'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExecutionStep } from '@/types';

interface GraphVisualizerProps {
  step: ExecutionStep;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ step }) => {
  const state = step.dataStructureState || {};
  const graph = state.graph || { nodes: [], edges: [] };
  const visited: string[] = state.visited || [];
  const queue: string[] = state.queue || [];
  const stack: string[] = state.stack || [];
  const distances: Record<string, number> = state.distances || {};
  const previous: Record<string, string | null> = state.previous || {};
  const activeNode: string | undefined = state.activeNode;
  const activeEdge: { from: string; to: string; weight?: number } | undefined = state.activeEdge;
  const shortestPath: string[] = state.shortestPath || [];
  const isDijkstra = state.type === 'graph-dijkstra';
  const isBFS = state.type === 'graph-bfs';
  const isDFS = state.type === 'graph-dfs';

  // Fixed coordinate map for common nodes A-F for clean layout
  const nodePositions: Record<string, { x: number; y: number }> = {
    A: { x: 100, y: 170 },
    B: { x: 260, y: 70 },
    C: { x: 260, y: 270 },
    D: { x: 440, y: 70 },
    E: { x: 440, y: 270 },
    F: { x: 590, y: 170 },
  };

  const svgWidth = 680;
  const svgHeight = 340;

  // Check if edge is on the final shortest path
  function isEdgeOnShortestPath(from: string, to: string): boolean {
    if (shortestPath.length < 2) return false;
    for (let i = 0; i < shortestPath.length - 1; i++) {
      if (
        (shortestPath[i] === from && shortestPath[i + 1] === to) ||
        (shortestPath[i] === to && shortestPath[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-[460px] w-full bg-slate-950/60 rounded-xl border border-dark-border">
      {/* Top Status & Queue/Stack/Distance Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Active Node: <strong className="text-cyan-400 font-mono text-sm">{activeNode || 'None'}</strong>
          </span>
          <span className="text-slate-400">
            Settled / Visited: <strong className="text-emerald-400 font-mono">[{visited.join(', ')}]</strong>
          </span>
        </div>

        {/* Dynamic Queue (BFS) or Stack (DFS) or Priority Queue (Dijkstra) */}
        <div className="flex items-center gap-2 font-mono">
          {isBFS && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase">FIFO Queue:</span>
              <span className="text-purple-300 font-bold">
                {queue.length > 0 ? `[${queue.join(' ← ')}]` : 'EMPTY'}
              </span>
            </div>
          )}

          {isDFS && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase">LIFO Stack:</span>
              <span className="text-amber-300 font-bold">
                {stack.length > 0 ? `[${stack.join(' | ')}] (Top)` : 'EMPTY'}
              </span>
            </div>
          )}

          {isDijkstra && shortestPath.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/60 border border-amber-500/50">
              <span className="text-amber-400 text-[10px] uppercase font-bold">Shortest Path:</span>
              <span className="text-white font-bold">{shortestPath.join(' → ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Graph View & Adjacency / Distance Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        {/* SVG Canvas (3 Cols) */}
        <div className="lg:col-span-3 flex justify-center overflow-x-auto py-2">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
            {/* Edges */}
            {graph.edges.map((edge: any, idx: number) => {
              const p1 = nodePositions[edge.from] || { x: 50, y: 50 };
              const p2 = nodePositions[edge.to] || { x: 100, y: 100 };
              const isActive =
                activeEdge &&
                ((activeEdge.from === edge.from && activeEdge.to === edge.to) ||
                  (activeEdge.from === edge.to && activeEdge.to === edge.from));
              const onShortest = isEdgeOnShortestPath(edge.from, edge.to);

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={onShortest ? '#f59e0b' : isActive ? '#06b6d4' : '#334155'}
                    strokeWidth={onShortest ? '4' : isActive ? '3.5' : '2'}
                    className="transition-all duration-200"
                  />
                  {edge.weight !== undefined && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-10"
                        y="-8"
                        width="20"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke={isActive ? '#06b6d4' : '#1e293b'}
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-mono text-[10px] font-bold fill-slate-300"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map((nodeName: string) => {
              const pos = nodePositions[nodeName] || { x: 100, y: 100 };
              const isVisited = visited.includes(nodeName);
              const isActive = activeNode === nodeName;
              const onShortest = shortestPath.includes(nodeName);

              return (
                <g key={nodeName} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r={22}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'fill-cyan-950 stroke-cyan-400 stroke-[3.5px] filter drop-shadow-[0_0_15px_rgba(6,182,212,0.7)]'
                        : onShortest
                        ? 'fill-amber-950 stroke-amber-400 stroke-[3px] filter drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                        : isVisited
                        ? 'fill-emerald-950 stroke-emerald-500 stroke-[2.5px]'
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
                    {nodeName}
                  </text>

                  {/* Distance badge for Dijkstra */}
                  {isDijkstra && distances[nodeName] !== undefined && (
                    <g transform="translate(0, 32)">
                      <rect
                        x="-18"
                        y="-8"
                        width="36"
                        height="16"
                        rx="6"
                        className="fill-slate-900 stroke stroke-slate-700"
                      />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-mono text-[9px] font-bold fill-cyan-300"
                      >
                        {distances[nodeName] === Infinity ? '∞' : distances[nodeName]}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar: Adjacency or Dijkstra Distance Table (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-3">
          <span className="font-bold text-slate-300 block uppercase tracking-wider text-[11px] border-b border-slate-800 pb-2">
            {isDijkstra ? 'Distance Table' : 'Adjacency List'}
          </span>

          {isDijkstra ? (
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {graph.nodes.map((node: string) => (
                <div
                  key={node}
                  className={`flex items-center justify-between p-1.5 rounded ${
                    activeNode === node ? 'bg-cyan-950/80 text-cyan-200' : 'text-slate-300'
                  }`}
                >
                  <span className="font-bold">Node {node}:</span>
                  <span>Dist: {distances[node] === Infinity ? '∞' : distances[node]}</span>
                  <span className="text-slate-500">via: {previous[node] || '-'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto text-[11px]">
              {graph.nodes.map((node: string) => {
                const neighbors = graph.edges
                  .filter((e: any) => e.from === node || e.to === node)
                  .map((e: any) => (e.from === node ? e.to : e.from));
                return (
                  <div key={node} className="text-slate-400">
                    <strong className="text-slate-200">{node}:</strong> [{neighbors.join(', ')}]
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
