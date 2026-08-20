import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

const DuplicateWarningBanner = ({ duplicates = [], onSelectExisting }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-[#FFB454]/10 border border-amber-200 dark:border-[#FFB454]/30 rounded-xl p-4 mb-4 shadow-sm dark:shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 text-slate-900 dark:text-[#EDF1F7]">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-amber-100 text-amber-700 dark:bg-[#FFB454]/20 dark:text-[#FFB454] rounded-lg shrink-0 mt-0.5 border border-amber-200 dark:border-[#FFB454]/30">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-[13.5px] font-bold text-amber-800 dark:text-[#FFB454]">
              Active Outage Correlation Detected
            </h4>
            <span className="font-mono text-[9.5px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-[#FFB454]/20 dark:text-[#FFB454] dark:border-[#FFB454]/40">
              Cosine Similarity
            </span>
          </div>

          <p className="font-mono text-[12px] text-slate-600 dark:text-[#8791A3] mt-1">
            Our AI engine calculated high semantic similarity between your description and active reported incidents:
          </p>

          <div className="mt-3 space-y-2">
            {duplicates.map((item) => {
              const simPercent = Math.round(item.similarity * 100);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#080A10] border border-slate-200 dark:border-white/[0.08] rounded-lg p-2.5 flex items-center justify-between hover:border-amber-300 dark:hover:border-[#FFB454]/40 transition-colors shadow-xs"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[12.5px] font-semibold text-slate-900 dark:text-[#EDF1F7] truncate">
                        {item.title}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-[#8791A3]">
                        {item.category}
                      </span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                        item.priority === 'Critical' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#FF5C6C]/15 dark:text-[#FF5C6C] dark:border-[#FF5C6C]/30' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#FFB454]/15 dark:text-[#FFB454] dark:border-[#FFB454]/30'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-[#22E6B8] bg-emerald-50 dark:bg-[#22E6B8]/10 border border-emerald-200 dark:border-[#22E6B8]/30 px-2 py-0.5 rounded">
                      {simPercent}% Match
                    </span>
                    {onSelectExisting && (
                      <button
                        type="button"
                        onClick={() => onSelectExisting(item)}
                        className="font-mono text-[11px] text-slate-500 hover:text-slate-900 dark:text-[#8791A3] dark:hover:text-[#EDF1F7] flex items-center gap-1 hover:underline cursor-pointer"
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

          <p className="font-mono text-[11px] text-slate-500 dark:text-[#565F70] mt-2">
            Tip: If your issue matches one above, referencing it speeds up incident resolution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningBanner;
