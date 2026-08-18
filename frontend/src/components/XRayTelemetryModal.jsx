import React, { useEffect, useState, useRef } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Search, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FileCode2,
  Terminal as TerminalIcon
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const PIPELINE_STAGES = [
  { id: 'CONTEXT_INDEXING', label: 'Context Harvesting', icon: Cpu, desc: 'Client OS & telemetry indexing' },
  { id: 'PII_REDACTION', label: 'In-Flight PII Scrub', icon: Lock, desc: 'Sanitizing secrets & credentials' },
  { id: 'EMBEDDING_DUPLICATE_CHECK', label: 'Outage Correlation', icon: Search, desc: 'Cosine similarity vector scan' },
  { id: 'NLP_TRIAGE', label: 'NLP Triage Engine', icon: Activity, desc: 'Category & priority scoring' },
  { id: 'SLA_PREDICTION', label: 'SLA Breach Predictor', icon: ShieldCheck, desc: 'Mathematical risk modeling' },
];

const XRayTelemetryModal = ({ isOpen, onClose, ticketData, onCompleted }) => {
  const { socket } = useSocket();
  const [logs, setLogs] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(10);
  const [activeStep, setActiveStep] = useState('CONTEXT_INDEXING');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [piiFound, setPiiFound] = useState([]);
  const [sanitizedSnippet, setSanitizedSnippet] = useState('');
  const [slaResult, setSlaResult] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setLogs([]);
      setCurrentProgress(10);
      setActiveStep('CONTEXT_INDEXING');
      setCompletedSteps(new Set());
      setPiiFound([]);
      setSanitizedSnippet('');
      setSlaResult(null);
      setIsFinished(false);
      return;
    }

    if (!socket) return;

    const handleTelemetryStep = (payload) => {
      const { step, status, message, progress, data, timestamp } = payload;

      setLogs((prev) => [
        ...prev,
        {
          step,
          status,
          message,
          timestamp: timestamp || new Date().toLocaleTimeString(),
        },
      ]);

      if (progress) setCurrentProgress(progress);
      if (step) setActiveStep(step);

      if (status === 'COMPLETED') {
        setCompletedSteps((prev) => new Set([...prev, step]));
      }

      // Capture metadata if present
      if (data?.piiCount && data.sanitizedPreview) {
        setSanitizedSnippet(data.sanitizedPreview);
      }
      if (data?.slaRisk) {
        setSlaResult(data.slaRisk);
      }

      if (step === 'COMPLETED' || progress === 100) {
        setIsFinished(true);
        if (onCompleted) onCompleted();
      }
    };

    socket.on('telemetry:step', handleTelemetryStep);

    return () => {
      socket.off('telemetry:step', handleTelemetryStep);
    };
  }, [isOpen, socket, onCompleted]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with animated radar beam */}
        <div className="relative px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  WebSocket "X-Ray" Telemetry Stream
                </h3>
                <span className="text-[10px] font-mono uppercase bg-brand-900/60 text-brand-300 border border-brand-700/50 px-2 py-0.5 rounded">
                  Novel Feature 7
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-time AI pipeline execution & Zero-Trust credential scrub
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currentProgress}% COMPLETED
            </span>
            <div className="w-32 bg-slate-800 h-2 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-brand-500 via-indigo-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline Stage Pills */}
        <div className="px-6 py-3 bg-slate-850/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = completedSteps.has(stage.id) || (isFinished && idx < 5);
            const isCurrent = activeStep === stage.id && !isDone;

            return (
              <div
                key={stage.id}
                className={`p-2 rounded-lg border transition-all text-left flex items-center space-x-2 ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : isCurrent
                    ? 'bg-brand-950/60 border-brand-500/80 text-brand-200 ring-1 ring-brand-500/30'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-brand-400 animate-spin-slow' : 'text-slate-500'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold truncate">{stage.label}</p>
                  <p className="text-[9px] text-slate-400 truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log Viewer */}
        <div className="p-6 space-y-4">
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <div className="flex items-center space-x-2">
                <TerminalIcon className="w-3.5 h-3.5 text-brand-400" />
                <span>Zero-Trust Diagnostic Terminal</span>
              </div>
              <span className="text-[10px] text-slate-500">Node.js Express &lt;--&gt; FastAPI Microservice</span>
            </div>

            <div
              ref={logContainerRef}
              className="h-44 overflow-y-auto space-y-2 text-slate-300 pr-1 select-text scroll-smooth"
            >
              {logs.length === 0 ? (
                <div className="text-slate-600 italic animate-pulse">
                  Establishing secure WebSocket handshake on telemetry channel...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-500 text-[10px] shrink-0">[{log.timestamp}]</span>
                    <span className={`shrink-0 font-bold px-1 rounded text-[10px] ${
                      log.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : log.status === 'TRIGGERED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-brand-950 text-brand-400 border border-brand-800'
                    }`}>
                      {log.step}
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sanitized PII & SLA Insight Cards */}
          {sanitizedSnippet && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs flex items-start space-x-3">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-400">In-Flight PII Redaction Verified:</span>
                <p className="text-slate-300 font-mono text-[11px] mt-0.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate">
                  "{sanitizedSnippet}"
                </p>
              </div>
            </div>
          )}

          {slaResult && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span className="text-slate-300">
                  Calculated SLA Breach Risk: <strong className="text-white">{slaResult.score}/100</strong> ({slaResult.level} Risk)
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {slaResult.remainingHours}h remaining
              </span>
            </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Zero-Trust Record persisted & ready</span>
          </div>

          <button
            onClick={onClose}
            disabled={!isFinished}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              isFinished
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>{isFinished ? 'View Created Incident' : 'Streaming Telemetry...'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default XRayTelemetryModal;
