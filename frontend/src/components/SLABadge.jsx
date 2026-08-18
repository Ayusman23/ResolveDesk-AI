import React from 'react';
import { AlertCircle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SLABadge = ({ score = 0, level = 'Low', deadline, status, isCompact = false }) => {
  if (status === 'Resolved' || status === 'Closed') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>SLA Met</span>
      </span>
    );
  }

  const getBadgeStyle = () => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500/20';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getDotColor = () => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-500 animate-pulse';
      case 'High':
        return 'bg-orange-500';
      case 'Medium':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  if (isCompact) {
    return (
      <span
        title={`SLA Breach Probability: ${score}/100 (${level} Risk)`}
        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getBadgeStyle()}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
        <span className="font-mono">{score}% SLA Risk</span>
      </span>
    );
  }

  return (
    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${getBadgeStyle()}`}>
      <div className="flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">{level} SLA Risk</span>
            <span className="text-[10px] font-mono px-1 rounded bg-white/60">
              {score}/100 Score
            </span>
          </div>
          <p className="text-[11px] opacity-90 mt-0.5">
            {level === 'Critical'
              ? 'Imminent breach predicted based on queue volume'
              : level === 'High'
              ? 'Elevated response priority required'
              : 'Within standard operating thresholds'}
          </p>
        </div>
      </div>

      {deadline && (
        <div className="text-right pl-3 shrink-0 border-l border-current/10">
          <div className="flex items-center space-x-1 text-[11px] font-mono">
            <Clock className="w-3 h-3" />
            <span>{new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLABadge;
