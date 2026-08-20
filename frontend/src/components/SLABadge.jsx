import React from 'react';
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SLABadge = ({ score = 0, level = 'Low', deadline, status, isCompact = false }) => {
  if (status === 'Resolved' || status === 'Closed') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#22E6B8]/10 text-[#22E6B8] border border-[#22E6B8]/30">
        <CheckCircle2 className="w-3 h-3 text-[#22E6B8]" />
        <span>SLA Met</span>
      </span>
    );
  }

  const getBadgeStyle = () => {
    switch (level) {
      case 'Critical':
        return 'bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30 shadow-[0_0_12px_-4px_rgba(255,92,108,0.4)]';
      case 'High':
        return 'bg-[#FFB454]/15 text-[#FFB454] border-[#FFB454]/30';
      case 'Medium':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30';
      default:
        return 'bg-[#22E6B8]/15 text-[#22E6B8] border-[#22E6B8]/30';
    }
  };

  const getDotColor = () => {
    switch (level) {
      case 'Critical':
        return 'bg-[#FF5C6C] pulse-dot';
      case 'High':
        return 'bg-[#FFB454]';
      case 'Medium':
        return 'bg-[#38BDF8]';
      default:
        return 'bg-[#22E6B8]';
    }
  };

  if (isCompact) {
    return (
      <span
        title={`SLA Breach Probability: ${score}% (${level} Risk)`}
        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${getBadgeStyle()}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
        <span>{score}% SLA Risk</span>
      </span>
    );
  }

  return (
    <div className={`p-2.5 rounded-lg border flex items-center justify-between ${getBadgeStyle()}`}>
      <div className="flex items-center space-x-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider">{level} SLA Risk</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-[#EDF1F7]">
              {score}% Breach Probability
            </span>
          </div>
          <p className="text-[11px] text-[#8791A3] mt-0.5">
            {level === 'Critical'
              ? 'Imminent breach predicted based on queue volume'
              : level === 'High'
              ? 'Elevated response priority required'
              : 'Within standard operating thresholds'}
          </p>
        </div>
      </div>

      {deadline && (
        <div className="text-right pl-3 shrink-0 border-l border-white/[0.08]">
          <div className="flex items-center space-x-1 text-[11px] font-mono text-[#8791A3]">
            <Clock className="w-3 h-3 text-[#22E6B8]" />
            <span className="text-[#EDF1F7]">{new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLABadge;
