'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { GraphNode, GraphLink, KnowledgeGraphData } from '@/types';
import { apiClient } from '@/lib/api/client';
import {
  Network,
  ArrowRight,
  Info,
  Layers,
  Tag,
  Sparkles,
  Search,
  ExternalLink,
  Cpu,
  Database,
  Code2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

// Extended node positions for all 13 algorithms + data structures + concepts
const nodePositions: Record<string, { x: number; y: number }> = {
  // Algorithms — row 1
  'merge-sort':      { x: 140, y: 110 },
  'counting-sort':   { x: 380, y: 80  },
  'linear-search':   { x: 620, y: 110 },
  // Algorithms — row 2
  'binary-search':   { x: 260, y: 220 },
  'fibonacci-search':{ x: 500, y: 210 },
  'kmp':             { x: 760, y: 180 },
  // Advanced DS — row 3
  'avl':             { x: 120, y: 340 },
  'bfs':             { x: 310, y: 360 },
  'dfs':             { x: 490, y: 360 },
  'dijkstra':        { x: 690, y: 330 },
  'min-heap':        { x: 120, y: 500 },
  'max-heap':        { x: 310, y: 500 },
  'trie':            { x: 760, y: 460 },
  // Data Structures
  'array':           { x: 200, y: 180 },
  'sorted-array':    { x: 440, y: 160 },
  'bst':             { x: 200, y: 400 },
  'frequency-array': { x: 860, y: 100 },
  'lps-array':       { x: 860, y: 220 },
  'priority-queue':  { x: 490, y: 490 },
  'adjacency-list':  { x: 600, y: 430 },
  // Concepts & Techniques
  'divide-conquer':  { x: 280, y: 50  },
  'recursion':       { x: 60,  y: 230 },
  'balance-factor':  { x: 70,  y: 430 },
  'rotations':       { x: 70,  y: 560 },
  'prefix-sum':      { x: 860, y: 50  },
  'pointers':        { x: 760, y: 300 },
  'greedy':          { x: 860, y: 340 },
  'graph-traversal': { x: 400, y: 440 },
  'heap-invariant':  { x: 200, y: 570 },
  'prefix-matching': { x: 860, y: 490 },
  // Complexities
  'comp-n-log-n':    { x: 60,  y: 80  },
  'comp-log-n':      { x: 640, y: 260 },
  'comp-n':          { x: 60,  y: 330 },
  'comp-n-plus-k':   { x: 860, y: 170 },
  'comp-n-plus-m':   { x: 860, y: 280 },
  'comp-e-log-v':    { x: 860, y: 420 },
  'comp-v-plus-e':   { x: 860, y: 550 },
  'comp-l':          { x: 860, y: 560 },
};

const typeColors: Record<string, { node: string; text: string; badge: string }> = {
  algorithm:        { node: '#6366f1', text: '#c7d2fe', badge: 'bg-indigo-950 border-indigo-500/40 text-indigo-300' },
  'data-structure': { node: '#0ea5e9', text: '#bae6fd', badge: 'bg-sky-950 border-sky-500/40 text-sky-300' },
  concept:          { node: '#8b5cf6', text: '#ddd6fe', badge: 'bg-violet-950 border-violet-500/40 text-violet-300' },
  technique:        { node: '#10b981', text: '#a7f3d0', badge: 'bg-emerald-950 border-emerald-500/40 text-emerald-300' },
  complexity:       { node: '#f59e0b', text: '#fde68a', badge: 'bg-amber-950 border-amber-500/40 text-amber-300' },
};

const masteryStyles: Record<string, { ring: string; fill: string; badge: string; label: string }> = {
  mastered: {
    ring: '#10b981',
    fill: '#064e3b',
    badge: 'bg-emerald-950 border-emerald-500/40 text-emerald-300',
    label: 'Mastered',
  },
  in_progress: {
    ring: '#f59e0b',
    fill: '#78350f',
    badge: 'bg-amber-950 border-amber-500/40 text-amber-300',
    label: 'In Progress',
  },
  needs_review: {
    ring: '#f43f5e',
    fill: '#881337',
    badge: 'bg-rose-950 border-rose-500/40 text-rose-300',
    label: 'Needs Review',
  },
  unvisited: {
    ring: '#475569',
    fill: '#1e293b',
    badge: 'bg-slate-900 border-slate-700/50 text-slate-400',
    label: 'Unvisited',
  },
};

const relationColors: Record<string, string> = {
  uses:           '#6366f1',
  requires:       '#ef4444',
  has_complexity: '#f59e0b',
  related_to:     '#8b5cf6',
  prerequisite_of:'#10b981',
  implements:     '#0ea5e9',
};

export default function KnowledgeGraphPage() {
  const { user, setIsAuthModalOpen } = useAuth();
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPersonalized, setIsPersonalized] = useState<boolean>(true);
  const [userSummary, setUserSummary] = useState<{
    totalMastered: number;
    inProgress: number;
    needsReview: number;
    masteryPercentage: number;
    weakTopics: string[];
    recommendations: string[];
    recommendedNext?: string[];
  } | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });
  const { setIsCustomGraphsOpen } = useAuth();

  const loadGraph = async (personalized: boolean) => {
    setIsLoading(true);
    try {
      // Isolate strictly to active logged-in user
      const targetUserId = personalized && user ? user.id : undefined;
      const data = await apiClient.getKnowledgeGraph(targetUserId);
      setGraphData(data);
      if ((data as any).userSummary) {
        setUserSummary((data as any).userSummary);
      }
      if (data.nodes.length > 0 && !selectedNode) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err) {
      console.warn('Using structured fallback graph data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph(isPersonalized);
  }, [user, isPersonalized]);

  const filteredNodes = graphData.nodes.filter((n) => {
    const matchType = filterType === 'all' || n.type === filterType;
    const matchSearch = n.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        n.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const visibleLinks = graphData.links.filter(
    (l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
  );

  const svgW = 940;
  const svgH = 640;

  const connectedLinks = selectedNode
    ? graphData.links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
    : [];
  const connectedNodeIds = new Set(connectedLinks.flatMap((l) => [l.source, l.target]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Auth Gate Notification for unauthenticated visitors */}
      {!user && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Student Account Required:</span> You are viewing the global static curriculum graph. Create an account or sign in to generate and track your custom personal mastery graph, calibrated by your skill level.
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition shrink-0 shadow-sm"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Animated Page Header & Personalized Switcher */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 border border-dark-border rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                {isPersonalized && user
                  ? `Custom Graph: ${user.fullName || user.username}`
                  : isPersonalized
                  ? 'Personalized Knowledge Graph'
                  : 'Global Curriculum Graph'}
              </span>
              {user && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  user.skillLevel === 'Beginner'
                    ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                    : user.skillLevel === 'Intermediate'
                    ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                    : 'bg-purple-950 border-purple-500/40 text-purple-300'
                }`}>
                  Level: {user.skillLevel}
                </span>
              )}
              <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {graphData.nodes.length} nodes · {graphData.links.length} relationships
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isPersonalized && user
                ? `${user.fullName || user.username}'s Learning Graph`
                : isPersonalized
                ? 'Your Custom Learning Graph'
                : 'Algorithm Concept Graph'}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {isPersonalized
                ? 'Constructed dynamically for your student profile with Supabase & Neo4j. Nodes glow with your mastery status and highlight AI-recommended next steps.'
                : 'Explore how every algorithm, data structure, technique, and complexity class inter-relate. Click any node to highlight direct connections.'}
            </p>
          </div>

          {/* Graph View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0">
            {user && (
              <button
                type="button"
                onClick={() => setIsCustomGraphsOpen(true)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-950/90 border border-indigo-700/60 text-indigo-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Radar Analytics</span>
              </button>
            )}
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setIsPersonalized(true);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                isPersonalized
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{user ? 'My Custom Graph' : 'Personalized'}</span>
            </button>
            <button
              onClick={() => setIsPersonalized(false)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                !isPersonalized
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Curriculum View</span>
            </button>
          </div>
        </div>

        {/* Personalized Student Mastery Bar */}
        {isPersonalized && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Mastery Level</div>
                <div className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{userSummary?.masteryPercentage ?? 8}%</span>
                  <span className="text-[10px] text-emerald-400 font-normal">
                    ({userSummary?.totalMastered ?? 1} Mastered)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">In Progress</div>
                <div className="text-base font-bold text-white">
                  {userSummary?.inProgress ?? 1} Concepts
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Needs Review</div>
                <div className="text-base font-bold text-white">
                  {userSummary?.needsReview ?? 1} Concepts
                </div>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Cloud Data Store</div>
                <div className="text-xs font-semibold text-indigo-300 truncate">
                  Supabase + Neo4j Aura
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Recommended Concept Pills */}
        {isPersonalized && userSummary?.recommendations && userSummary.recommendations.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-brand-300 font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              AI Recommended Next:
            </span>
            {userSummary.recommendations.map((recId) => (
              <Link
                key={recId}
                href={`/visualizer/${recId}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-950/80 border border-brand-500/40 text-brand-200 text-xs font-mono hover:bg-brand-900 transition"
              >
                <span>{recId.replace(/-/g, ' ')}</span>
                <ArrowRight className="w-3 h-3 text-brand-400" />
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3"
      >
        <div className="flex flex-wrap gap-1.5">
          {['all', 'algorithm', 'data-structure', 'concept', 'technique', 'complexity'].map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition capitalize ${
                filterType === t
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Nodes' : t.replace('-', ' ')}
            </motion.button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500"
          />
        </div>
      </motion.div>

      {/* Main Two-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Graph Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-slate-950/70 border border-dark-border rounded-xl overflow-hidden shadow-2xl"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent"
              />
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-auto"
              style={{ minHeight: 320 }}
            >
              <defs>
                {Object.entries(relationColors).map(([rel, color]) => (
                  <marker
                    key={rel}
                    id={`arrow-${rel}`}
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill={color} opacity="0.75" />
                  </marker>
                ))}
              </defs>

              {/* Edges */}
              {visibleLinks.map((link, idx) => {
                const src = nodePositions[link.source];
                const tgt = nodePositions[link.target];
                if (!src || !tgt) return null;
                const isHighlighted =
                  selectedNode &&
                  (link.source === selectedNode.id || link.target === selectedNode.id);
                const color = relationColors[link.relation] || '#6366f1';
                return (
                  <motion.line
                    key={idx}
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={color}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : 0.18}
                    markerEnd={`url(#arrow-${link.relation})`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.005 }}
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isHovered = hoveredNode === node.id;
                const color = typeColors[node.type]?.node || '#6366f1';
                const r = isSelected ? 14 : isConnected ? 11 : 8;
                const status = node.userStatus || 'unvisited';
                const statusStyle = masteryStyles[status] || masteryStyles.unvisited;

                return (
                  <motion.g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: Math.random() * 0.3 }}
                  >
                    {/* Mastery Halo for Personalized Mode */}
                    {isPersonalized && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={r + 4}
                        fill="none"
                        stroke={statusStyle.ring}
                        strokeWidth={status === 'mastered' ? 2.5 : status === 'needs_review' ? 2 : 1.2}
                        strokeDasharray={status === 'in_progress' ? '3,2' : undefined}
                        opacity={status === 'unvisited' ? 0.35 : 0.95}
                      />
                    )}

                    {/* Glow ring for selected */}
                    {(isSelected || isHovered) && (
                      <motion.circle
                        cx={pos.x} cy={pos.y}
                        r={r + 8}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        strokeOpacity={0.4}
                        animate={{ r: [r + 6, r + 12, r + 6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={color}
                      fillOpacity={isSelected ? 1 : isConnected ? 0.85 : 0.65}
                      animate={{ r }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />

                    {/* Checkmark indicator on mastered nodes in personalized mode */}
                    {isPersonalized && status === 'mastered' && (
                      <circle
                        cx={pos.x + r - 2}
                        cy={pos.y - r + 2}
                        r={3}
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth={1}
                      />
                    )}

                    <text
                      x={pos.x}
                      y={pos.y + r + 13}
                      textAnchor="middle"
                      fontSize={isSelected ? 10.5 : 8.5}
                      fill={typeColors[node.type]?.text || '#c7d2fe'}
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      opacity={selectedNode ? (isConnected || isSelected ? 1 : 0.35) : 0.85}
                    >
                      {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                    </text>
                  </motion.g>
                );
              })}
            </svg>
          )}

          {/* Legends: Types & Mastery Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-800 text-[10px] font-mono">
            <div className="flex flex-wrap gap-3">
              {Object.entries(typeColors).map(([type, c]) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c.node }} />
                  <span className="text-slate-400 capitalize">{type.replace('-', ' ')}</span>
                </span>
              ))}
            </div>

            {isPersonalized && (
              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <span className="text-slate-500 uppercase font-semibold">User Mastery:</span>
                {Object.entries(masteryStyles).map(([statusKey, st]) => (
                  <span key={statusKey} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border"
                      style={{ background: st.fill, borderColor: st.ring }}
                    />
                    <span className="text-slate-300">{st.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Node Detail Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded border ${typeColors[selectedNode.type]?.badge}`}>
                      {selectedNode.type.replace('-', ' ')}
                    </span>
                    {isPersonalized && selectedNode.userStatus && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${masteryStyles[selectedNode.userStatus]?.badge}`}>
                        {masteryStyles[selectedNode.userStatus]?.label}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">{selectedNode.label}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedNode.description}</p>
                </div>

                {/* Personalized Mastery Metrics */}
                {isPersonalized && (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center justify-between">
                      <span>Personal Mastery Profile</span>
                      <span className="text-brand-300 font-bold">
                        {selectedNode.score !== undefined ? `${selectedNode.score}%` : '0%'}
                      </span>
                    </div>
                    {selectedNode.attempts !== undefined && selectedNode.attempts > 0 ? (
                      <div className="text-[11px] text-slate-400">
                        Solved {selectedNode.correct || 0} of {selectedNode.attempts} AI practice questions correctly.
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500">
                        No practice attempts logged yet. Test your knowledge below.
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {selectedNode.algorithmId && (
                    <Link
                      href={`/visualizer/${selectedNode.algorithmId}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glow transition w-full justify-center"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Open Live Visualizer
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <Link
                    href={`/practice?algorithmId=${selectedNode.algorithmId || selectedNode.id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition w-full justify-center"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Practice AI Questions on this Topic
                  </Link>
                </div>

                {/* Connected Nodes */}
                {connectedLinks.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider font-mono">
                      Direct Connections ({connectedLinks.length})
                    </span>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {connectedLinks.map((link, idx) => {
                        const otherId = link.source === selectedNode.id ? link.target : link.source;
                        const otherNode = graphData.nodes.find((n) => n.id === otherId);
                        const color = relationColors[link.relation] || '#6366f1';
                        const direction = link.source === selectedNode.id ? '→' : '←';
                        return (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => otherNode && setSelectedNode(otherNode)}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-600 transition text-left"
                          >
                            <span className="font-mono text-[10px] font-bold" style={{ color }}>
                              {direction}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate">
                                {otherNode?.label || otherId}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">{link.label}</p>
                            </div>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded border font-mono shrink-0"
                              style={{ borderColor: `${color}60`, color }}
                            >
                              {link.relation.replace(/_/g, ' ')}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6 text-center text-slate-500 text-sm"
              >
                <Network className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Click any node to inspect its connections
              </motion.div>
            )}
          </AnimatePresence>

          {/* Relationship Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2"
          >
            <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider font-mono block">
              Edge Relationship Types
            </span>
            {Object.entries(relationColors).map(([rel, color]) => (
              <div key={rel} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-5 h-0.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="font-mono capitalize">{rel.replace(/_/g, ' ').replace(/-/g, ' ')}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
