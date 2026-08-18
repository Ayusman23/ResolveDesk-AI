import React from 'react';
import { AlertTriangle, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

const DuplicateWarningBanner = ({ duplicates = [], onSelectExisting }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-amber-900">
              Potential Outage Duplicate Detected
            </h4>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
              Novel Feature 3: Vector Cosine
            </span>
          </div>

          <p className="text-xs text-amber-800 mt-1">
            Our AI engine calculated high semantic similarity between your description and active reported incidents. An investigation may already be underway:
          </p>

          <div className="mt-3 space-y-2">
            {duplicates.map((item) => {
              const simPercent = Math.round(item.similarity * 100);
              return (
                <div
                  key={item.id}
                  className="bg-white/80 border border-amber-200/80 rounded-lg p-2.5 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md">
                      {simPercent}% Match
                    </span>
                    {onSelectExisting && (
                      <button
                        type="button"
                        onClick={() => onSelectExisting(item)}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-amber-700/80 mt-2 italic">
            Tip: If your issue matches one above, subscribing to it avoids creating duplicate support tickets.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningBanner;
