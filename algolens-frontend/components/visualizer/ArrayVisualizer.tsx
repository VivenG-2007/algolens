'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';
import { GitFork, Combine, CheckCircle2, Split } from 'lucide-react';

interface ArrayVisualizerProps {
  step: ExecutionStep;
  initialArray?: number[];
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  step,
  initialArray = [],
}) => {
  const currentArray = step.arrayState || initialArray;
  const highlights = step.highlights || [];
  const variables = step.variables || {};
  const maxVal = Math.max(...currentArray, 10);
  const minVal = Math.min(...currentArray, 0);
  const span = Math.max(maxVal - minVal, 10);

  // Identify pointer assignments
  const pointers: { label: string; index: number; color: string }[] = [];

  if (typeof variables.low === 'number') {
    pointers.push({ label: 'low', index: variables.low, color: 'text-amber-400 border-amber-400' });
  }
  if (typeof variables.mid === 'number') {
    pointers.push({ label: 'mid', index: variables.mid, color: 'text-cyan-400 border-cyan-400' });
  }
  if (typeof variables.high === 'number') {
    pointers.push({ label: 'high', index: variables.high, color: 'text-purple-400 border-purple-400' });
  }
  if (typeof variables.i === 'number' && variables.i >= 0 && variables.i < currentArray.length) {
    pointers.push({ label: 'i (left)', index: variables.i, color: 'text-emerald-400 border-emerald-400' });
  }
  if (typeof variables.j === 'number' && variables.j >= 0 && variables.j < currentArray.length) {
    pointers.push({ label: 'j (right)', index: variables.j, color: 'text-rose-400 border-rose-400' });
  }
  if (typeof variables.k === 'number' && variables.k >= 0 && variables.k < currentArray.length) {
    pointers.push({ label: 'k (target)', index: variables.k, color: 'text-blue-400 border-blue-400' });
  }
  if (typeof variables.probeIndex === 'number') {
    pointers.push({ label: 'probe', index: variables.probeIndex, color: 'text-amber-300 border-amber-300' });
  }

  const phase = variables.phase as string | undefined;

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[380px] w-full bg-slate-950/70 rounded-xl border border-dark-border relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Explanatory Phase Indicator Header */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 z-10">
        {phase === 'DIVIDE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-mono flex items-center gap-2 shadow-lg"
          >
            <Split className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Phase 1: Complete Divide</span>
            <span className="text-slate-400">|</span>
            <span className="text-indigo-200">
              Partitioning [indices {variables.low}..{variables.high}] at Midpoint {variables.mid}
            </span>
          </motion.div>
        )}

        {phase === 'DIVIDE_COMPLETE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/50 text-teal-300 text-xs font-mono flex items-center gap-2 shadow-lg"
          >
            <GitFork className="w-3.5 h-3.5 text-teal-400" />
            <span>Phase 1 Milestone</span>
            <span className="text-slate-400">|</span>
            <span className="text-teal-200">Entire Array Divided into Atomic Units (Size 1)</span>
          </motion.div>
        )}

        {(phase === 'MERGE' || (!phase && step.operation === 'COMPARE')) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono flex items-center gap-2 shadow-lg"
          >
            <Combine className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 2: Compare & Merge</span>
            {typeof variables.low === 'number' && typeof variables.high === 'number' && (
              <>
                <span className="text-slate-400">|</span>
                <span className="text-amber-200">Subarray [{variables.low}..{variables.high}]</span>
              </>
            )}
          </motion.div>
        )}

        {step.operation === 'COMPLETE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Execution Complete</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-200">Array Fully Sorted</span>
          </motion.div>
        )}

        {/* Live Comparison Badge */}
        {step.comparisons && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/60 text-amber-300 text-xs font-mono flex items-center gap-2 shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Comparison:</span>
            <strong className="text-white font-bold">{step.comparisons.result}</strong>
          </motion.div>
        )}
      </div>

      {/* Visual Bars & Elements Container */}
      <div className="flex items-end justify-center gap-2 sm:gap-3 w-full max-w-4xl px-4 py-6 overflow-x-auto min-h-[220px]">
        <AnimatePresence>
          {currentArray.map((val, idx) => {
            const isHighlighted = highlights.includes(idx);
            const isFound = step.operation === 'FOUND' && isHighlighted;
            const isAssign = step.operation === 'ASSIGN' && isHighlighted;
            const isDivide = step.operation === 'DIVIDE' && isHighlighted;
            const isEliminated =
              typeof variables.low === 'number' &&
              typeof variables.high === 'number' &&
              (idx < variables.low || idx > variables.high);

            // Dynamic height percentage for bar
            const heightPercent = Math.max(18, Math.min(100, Math.round(((val - minVal) / span) * 82) + 18));

            // Node matching pointers
            const activePointers = pointers.filter((p) => p.index === idx);

            return (
              <div key={idx} className="flex flex-col items-center group relative">
                {/* Pointer Indicators above */}
                <div className="h-6 flex items-center justify-center gap-1 mb-1">
                  {activePointers.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-slate-900/95 shadow ${p.color}`}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>

                {/* Vertical Bar */}
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  style={{ height: `${heightPercent}px` }}
                  className={`w-10 sm:w-12 rounded-t-lg transition-all duration-300 flex flex-col justify-end items-center pb-2 relative overflow-hidden ${
                    isFound
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                      : isAssign
                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                      : isDivide
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.5)]'
                      : isHighlighted
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.5)]'
                      : isEliminated
                      ? 'bg-slate-800/40 opacity-30'
                      : 'bg-gradient-to-t from-slate-800 to-slate-700/80 hover:from-slate-700 hover:to-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-white drop-shadow font-mono">
                    {val}
                  </span>
                </motion.div>

                {/* Numeric Value Box */}
                <div
                  className={`w-10 sm:w-12 h-10 mt-1.5 rounded-b-lg flex items-center justify-center font-mono font-semibold text-xs border transition-colors duration-300 ${
                    isFound
                      ? 'border-emerald-500 bg-emerald-950/80 text-emerald-200'
                      : isAssign
                      ? 'border-cyan-500 bg-cyan-950/80 text-cyan-200'
                      : isDivide
                      ? 'border-indigo-500 bg-indigo-950/80 text-indigo-200'
                      : isHighlighted
                      ? 'border-amber-500 bg-amber-950/80 text-amber-200'
                      : isEliminated
                      ? 'border-slate-800 bg-slate-900/40 text-slate-600'
                      : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  {val}
                </div>

                {/* Array Index Label */}
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">
                  [{idx}]
                </span>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Operation Status Label & Bounds */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
          Operation: <strong className="text-slate-200">{step.operation || 'STEP'}</strong>
        </span>
        {typeof variables.low === 'number' && typeof variables.high === 'number' && (
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            Active Range: <strong className="text-indigo-300">[{variables.low}..{variables.high}]</strong>
          </span>
        )}
        <span className="text-slate-400 font-mono">
          Array Size: <strong className="text-brand-400">{currentArray.length}</strong>
        </span>
      </div>
    </div>
  );
};
