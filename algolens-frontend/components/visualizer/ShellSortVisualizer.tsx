'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface ShellSortVisualizerProps {
  step: ExecutionStep;
}

export const ShellSortVisualizer: React.FC<ShellSortVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const gap: number = state.gap ?? 1;
  const comparingIndices: number[] = state.comparingIndices || [];
  const connectedChains: number[][] = state.connectedChains || [];
  const arrayState: number[] = step.arrayState || [];
  const maxVal = Math.max(...arrayState, 1);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-[380px] w-full bg-slate-950/70 rounded-xl border border-dark-border shadow-xl backdrop-blur-sm">
      {/* Top Gap Status & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-slate-400">
            Current Gap: <strong className="text-brand-300 font-mono text-base">{gap}</strong>
          </span>
          <span className="text-slate-400">
            Operation: <strong className="text-cyan-300 font-mono uppercase">{step.operation}</strong>
          </span>
          {comparingIndices.length >= 2 && (
            <span className="text-slate-400">
              Comparing Indices:{' '}
              <strong className="text-amber-400 font-mono text-sm">
                A[{comparingIndices[0]}] ({arrayState[comparingIndices[0]]})
              </strong>{' '}
              and{' '}
              <strong className="text-amber-400 font-mono text-sm">
                A[{comparingIndices[1]}] ({arrayState[comparingIndices[1]]})
              </strong>
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Comparing Gap Pair
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Chain Member
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Sorted
          </span>
        </div>
      </div>

      {/* Vertical Bar Chart with Gap Connecting Lines */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Vertical Element Bars & Gapped Connection</span>
          <span className="text-[10px] text-slate-500 font-mono">gap = {gap}</span>
        </span>

        <div className="relative pt-8 pb-4 flex items-end justify-center gap-3 sm:gap-4 min-h-[220px] bg-slate-900/60 rounded-xl border border-slate-800/80 px-4">
          {arrayState.map((val, idx) => {
            const isComparing = comparingIndices.includes(idx);
            const heightPercent = Math.max(18, Math.round((val / maxVal) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                {/* Bar Value on Top */}
                <span
                  className={`text-xs font-mono font-bold ${
                    isComparing ? 'text-amber-300' : 'text-slate-300'
                  }`}
                >
                  {val}
                </span>

                {/* Animated Vertical Bar */}
                <motion.div
                  layout
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`w-9 sm:w-11 rounded-t-lg border transition-all flex items-end justify-center pb-2 ${
                    isComparing
                      ? 'border-amber-400 bg-gradient-to-t from-amber-600/80 to-amber-400/80 shadow-[0_0_18px_rgba(245,158,11,0.6)]'
                      : 'border-brand-500/50 bg-gradient-to-t from-brand-900/60 to-brand-500/60'
                  }`}
                  style={{ minHeight: '36px', maxHeight: '140px' }}
                />

                {/* Index Beneath Bar */}
                <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gapped Interleaving Sub-Chains Display */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <span>Active Gapped Chains (Stride = {gap})</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {connectedChains.map((chain, cIdx) => (
            <div
              key={cIdx}
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center gap-2"
            >
              <span className="text-brand-400 font-semibold">Chain {cIdx}:</span>
              <span className="text-slate-200">
                {chain.map((idx) => `A[${idx}](${arrayState[idx]})`).join(' ──→ ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
