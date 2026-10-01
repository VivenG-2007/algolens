'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';
import { Check, ArrowDown, ArrowUp } from 'lucide-react';

interface QuickRecursionNode {
  id: string;
  subarray: number[];
  low: number;
  high: number;
  pivotVal?: number;
  pivotIndex?: number;
  status: 'active' | 'partitioned' | 'complete';
  children?: QuickRecursionNode[];
}

interface QuickSortVisualizerProps {
  step: ExecutionStep;
}

export const QuickSortVisualizer: React.FC<QuickSortVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const pivotIndex: number | null = state.pivotIndex ?? null;
  const pivotValue: number | null = state.pivotValue ?? null;
  const i: number | null = state.i ?? null;
  const j: number | null = state.j ?? null;
  const low: number = state.low ?? 0;
  const high: number = state.high ?? ((step.arrayState?.length || 1) - 1);
  const completedPivots: number[] = state.completedPivots || [];
  const swapCandidates: [number, number] | null = state.swapCandidates ?? null;
  const recursionTree: QuickRecursionNode | null = state.recursionTree || null;
  const arrayState: number[] = step.arrayState || [];
  const phase: string = state.phase || 'INIT';

  // Recursive tree renderer
  const renderRecursionTreeNode = (node: QuickRecursionNode | null): React.ReactNode => {
    if (!node) return null;
    const isActive = node.status === 'active';
    const isComplete = node.status === 'complete';

    return (
      <div key={node.id} className="flex flex-col items-center gap-2">
        {/* Node Box */}
        <div
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isActive
              ? 'border-purple-400 bg-purple-950/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/50'
              : isComplete
              ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
              : 'border-slate-800 bg-slate-900/80 text-slate-300'
          }`}
        >
          <div className="font-bold">
            [{node.subarray.join(', ')}]
          </div>
          {node.pivotVal !== undefined && (
            <div className="text-[10px] text-purple-300 font-semibold mt-0.5">
              pivot = {node.pivotVal}
            </div>
          )}
        </div>

        {/* Children Branches */}
        {node.children && node.children.length > 0 && (
          <div className="flex items-start gap-4 sm:gap-6 pt-2 border-t border-slate-800">
            {node.children.map((child) => renderRecursionTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-[420px] w-full bg-slate-950/70 rounded-xl border border-dark-border shadow-xl backdrop-blur-sm">
      {/* Top Header Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-slate-400">
            Active Subarray: <strong className="text-brand-300 font-mono text-sm">[{low} ... {high}]</strong>
          </span>
          {pivotValue !== null && (
            <span className="text-slate-400">
              Pivot: <strong className="text-purple-300 font-mono text-sm">{pivotValue}</strong> (index {pivotIndex})
            </span>
          )}
          <span className="text-slate-400">
            Pointers: <strong className="text-cyan-300 font-mono">i = {i !== null ? i : '—'}</strong>,{' '}
            <strong className="text-amber-300 font-mono">j = {j !== null ? j : '—'}</strong>
          </span>
        </div>

        {/* Reusable Visual State Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-700"></span> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Compare
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Pivot
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Swap Candidate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Placed Pivot
          </span>
        </div>
      </div>

      {/* Dual Synchronized Layout: Array View & Recursion Tree View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top View: Array View (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Array Partition View
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Active Range: [{low} ... {high}]
            </span>
          </div>

          <div className="pt-6 pb-6 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto min-h-[140px]">
            {arrayState.map((val, idx) => {
              const isPivot = idx === pivotIndex;
              const isCompletedPivot = completedPivots.includes(idx);
              const isI = idx === i;
              const isJ = idx === j;
              const isSwapCandidate = swapCandidates && (idx === swapCandidates[0] || idx === swapCandidates[1]);
              const isComparing = idx === j && !isSwapCandidate && !isCompletedPivot;
              const inActiveSubarray = idx >= low && idx <= high;

              return (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Top Pointer Indicator: i */}
                  {isI && (
                    <motion.div
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute -top-6 flex flex-col items-center text-cyan-400 font-mono text-[10px] font-bold"
                    >
                      <span>i</span>
                      <ArrowDown className="w-3 h-3" />
                    </motion.div>
                  )}

                  {/* Array Chip */}
                  <motion.div
                    layout
                    className={`w-11 sm:w-12 h-14 flex flex-col items-center justify-center rounded-xl border text-xs font-mono font-bold transition-all ${
                      isCompletedPivot
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : isSwapCandidate
                        ? 'border-rose-500 bg-rose-950/80 text-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.5)] ring-2 ring-rose-400'
                        : isPivot
                        ? 'border-purple-400 bg-purple-950 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.5)] ring-2 ring-purple-400'
                        : isComparing
                        ? 'border-amber-400 bg-amber-500/25 text-amber-200 ring-2 ring-amber-400/60'
                        : inActiveSubarray
                        ? 'border-slate-700 bg-slate-800/90 text-slate-200'
                        : 'border-slate-800/60 bg-slate-950/40 text-slate-600 opacity-40'
                    }`}
                  >
                    <span className="text-sm flex items-center gap-0.5">
                      {val}
                      {isCompletedPivot && <Check className="w-3 h-3 text-emerald-400" />}
                    </span>
                    <span className="text-[9px] text-slate-500 font-normal">[{idx}]</span>
                  </motion.div>

                  {/* Bottom Pointer Indicator: j */}
                  {isJ && (
                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute -bottom-6 flex flex-col items-center text-amber-400 font-mono text-[10px] font-bold"
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>j</span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Subarray Division Visualizer */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-400">Left (&lt; pivot):</span>{' '}
              <span className="text-cyan-300 font-bold">
                [{arrayState.slice(low, (pivotIndex ?? high)).filter((x) => pivotValue !== null && x <= pivotValue).join(', ')}]
              </span>
            </div>
            {pivotValue !== null && (
              <div className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                Pivot: [{pivotValue}]
              </div>
            )}
            <div>
              <span className="text-slate-400">Right (&gt; pivot):</span>{' '}
              <span className="text-amber-300 font-bold">
                [{arrayState.slice((pivotIndex ?? low) + 1, high + 1).filter((x) => pivotValue !== null && x > pivotValue).join(', ')}]
              </span>
            </div>
          </div>
        </div>

        {/* Right / Bottom View: Recursion Tree View (5 columns) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Recursion Tree View
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Divide & Conquer Call Hierarchy
            </span>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 min-h-[220px] flex items-center justify-center overflow-x-auto">
            {recursionTree ? (
              renderRecursionTreeNode(recursionTree)
            ) : (
              <span className="text-xs text-slate-500 italic">No recursion tree data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
