const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      maxlength: 200,
    },
    rawDescription: {
      type: String,
      required: [true, 'Please provide a description'],
      // Raw description contains unsanitized input; restricted to developer/manager by role security
    },
    sanitizedDescription: {
      type: String,
      required: true,
      // PII scrubbed description safe for all roles
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Hardware', 'Network', 'Access', 'Software', 'Security', 'Other'],
      default: 'Other',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Novel Feature 8: SLA Breach Predictor
    slaRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    slaRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    slaHours: {
      type: Number,
      default: 24,
    },
    // Novel Feature 1 & 2: NLP & PII Redaction metadata
    aiConfidence: {
      type: Number,
      default: 0.85,
    },
    piiEntitiesFound: [
      {
        entityType: String, // e.g. EMAIL, API_KEY, PASSWORD, TOKEN
        originalValueLength: Number,
        redactedWith: String,
      },
    ],
    // Novel Feature 6: Agentic Fallback
    suggestedRemediation: {
      type: String,
      default: '',
    },
    agenticFallbackTriggered: {
      type: Boolean,
      default: false,
    },
    agenticSearchSources: [
      {
        title: String,
        source: String,
        url: String,
        relevanceScore: Number,
      },
    ],
    // Novel Feature 5: Contextual Indexing
    deviceContext: {
      os: { type: String, default: 'Unknown' },
      browser: { type: String, default: 'Unknown' },
      screenResolution: { type: String, default: 'Unknown' },
      ipAddress: { type: String, default: '127.0.0.1' },
      networkType: { type: String, default: 'broadband' },
      userAgent: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
    },
    // Novel Feature 4: Role-Enforced internal dev logs & notes
    internalDevNotes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Novel Feature 7: X-Ray Telemetry logs
    telemetryLogs: [
      {
        step: String,
        status: String,
        details: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant querying and triage analytics
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
