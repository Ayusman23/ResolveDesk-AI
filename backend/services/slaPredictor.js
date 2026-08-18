/**
 * Novel Feature 8: Mathematical SLA Breach Predictor
 * Computes real-time dynamic breach probability based on:
 * 1. SLA window allocation by priority
 * 2. Time elapsed vs. time remaining
 * 3. Total active ticket backlog load
 * 4. Active developer concurrency capacity
 * 5. Incident complexity modifiers
 */

const SLA_HOURS_MAP = {
  Critical: 2, // 2 Hours max
  High: 6,     // 6 Hours max
  Medium: 12,  // 12 Hours max
  Low: 24,     // 24 Hours max
};

const CATEGORY_COMPLEXITY = {
  Security: 1.35,
  Network: 1.25,
  Hardware: 1.15,
  Access: 1.0,
  Software: 1.1,
  Other: 1.0,
};

/**
 * Calculates deadline for a newly created ticket
 */
const calculateDeadline = (priority) => {
  const hours = SLA_HOURS_MAP[priority] || 24;
  const deadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  return { deadline, hours };
};

/**
 * Predicts SLA risk score (0-100) and risk level
 * @param {Object} ticket - Ticket data
 * @param {Number} activeBacklogCount - Count of currently open/in-progress tickets in system
 * @param {Number} devCount - Available active developers
 */
const predictSlaRisk = (ticket, activeBacklogCount = 5, devCount = 3) => {
  const now = new Date();
  const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : now;
  const deadline = ticket.slaDeadline ? new Date(ticket.slaDeadline) : new Date(now.getTime() + 24 * 3600000);
  
  const totalDurationMs = Math.max(1, deadline.getTime() - createdAt.getTime());
  const elapsedMs = Math.max(0, now.getTime() - createdAt.getTime());
  const remainingMs = Math.max(0, deadline.getTime() - now.getTime());

  // 1. Time-decay ratio (0.0 to 1.0+)
  const timeProgress = Math.min(1.5, elapsedMs / totalDurationMs);
  const timeWeight = timeProgress * 45; // Up to 45 points

  // 2. Priority urgency multiplier
  const priorityMultipliers = {
    Critical: 35,
    High: 25,
    Medium: 15,
    Low: 5,
  };
  const priorityWeight = priorityMultipliers[ticket.priority] || 15;

  // 3. System Backlog Pressure (Concurrency queue ratio)
  // Dev capacity assumed to handle 3 concurrent tickets comfortably
  const capacity = Math.max(1, devCount * 3);
  const loadRatio = Math.min(2.0, activeBacklogCount / capacity);
  const loadWeight = loadRatio * 20; // Up to 20 points

  // 4. Complexity & Fallback Modifiers
  const complexityFactor = CATEGORY_COMPLEXITY[ticket.category] || 1.0;
  const fallbackPenalty = ticket.agenticFallbackTriggered ? 10 : 0;

  // Total raw mathematical score
  let rawScore = (timeWeight + priorityWeight + loadWeight + fallbackPenalty) * (complexityFactor * 0.9);

  // If status is already Resolved or Closed, risk is 0
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
    return {
      score: 0,
      level: 'Low',
      remainingHours: 0,
      isBreached: false,
    };
  }

  // If deadline has passed, breach is 100%
  const isBreached = remainingMs <= 0;
  if (isBreached) {
    return {
      score: 100,
      level: 'Critical',
      remainingHours: 0,
      isBreached: true,
    };
  }

  const score = Math.min(99, Math.max(5, Math.round(rawScore)));

  let level = 'Low';
  if (score >= 75) level = 'Critical';
  else if (score >= 50) level = 'High';
  else if (score >= 25) level = 'Medium';

  const remainingHours = Number((remainingMs / (1000 * 60 * 60)).toFixed(1));

  return {
    score,
    level,
    remainingHours,
    isBreached: false,
  };
};

module.exports = {
  SLA_HOURS_MAP,
  calculateDeadline,
  predictSlaRisk,
};
