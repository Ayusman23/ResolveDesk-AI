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
  ShieldCheck, 
  RefreshCw, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const COLUMNS = [
  { id: 'Open', title: 'Open Backlog', border: 'border-[#FFB454]/40', badge: 'bg-[#FFB454]/15 text-[#FFB454] border-[#FFB454]/30' },
  { id: 'In Progress', title: 'In Investigation', border: 'border-[#38BDF8]/40', badge: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30' },
  { id: 'Resolved', title: 'Resolved & Verified', border: 'border-[#22E6B8]/40', badge: 'bg-[#22E6B8]/15 text-[#22E6B8] border-[#22E6B8]/30' },
  { id: 'Closed', title: 'Closed / Archived', border: 'border-white/[0.08]', badge: 'bg-white/[0.06] text-[#8791A3] border-white/[0.1]' },
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

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText || !selectedTicket) return;

    setAddingNote(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/notes`, { text: newNoteText });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setNewNoteText('');
        fetchTickets();
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.sanitizedDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
    const matchPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    return matchSearch && matchCategory && matchPriority;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080A10] text-[#EDF1F7] py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto selection:bg-[#22E6B8] selection:text-[#080A10]">
      
      {/* Header & Controls Bar */}
      <div className="mb-6 bg-[#0D1119] p-5 rounded-xl border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
              <Kanban className="w-4.5 h-4.5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#EDF1F7]">
              Developer & SRE Triage Kanban
            </h1>
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              Role-Scoped Diagnostics
            </span>
          </div>
          <p className="font-mono text-[12px] text-[#8791A3] mt-1">
            Real-time multi-agent triage, PII disclosure clearance, and automated runbook synthesis
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565F70]" />
            <input
              type="text"
              placeholder="Filter incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#EDF1F7] text-xs focus:ring-1 focus:ring-[#38BDF8] placeholder-[#565F70]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#EDF1F7] text-xs focus:ring-1 focus:ring-[#38BDF8]"
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
            className="px-2.5 py-1.5 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#EDF1F7] text-xs focus:ring-1 focus:ring-[#38BDF8]"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={fetchTickets}
            className="p-1.5 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#8791A3] hover:text-[#EDF1F7] hover:border-white/[0.2] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {COLUMNS.map((column) => {
          const colTickets = filteredTickets.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className="bg-[#0D1119] border border-white/[0.08] rounded-xl p-4 flex flex-col min-h-[600px] shadow-xl"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <span className={`font-display text-[14px] font-bold text-[#EDF1F7]`}>
                    {column.title}
                  </span>
                  <span className={`font-mono text-[11px] font-semibold px-2 py-0.2 rounded border ${column.badge}`}>
                    {colTickets.length}
                  </span>
                </div>
              </div>

              {/* Column Ticket Stream */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-[#080A10] border border-white/[0.07] hover:border-[#38BDF8]/40 rounded-xl p-4 transition-all shadow-md cursor-pointer group space-y-2.5"
                  >
                    {/* Top Row: Meta Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10.5px] text-[#565F70]">
                          #{ticket._id.slice(-5).toUpperCase()}
                        </span>
                        <span className="font-mono text-[9.5px] px-1.5 py-0.2 rounded bg-white/[0.05] text-[#8791A3] border border-white/[0.06]">
                          {ticket.category || 'General'}
                        </span>
                      </div>

                      <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${
                        ticket.priority === 'Critical'
                          ? 'bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30'
                          : ticket.priority === 'High'
                          ? 'bg-[#FFB454]/15 text-[#FFB454] border-[#FFB454]/30'
                          : 'bg-[#22E6B8]/15 text-[#22E6B8] border-[#22E6B8]/30'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-semibold text-[13.5px] text-[#EDF1F7] group-hover:text-[#38BDF8] transition-colors line-clamp-2">
                      {ticket.title}
                    </h3>

                    {/* Description Snippet */}
                    <p className="font-mono text-[11.5px] text-[#8791A3] line-clamp-2 leading-relaxed">
                      {ticket.sanitizedDescription || ticket.description}
                    </p>

                    {/* SLA & Confidence Bar */}
                    <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10.5px] font-mono">
                      <SLABadge
                        score={ticket.slaPrediction?.score || 15}
                        level={ticket.slaPrediction?.level || 'Low'}
                        isCompact
                      />
                      <span className="text-[#22E6B8] font-semibold">
                        NLP: {Math.round((ticket.nlpTriage?.confidence || 0.85) * 100)}%
                      </span>
                    </div>

                    {/* Quick Move Action Buttons */}
                    <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono" onClick={(e) => e.stopPropagation()}>
                      {column.id === 'Open' && (
                        <button
                          onClick={() => handleStatusChange(ticket._id, 'In Progress')}
                          className="w-full py-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {column.id === 'In Progress' && (
                        <button
                          onClick={() => handleStatusChange(ticket._id, 'Resolved')}
                          className="w-full py-1 rounded bg-[#22E6B8]/10 text-[#22E6B8] border border-[#22E6B8]/30 hover:bg-[#22E6B8]/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                      {column.id === 'Resolved' && (
                        <button
                          onClick={() => handleStatusChange(ticket._id, 'Closed')}
                          className="w-full py-1 rounded bg-white/[0.05] text-[#8791A3] border border-white/[0.08] hover:text-[#EDF1F7] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Archive / Close</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colTickets.length === 0 && (
                  <div className="p-8 text-center border border-dashed border-white/[0.06] rounded-xl font-mono text-xs text-[#565F70]">
                    No tickets in queue
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Detail Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080A10]/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#22E6B8] selection:text-[#080A10]">
          <div className="bg-[#0D1119] border border-white/[0.1] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-[#EDF1F7] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#080A10] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs text-[#565F70]">
                  #{selectedTicket._id.toUpperCase()}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.06] text-[#EDF1F7]">
                  {selectedTicket.category}
                </span>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  selectedTicket.priority === 'Critical' ? 'bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30' : 'bg-[#22E6B8]/15 text-[#22E6B8] border-[#22E6B8]/30'
                }`}>
                  {selectedTicket.priority} Priority
                </span>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-[#8791A3] hover:text-[#EDF1F7] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-mono text-xs">
              <div>
                <h2 className="font-display text-lg font-bold text-[#EDF1F7] mb-1">
                  {selectedTicket.title}
                </h2>
                <div className="flex items-center space-x-4 text-[#565F70] text-[11px]">
                  <span>Submitted by: {selectedTicket.createdBy?.name || 'Client End-User'}</span>
                  <span>Time: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Zero-Trust Dual Description View */}
              <div className="bg-[#080A10] p-4 rounded-xl border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px]">
                  <span className="text-[#8791A3] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22E6B8]" />
                    Incident Description Payload
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRawDescription(!showRawDescription)}
                    className="text-[#22E6B8] hover:underline flex items-center gap-1 cursor-pointer text-[10.5px]"
                  >
                    {showRawDescription ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{showRawDescription ? 'Show Sanitized PII' : 'Reveal Raw Payload (Developer Clearance)'}</span>
                  </button>
                </div>

                <p className="text-[#EDF1F7] text-[12.5px] leading-relaxed select-text">
                  {showRawDescription
                    ? selectedTicket.rawDescription || selectedTicket.description
                    : selectedTicket.sanitizedDescription || selectedTicket.description}
                </p>
              </div>

              {/* Automated Runbook / Remediation SOP */}
              {selectedTicket.nlpTriage?.suggestedRemediation && (
                <div className="bg-[#22E6B8]/[0.06] border border-[#22E6B8]/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-[#22E6B8] font-bold text-[12px]">
                    <Sparkles className="w-4 h-4" />
                    <span>Agentic AI Suggested Remediation & Runbook</span>
                  </div>
                  <p className="text-[#EDF1F7] text-[12px] leading-relaxed">
                    {selectedTicket.nlpTriage.suggestedRemediation}
                  </p>
                </div>
              )}

              {/* Internal Developer Notes Feed */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-sm text-[#EDF1F7] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#38BDF8]" />
                  Internal Investigation Notes ({selectedTicket.internalNotes?.length || 0})
                </h3>

                <div className="space-y-2">
                  {selectedTicket.internalNotes?.map((note, idx) => (
                    <div key={idx} className="bg-[#080A10] p-3 rounded-lg border border-white/[0.06] text-xs">
                      <div className="flex items-center justify-between text-[#565F70] text-[10px] mb-1">
                        <span className="text-[#38BDF8] font-semibold">{note.author?.name || 'Developer'}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[#EDF1F7]">{note.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal diagnosis note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#EDF1F7] text-xs focus:ring-1 focus:ring-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNoteText}
                    className="px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#60A5FA] text-[#080A10] font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {addingNote ? 'Adding...' : 'Post Note'}
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer Status Actions */}
            <div className="px-6 py-4 bg-[#080A10] border-t border-white/[0.08] flex items-center justify-between">
              <div className="font-mono text-xs text-[#8791A3]">
                Current Status: <strong className="text-[#EDF1F7]">{selectedTicket.status}</strong>
              </div>
              <div className="flex space-x-2 font-mono text-xs">
                <button
                  onClick={() => handleStatusChange(selectedTicket._id, 'In Progress')}
                  className="px-3 py-1.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/25 transition-colors cursor-pointer"
                >
                  Set In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(selectedTicket._id, 'Resolved')}
                  className="px-3 py-1.5 rounded-lg bg-[#22E6B8]/15 text-[#22E6B8] border border-[#22E6B8]/30 hover:bg-[#22E6B8]/25 transition-colors cursor-pointer"
                >
                  Set Resolved
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DeveloperKanban;
