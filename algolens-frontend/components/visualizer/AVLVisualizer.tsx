'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface AVLNode {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  left: AVLNode | null;
  right: AVLNode | null;
}

interface AVLVisualizerProps {
  step: ExecutionStep;
}

export const AVLVisualizer: React.FC<AVLVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const rootNode: AVLNode | null = state.root || null;
  const imbalancedNode = state.imbalancedNode;
  const rotationType = state.rotationType;
  const insertingValue = state.activeInsertingValue;

  // Flatten tree for SVG layout
  interface LayoutNode {
    node: AVLNode;
    x: number;
    y: number;
    parentX?: number;
    parentY?: number;
  }

  const layoutNodes: LayoutNode[] = [];

  function computeLayout(
    curr: AVLNode | null,
    x: number,
    y: number,
    offset: number,
    px?: number,
    py?: number
  ) {
    if (!curr) return;
    layoutNodes.push({ node: curr, x, y, parentX: px, parentY: py });

    if (curr.left) {
      computeLayout(curr.left, x - offset, y + 80, offset / 1.8, x, y);
    }
    if (curr.right) {
      computeLayout(curr.right, x + offset, y + 80, offset / 1.8, x, y);
    }
  }

  const svgWidth = 800;
  const svgHeight = 400;
  computeLayout(rootNode, svgWidth / 2, 60, 160);

  return (
    <div className="flex flex-col items-center p-6 min-h-[420px] w-full bg-slate-950/60 rounded-xl border border-dark-border relative overflow-hidden">
      {/* Rotation Banner if active */}
      {rotationType && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-purple-950/90 border border-purple-500 rounded-lg text-purple-200 text-xs font-mono flex items-center gap-2 shadow-glow"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
          <span>
            Active Rotation: <strong>{rotationType} Rotation</strong>
          </span>
        </motion.div>
      )}

      {/* Overview Status */}
      <div className="w-full flex items-center justify-between text-xs border-b border-slate-800 pb-3 mb-2">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Current Phase: <strong className="text-brand-300 font-mono">{step.operation}</strong>
          </span>
          {insertingValue !== undefined && (
            <span className="text-slate-400">
              Active Value: <strong className="text-cyan-400 font-mono">{insertingValue}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Balanced (|BF| ≤ 1)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Imbalanced (|BF| &gt; 1)
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      {!rootNode ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm italic py-20">
          <span>Tree is currently empty. Click "Generate Visualization" to begin insertions.</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto flex justify-center py-4">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            {/* Edges */}
            {layoutNodes.map((item, idx) => {
              if (item.parentX === undefined || item.parentY === undefined) return null;
              return (
                <line
                  key={`edge-${idx}`}
                  x1={item.parentX}
                  y1={item.parentY}
                  x2={item.x}
                  y2={item.y}
                  stroke="#334155"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((item) => {
              const { node, x, y } = item;
              const isImbalanced = Math.abs(node.balanceFactor) > 1;
              const isTargetNode = imbalancedNode === node.value;
              const isRecentlyInserted = insertingValue === node.value;

              return (
                <g key={node.id} className="cursor-pointer group">
                  {/* Outer circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={26}
                    className={`transition-all duration-300 ${
                      isTargetNode || isImbalanced
                        ? 'fill-rose-950 stroke-rose-500 stroke-[3px] filter drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                        : isRecentlyInserted
                        ? 'fill-cyan-950 stroke-cyan-400 stroke-[2.5px] filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'fill-slate-900 stroke-brand-500 stroke-[2px]'
                    }`}
                  />

                  {/* Value */}
                  <text
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono font-bold text-sm fill-white select-none pointer-events-none"
                  >
                    {node.value}
                  </text>

                  {/* Balance Factor (BF) pill */}
                  <g transform={`translate(${x + 18}, ${y - 18})`}>
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="16"
                      rx="8"
                      className={`${
                        isImbalanced
                          ? 'fill-rose-600'
                          : 'fill-slate-800 stroke stroke-slate-700'
                      }`}
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-mono text-[9px] font-bold fill-white select-none pointer-events-none"
                    >
                      {node.balanceFactor >= 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                    </text>
                  </g>

                  {/* Height pill */}
                  <text
                    x={x}
                    y={y + 38}
                    textAnchor="middle"
                    className="font-mono text-[10px] fill-slate-400 select-none pointer-events-none"
                  >
                    H: {node.height}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};
