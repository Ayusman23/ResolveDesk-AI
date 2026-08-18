const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sanitizeTicketForRole, sanitizeTicketsForRole } = require('../middleware/roleFilter');
const { redactPII, triageTicket, checkDuplicates } = require('../services/aiService');
const { calculateDeadline, predictSlaRisk } = require('../services/slaPredictor');
const { emitTelemetryStep, broadcastTicketEvent } = require('../socket/telemetrySocket');

const router = express.Router();

// Helper sleep to allow frontend X-Ray visualizer to stream smoothly
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// @route   POST /api/tickets/check-duplicates
// @desc    Feature 3: Semantic Duplicate Detection as-you-type
// @access  Private / Authenticated
router.post('/check-duplicates', protect, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.json({ success: true, duplicates: [] });
    }

    // Get active tickets (Open or In Progress) for comparison
    const activeTickets = await Ticket.find({
      status: { $in: ['Open', 'In Progress'] },
    }).select('title sanitizedDescription priority status createdAt category').limit(50);

    const result = await checkDuplicates(title, description, activeTickets);
    res.json({
      success: true,
      duplicates: result.duplicates || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tickets
// @desc    Create new ticket with AI Triage, PII Redaction, Telemetry Streaming, and SLA Prediction
// @access  Private (Client, Developer, Manager)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, deviceContext = {}, socketId } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for the ticket',
      });
    }

    const telemetryTarget = socketId || req.user._id.toString();
    const telemetryLogs = [];

    const recordStep = (step, status, details, progress, extraData = {}) => {
      const log = { step, status, details, timestamp: new Date() };
      telemetryLogs.push(log);
      emitTelemetryStep(telemetryTarget, {
        step,
        status,
        message: details,
        progress,
        data: extraData,
      });
    };

    // --- STEP 1: Contextual Indexing (Feature 5) ---
    recordStep(
      'CONTEXT_INDEXING',
      'IN_PROGRESS',
      `Harvesting environment diagnostics: OS: ${deviceContext.os || 'Windows'}, Browser: ${deviceContext.browser || 'Chrome'}, Resolution: ${deviceContext.screenResolution || '1920x1080'}`,
      15,
      { deviceContext }
    );
    await delay(40);

    // --- STEP 2: In-Flight PII Redaction (Feature 1) ---
    recordStep(
      'PII_REDACTION',
      'IN_PROGRESS',
      'Scanning for credentials, auth tokens, API keys, passwords, and emails via NER...',
      35
    );
    const piiResult = await redactPII(description);
    const sanitizedDescription = piiResult.sanitizedText || description;
    const piiEntitiesFound = piiResult.piiEntities || [];
    
    recordStep(
      'PII_REDACTION',
      'COMPLETED',
      `PII Scrubbing Complete: ${piiEntitiesFound.length} sensitive item(s) sanitized in-flight`,
      50,
      { piiCount: piiEntitiesFound.length, sanitizedPreview: sanitizedDescription.substring(0, 120) }
    );
    await delay(40);

    // --- STEP 3: Semantic Duplicate Detection Check (Feature 3) ---
    recordStep(
      'EMBEDDING_DUPLICATE_CHECK',
      'IN_PROGRESS',
      'Calculating cosine similarity across active enterprise incident vectors...',
      65
    );
    const activeTickets = await Ticket.find({ status: { $in: ['Open', 'In Progress'] } }).select('title sanitizedDescription priority status category');
    const duplicateMatches = await checkDuplicates(title, sanitizedDescription, activeTickets);
    recordStep(
      'EMBEDDING_DUPLICATE_CHECK',
      'COMPLETED',
      `Duplicate Scan complete: ${duplicateMatches.duplicates?.length || 0} potential correlation(s) found`,
      75,
      { topDuplicates: duplicateMatches.duplicates || [] }
    );
    await delay(40);

    // --- STEP 4: NLP Triage Engine & Agentic Fallback (Feature 2 & 6) ---
    recordStep(
      'NLP_TRIAGE',
      'IN_PROGRESS',
      'Executing multi-class NLP triage pipeline (Category, Priority, & Remediation synthesis)...',
      85
    );
    const triageResult = await triageTicket(title, sanitizedDescription, deviceContext);
    
    if (triageResult.agenticFallbackTriggered) {
      recordStep(
        'AGENTIC_FALLBACK',
        'TRIGGERED',
        `AI Confidence (${(triageResult.confidence * 100).toFixed(0)}%) below 0.65 threshold. Triggered external documentation & runbook search.`,
        90,
        { sources: triageResult.agenticSearchSources }
      );
    }
    await delay(40);

    // --- STEP 5: SLA Breach Predictor (Feature 8) ---
    const { deadline, hours } = calculateDeadline(triageResult.priority);
    const activeBacklogCount = activeTickets.length + 1;
    const devCount = await User.countDocuments({ role: 'developer' });

    const ticketDraft = {
      priority: triageResult.priority,
      category: triageResult.category,
      createdAt: new Date(),
      slaDeadline: deadline,
      agenticFallbackTriggered: triageResult.agenticFallbackTriggered,
      status: 'Open',
    };
    const slaPrediction = predictSlaRisk(ticketDraft, activeBacklogCount, Math.max(1, devCount));

    recordStep(
      'SLA_PREDICTION',
      'COMPLETED',
      `SLA Analysis: Window = ${hours}h, Breach Risk Score = ${slaPrediction.score}/100 (${slaPrediction.level} Risk)`,
      95,
      { slaRisk: slaPrediction }
    );
    await delay(40);

    // --- STEP 6: Zero-Trust Persistence (Feature 4) ---
    const ticket = await Ticket.create({
      title,
      rawDescription: description, // Saved to DB, but stripped for client queries
      sanitizedDescription,
      status: 'Open',
      priority: triageResult.priority || 'Medium',
      category: triageResult.category || 'Other',
      createdBy: req.user._id,
      assignedTo: null,
      slaRiskScore: slaPrediction.score,
      slaRiskLevel: slaPrediction.level,
      slaDeadline: deadline,
      slaHours: hours,
      aiConfidence: triageResult.confidence || 0.85,
      piiEntitiesFound,
      suggestedRemediation: triageResult.suggestedRemediation || '',
      agenticFallbackTriggered: triageResult.agenticFallbackTriggered || false,
      agenticSearchSources: triageResult.agenticSearchSources || [],
      deviceContext: {
        os: deviceContext.os || 'Windows',
        browser: deviceContext.browser || 'Chrome',
        screenResolution: deviceContext.screenResolution || '1920x1080',
        ipAddress: req.ip || '127.0.0.1',
        networkType: deviceContext.networkType || 'broadband',
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date(),
      },
      internalDevNotes: [],
      telemetryLogs,
    });

    recordStep(
      'COMPLETED',
      'COMPLETED',
      `Ticket #${ticket._id.toString().slice(-6).toUpperCase()} created and published to developer queue.`,
      100,
      { ticketId: ticket._id }
    );

    // Broadcast to Developer and Manager boards in real-time
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role');

    broadcastTicketEvent('ticket:created', populatedTicket);

    // Return role-sanitized response (Feature 4)
    const sanitizedResponse = sanitizeTicketForRole(populatedTicket, req.user.role);

    res.status(201).json({
      success: true,
      ticket: sanitizedResponse,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tickets
// @desc    Get all tickets filtered by user role (Feature 4 Zero-Trust)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Clients only see their own tickets
    if (req.user.role === 'client') {
      query.createdBy = req.user._id;
    }

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .sort({ createdAt: -1 });

    const totalActive = await Ticket.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const devCount = await User.countDocuments({ role: 'developer' });

    // Recalculate dynamic real-time SLA breach risks for active tickets
    const updatedTickets = tickets.map((t) => {
      const sla = predictSlaRisk(t, totalActive, Math.max(1, devCount));
      t.slaRiskScore = sla.score;
      t.slaRiskLevel = sla.level;
      return t;
    });

    // Strip internal metadata for client role (Feature 4)
    const roleFiltered = sanitizeTicketsForRole(updatedTickets, req.user.role);

    res.json({
      success: true,
      count: roleFiltered.length,
      tickets: roleFiltered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tickets/:id
// @desc    Get single ticket by ID (role-enforced)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('internalDevNotes.author', 'name email role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Zero-Trust check: clients cannot view other users' tickets
    if (req.user.role === 'client' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this ticket',
      });
    }

    const sanitized = sanitizeTicketForRole(ticket, req.user.role);
    res.json({ success: true, ticket: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/tickets/:id/status
// @desc    Update ticket status (Developers & Managers)
// @access  Private (Developer, Manager)
router.patch('/:id/status', protect, authorize('developer', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket status' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;
    if (status === 'In Progress' && !ticket.assignedTo) {
      ticket.assignedTo = req.user._id;
    }
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    broadcastTicketEvent('ticket:updated', populated);

    res.json({ success: true, ticket: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/tickets/:id/assign
// @desc    Assign ticket to a developer
// @access  Private (Developer, Manager)
router.patch('/:id/assign', protect, authorize('developer', 'manager'), async (req, res) => {
  try {
    const { developerId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.assignedTo = developerId || null;
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    broadcastTicketEvent('ticket:updated', populated);

    res.json({ success: true, ticket: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tickets/:id/notes
// @desc    Add developer internal diagnostic note (Feature 4)
// @access  Private (Developer, Manager)
router.post('/:id/notes', protect, authorize('developer', 'manager'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.internalDevNotes.push({
      author: req.user._id,
      authorName: req.user.name,
      text,
      createdAt: new Date(),
    });

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('internalDevNotes.author', 'name email role');

    broadcastTicketEvent('ticket:updated', populated);

    res.json({ success: true, ticket: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
