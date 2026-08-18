/**
 * Novel Feature 4: Role-Enforced Vector Security
 * Enforces Zero-Trust data projection based on the caller's JWT role.
 * Clients are strictly isolated from seeing developer-level metadata,
 * unredacted raw descriptions, internal runbook search logs, and developer notes.
 */

const sanitizeTicketForRole = (ticketDoc, role) => {
  if (!ticketDoc) return null;
  const ticket = ticketDoc.toObject ? ticketDoc.toObject() : { ...ticketDoc };

  if (role === 'client') {
    // Zero-Trust field stripping for Clients
    delete ticket.rawDescription; // Unredacted text scrubbed
    delete ticket.internalDevNotes; // Developer-only internal deliberations
    delete ticket.agenticSearchSources; // Internal runbook URLs
    delete ticket.telemetryLogs; // Internal microservice timings & raw telemetry
    delete ticket.vectorEmbedding; // Raw mathematical embedding
    
    // Clients only see the sanitized version
    ticket.description = ticket.sanitizedDescription;
  } else {
    // Developers & Managers receive full diagnostic perspective
    ticket.description = ticket.sanitizedDescription;
  }

  return ticket;
};

const sanitizeTicketsForRole = (tickets, role) => {
  if (!Array.isArray(tickets)) return [];
  return tickets.map((t) => sanitizeTicketForRole(t, role));
};

module.exports = {
  sanitizeTicketForRole,
  sanitizeTicketsForRole,
};
