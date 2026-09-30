'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface TrieNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  children: TrieNode[];
}

interface TrieVisualizerProps {
  step: ExecutionStep;
}

export const TrieVisualizer: React.FC<TrieVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const rootNode: TrieNode | null = state.root || null;
  const activeNodeId: string = state.activeNodeId || 'root';
  const activeChar: string = state.activeChar || '';

  // Layout calculation for Trie
  interface LayoutTrieNode {
    node: TrieNode;
    x: number;
    y: number;
    parentX?: number;
    parentY?: number;
  }

  const layoutNodes: LayoutTrieNode[] = [];

  function computeTrieLayout(
    curr: TrieNode | null,
    x: number,
    y: number,
    widthAvailable: number,
    px?: number,
    py?: number
  ) {
    if (!curr) return;
    layoutNodes.push({ node: curr, x, y, parentX: px, parentY: py });

    const numChildren = curr.children ? curr.children.length : 0;
    if (numChildren > 0) {
      const childWidth = widthAvailable / numChildren;
      const startX = x - widthAvailable / 2 + childWidth / 2;

      curr.children.forEach((child, idx) => {
        computeTrieLayout(
          child,
          startX + idx * childWidth,
          y + 70,
          Math.max(childWidth, 60),
          x,
          y
        );
      });
    }
  }

  const svgWidth = 740;
  const svgHeight = 360;
  computeTrieLayout(rootNode, svgWidth / 2, 40, svgWidth - 80);

  return (
    <div className="flex flex-col gap-4 p-6 min-h-[460px] w-full bg-slate-950/60 rounded-xl border border-dark-border">
      {/* Top Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Structure: <strong className="text-brand-300 font-mono">Trie (Prefix Tree)</strong>
          </span>
          {activeChar && (
            <span className="text-slate-400">
              Active Char: <strong className="text-cyan-400 font-mono">&apos;{activeChar}&apos;</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Word End (isEndOfWord)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Active Traversal
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      {!rootNode ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic py-16">
          Trie is empty.
        </div>
      ) : (
        <div className="w-full overflow-x-auto flex justify-center py-2">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
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
                  strokeWidth="2"
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((item) => {
              const { node, x, y } = item;
              const isActive = activeNodeId === node.id;
              const isWordEnd = node.isEndOfWord;
              const isRoot = node.id === 'root';

              return (
                <g key={node.id} transform={`translate(${x}, ${y})`}>
                  <circle
                    r={isRoot ? 20 : 18}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'fill-cyan-950 stroke-cyan-400 stroke-[3px] filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : isWordEnd
                        ? 'fill-emerald-950 stroke-emerald-400 stroke-[2.5px]'
                        : 'fill-slate-900 stroke-slate-700 stroke-[2px]'
                    }`}
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`font-mono text-xs font-bold pointer-events-none ${
                      isWordEnd ? 'fill-emerald-300' : 'fill-white'
                    }`}
                  >
                    {node.char}
                  </text>

                  {/* Word end star indicator */}
                  {isWordEnd && (
                    <g transform="translate(12, -12)">
                      <circle r="5" className="fill-emerald-400" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};
