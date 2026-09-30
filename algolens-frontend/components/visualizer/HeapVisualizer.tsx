'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface HeapVisualizerProps {
  step: ExecutionStep;
}

export const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const heapArray: number[] = state.array || step.arrayState || [];
  const heapType: string = state.heapType || 'min-heap';
  const activeIndices: number[] = state.activeIndices || step.highlights || [];
  const isMin = heapType === 'min-heap';

  // Compute SVG coordinates for complete binary tree
  const treeNodes = heapArray.map((val, idx) => {
    const level = Math.floor(Math.log2(idx + 1));
    const posInLevel = idx - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);
    const spacing = 640 / (totalInLevel + 1);
    const x = spacing * (posInLevel + 1);
    const y = 50 + level * 65;

    const parentIdx = idx > 0 ? Math.floor((idx - 1) / 2) : undefined;
    let parentX: number | undefined;
    let parentY: number | undefined;

    if (parentIdx !== undefined) {
      const pLevel = Math.floor(Math.log2(parentIdx + 1));
      const pPosInLevel = parentIdx - (Math.pow(2, pLevel) - 1);
      const pTotalInLevel = Math.pow(2, pLevel);
      const pSpacing = 640 / (pTotalInLevel + 1);
      parentX = pSpacing * (pPosInLevel + 1);
      parentY = 50 + pLevel * 65;
    }

    return { idx, val, x, y, parentX, parentY };
  });

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[460px] w-full bg-slate-950/60 rounded-xl border border-dark-border">
      {/* Top Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Structure:{' '}
            <strong className="text-brand-300 font-mono uppercase">
              {isMin ? 'Min-Heap (Root is Min)' : 'Max-Heap (Root is Max)'}
            </strong>
          </span>
          <span className="text-slate-400">
            Heap Size: <strong className="text-cyan-400 font-mono">{heapArray.length}</strong>
          </span>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
          Phase: <strong className="text-brand-400">{step.operation}</strong>
        </span>
      </div>

      {/* Row 1: Array Representation with Parent/Child Formula Info */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">
            Array Representation
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Parent: <code>floor((i-1)/2)</code> | Left: <code>2i+1</code> | Right: <code>2i+2</code>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto py-2">
          {heapArray.map((val, idx) => {
            const isActive = activeIndices.includes(idx);
            return (
              <div
                key={idx}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg border font-mono text-xs transition-all ${
                  isActive
                    ? 'border-amber-400 bg-amber-950 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                    : idx === 0
                    ? 'border-brand-500 bg-brand-950/80 text-brand-300 font-bold'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold text-sm">{val}</span>
                <span className="text-[9px] text-slate-500">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Tree Representation (SVG) */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <span className="font-semibold text-xs text-brand-400 uppercase tracking-wider block">
          Complete Binary Tree Representation
        </span>

        <div className="w-full overflow-x-auto flex justify-center py-2">
          <svg width="660" height="250" className="overflow-visible select-none">
            {/* Edges */}
            {treeNodes.map((n) => {
              if (n.parentX === undefined || n.parentY === undefined) return null;
              return (
                <line
                  key={`edge-${n.idx}`}
                  x1={n.parentX}
                  y1={n.parentY}
                  x2={n.x}
                  y2={n.y}
                  stroke="#334155"
                  strokeWidth="2"
                />
              );
            })}

            {/* Tree Nodes */}
            {treeNodes.map((n) => {
              const isActive = activeIndices.includes(n.idx);
              const isRoot = n.idx === 0;

              return (
                <g key={`node-${n.idx}`} transform={`translate(${n.x}, ${n.y})`}>
                  <circle
                    r={20}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'fill-amber-950 stroke-amber-400 stroke-[3px] filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : isRoot
                        ? 'fill-brand-950 stroke-brand-400 stroke-[2.5px]'
                        : 'fill-slate-900 stroke-slate-700 stroke-[2px]'
                    }`}
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono text-xs font-bold fill-white pointer-events-none"
                  >
                    {n.val}
                  </text>
                  <text
                    x="0"
                    y="30"
                    textAnchor="middle"
                    className="font-mono text-[9px] fill-slate-500 pointer-events-none"
                  >
                    i={n.idx}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
