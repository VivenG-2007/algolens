'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';
import { Target, ArrowDown, CheckCircle2, XCircle } from 'lucide-react';

interface InterpolationSearchVisualizerProps {
  step: ExecutionStep;
}

export const InterpolationSearchVisualizer: React.FC<InterpolationSearchVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const low: number = state.low ?? 0;
  const high: number = state.high ?? ((step.arrayState?.length || 1) - 1);
  const target: number = state.target ?? Number(step.variables?.target ?? 0);
  const pos: number | null = state.pos ?? null;
  const found: boolean = state.found ?? false;
  const arrayState: number[] = step.arrayState || [];
  const calculationStr = (step.variables?.calculation as string) || state.formulaExplanation || '';

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-[380px] w-full bg-slate-950/70 rounded-xl border border-dark-border shadow-xl backdrop-blur-sm">
      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-950/80 border border-brand-500/40 text-brand-200">
            <Target className="w-3.5 h-3.5 text-brand-400" />
            <span>
              Target: <strong className="font-mono text-white text-sm">{target}</strong>
            </span>
          </div>
          <span className="text-slate-400">
            Search Range: <strong className="text-cyan-300 font-mono">[{low} ... {high}]</strong>
          </span>
          {pos !== null && (
            <span className="text-slate-400">
              Estimated pos: <strong className="text-amber-400 font-mono text-sm">{pos}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Range [low, high]
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Estimated Pos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Found
          </span>
        </div>
      </div>

      {/* Formula Computation Banner */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-brand-500/30 shadow-md">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1 flex items-center justify-between">
          <span>Interpolation Formula</span>
          <span className="text-[10px] text-slate-400 font-mono">Slope-based intelligent probing</span>
        </div>
        <div className="font-mono text-xs sm:text-sm text-cyan-200 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mb-2 overflow-x-auto">
          pos = low + ⌊((target - arr[low]) × (high - low)) / (arr[high] - arr[low])⌋
        </div>
        {calculationStr && (
          <div className="font-mono text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg">
            Active calculation: {calculationStr}
          </div>
        )}
      </div>

      {/* Array Elements with Animated Probe Arrow & Range Bracket */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Array View & Calculated Probe
        </span>

        <div className="flex flex-wrap items-end gap-2.5 pt-6 pb-2 overflow-x-auto">
          {arrayState.map((val, idx) => {
            const isLow = idx === low;
            const isHigh = idx === high;
            const isPos = idx === pos;
            const inRange = idx >= low && idx <= high;
            const isTargetMatch = found && isPos;

            return (
              <div key={idx} className="relative flex flex-col items-center">
                {/* Animated Probe Arrow */}
                <AnimatePresence>
                  {isPos && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className="absolute -top-7 flex flex-col items-center text-amber-400"
                    >
                      <span className="text-[10px] font-mono font-bold leading-none uppercase">probe</span>
                      <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Range Label Above Low/High */}
                {!isPos && (isLow || isHigh) && (
                  <div className="absolute -top-5 text-[10px] font-mono font-semibold text-cyan-400 uppercase">
                    {isLow && isHigh ? 'low=high' : isLow ? 'low' : 'high'}
                  </div>
                )}

                {/* Array Chip */}
                <motion.div
                  layout
                  className={`w-12 h-14 flex flex-col items-center justify-center rounded-xl border text-xs font-mono transition-all ${
                    isTargetMatch
                      ? 'border-emerald-400 bg-emerald-950 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400 scale-105'
                      : isPos
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/60 scale-105'
                      : isLow || isHigh
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400/50'
                      : inRange
                      ? 'border-slate-700 bg-slate-900/90 text-slate-200'
                      : 'border-slate-800/60 bg-slate-950/40 text-slate-600 opacity-40'
                  }`}
                >
                  <span className="font-bold text-sm">{val}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">[{idx}]</span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {found ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Target {target} located at index {pos}!</span>
            </div>
          ) : pos !== null ? (
            <div className="text-slate-300 font-mono">
              arr[{pos}] = {arrayState[pos]} {arrayState[pos] < target ? `< ${target} (Range shrinks: low = ${pos + 1})` : `> ${target} (Range shrinks: high = ${pos - 1})`}
            </div>
          ) : (
            <span className="text-slate-400 font-mono">Active interval: [{low} ... {high}]</span>
          )}
        </div>
      </div>
    </div>
  );
};
