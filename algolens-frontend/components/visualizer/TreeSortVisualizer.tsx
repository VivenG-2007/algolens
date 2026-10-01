'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface BSTNodeData {
  id: string;
  value: number;
  x: number;
  y: number;
  left: BSTNodeData | null;
  right: BSTNodeData | null;
}

interface TreeSortVisualizerProps {
  step: ExecutionStep;
}

export const TreeSortVisualizer: React.FC<TreeSortVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const phase: string = state.phase || 'INIT';
  const tree: BSTNodeData | null = state.tree || null;
  const activeNodeId: string | null = state.activeNodeId || null;
  const currentVisitingNode: number | null = state.currentVisitingNode ?? null;
  const sortedOutput: number[] = state.sortedOutput || [];
  const arrayState: number[] = step.arrayState || [];
  const highlights: number[] = step.highlights || [];

  // Helper to render tree nodes and edges recursively
  const renderTreeEdges = (node: BSTNodeData | null): React.ReactNode => {
    if (!node) return null;
    return (
      <g key={`edges-${node.id}`}>
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
        {renderTreeEdges(node.left)}
        {renderTreeEdges(node.right)}
      </g>
    );
  };

  const renderTreeNodes = (node: BSTNodeData | null): React.ReactNode => {
    if (!node) return null;
    const isCurrentVisited = currentVisitingNode === node.value;
    const isActiveNode = activeNodeId === node.id;
    const isAlreadyOutput = sortedOutput.includes(node.value);

    return (
      <g key={`node-${node.id}`}>
        <motion.circle
          cx={node.x}
          cy={node.y}
          r="19"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className={`transition-all ${
            isCurrentVisited
              ? 'fill-amber-500 stroke-amber-300 stroke-[3px] filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
              : isActiveNode
              ? 'fill-brand-600 stroke-brand-300 stroke-[3px] filter drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]'
              : isAlreadyOutput
              ? 'fill-emerald-800 stroke-emerald-400 stroke-2'
              : 'fill-slate-800 stroke-slate-600 stroke-2'
          }`}
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="font-mono text-xs font-bold fill-white select-none pointer-events-none"
        >
          {node.value}
        </text>
        {renderTreeNodes(node.left)}
        {renderTreeNodes(node.right)}
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 min-h-[380px] w-full bg-slate-950/70 rounded-xl border border-dark-border shadow-xl backdrop-blur-sm">
      {/* Top Header & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-slate-400">
            Phase:{' '}
            <strong className="text-brand-300 font-mono uppercase">
              {phase.includes('INORDER') ? '2. Inorder Traversal' : '1. BST Construction'}
            </strong>
          </span>
          <span className="text-slate-400">
            Operation: <strong className="text-cyan-300 font-mono">{step.operation}</strong>
          </span>
          {currentVisitingNode !== null && (
            <span className="text-slate-400">
              Visiting Node: <strong className="text-amber-400 font-mono text-sm">{currentVisitingNode}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Inserting
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Visiting (Inorder)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Sorted Output
          </span>
        </div>
      </div>

      {/* Input Array Strip */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Input Array Elements
        </span>
        <div className="flex flex-wrap gap-2">
          {arrayState.map((val, idx) => {
            const isHighlighted = highlights.includes(idx);
            return (
              <div
                key={idx}
                className={`w-11 h-11 flex flex-col items-center justify-center rounded-lg border font-mono text-xs transition-all ${
                  isHighlighted
                    ? 'border-brand-400 bg-brand-500/20 text-brand-200 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold">{val}</span>
                <span className="text-[9px] text-slate-500">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Binary Search Tree Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Binary Search Tree (BST) Canvas
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {phase.includes('INORDER') ? 'Rule: LEFT → ROOT → RIGHT' : 'Rule: Left < Parent ≤ Right'}
          </span>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-900/60 rounded-xl border border-slate-800 p-2 min-h-[220px] flex items-center justify-center">
          {tree ? (
            <svg
              viewBox="100 20 400 240"
              className="w-full h-[240px] max-w-2xl"
              preserveAspectRatio="xMidYMid meet"
            >
              {renderTreeEdges(tree)}
              {renderTreeNodes(tree)}
            </svg>
          ) : (
            <span className="text-xs text-slate-500 italic">Initializing BST...</span>
          )}
        </div>
      </div>

      {/* Inorder Traversal Output Shelf */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <span>Sorted Array Output (From Inorder Traversal)</span>
          <span className="text-[10px] text-slate-500 font-normal">
            Yields mathematically sorted order in O(n)
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 min-h-[56px]">
          <AnimatePresence>
            {sortedOutput.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-11 h-11 flex flex-col items-center justify-center rounded-lg border border-emerald-500/60 bg-emerald-950/50 text-emerald-200 font-mono text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                <span>{val}</span>
                <span className="text-[9px] text-emerald-400/60">[{idx}]</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {sortedOutput.length === 0 && (
            <span className="text-xs text-slate-500 font-mono italic">
              Awaiting inorder traversal extraction (Phase 2)...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
