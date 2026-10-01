'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface BucketSortVisualizerProps {
  step: ExecutionStep;
}

export const BucketSortVisualizer: React.FC<BucketSortVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const bucketRanges: { label: string; min: number; max: number }[] = state.bucketRanges || [];
  const buckets: number[][] = state.buckets || [];
  const currentElement: number | null = state.currentElement ?? null;
  const currentBucketIndex: number = state.currentBucketIndex ?? -1;
  const phase: string = state.phase || 'INIT';
  const arrayState: number[] = step.arrayState || [];
  const highlights: number[] = step.highlights || [];
  const sortedOutput: number[] = state.sortedOutput || [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-[380px] w-full bg-slate-950/70 rounded-xl border border-dark-border shadow-xl backdrop-blur-sm">
      {/* Top Phase Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-slate-400">
            Phase: <strong className="text-brand-300 font-mono uppercase">{phase}</strong>
          </span>
          <span className="text-slate-400">
            Operation: <strong className="text-cyan-300 font-mono">{step.operation}</strong>
          </span>
          {currentElement !== null && (
            <span className="text-slate-400">
              Active Element: <strong className="text-amber-400 font-mono text-sm">{currentElement}</strong>
              {currentBucketIndex >= 0 && (
                <span>
                  {' '}
                  → Bucket <strong className="text-emerald-400 font-mono text-sm">{currentBucketIndex}</strong>
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Floating/Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> In Bucket
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Concatenated
          </span>
        </div>
      </div>

      {/* Row 1: Source Array */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Input Elements</span>
          <span className="text-[10px] text-slate-500 font-normal">
            Distributing elements into uniform range intervals
          </span>
        </span>
        <div className="flex flex-wrap gap-2">
          {arrayState.map((val, idx) => {
            const isHighlighted = highlights.includes(idx);
            const isCurrent = currentElement === val && isHighlighted;
            return (
              <motion.div
                key={idx}
                layout
                className={`min-w-[50px] px-2.5 py-2 flex flex-col items-center justify-center rounded-lg border text-xs font-mono transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50'
                    : isHighlighted
                    ? 'border-brand-500 bg-brand-500/20 text-brand-200'
                    : 'border-slate-800 bg-slate-900/90 text-slate-300'
                }`}
              >
                <span className="font-bold text-sm">{val}</span>
                <span className="text-[9px] text-slate-500">[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Bucket Containers with Range Bounds */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <span>Buckets & Value Partitions</span>
          <span className="text-[10px] text-slate-500 font-normal">
            Physical containers with value range boundaries
          </span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {buckets.map((bucketItems, bIdx) => {
            const range = bucketRanges[bIdx] || { label: `B${bIdx}`, min: 0, max: 1 };
            const isTargetBucket = currentBucketIndex === bIdx;
            return (
              <div
                key={bIdx}
                className={`flex flex-col min-h-[140px] rounded-xl border p-3 transition-all ${
                  isTargetBucket
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_18px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/50'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Bucket Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2.5">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      Bucket {bIdx}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/80 block">
                      Range: {range.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {bucketItems.length} items
                  </span>
                </div>

                {/* Floating Elements Inside Bucket */}
                <div className="flex flex-wrap gap-1.5 flex-1 content-start overflow-y-auto max-h-[130px] pr-0.5">
                  <AnimatePresence>
                    {bucketItems.map((val, itemIdx) => {
                      const isNewest = isTargetBucket && currentElement === val;
                      return (
                        <motion.div
                          key={`${val}-${itemIdx}`}
                          initial={{ opacity: 0, scale: 0.5, y: -12 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                          className={`px-2 py-1 rounded-md text-xs font-mono font-bold border transition-all ${
                            isNewest
                              ? 'border-amber-400 bg-amber-950/90 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'border-cyan-700/60 bg-cyan-950/40 text-cyan-200'
                          }`}
                        >
                          {val}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {bucketItems.length === 0 && (
                    <div className="text-[11px] text-slate-600 italic m-auto">empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Concatenation Pipeline / Sorted Output */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <span>Concatenation Merge Pipeline</span>
          <span className="text-[10px] text-slate-500 font-normal">
            B0 → B1 → B2 → B3 → B4 Concatenation
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
          {sortedOutput.length > 0 ? (
            sortedOutput.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-11 h-11 flex flex-col items-center justify-center rounded-lg border border-emerald-500/60 bg-emerald-950/50 text-emerald-200 font-mono text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                <span>{val}</span>
                <span className="text-[9px] text-emerald-400/60">[{idx}]</span>
              </motion.div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono italic">
              Awaiting concatenation phase (after sorting individual buckets)...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
