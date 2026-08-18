import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import SLABadge from '../components/SLABadge';
import { 
  Kanban, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  Sparkles, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ArrowRight, 
  MessageSquare, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  X
} from 'lucide-react';

const COLUMNS = [
  { id: 'Open', title: 'Open Backlog', color: 'border-amber-400', badge: 'bg-amber-100 text-amber-800' },
  { id: 'In Progress', title: 'In Investigation', color: 'border-blue-400', badge: 'bg-blue-100 text-blue-800' },
  { id: 'Resolved', title: 'Resolved & Verified', color: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
  { id: 'Closed', title: 'Closed / Archived', color: 'border-slate-300', badge: 'bg-slate-100 text-slate-700' },
];

const DeveloperKanban = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showRawDescription, setShowRawDescription] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Real-time socket sync
  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (newTicket) => {
      setTickets((prev) => [newTicket, ...prev.filter((t) => t._id !== newTicket._id)]);
    };

    const handleTicketUpdated = (updated) => {
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      if (selectedTicket && selectedTicket._id === updated._id) {
        setSelectedTicket(updated);
      }
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);

    return () => {
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
    };
  }, [socket, selectedTicket]);

  // Update Status
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      if (res.data.success) {
        setTickets((prev) => prev.map((t) => (t._id === ticketId ? res.data.ticket : t)));
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(res.data.ticket);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Add Developer Internal Note (Feature 4)
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText || !selectedTicket) return;

    setAddingNote(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/notes`, { text: newNoteText });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setNewNoteText('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sanitizedDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesPri = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesCat && matchesPri;
  });

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-brand-500 selection:text-white">
      
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Kanban className="w-6 h-6 text-brand-600" />
              Developer & SRE Kanban Board
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Zero-Trust Dev View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time incident progression, raw PII comparison, agentic runbook search, and SLA telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTickets}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Board</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, titles, error codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Network">Network</option>
            <option value="Hardware">Hardware</option>
            <option value="Access">Access</option>
            <option value="Software">Software</option>
            <option value="Security">Security</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map((column) => {
          const colTickets = filteredTickets.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className="bg-slate-200/60 rounded-2xl p-4 flex flex-col min-h-[650px] border border-slate-300/60"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-300">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.id === 'Open' ? 'bg-amber-500' : column.id === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {column.title}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                  {colTickets.length}
                </span>
              </div>

              {/* Tickets in column */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colTickets.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono">
                    No active tickets
                  </div>
                ) : (
                  colTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowRawDescription(false);
                      }}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-enterprise-md hover:border-brand-400 transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-brand-600">
                          #{ticket._id.slice(-6).toUpperCase()}
                        </span>
                        <SLABadge
                          score={ticket.slaRiskScore}
                          level={ticket.slaRiskLevel}
                          deadline={ticket.slaDeadline}
                          status={ticket.status}
                          isCompact={true}
                        />
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {ticket.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ticket.category}
                        </span>
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ticket.priority}
                        </span>
                        {ticket.agenticFallbackTriggered && (
                          <span className="font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                            Runbook Fallback
                          </span>
                        )}
                      </div>

                      {/* AI Confidence and Quick Advance */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-brand-500" />
                          <span>AI Conf: {Math.round((ticket.aiConfidence || 0.85) * 100)}%</span>
                        </div>

                        {column.id === 'Open' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket._id, 'In Progress');
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          >
                            Investigate →
                          </button>
                        )}
                        {column.id === 'In Progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket._id, 'Resolved');
                            }}
                            className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          >
                            Resolve ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Developer Deep-Dive Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-400">
                      #{selectedTicket._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedTicket.category}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedTicket.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Novel Feature 4: Zero-Trust Vector Security - Unredacted vs Sanitized Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    {showRawDescription ? (
                      <Unlock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="font-bold text-slate-800">
                      Novel Feature 4: Role-Enforced Vector Security (Raw vs Sanitized)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRawDescription(!showRawDescription)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                  >
                    {showRawDescription ? 'Show Sanitized (Client View)' : 'Reveal Raw Unredacted (Dev Privilege)'}
                  </button>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed select-text">
                  {showRawDescription ? (
                    <div className="text-rose-900">
                      <span className="font-bold text-rose-600">[DEV RAW UNREDACTED]: </span>
                      {selectedTicket.rawDescription || selectedTicket.sanitizedDescription}
                    </div>
                  ) : (
                    <div className="text-slate-800">
                      <span className="font-bold text-emerald-600">[SANITIZED ZERO-TRUST]: </span>
                      {selectedTicket.sanitizedDescription}
                    </div>
                  )}
                </div>

                {/* PII Entities list */}
                {selectedTicket.piiEntitiesFound?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500">Scrubbed Tokens:</span>
                    {selectedTicket.piiEntitiesFound.map((pii, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {pii.entityType} ({pii.redactedWith})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Novel Feature 5: Device & Context Telemetry */}
              {selectedTicket.deviceContext && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Client OS:</span>
                    <strong className="text-slate-800">{selectedTicket.deviceContext.os}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Browser:</span>
                    <strong className="text-slate-800">{selectedTicket.deviceContext.browser}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Resolution:</span>
                    <strong className="text-slate-800">{selectedTicket.deviceContext.screenResolution}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Network:</span>
                    <strong className="text-slate-800">{selectedTicket.deviceContext.networkType}</strong>
                  </div>
                </div>
              )}

              {/* Novel Feature 6 & Remediation */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>AI Automated Remediation & Runbook Guide</span>
                </div>
                <p className="text-slate-800 font-sans leading-relaxed text-xs">
                  {selectedTicket.suggestedRemediation}
                </p>

                {/* Agentic Fallback Sources if triggered */}
                {selectedTicket.agenticSearchSources?.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-indigo-200/60">
                    <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider block mb-1.5">
                      Novel Feature 6: Agentic Retrieved Knowledge Sources
                    </span>
                    <div className="space-y-1">
                      {selectedTicket.agenticSearchSources.map((src, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-indigo-100">
                          <span className="font-semibold text-slate-800 truncate">{src.title}</span>
                          <span className="text-[10px] font-mono text-brand-600 shrink-0 ml-2">
                            {Math.round((src.relevanceScore || 0.85) * 100)}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Novel Feature 8: SLA Predictor Card */}
              <SLABadge
                score={selectedTicket.slaRiskScore}
                level={selectedTicket.slaRiskLevel}
                deadline={selectedTicket.slaDeadline}
                status={selectedTicket.status}
              />

              {/* Internal Developer Notes Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  Internal Developer Notes (Zero-Trust Isolated)
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTicket.internalDevNotes?.length === 0 ? (
                    <p className="text-slate-400 italic text-xs">No internal notes added yet.</p>
                  ) : (
                    selectedTicket.internalDevNotes?.map((note, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <strong className="text-slate-800">{note.authorName || 'Engineer'}</strong>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add an internal diagnostic observation..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNoteText}
                    className="px-3 py-1.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors shrink-0"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600">Update Status:</span>
                {['Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedTicket._id, st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedTicket.status === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DeveloperKanban;
