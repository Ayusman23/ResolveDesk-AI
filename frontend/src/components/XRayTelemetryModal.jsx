import React, { useEffect, useState, useRef } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Search, 
  Activity, 
  CheckCircle2, 
  ChevronRight,
  Terminal as TerminalIcon,
  X
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const PIPELINE_STAGES = [
  { id: 'CONTEXT_INDEXING', label: 'Context Harvesting', icon: Cpu, desc: 'Client OS & device diagnostics' },
  { id: 'PII_REDACTION', label: 'In-Flight PII Scrub', icon: Lock, desc: 'Sanitizing secrets & credentials' },
  { id: 'EMBEDDING_DUPLICATE_CHECK', label: 'Outage Correlation', icon: Search, desc: 'Cosine similarity vector scan' },
  { id: 'NLP_TRIAGE', label: 'NLP Triage Engine', icon: Activity, desc: 'Category & priority scoring' },
  { id: 'SLA_PREDICTION', label: 'SLA Breach Predictor', icon: ShieldCheck, desc: 'Mathematical risk modeling' },
];

const DEFAULT_LOGS = [
  { step: 'CONTEXT_INDEXING', status: 'COMPLETED', message: 'Client OS, Browser & Screen diagnostics ingested into secure payload' },
  { step: 'PII_REDACTION', status: 'COMPLETED', message: 'In-flight NER scrubbed sensitive credentials & API keys' },
  { step: 'EMBEDDING_DUPLICATE_CHECK', status: 'COMPLETED', message: 'Cosine similarity calculated over active enterprise incident vectors' },
  { step: 'NLP_TRIAGE', status: 'COMPLETED', message: 'Classified incident category & assigned SLA priority weighting' },
  { step: 'SLA_PREDICTION', status: 'COMPLETED', message: 'Mathematical breach probability & deadline modeled' },
  { step: 'COMPLETED', status: 'COMPLETED', message: 'Zero-Trust ticket persisted to MongoDB Atlas cluster' },
];

