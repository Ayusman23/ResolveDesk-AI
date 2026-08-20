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
  RefreshCw,
  Eye,
  Terminal,
  Activity
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

  // Ingest Client Telemetry on mount
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

  // Real-time as-you-type Semantic Duplicate Detection
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

  // Client-side quick PII detector simulation for instant preview
  const detectedPIIPreview = (() => {
    if (!description) return null;
    let scrubbed = description;
    let count = 0;
    
    // Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = scrubbed.match(emailRegex) || [];
    count += emails.length;
    scrubbed = scrubbed.replace(emailRegex, '[REDACTED_EMAIL]');

    // Secrets / Keys / Passwords
    const secretRegex = /(?:api[_-]?key|secret|token|bearer|password|pwd)[\s:=]+([a-zA-Z0-9_\-\.]{8,})/gi;
    const secrets = scrubbed.match(secretRegex) || [];
    count += secrets.length;
    scrubbed = scrubbed.replace(secretRegex, (m, p1) => m.replace(p1, '[REDACTED_SECRET]'));

    return count > 0 ? { scrubbed, count } : null;
  })();

  // Submit Ticket with WebSocket X-Ray Telemetry
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

  const fillSampleTicket = (type) => {
    if (type === 'vpn') {
      setTitle('VPN Gateway disconnects every 15 minutes during voice calls');
      setDescription('My Cisco AnyConnect VPN drops connection during Zoom meetings. Device IP 192.168.1.45, contact alice.work@enterprise.corp or auth token bearer sk-9988223311.');
    } else if (type === 'secret') {
      setTitle('Production AWS S3 deployment pipeline failing on upload');
      setDescription('The CI runner failed with AccessDenied on s3:PutObject. AWS_ACCESS_KEY_ID: AKIAIOSFODNN7EXAMPLE and secret_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY. Please grant permissions.');
    } else if (type === 'db') {
      setTitle('PostgreSQL connection pool exhausted under heavy peak load');
      setDescription('Database latency spiked above 1800ms with error: too many connections for role pg_admin password=SecretDbPass123!.');
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchCat = filterCategory === 'ALL' || t.category === filterCategory;
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchCat && matchStatus;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080A10] text-[#EDF1F7] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-[#22E6B8] selection:text-[#080A10]">
      
      {/* Telemetry Ingestion Modal */}
      <XRayTelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        onCompleted={handleTelemetryComplete}
      />

      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22E6B8]/15 border border-[#22E6B8]/30 flex items-center justify-center text-[#22E6B8]">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#EDF1F7]">
              Client Self-Service & Triage Portal
            </h1>
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#22E6B8]/10 text-[#22E6B8] border border-[#22E6B8]/30">
              Zero-Trust Client
            </span>
          </div>
          <p className="font-mono text-[12px] text-[#8791A3] mt-1">
            Automatic in-flight credential scrubbing, contextual device harvesting, and real-time AI triage
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTickets}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#080A10] border border-white/[0.08] text-[12px] font-mono text-[#8791A3] hover:text-[#EDF1F7] hover:border-white/[0.2] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? 'animate-spin text-[#22E6B8]' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Ticket Ingestion Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="font-display text-[16px] font-semibold text-[#EDF1F7] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#22E6B8]" />
                Submit Support Incident
              </h2>
              <span className="font-mono text-[10px] text-[#565F70]">Real-Time Ingestion</span>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="p-3 bg-[#080A10] rounded-lg border border-white/[0.06]">
              <span className="font-mono text-[10.5px] uppercase font-semibold text-[#8791A3] flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#22E6B8]" /> Quick Telemetry Scenarios:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => fillSampleTicket('vpn')}
                  className="px-2.5 py-1 rounded bg-[#22E6B8]/10 text-[#22E6B8] border border-[#22E6B8]/30 hover:bg-[#22E6B8]/20 transition-colors cursor-pointer"
                >
                  VPN Flapping + Email
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleTicket('secret')}
                  className="px-2.5 py-1 rounded bg-[#FF5C6C]/10 text-[#FF5C6C] border border-[#FF5C6C]/30 hover:bg-[#FF5C6C]/20 transition-colors cursor-pointer"
                >
                  AWS Key Scrubbing
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleTicket('db')}
                  className="px-2.5 py-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 transition-colors cursor-pointer"
                >
                  DB Password Scrub
                </button>
              </div>
            </div>

            {/* Duplicate Warning Banner */}
            <DuplicateWarningBanner duplicates={duplicates} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8791A3] mb-1.5">
                  Incident Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cisco VPN repeatedly terminates session"
                  className="w-full px-3 py-2 text-[13px] font-mono border border-white/[0.09] rounded-lg bg-[#080A10] text-[#EDF1F7] placeholder-[#565F70] focus:ring-1 focus:ring-[#22E6B8] focus:border-[#22E6B8] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8791A3] mb-1.5">
                  Detailed Description & Logs
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident. In-flight PII scrubber will automatically strip passwords, keys, and emails before database write."
                  className="w-full px-3 py-2 text-[13px] font-mono border border-white/[0.09] rounded-lg bg-[#080A10] text-[#EDF1F7] placeholder-[#565F70] focus:ring-1 focus:ring-[#22E6B8] focus:border-[#22E6B8] transition-colors"
                />
              </div>

              {/* Real-time In-Flight PII Redactor Live Visualizer */}
              {detectedPIIPreview && (
                <div className="p-3 bg-[#22E6B8]/[0.06] border border-[#22E6B8]/30 rounded-lg space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-[#22E6B8]">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      In-Flight Scrub Preview ({detectedPIIPreview.count} entities detected)
                    </span>
                    <span className="text-[9.5px] uppercase bg-[#22E6B8]/20 px-1.5 py-0.5 rounded">Pre-Write Scrub</span>
                  </div>
                  <p className="font-mono text-[11px] text-[#8791A3] bg-[#080A10] p-2 rounded border border-white/[0.06] leading-relaxed truncate">
                    {detectedPIIPreview.scrubbed}
                  </p>
                </div>
              )}

              {/* Harvested Device Context Telemetry */}
              <ContextTelemetryPill diagnostics={diagnostics} />

              <button
                type="submit"
                disabled={isSubmitting || !title || !description}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-mono text-[13px] font-semibold text-[#080A10] bg-[#22E6B8] hover:bg-[#5CF2CE] transition-all shadow-[0_0_24px_-6px_rgba(34,230,184,0.6)] disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Streaming Telemetry...' : 'Submit with X-Ray Telemetry'}</span>
              </button>
            </form>

          </div>
        </div>

        {/* Right Column: Submitted Incidents Stream */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-[#0D1119] p-4 rounded-xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#22E6B8]" />
              <span className="font-display font-bold text-sm text-[#EDF1F7]">
                My Incident Stream ({filteredTickets.length})
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#EDF1F7] text-xs focus:ring-1 focus:ring-[#22E6B8]"
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
                className="px-2.5 py-1 rounded-lg bg-[#080A10] border border-white/[0.09] text-[#EDF1F7] text-xs focus:ring-1 focus:ring-[#22E6B8]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Ticket Cards */}
          {loadingTickets ? (
            <div className="bg-[#0D1119] border border-white/[0.08] rounded-xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#22E6B8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-mono text-xs text-[#8791A3]">Syncing client incident telemetry...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-[#0D1119] border border-white/[0.08] rounded-xl p-12 text-center">
              <FileText className="w-8 h-8 text-[#565F70] mx-auto mb-2" />
              <p className="font-display font-semibold text-sm text-[#EDF1F7]">No incidents recorded</p>
              <p className="font-mono text-xs text-[#565F70] mt-1">Submit your first issue using the form on the left</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-[#0D1119] border border-white/[0.08] hover:border-[#22E6B8]/30 rounded-xl p-4.5 transition-all shadow-lg group space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-[11px] text-[#565F70]">
                          #{ticket._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`font-mono text-[10px] font-semibold px-2 py-0.2 rounded border ${
                          ticket.status === 'Resolved'
                            ? 'bg-[#22E6B8]/15 text-[#22E6B8] border-[#22E6B8]/30'
                            : ticket.status === 'In Progress'
                            ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
                            : 'bg-[#FFB454]/15 text-[#FFB454] border-[#FFB454]/30'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-[#8791A3] border border-white/[0.06]">
                          {ticket.category || 'General'}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-[14.5px] text-[#EDF1F7] group-hover:text-[#22E6B8] transition-colors">
                        {ticket.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      <SLABadge
                        score={ticket.slaPrediction?.score || 15}
                        level={ticket.slaPrediction?.level || 'Low'}
                        isCompact
                      />
                    </div>
                  </div>

                  <p className="font-mono text-[12px] text-[#8791A3] line-clamp-2 leading-relaxed bg-[#080A10] p-2.5 rounded-lg border border-white/[0.05]">
                    {ticket.sanitizedDescription || ticket.description}
                  </p>

                  {/* Remediation SOP Pill if available */}
                  {ticket.nlpTriage?.suggestedRemediation && (
                    <div className="p-2 rounded-lg bg-[#22E6B8]/[0.05] border border-[#22E6B8]/20 flex items-start space-x-2 text-[11.5px] font-mono text-[#22E6B8]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{ticket.nlpTriage.suggestedRemediation}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px] font-mono text-[#565F70]">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[#22E6B8] font-bold">
                        NLP Confidence: {Math.round((ticket.nlpTriage?.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ClientPortal;
