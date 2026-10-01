'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion';
import {
  Code,
  Sparkles,
  Zap,
  Bot,
  Layers,
  ArrowRight,
  Database,
  CheckCircle,
  Play,
  Share2,
  Cpu,
  ShieldCheck,
  Network,
  GitBranch,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export default function HomePage() {
  const { user, setIsAuthModalOpen } = useAuth();
  const algoRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLElement>(null);
  const algoInView = useInView(algoRef, { once: true, margin: '-80px' });
  const archInView = useInView(archRef, { once: true, margin: '-80px' });

  const algorithms = [
    {
      id: 'merge-sort',
      name: 'Merge Sort',
      category: 'Sorting',
      complexity: 'O(n log n)',
      desc: 'Recursive divide-and-conquer splitting and merging of subarrays.',
      demoInput: '64 25 12 22 11',
      color: 'brand',
    },
    {
      id: 'counting-sort',
      name: 'Counting Sort',
      category: 'Sorting',
      complexity: 'O(n + k)',
      desc: 'Linear-time non-comparison sorting via frequency bucket calculation.',
      demoInput: '4 2 2 8 3 3 1',
      color: 'brand',
    },
    {
      id: 'linear-search',
      name: 'Linear Search',
      category: 'Searching',
      complexity: 'O(n)',
      desc: 'Sequential scan through each element to find a target value.',
      demoInput: '5 12 18 23 36 42',
      color: 'cyan',
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      category: 'Searching',
      complexity: 'O(log n)',
      desc: 'Logarithmic search interval elimination on ordered sequences.',
      demoInput: '10 20 30 40 50 60',
      color: 'cyan',
    },
    {
      id: 'fibonacci-search',
      name: 'Fibonacci Search',
      category: 'Searching',
      complexity: 'O(log n)',
      desc: 'Golden-ratio interval probing using Fibonacci sequence numbers.',
      demoInput: '10 20 30 40 50 60',
      color: 'cyan',
    },
    {
      id: 'kmp',
      name: 'KMP String Match',
      category: 'String Matching',
      complexity: 'O(n + m)',
      desc: 'Deterministic pattern matching powered by the LPS preprocessing table.',
      demoInput: 'ABABDABACDABABCABAB',
      color: 'amber',
    },
    {
      id: 'avl',
      name: 'AVL Tree',
      category: 'Self-Balancing BST',
      complexity: 'O(log n)',
      desc: 'Dynamic height-balanced BST with LL, RR, LR, RL rotations.',
      demoInput: '30 10 20',
      color: 'indigo',
    },
    {
      id: 'bfs',
      name: 'BFS',
      category: 'Graph Traversal',
      complexity: 'O(V + E)',
      desc: 'Level-order breadth-first graph exploration via queue.',
      demoInput: 'nodes: 6, edges: auto',
      color: 'emerald',
    },
    {
      id: 'dfs',
      name: 'DFS',
      category: 'Graph Traversal',
      complexity: 'O(V + E)',
      desc: 'Deep-first graph traversal using recursion or explicit stack.',
      demoInput: 'nodes: 6, edges: auto',
      color: 'emerald',
    },
    {
      id: 'dijkstra',
      name: "Dijkstra's SSSP",
      category: 'Shortest Path',
      complexity: 'O((V+E) log V)',
      desc: 'Greedy single-source shortest paths with priority queue.',
      demoInput: 'weighted graph, 6 nodes',
      color: 'emerald',
    },
    {
      id: 'min-heap',
      name: 'Min-Heap',
      category: 'Priority Queue',
      complexity: 'O(log n)',
      desc: 'Complete binary tree with parent ≤ children. Heapify on insert/delete.',
      demoInput: '15 10 8 5 3 1',
      color: 'violet',
    },
    {
      id: 'max-heap',
      name: 'Max-Heap',
      category: 'Priority Queue',
      complexity: 'O(log n)',
      desc: 'Complete binary tree with parent ≥ children. Extract-max in O(log n).',
      demoInput: '1 3 5 8 10 15',
      color: 'violet',
    },
    {
      id: 'trie',
      name: 'Trie (Prefix Tree)',
      category: 'Digital Search Tree',
      complexity: 'O(L)',
      desc: 'Character-by-character prefix tree enabling O(L) insert, search, and delete.',
      demoInput: 'cat car card',
      color: 'rose',
    },
    {
      id: 'radix-sort',
      name: 'Radix Sort (LSD)',
      category: 'Sorting',
      complexity: 'O(d · (n + k))',
      desc: 'Non-comparative integer sorting digit-by-digit from LSD using 10 distribution buckets.',
      demoInput: '170 45 75 90 802 24 2 66',
      color: 'brand',
    },
    {
      id: 'bucket-sort',
      name: 'Bucket Sort',
      category: 'Sorting',
      complexity: 'O(n + k)',
      desc: 'Distribute elements into uniform partition buckets, sort buckets, and concatenate.',
      demoInput: '0.42 0.32 0.73 0.25 0.52',
      color: 'cyan',
    },
    {
      id: 'interpolation-search',
      name: 'Interpolation Search',
      category: 'Searching',
      complexity: 'O(log log n)',
      desc: 'Estimated position probing for sorted uniform keys with slope calculation.',
      demoInput: '10 20 30 40 50 60 70',
      color: 'amber',
    },
    {
      id: 'shell-sort',
      name: 'Shell Sort',
      category: 'Sorting',
      complexity: 'O(n log² n)',
      desc: 'Gapped insertion sort using diminishing increment stride sequence.',
      demoInput: '12 34 54 2 3',
      color: 'indigo',
    },
    {
      id: 'tree-sort',
      name: 'Tree Sort',
      category: 'Tree',
      complexity: 'O(n log n)',
      desc: 'Build Binary Search Tree followed by Inorder traversal extraction.',
      demoInput: '50 30 70 20 40 60 80',
      color: 'emerald',
    },
    {
      id: 'quick-sort',
      name: 'Quick Sort',
      category: 'Sorting',
      complexity: 'O(n log n)',
      desc: 'Pivot-based Lomuto partition with two pointers and recursive subarray trees.',
      demoInput: '8 3 1 7 0 10 2',
      color: 'violet',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 to-accent-indigo/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-brand-500/30 text-brand-300 text-xs font-mono font-medium shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
              <span>College PBL Innovation • Production Grade</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]"
            >
              See the Code.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-indigo">
                Understand the Algorithm.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              AlgoLens transforms abstract algorithms into live, synchronized executions.
              Enter <strong>your own dynamic inputs</strong>, inspect line-by-line source code mutations, and converse with an AI Tutor grounded strictly in the real execution trace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              {user ? (
                <Link
                  href="/visualizer/merge-sort"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white font-semibold text-sm rounded-xl shadow-glow transition transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Merge Sort Visualizer</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white font-semibold text-sm rounded-xl shadow-glow transition transform hover:scale-105"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Launch Engine</span>
                </button>
              )}
              {user ? (
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
                >
                  <span>Browse 13 Algorithms</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Explore Algorithms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          </div>

          {/* Interactive Pipeline Showcase Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-dark-card/90 border border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-dark-border/60 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">
                  AlgoLens Synchronized Pipeline
                </span>
              </div>
              <span className="text-xs font-mono text-brand-400">
                100% Dynamic • Zero Pre-baked Animation
              </span>
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { step: '1. User Input', desc: 'Custom Numbers / String', color: 'border-brand-500/50 text-brand-300' },
                { step: '2. Backend Engine', desc: 'Stateless Render API', color: 'border-purple-500/50 text-purple-300' },
                { step: '3. ExecutionTrace', desc: 'ExecutionStep[] Array', color: 'border-cyan-500/50 text-cyan-300' },
                { step: '4. Source Code', desc: 'Active Line Highlight', color: 'border-emerald-500/50 text-emerald-300' },
                { step: '5. Variable Watch', desc: 'Pointers & Registers', color: 'border-amber-500/50 text-amber-300' },
                { step: '6. Visual Canvas', desc: 'Bars, Arrays & SVG Trees', color: 'border-indigo-500/50 text-indigo-300' },
                { step: '7. Groq AI Tutor', desc: 'Context-Grounded Tutor', color: 'border-rose-500/50 text-rose-300' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={`p-3 rounded-xl bg-slate-900/80 border ${item.color} flex flex-col justify-between min-h-[90px]`}
                >
                  <span className="text-xs font-bold">{item.step}</span>
                  <span className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Algorithms Showcase Grid */}
      <section ref={algoRef} className="py-20 bg-slate-950/50 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={algoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              13 Live Algorithm Engines
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every algorithm is powered by a real execution engine with your custom inputs — zero pre-baked animations.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            animate={algoInView ? 'show' : 'hidden'}
          >
            {algorithms.map((algo) => (
              <motion.div
                key={algo.id}
                variants={fadeUp}
                whileHover={{ y: -5, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-dark-card border border-dark-border hover:border-brand-500/50 rounded-xl p-5 shadow-lg flex flex-col justify-between group cursor-default"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-brand-300">
                      {algo.category}
                    </span>
                    <span className="text-xs font-mono font-semibold text-accent-amber">
                      {algo.complexity}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition">
                    {algo.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {algo.desc}
                  </p>

                  <div className="mt-4 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-500 block text-[10px]">Sample Input:</span>
                    <span className="text-slate-300">{algo.demoInput}</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-dark-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Live Tracing</span>
                  {user ? (
                    <Link
                      href={`/visualizer/${algo.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition"
                    >
                      <span>Visualize</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
                    >
                      <Lock className="w-3 h-3 text-brand-400/80" />
                      <span>Unlock Engine</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cloud Architecture Diagram Section */}
      <section ref={archRef} className="py-20 border-t border-dark-border bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={archInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-mono uppercase tracking-wider text-brand-400 block mb-1">
              Production Full-Stack Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Vercel + Render + Supabase + Neo4j
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Stateless Node.js execution engine, Redis cache acceleration, Neo4j knowledge graph, and isolated user traces.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={staggerContainer}
            initial="hidden"
            animate={archInView ? 'show' : 'hidden'}
          >
            {[
              {
                num: '1', title: 'Vercel Frontend', color: 'brand',
                icon: <Cpu className="w-5 h-5" />,
                desc: 'Next.js 15, TypeScript, Tailwind CSS, and Framer Motion animations. Full SSR + client hydration.',
              },
              {
                num: '2', title: 'Render Backend', color: 'purple',
                icon: <Layers className="w-5 h-5" />,
                desc: 'Express TypeScript service with stateless deterministic algorithm engines. Groq AI attached.',
              },
              {
                num: '3', title: 'Redis + Supabase', color: 'emerald',
                icon: <Database className="w-5 h-5" />,
                desc: 'Upstash Redis eliminates redundant compute for 100+ concurrent users. Supabase persists quiz scores.',
              },
              {
                num: '4', title: 'Neo4j Aura Graph', color: 'indigo',
                icon: <Network className="w-5 h-5" />,
                desc: 'Cloud Neo4j stores the DSA knowledge graph — nodes, relationships, and concept dependencies in Cypher.',
              },
            ].map((card) => (
              <motion.div
                key={card.num}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="p-6 rounded-xl bg-dark-card border border-dark-border space-y-3"
              >
                <div className={`w-10 h-10 rounded-lg bg-${card.color}-600/20 text-${card.color}-400 border border-${card.color}-500/30 flex items-center justify-center`}>
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-white">{card.num}. {card.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
