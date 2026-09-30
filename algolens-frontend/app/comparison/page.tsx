'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Search,
  ExternalLink,
} from 'lucide-react';

interface StructureComparison {
  id: string;
  name: string;
  category: 'Tree' | 'Hash' | 'String' | 'Heap' | 'Linear' | 'Graph';
  search: { avg: string; worst: string };
  insert: { avg: string; worst: string };
  delete: { avg: string; worst: string };
  space: string;
  concept: string;
  advantages: string[];
  disadvantages: string[];
  visualizerLink?: string;
  bestFor: string;
}

const COMPARISON_DATA: StructureComparison[] = [
  {
    id: 'avl',
    name: 'AVL Tree',
    category: 'Tree',
    search: { avg: 'O(log n)', worst: 'O(log n)' },
    insert: { avg: 'O(log n)', worst: 'O(log n)' },
    delete: { avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
    concept: 'Self-balancing BST with strict |BF| ≤ 1 invariant. Guarantees logarithmic height through LL, RR, LR, RL rotations.',
    advantages: [
      'Guaranteed O(log n) worst-case lookups',
      'Faster lookups than Red-Black trees due to stricter balance factor',
      'Maintains sorted order & supports range queries efficiently',
    ],
    disadvantages: [
      'More frequent rotations on insert/delete compared to Red-Black trees',
      'High pointer memory overhead (parent, left, right, height per node)',
    ],
    visualizerLink: '/visualizer/avl',
    bestFor: 'Lookup-intensive workloads needing strict real-time O(log n) guarantees and ordered range queries.',
  },
  {
    id: 'bst',
    name: 'Binary Search Tree (Unbalanced)',
    category: 'Tree',
    search: { avg: 'O(log n)', worst: 'O(n)' },
    insert: { avg: 'O(log n)', worst: 'O(n)' },
    delete: { avg: 'O(log n)', worst: 'O(n)' },
    space: 'O(n)',
    concept: 'Hierarchical node tree where left < root < right. Prone to skewing into a linked list on sorted inputs.',
    advantages: [
      'Simple implementation without rotation logic',
      'Maintains dynamic sorted keys on average',
    ],
    disadvantages: [
      'Degenerates to O(n) linked list on sorted or nearly sorted input',
      'No height balancing guarantees',
    ],
    bestFor: 'Academic demonstration or situations where input keys are provably random.',
  },
  {
    id: 'hash-table',
    name: 'Hash Table',
    category: 'Hash',
    search: { avg: 'O(1)', worst: 'O(n)' },
    insert: { avg: 'O(1)', worst: 'O(n)' },
    delete: { avg: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
    concept: 'Direct key-to-index mapping via hashing function with collision resolution (chaining or open addressing).',
    advantages: [
      'Constant time O(1) expected lookup, insert, and delete',
      'Extremely high throughput for point queries',
    ],
    disadvantages: [
      'Does not preserve key ordering (cannot do predecessor/successor or range queries in O(log n))',
      'Worst case O(n) under deliberate or accidental hash collision attacks',
      'Costly rehashing on dynamic table resizing',
    ],
    bestFor: 'Exact-key lookups, session token caches, dictionary lookups, deduplication.',
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'String',
    search: { avg: 'O(L)', worst: 'O(L)' },
    insert: { avg: 'O(L)', worst: 'O(L)' },
    delete: { avg: 'O(L)', worst: 'O(L)' },
    space: 'O(N × L)',
    concept: 'Tree keyed by string character sequences. Shared prefixes share root ancestors; words end at terminal nodes.',
    advantages: [
      'Lookup time depends only on string length L, completely independent of total words N',
      'Native O(L) prefix matching, auto-complete, and spell checking',
      'No hash collision degradation',
    ],
    disadvantages: [
      'High memory overhead due to array/map of child pointers at every character node',
      'Poor CPU cache locality because nodes are scattered in memory',
    ],
    visualizerLink: '/visualizer/trie',
    bestFor: 'Search engine autocomplete, IP router longest prefix routing, spell-check dictionaries.',
  },
  {
    id: 'heap',
    name: 'Binary Heap (Min/Max)',
    category: 'Heap',
    search: { avg: 'O(n)', worst: 'O(n)' },
    insert: { avg: 'O(log n)', worst: 'O(log n)' },
    delete: { avg: 'O(log n)', worst: 'O(log n)' },
    space: 'O(n)',
    concept: 'Complete binary tree packed in contiguous array. Heap order invariant: parent ≤ children (min) or parent ≥ children (max).',
    advantages: [
      'O(1) instant retrieval of extremum (min or max)',
      'O(n) linear-time buildHeap via bottom-up sift-down',
      'Zero pointer overhead! Stored in compact contiguous array with 2i+1, 2i+2 indexing',
    ],
    disadvantages: [
      'Arbitrary key search is slow O(n) because left/right subtrees have no relative order',
      'Deleting arbitrary non-root elements is O(n + log n) without auxiliary hash index',
    ],
    visualizerLink: '/visualizer/min-heap',
    bestFor: 'Priority queues, CPU job schedulers, Dijkstra shortest path, streaming Top-K / median tracking.',
  },
  {
    id: 'dynamic-array',
    name: 'Dynamic Array (Vector)',
    category: 'Linear',
    search: { avg: 'O(n)', worst: 'O(n)' },
    insert: { avg: 'O(1)*', worst: 'O(n)' },
    delete: { avg: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
    concept: 'Contiguous memory buffer with geometric capacity doubling (amortized O(1) append).',
    advantages: [
      'Instant O(1) random index access (arr[i])',
      'Best-in-class CPU cache locality (L1/L2 prefetching across contiguous memory)',
      'Minimal memory overhead per element',
    ],
    disadvantages: [
      'Arbitrary insert/delete requires O(n) shifting of subsequent elements',
      'Occasional resizing reallocation spike',
    ],
    visualizerLink: '/visualizer/merge-sort',
    bestFor: 'Sequential processing, indexed lookups, algorithms dominated by cache-line throughput.',
  },
  {
    id: 'linked-list',
    name: 'Doubly Linked List',
    category: 'Linear',
    search: { avg: 'O(n)', worst: 'O(n)' },
    insert: { avg: 'O(1)', worst: 'O(1)' },
    delete: { avg: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
    concept: 'Non-contiguous nodes chained via next and prev pointers. Instant mutation given node reference.',
    advantages: [
      'Strict O(1) insertion and deletion once pointer to target node is known',
      'No contiguous reallocation pauses or capacity limits',
    ],
    disadvantages: [
      'No random access: reaching index k requires O(k) linear traversal',
      'Terrible cache locality; pointer chasing causes repeated CPU cache misses',
      'Memory bloat: 16-24 bytes of pointer overhead per payload',
    ],
    bestFor: 'LRU Cache backing list (combined with Hash Map), OS free-list allocators, undo/redo buffers.',
  },
  {
    id: 'graph-adj-list',
    name: 'Graph (Adjacency List)',
    category: 'Graph',
    search: { avg: 'O(V + E)', worst: 'O(V + E)' },
    insert: { avg: 'O(1)', worst: 'O(1)' },
    delete: { avg: 'O(deg(u))', worst: 'O(V)' },
    space: 'O(V + E)',
    concept: 'Vertex array mapping to linked lists/dynamic arrays of incident edges. Ideal for sparse graphs (E ≪ V²).',
    advantages: [
      'Space-efficient O(V + E) for realistic sparse real-world networks',
      'Iterating through neighbors takes optimal O(degree(v)) time',
    ],
    disadvantages: [
      'Checking if specific edge (u, v) exists takes O(degree(u)) rather than O(1)',
      'Multiple pointer indirections during traversal',
    ],
    visualizerLink: '/visualizer/dijkstra',
    bestFor: 'Road networks, social networks, web link graphs, shortest path traversals (Dijkstra, BFS).',
  },
];

export default function ComparisonPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [headA, setHeadA] = useState<string>('avl');
  const [headB, setHeadB] = useState<string>('hash-table');

  const categories = ['All', 'Tree', 'Hash', 'String', 'Heap', 'Linear', 'Graph'];

  const filteredData = COMPARISON_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bestFor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const structA = COMPARISON_DATA.find((x) => x.id === headA) || COMPARISON_DATA[0];
  const structB = COMPARISON_DATA.find((x) => x.id === headB) || COMPARISON_DATA[2];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950/60 to-slate-900 border border-dark-border rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Advanced DSA Architecture
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Data Structure & Algorithm Matrix
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Directly connect theoretical complexity bounds to actual implementation trade-offs. Compare
            invariants, memory footprints, asymptotic bounds, and production use cases to make informed
            engineering choices.
          </p>
        </div>
      </div>

      {/* Head-to-Head Comparative Battle Card */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Head-to-Head Architectural Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any two data structures to examine their trade-offs side by side.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={headA}
              onChange={(e) => setHeadA(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-brand-300 font-medium focus:border-brand-500 focus:outline-none"
            >
              {COMPARISON_DATA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-500 font-mono">VS</span>
            <select
              value={headB}
              onChange={(e) => setHeadB(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-medium focus:border-cyan-500 focus:outline-none"
            >
              {COMPARISON_DATA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-300">{structA.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
                {structA.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{structA.concept}</p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-2 bg-slate-950/70 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Search</span>
                <span className="text-amber-400 font-bold">{structA.search.avg}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Insert</span>
                <span className="text-emerald-400 font-bold">{structA.insert.avg}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Delete</span>
                <span className="text-rose-400 font-bold">{structA.delete.avg}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Key Strengths:</span>
              {structA.advantages.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{adv}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Critical Trade-offs:</span>
              {structA.disadvantages.map((dis, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-400">
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{dis}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Optimal Use Case:</span>
              <p className="text-white mt-0.5 font-medium">{structA.bestFor}</p>
            </div>

            {structA.visualizerLink && (
              <Link
                href={structA.visualizerLink}
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium mt-2"
              >
                Launch {structA.name} in Live Visualizer <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Card B */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cyan-300">{structB.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {structB.category}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{structB.concept}</p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-2 bg-slate-950/70 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Search</span>
                <span className="text-amber-400 font-bold">{structB.search.avg}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Insert</span>
                <span className="text-emerald-400 font-bold">{structB.insert.avg}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Delete</span>
                <span className="text-rose-400 font-bold">{structB.delete.avg}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Key Strengths:</span>
              {structB.advantages.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{adv}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">Critical Trade-offs:</span>
              {structB.disadvantages.map((dis, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-400">
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{dis}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Optimal Use Case:</span>
              <p className="text-white mt-0.5 font-medium">{structB.bestFor}</p>
            </div>

            {structB.visualizerLink && (
              <Link
                href={structB.visualizerLink}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-2"
              >
                Launch {structB.name} in Live Visualizer <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search concept, usage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Master Comparison Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Data Structure</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Search (Avg / Worst)</th>
                <th className="py-3.5 px-4 font-semibold">Insert (Avg / Worst)</th>
                <th className="py-3.5 px-4 font-semibold">Delete (Avg / Worst)</th>
                <th className="py-3.5 px-4 font-semibold">Space</th>
                <th className="py-3.5 px-4 font-semibold">Main Concept</th>
                <th className="py-3.5 px-4 font-semibold text-right">Live View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-amber-400 font-semibold">{row.search.avg}</span>
                    {row.search.avg !== row.search.worst && (
                      <span className="text-rose-400 text-[10px] block">worst: {row.search.worst}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 font-semibold">{row.insert.avg}</span>
                    {row.insert.avg !== row.insert.worst && (
                      <span className="text-rose-400 text-[10px] block">worst: {row.insert.worst}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-rose-400 font-semibold">{row.delete.avg}</span>
                    {row.delete.avg !== row.delete.worst && (
                      <span className="text-rose-400 text-[10px] block">worst: {row.delete.worst}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-cyan-400">{row.space}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs text-[11px] leading-relaxed">
                    {row.concept}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {row.visualizerLink ? (
                      <Link
                        href={row.visualizerLink}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-600/30 text-brand-300 border border-brand-500/40 hover:bg-brand-600 hover:text-white transition text-[11px]"
                      >
                        Visualizer <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-slate-600 text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Callout to Challenge Mode */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Ready to test your architectural intuition?
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Take the "Choose the Data Structure" challenge. Solve real-world architectural design scenarios and receive immediate deterministic feedback.
          </p>
        </div>
        <Link
          href="/challenge"
          className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glow transition shrink-0 flex items-center gap-2"
        >
          Take DS Challenge <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