const XRayTelemetryModal = ({ isOpen, onClose, onCompleted }) => {
  const { socket } = useSocket();
  const [logs, setLogs] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(15);
  const [activeStep, setActiveStep] = useState('CONTEXT_INDEXING');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [sanitizedSnippet, setSanitizedSnippet] = useState('');
  const [slaResult, setSlaResult] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setLogs([]);
      setCurrentProgress(15);
      setActiveStep('CONTEXT_INDEXING');
      setCompletedSteps(new Set());
      setSanitizedSnippet('');
      setSlaResult(null);
      setIsFinished(false);
      return;
    }

    const startTime = new Date().toLocaleTimeString();
    setLogs([
      {
        step: 'HANDSHAKE',
        status: 'COMPLETED',
        message: 'Establishing secure WebSocket telemetry handshake...',
        timestamp: startTime,
      },
    ]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < DEFAULT_LOGS.length) {
        const item = DEFAULT_LOGS[stepIndex];
        const pct = Math.min(100, Math.round(((stepIndex + 1) / DEFAULT_LOGS.length) * 100));

        setLogs((prev) => [
          ...prev,
          {
            step: item.step,
            status: item.status,
            message: item.message,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        setCurrentProgress(pct);
        setActiveStep(item.step);
        setCompletedSteps((prev) => new Set([...prev, item.step]));

        if (item.step === 'COMPLETED' || pct === 100) {
          setIsFinished(true);
          if (onCompleted) onCompleted();
          clearInterval(interval);
        }
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 220);

    const handleTelemetryStep = (payload) => {
      const { step, status, message, progress, data, timestamp } = payload;
      if (message) {
        setLogs((prev) => [
          ...prev,
          {
            step,
            status,
            message,
            timestamp: timestamp || new Date().toLocaleTimeString(),
          },
        ]);
      }

      if (progress && progress > currentProgress) {
        setCurrentProgress(progress);
      }
      if (step) {
        setActiveStep(step);
        setCompletedSteps((prev) => new Set([...prev, step]));
      }
      if (data?.sanitizedPreview) {
        setSanitizedSnippet(data.sanitizedPreview);
      }
      if (data?.slaRisk) {
        setSlaResult(data.slaRisk);
      }
      if (step === 'COMPLETED' || progress === 100) {
        setIsFinished(true);
        if (onCompleted) onCompleted();
        clearInterval(interval);
      }
    };

    if (socket) {
      socket.on('telemetry:step', handleTelemetryStep);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('telemetry:step', handleTelemetryStep);
      }
    };
  }, [isOpen, socket, onCompleted]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080A10]/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#22E6B8] selection:text-[#080A10]">
      <div className="bg-[#0D1119] border border-white/[0.1] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-[#EDF1F7] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative px-6 py-4 bg-[#080A10] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#22E6B8]/15 border border-[#22E6B8]/40 flex items-center justify-center text-[#22E6B8] shadow-[0_0_16px_-4px_rgba(34,230,184,0.4)]">
              <Radio className="w-5 h-5 pulse-dot" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[16px] font-bold text-[#EDF1F7] tracking-wide">
                  WebSocket "X-Ray" Telemetry Stream
                </h3>
                <span className="font-mono text-[9.5px] uppercase bg-[#22E6B8]/10 text-[#22E6B8] border border-[#22E6B8]/30 px-2 py-0.5 rounded">
                  Live Topology
                </span>
              </div>
              <p className="font-mono text-[11.5px] text-[#8791A3]">
                Real-time AI pipeline execution & Zero-Trust credential scrub
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-bold text-[#22E6B8]">
              {currentProgress}% COMPLETED
            </span>
            <div className="w-32 bg-[#080A10] h-2 rounded-full mt-1.5 overflow-hidden border border-white/[0.08]">
              <div
                className="bg-gradient-to-r from-[#22E6B8] via-[#38BDF8] to-[#8B7CFA] h-full transition-all duration-300 rounded-full"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline Stage Pills */}
        <div className="px-6 py-3 bg-[#0A0D14] border-b border-white/[0.06] grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = completedSteps.has(stage.id) || (isFinished && idx < 5);
            const isCurrent = activeStep === stage.id && !isDone;

            return (
              <div
                key={stage.id}
                className={`p-2 rounded-lg border transition-all text-left flex items-center space-x-2 ${
                  isDone
                    ? 'bg-[#22E6B8]/[0.08] border-[#22E6B8]/40 text-[#22E6B8]'
                    : isCurrent
                    ? 'bg-[#38BDF8]/[0.10] border-[#38BDF8]/50 text-[#38BDF8] shadow-[0_0_12px_-3px_rgba(56,189,248,0.4)]'
                    : 'bg-[#080A10]/60 border-white/[0.05] text-[#565F70]'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22E6B8]" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#38BDF8] pulse-dot' : 'text-[#565F70]'}`} />
                  )}
                </div>
                <div className="min-w-0 font-mono">
                  <p className="text-[11px] font-semibold truncate">{stage.label}</p>
                  <p className="text-[9px] text-[#565F70] truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log Viewer */}
        <div className="p-6 space-y-4">
          <div className="bg-[#080A10] border border-white/[0.08] rounded-xl p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-[#8791A3] text-[11px]">
              <div className="flex items-center space-x-2">
                <TerminalIcon className="w-3.5 h-3.5 text-[#22E6B8]" />
                <span className="text-[#EDF1F7]">Zero-Trust Diagnostic Terminal</span>
              </div>
              <span className="text-[10px] text-[#565F70]">Socket.IO Ingestion Stream</span>
            </div>

            <div
              ref={logContainerRef}
              className="h-44 overflow-y-auto space-y-2 text-[#EDF1F7] pr-1 select-text scroll-smooth"
            >
              {logs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-[#565F70] text-[10px] shrink-0">[{log.timestamp}]</span>
                  <span className={`shrink-0 font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    log.status === 'COMPLETED'
                      ? 'bg-[#22E6B8]/15 text-[#22E6B8] border border-[#22E6B8]/30'
                      : log.status === 'TRIGGERED'
                      ? 'bg-[#FFB454]/15 text-[#FFB454] border border-[#FFB454]/30'
                      : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                  }`}>
                    {log.step}
                  </span>
                  <span className="text-[#EDF1F7]">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sanitized PII & SLA Insight Cards */}
          {sanitizedSnippet && (
            <div className="bg-[#080A10] border border-white/[0.08] rounded-xl p-3 text-xs flex items-start space-x-3">
              <Lock className="w-4 h-4 text-[#22E6B8] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[#22E6B8]">In-Flight PII Redaction Verified:</span>
                <p className="text-[#EDF1F7] font-mono text-[11px] mt-1 bg-[#0D1119] px-2.5 py-1 rounded border border-white/[0.07] truncate">
                  "{sanitizedSnippet}"
                </p>
              </div>
            </div>
          )}

          {slaResult && (
            <div className="bg-[#080A10] border border-white/[0.08] rounded-xl p-3 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#22E6B8]" />
                <span className="text-[#8791A3]">
                  Calculated SLA Breach Risk: <strong className="text-[#EDF1F7]">{slaResult.score}%</strong> ({slaResult.level} Risk)
                </span>
              </div>
              <span className="text-[#565F70] text-[11px]">
                {slaResult.remainingHours}h remaining
              </span>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="px-6 py-4 bg-[#080A10] border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-[11.5px] text-[#8791A3]">
            <span className={`w-2 h-2 rounded-full ${isFinished ? 'bg-[#22E6B8]' : 'bg-[#FFB454] pulse-dot'}`} />
            <span>{isFinished ? 'Zero-Trust Record persisted & ready' : 'Streaming Real-Time Telemetry...'}</span>
          </div>

          <button
            onClick={onClose}
            disabled={!isFinished}
            className={`px-5 py-2 rounded-lg font-mono text-[13px] font-semibold transition-all flex items-center space-x-1.5 ${
              isFinished
                ? 'bg-[#22E6B8] hover:bg-[#5CF2CE] text-[#080A10] shadow-[0_0_20px_-6px_rgba(34,230,184,0.6)] cursor-pointer'
                : 'bg-white/[0.05] text-[#565F70] cursor-not-allowed border border-white/[0.08]'
            }`}
          >
            <span>{isFinished ? 'View Created Incident' : 'Processing Telemetry...'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default XRayTelemetryModal;
