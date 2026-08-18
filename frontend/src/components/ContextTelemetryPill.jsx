import React from 'react';
import { Laptop, Globe, Monitor, Wifi, Shield } from 'lucide-react';

const ContextTelemetryPill = ({ diagnostics }) => {
  if (!diagnostics) return null;

  return (
    <div className="bg-slate-100/90 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 text-[11px] font-semibold text-slate-700">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-600" />
          Novel Feature 5: Contextual Indexing Telemetry
        </span>
        <span className="font-mono text-[10px] text-brand-600 uppercase">Auto-Injected</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="flex items-center space-x-1.5 truncate">
          <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{diagnostics.os}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{diagnostics.browser}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{diagnostics.screenResolution}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate">
          <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{diagnostics.networkType}</span>
        </div>
      </div>
    </div>
  );
};

export default ContextTelemetryPill;
