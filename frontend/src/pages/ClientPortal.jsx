import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { getDeviceDiagnostics } from '../services/deviceContext';
import XRayTelemetryModal from '../components/XRayTelemetryModal';
import DuplicateWarningBanner from '../components/DuplicateWarningBanner';
import SLABadge from '../components/SLABadge';
import ContextTelemetryPill from '../components/ContextTelemetryPill';
import { 
  PlusCircle, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Filter, 
  FileText,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

const ClientPortal = () => {
  const { user } = useAuth();
  const { socket, clientId } = useSocket();

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [diagnostics, setDiagnostics] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const duplicateCheckTimer = useRef(null);

  // Ingest Client Telemetry on mount (Feature 5)
  useEffect(() => {
    const diag = getDeviceDiagnostics();
    setDiagnostics(diag);
  }, []);

  // Fetch client tickets
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await api.get('/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Real-time socket updates for tickets
  useEffect(() => {
    if (!socket) return;
    const handleTicketCreated = (newTicket) => {
      // If client created it, refresh list
      if (newTicket.createdBy?._id === user?._id || newTicket.createdBy === user?._id) {
        fetchTickets();
      }
    };
    const handleTicketUpdated = () => {
      fetchTickets();
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);

    return () => {
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
    };
  }, [socket, user]);

  // Real-time as-you-type Semantic Duplicate Detection (Feature 3)
  useEffect(() => {
    if (duplicateCheckTimer.current) {
      clearTimeout(duplicateCheckTimer.current);
    }

    if (!title && !description) {
      setDuplicates([]);
      return;
    }

    duplicateCheckTimer.current = setTimeout(async () => {
      if (title.length > 5 || description.length > 10) {
        try {
          const res = await api.post('/tickets/check-duplicates', {
            title,
            description,
          });
          if (res.data.success) {
            setDuplicates(res.data.duplicates || []);
          }
        } catch (err) {
          // Silent fallback
        }
      }
    }, 450);

    return () => clearTimeout(duplicateCheckTimer.current);
  }, [title, description]);

  // Submit Ticket with WebSocket X-Ray Telemetry (Feature 7)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    setIsTelemetryModalOpen(true);

    try {
      const payload = {
        title,
        description,
        deviceContext: diagnostics,
        socketId: socket?.id || clientId,
      };

      const res = await api.post('/tickets', payload);
      if (res.data.success) {
        // Reset form
        setTitle('');
        setDescription('');
        setDuplicates([]);
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTelemetryComplete = () => {
    fetchTickets();
  };

  // Quick sample templates for testing PII redaction and triage
  const fillSampleTicket = (type) => {
    if (type === 'vpn') {
      setTitle('VPN Gateway disconnects every 15 minutes during voice calls');
      setDescription('Cannot reach London HQ subnet. My email is alice.client@enterprise.corp and my auth bearer token was bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. Please unlock my ASA port.');
    } else if (type === 'access') {
      setTitle('Need AWS Production S3 Read Access for Q3 Accounting Audit');
      setDescription('Requesting temporary assume-role IAM credential for bucket s3://prod-finance-archive. My AWS key was AKIAIOSFODNN7EXAMPLE and password was SecretP@ssw0rd!2026.');
    } else if (type === 'hardware') {
      setTitle('MacBook Pro M3 USB-C Thunderbolt dock monitor flickering pink');
      setDescription('External 4K Dell display flickers and disconnects whenever charging via CalDigit Thunderbolt dock in 4th floor conference room.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-brand-500 selection:text-white">
      
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Client Service Desk
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Zero-Trust Protected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Submit IT incidents with in-flight PII redaction, real-time outage detection, and WebSocket telemetry streaming.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchTickets}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Ticket Submission Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">New Service Incident</h2>
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                AI Automated Triage
              </span>
            </div>

            {/* Quick Test Preset Badges */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-amber-500" /> Test Scenarios (Auto-Fills PII & Category):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillSampleTicket('vpn')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  🌐 VPN + Bearer Token
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleTicket('access')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  🔑 AWS Key + Password
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleTicket('hardware')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  🖥️ Mac Dock Hardware
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cannot reach Cisco VPN gateway after firmware patch"
                  className="block w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Diagnostic Description
                  </label>
                  <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> In-Flight PII Auto-Scrub
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your technical issue. (Feel free to test PII scrubbing by writing passwords or email addresses - they will be scrubbed before database persistence!)"
                  className="block w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
                />
              </div>

              {/* Novel Feature 3: Real-Time Duplicate Warning Banner */}
              <DuplicateWarningBanner
                duplicates={duplicates}
                onSelectExisting={(item) => setSelectedTicket(item)}
              />

              {/* Novel Feature 5: Contextual Indexing Diagnostic Pill */}
              <ContextTelemetryPill diagnostics={diagnostics} />

              <button
                type="submit"
                disabled={isSubmitting || !title || !description}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Incident & Stream X-Ray</span>
              </button>
            </form>

          </div>
        </div>

        {/* Right Column: Submitted Tickets Track & Inspect */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-enterprise-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase">My Submitted Tickets</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-700">
                {filteredTickets.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {loadingTickets ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-slate-500">Loading Zero-Trust ticket projections...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Incidents Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Submit a new IT incident using the form on the left to trigger the AI triage pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?._id === ticket._id;

                return (
                  <div
                    key={ticket._id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-enterprise-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-600">
                            #{ticket._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ticket.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {ticket.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ticket.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : ticket.priority === 'High'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.priority} Priority
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {ticket.title}
                        </h3>
                      </div>

                      {/* SLA Indicator */}
                      <SLABadge
                        score={ticket.slaRiskScore}
                        level={ticket.slaRiskLevel}
                        deadline={ticket.slaDeadline}
                        status={ticket.status}
                        isCompact={true}
                      />
                    </div>

                    {/* Sanitized Description */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed font-sans">
                      <p>{ticket.sanitizedDescription || ticket.description}</p>
                    </div>

                    {/* AI Remediation Pill if available */}
                    {ticket.suggestedRemediation && (
                      <div className="bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-xl text-xs flex items-start space-x-2 text-indigo-900">
                        <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-brand-700">Automated Triage Recommendation:</span>
                          <p className="text-[11px] text-slate-700 mt-0.5">{ticket.suggestedRemediation}</p>
                        </div>
                      </div>
                    )}

                    {/* PII Redacted Indicator */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-500" />
                          <span>Zero-Trust Projection Safe</span>
                        </span>
                        {ticket.piiEntitiesFound?.length > 0 && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {ticket.piiEntitiesFound.length} PII Item(s) Scrubbed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Real-time WebSocket X-Ray Telemetry Modal (Feature 7) */}
      <XRayTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        onCompleted={handleTelemetryComplete}
      />

    </div>
  );
};

export default ClientPortal;
