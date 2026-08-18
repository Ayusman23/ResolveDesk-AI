const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { predictSlaRisk } = require('../services/slaPredictor');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get aggregated managerial metrics & telemetry
// @access  Private (Developer, Manager)
router.get('/overview', protect, authorize('developer', 'manager'), async (req, res) => {
  try {
    const allTickets = await Ticket.find().populate('createdBy', 'name email').populate('assignedTo', 'name email');
    const developers = await User.find({ role: 'developer' }).select('name email');

    // Update real-time dynamic SLA risk for active tickets
    const activeCount = allTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;
    const devCount = Math.max(1, developers.length);

    let totalSlaRisk = 0;
    let criticalRiskCount = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let breachedCount = 0;

    let piiScrubbedTotal = 0;
    let piiTypesMap = {};
    let fallbackCount = 0;
    let totalConfidence = 0;

    const categoryMap = {
      Hardware: 0,
      Network: 0,
      Access: 0,
      Software: 0,
      Security: 0,
      Other: 0,
    };

    const statusMap = {
      Open: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
    };

    const priorityMap = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    allTickets.forEach((t) => {
      // Category count
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
      
      // Status count
      statusMap[t.status] = (statusMap[t.status] || 0) + 1;

      // Priority count
      priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;

      // SLA recalculation
      const sla = predictSlaRisk(t, activeCount, devCount);
      totalSlaRisk += sla.score;
      if (sla.isBreached) breachedCount++;
      if (sla.level === 'Critical') criticalRiskCount++;
      else if (sla.level === 'High') highRiskCount++;
      else if (sla.level === 'Medium') mediumRiskCount++;
      else lowRiskCount++;

      // AI telemetry
      if (t.aiConfidence) totalConfidence += t.aiConfidence;
      if (t.agenticFallbackTriggered) fallbackCount++;

      // PII Scrubbing stats
      if (t.piiEntitiesFound && t.piiEntitiesFound.length > 0) {
        piiScrubbedTotal += t.piiEntitiesFound.length;
        t.piiEntitiesFound.forEach((p) => {
          const type = p.entityType || 'UNKNOWN';
          piiTypesMap[type] = (piiTypesMap[type] || 0) + 1;
        });
      }
    });

    const totalTickets = allTickets.length;
    const avgConfidence = totalTickets > 0 ? (totalConfidence / totalTickets).toFixed(2) : 0.85;
    const avgRiskScore = totalTickets > 0 ? Math.round(totalSlaRisk / totalTickets) : 0;
    const fallbackRate = totalTickets > 0 ? Math.round((fallbackCount / totalTickets) * 100) : 0;
    const slaComplianceRate = totalTickets > 0 ? Math.round(((totalTickets - breachedCount) / totalTickets) * 100) : 100;

    // Format category distribution for Recharts
    const categoryData = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));

    // Format SLA risk distribution for Recharts
    const slaRiskData = [
      { name: 'Low Risk', value: lowRiskCount, color: '#10b981' },
      { name: 'Medium Risk', value: mediumRiskCount, color: '#f59e0b' },
      { name: 'High Risk', value: highRiskCount, color: '#f97316' },
      { name: 'Critical / Breached', value: criticalRiskCount + breachedCount, color: '#ef4444' },
    ];

    // Format priority distribution
    const priorityData = Object.keys(priorityMap).map((key) => ({
      priority: key,
      count: priorityMap[key],
    }));

    // Format PII types distribution
    const piiDistribution = Object.keys(piiTypesMap).map((key) => ({
      type: key,
      count: piiTypesMap[key],
    }));

    res.json({
      success: true,
      summary: {
        totalTickets,
        activeTickets: activeCount,
        resolvedTickets: statusMap['Resolved'] + statusMap['Closed'],
        slaComplianceRate,
        avgRiskScore,
        avgAiConfidence: Number(avgConfidence),
        piiScrubbedTotal,
        agenticFallbackRate: fallbackRate,
        activeDevelopersCount: devCount,
      },
      categoryData,
      slaRiskData,
      priorityData,
      piiDistribution,
      statusMap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
