'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface CountingSortVisualizerProps {
  step: ExecutionStep;
}

export const CountingSortVisualizer: React.FC<CountingSortVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const countArray: number[] = state.countArray || [];
  const outputArray: number[] = state.outputArray || [];
  const minVal: number = state.min ?? 0;
  const maxVal: number = state.max ?? 0;
  const highlightedCountIndex = state.highlightedCountIndex;
  const highlightedOutputIndex = state.highlightedOutputIndex;
  const inputHighlights = step.highlights || [];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[340px] w-full bg-slate-950/60 rounded-xl border border-dark-border">
      {/* Overview Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Min Value: <strong className="text-brand-300 font-mono">{minVal}</strong>
          </span>
          <span className="text-slate-400">
            Max Value: <strong className="text-brand-300 font-mono">{maxVal}</strong>
          </span>
          <span className="text-slate-400">
            Range: <strong className="text-cyan-300 font-mono">{state.range ?? 0}</strong>
          </span>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
          Phase: <strong className="text-brand-400">{step.operation}</strong>
        </span>
      </div>

      {/* Row 1: Original Input Array */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Input Array
        </span>
        <div className="flex flex-wrap gap-2">
          {(step.arrayState || []).map((val, idx) => {
            const isHighlighted = inputHighlights.includes(idx);
            return (
              <div
                key={idx}
                className={`w-11 h-11 flex flex-col items-center justify-center rounded-lg border font-mono text-xs transition-all ${
                  isHighlighted
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'border-slate-700 bg-slate-900 text-slate-200'
                }`}
              >
                <span className="font-bold">{val}</span>
                <span className="text-[9px] text-slate-500">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Frequency Count Array */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <span>Frequency / Cumulative Count Array</span>
          <span className="text-[10px] text-slate-500 font-normal">
            (Indexed by value - min)
          </span>
        </span>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {countArray.map((count, idx) => {
            const actualVal = minVal + idx;
            const isCountHighlighted = highlightedCountIndex === idx;
            return (
              <motion.div
                key={idx}
                layout
                className={`w-12 h-14 flex flex-col items-center justify-center rounded-lg border font-mono text-xs transition-all ${
                  isCountHighlighted
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-400">Val: {actualVal}</span>
                <span className="font-bold text-sm text-cyan-300">{count}</span>
                <span className="text-[9px] text-slate-500">c[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Output Array */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          Sorted Output Array
        </span>
        <div className="flex flex-wrap gap-2">
          {outputArray.map((val, idx) => {
            const isOutputHighlighted = highlightedOutputIndex === idx;
            return (
              <motion.div
                key={idx}
                layout
                className={`w-11 h-11 flex flex-col items-center justify-center rounded-lg border font-mono text-xs transition-all ${
                  isOutputHighlighted
                    ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold">{val}</span>
                <span className="text-[9px] text-slate-500">[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
