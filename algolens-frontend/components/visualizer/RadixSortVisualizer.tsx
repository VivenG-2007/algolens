'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface RadixSortVisualizerProps {
  step: ExecutionStep;
}

export const RadixSortVisualizer: React.FC<RadixSortVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const exp: number = state.exp || 1;
  const digitPlace: string = state.digitPlace || 'Ones';
  const currentDigitIndex: number = state.currentDigitIndex ?? -1;
  const currentElement: number | null = state.currentElement ?? null;
  const buckets: number[][] = state.buckets || Array.from({ length: 10 }, () => []);
  const arrayState: number[] = step.arrayState || [];
  const highlights: number[] = step.highlights || [];

  // Helper to format number and highlight the active digit
  const renderDigitHighlighted = (num: number, isElementActive: boolean) => {
    const s = num.toString();
    const power = Math.round(Math.log10(exp));
    const targetCharIdx = s.length - 1 - power;

    return (
      <div className="flex items-center font-mono font-bold tracking-wider">
        {s.split('').map((ch, idx) => {
          const isTargetDigit = idx === targetCharIdx;
          return (
            <span
              key={idx}
              className={`transition-colors ${
                isTargetDigit
                  ? isElementActive
                    ? 'text-amber-300 font-extrabold underline decoration-amber-400 decoration-2 scale-110'
                    : 'text-amber-400 font-bold'
                  : 'text-slate-300'
              }`}
            >
              {ch}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-[380px] w-full bg-slate-950/70 rounded-xl border border-dark-border shadow-xl backdrop-blur-sm">
      {/* Top Pass Status & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-slate-400">
            Active Pass: <strong className="text-brand-300 font-mono text-sm">{digitPlace} Digit (exp={exp})</strong>
          </span>
          <span className="text-slate-400">
            Operation: <strong className="text-cyan-300 font-mono uppercase">{step.operation || 'DISTRIBUTE'}</strong>
          </span>
          {currentElement !== null && (
            <span className="text-slate-400">
              Processing: <strong className="text-amber-400 font-mono text-sm">{currentElement}</strong> → Bucket{' '}
              <strong className="text-emerald-400 font-mono text-sm">{currentDigitIndex}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Active Digit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Current Target
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Placed
          </span>
        </div>
      </div>

      {/* Row 1: Source Array with Digit Highlight */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Array (Digit Highlight: {digitPlace})</span>
            <span className="text-[10px] text-slate-500 font-normal">
              Underlined digit corresponds to current place value (÷ {exp} % 10)
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {arrayState.map((val, idx) => {
            const isHighlighted = highlights.includes(idx);
            const isCurrent = currentElement === val && isHighlighted;
            return (
              <motion.div
                key={`${idx}-${val}`}
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`min-w-[54px] px-3 py-2 flex flex-col items-center justify-center rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50'
                    : isHighlighted
                    ? 'border-brand-500 bg-brand-500/20 text-brand-200 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'border-slate-800 bg-slate-900/90 text-slate-200'
                }`}
              >
                {renderDigitHighlighted(val, isCurrent)}
                <span className="text-[9px] text-slate-500 mt-0.5">[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 2: 10 Distribution Buckets (0 to 9) */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <span>Distribution Buckets [0 – 9]</span>
          <span className="text-[10px] text-slate-500 font-normal">
            FIFO queue of elements grouped by the {digitPlace.toLowerCase()} digit
          </span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {buckets.map((bucketItems, bIdx) => {
            const isActiveBucket = currentDigitIndex === bIdx;
            return (
              <div
                key={bIdx}
                className={`flex flex-col min-h-[110px] rounded-lg border p-2 transition-all ${
                  isActiveBucket
                    ? 'border-brand-400 bg-brand-950/40 shadow-[0_0_14px_rgba(99,102,241,0.35)] ring-1 ring-brand-400/40'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Bucket Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-2">
                  <span className={`text-xs font-mono font-bold ${isActiveBucket ? 'text-brand-300' : 'text-slate-400'}`}>
                    Bucket {bIdx}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">({bucketItems.length})</span>
                </div>

                {/* Bucket Items */}
                <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto max-h-[140px] pr-0.5">
                  <AnimatePresence>
                    {bucketItems.map((item, itemIdx) => {
                      const isNewest = isActiveBucket && itemIdx === bucketItems.length - 1 && currentElement === item;
                      return (
                        <motion.div
                          key={`${item}-${itemIdx}`}
                          initial={{ opacity: 0, y: -8, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className={`px-2 py-1 rounded text-center font-mono text-xs font-semibold border ${
                            isNewest
                              ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                              : 'border-slate-700/80 bg-slate-800/80 text-slate-200'
                          }`}
                        >
                          {item}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {bucketItems.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic text-center my-auto">empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Collection Pipeline / Next Pass Status */}
      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Pipeline:</span>
          <span className="font-mono text-slate-300">
            Array → {digitPlace} Digit Highlight → Buckets [0..9] → FIFO Collection → Next Digit
          </span>
        </div>
        <div className="text-slate-400 text-[11px] font-mono">
          Collected size: <strong className="text-emerald-400">{buckets.flat().length}</strong> / {arrayState.length}
        </div>
      </div>
    </div>
  );
};
