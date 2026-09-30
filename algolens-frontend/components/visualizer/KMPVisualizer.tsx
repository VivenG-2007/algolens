'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface KMPVisualizerProps {
  step: ExecutionStep;
}

export const KMPVisualizer: React.FC<KMPVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const text: string = state.text || '';
  const pattern: string = state.pattern || '';
  const lps: number[] = state.lps || [];
  const currentI: number = state.i ?? 0;
  const currentJ: number = state.j ?? 0;
  const matches: number[] = state.matches || [];
  const isCharMatch = state.currentCharMatch;
  const lpsUpdatedIndex = state.lpsUpdatedIndex;

  // Pattern offset relative to text
  const patternShift = Math.max(0, currentI - currentJ);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[360px] w-full bg-slate-950/60 rounded-xl border border-dark-border overflow-x-auto">
      {/* Top Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Text Pointer (i): <strong className="text-cyan-400 font-mono">{currentI}</strong>
          </span>
          <span className="text-slate-400">
            Pattern Pointer (j): <strong className="text-purple-400 font-mono">{currentJ}</strong>
          </span>
          <span className="text-slate-400">
            Matches Found: <strong className="text-emerald-400 font-mono">{matches.length}</strong>
          </span>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
          Phase: <strong className="text-brand-400">{step.operation}</strong>
        </span>
      </div>

      {/* Text String Row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Main Text (i = {currentI})
          </span>
          {matches.length > 0 && (
            <span className="text-xs text-emerald-400 font-mono">
              Match starting indices: [{matches.join(', ')}]
            </span>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto py-2">
          {text.split('').map((char, idx) => {
            const isCurrent = idx === currentI;
            const isMatchedRange = matches.some(
              (mStart) => idx >= mStart && idx < mStart + pattern.length
            );

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Pointer i label */}
                <div className="h-5 flex items-center justify-center">
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 animate-bounce">
                      ↓ i
                    </span>
                  )}
                </div>

                {/* Character block */}
                <div
                  className={`w-9 h-10 flex items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all ${
                    isMatchedRange
                      ? 'border-emerald-500 bg-emerald-950/80 text-emerald-200'
                      : isCurrent
                      ? isCharMatch
                        ? 'border-emerald-400 bg-emerald-900/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'border-rose-400 bg-rose-950/70 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                      : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  {char}
                </div>

                <span className="text-[9px] font-mono text-slate-500 mt-1">
                  {idx}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern String Row (Shifted visually to align with text window) */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
          Pattern Alignment (j = {currentJ}, Shift = {patternShift})
        </span>

        <div className="flex gap-1.5 overflow-x-auto py-2">
          {/* Visual spacer to align pattern under the text */}
          {Array.from({ length: patternShift }).map((_, sIdx) => (
            <div key={`spacer-${sIdx}`} className="w-9 h-10 invisible" />
          ))}

          {pattern.split('').map((char, idx) => {
            const isCurrent = idx === currentJ;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="h-5 flex items-center justify-center">
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold text-purple-400 animate-bounce">
                      ↑ j
                    </span>
                  )}
                </div>

                <div
                  className={`w-9 h-10 flex items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all ${
                    isCurrent
                      ? isCharMatch
                        ? 'border-emerald-400 bg-emerald-900/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'border-rose-400 bg-rose-950/70 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                      : 'border-purple-800/60 bg-purple-950/30 text-purple-200'
                  }`}
                >
                  {char}
                </div>

                <span className="text-[9px] font-mono text-slate-500 mt-1">
                  {idx}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic LPS Table */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            Longest Proper Prefix Suffix (LPS) Preprocessing Table
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Avoids backtracking text pointer i on mismatch
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {pattern.split('').map((char, idx) => {
            const isLpsActive = lpsUpdatedIndex === idx || currentJ === idx;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-9 h-7 flex items-center justify-center bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-mono">
                  {char}
                </div>
                <div
                  className={`w-9 h-8 flex items-center justify-center border font-mono font-bold text-xs transition-all ${
                    isLpsActive
                      ? 'border-brand-400 bg-brand-950 text-brand-200 shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                      : 'border-slate-800 bg-slate-900/40 text-slate-300'
                  }`}
                >
                  {lps[idx] !== undefined ? lps[idx] : 0}
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
