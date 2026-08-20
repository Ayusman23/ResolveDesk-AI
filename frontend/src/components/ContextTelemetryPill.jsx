import React from 'react';
import { Laptop, Globe, Monitor, Wifi, Shield } from 'lucide-react';

const ContextTelemetryPill = ({ diagnostics }) => {
  if (!diagnostics) return null;

  return (
    <div className="bg-[#0D1119] border border-white/[0.08] rounded-xl p-3 text-xs text-[#8791A3]">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-[11px] font-semibold text-[#EDF1F7]">
        <span className="flex items-center gap-1.5 font-mono">
          <Shield className="w-3.5 h-3.5 text-[#22E6B8]" />
          <span>Device Context Harvesting</span>
        </span>
        <span className="font-mono text-[9.5px] text-[#22E6B8] bg-[#22E6B8]/10 border border-[#22E6B8]/30 px-2 py-0.5 rounded uppercase">
          Auto-Harvested
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
        <div className="flex items-center space-x-1.5 truncate bg-[#080A10] px-2 py-1 rounded border border-white/[0.05]">
          <Laptop className="w-3.5 h-3.5 text-[#22E6B8] shrink-0" />
          <span className="truncate text-[#EDF1F7]">{diagnostics.os || 'Unknown OS'}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate bg-[#080A10] px-2 py-1 rounded border border-white/[0.05]">
          <Globe className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <span className="truncate text-[#EDF1F7]">{diagnostics.browser || 'Browser'}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate bg-[#080A10] px-2 py-1 rounded border border-white/[0.05]">
          <Monitor className="w-3.5 h-3.5 text-[#8B7CFA] shrink-0" />
          <span className="truncate text-[#EDF1F7]">{diagnostics.screenResolution || '1080p'}</span>
        </div>
        <div className="flex items-center space-x-1.5 truncate bg-[#080A10] px-2 py-1 rounded border border-white/[0.05]">
          <Wifi className="w-3.5 h-3.5 text-[#FFB454] shrink-0" />
          <span className="truncate text-[#EDF1F7]">{diagnostics.networkType || '4G/WiFi'}</span>
        </div>
      </div>
    </div>
  );
};

export default ContextTelemetryPill;
