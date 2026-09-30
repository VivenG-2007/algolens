'use client';

import React from 'react';
import { ExecutionStep } from '@/types';
import { Activity, Variable, Info } from 'lucide-react';

interface VariablesPanelProps {
  step: ExecutionStep;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({ step }) => {
  const variables = step.variables || {};
  const entries = Object.entries(variables);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg p-4 flex flex-col h-full">
      {/* Title & Description */}
      <div className="border-b border-dark-border/60 pb-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
          <Info className="w-3.5 h-3.5" />
          <span>Step Action & Explanation</span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1.5">{step.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
      </div>

      {/* Variables Watch List */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Variable className="w-3.5 h-3.5 text-accent-cyan" />
            Watch Variables
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {entries.length} tracked
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic py-6">
            No local variables in this state.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[220px]">
            {entries.map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs"
              >
                <span className="text-slate-400">{key}:</span>
                <span className="font-bold text-cyan-300">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operation & Complexity Footer */}
      <div className="pt-3 mt-3 border-t border-dark-border/60 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Op:</span>
          <span className="text-white font-bold">{step.operation || 'EVAL'}</span>
        </div>

        {step.complexity && (
          <div className="text-slate-400">
            Time: <span className="text-amber-400 font-semibold">{step.complexity.time}</span>
          </div>
        )}
      </div>
    </div>
  );
};
