'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Target,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface ChallengeScenario {
  id: number;
  title: string;
  problem: string;
  context: string;
  options: {
    name: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  detailedBreakdown: string;
  recommendedVisualizer?: string;
  theoryConcept: string;
}

const CHALLENGES: ChallengeScenario[] = [
  {
    id: 1,
    title: 'Stream Extremum Extraction',
    problem: 'You need to repeatedly retrieve and extract the smallest element from a continuously incoming stream of numbers.',
    context: 'Data packets arrive out of order with dynamic latency timestamps. The router must always forward the packet with the lowest timestamp first.',
    options: [
      {
        name: 'Min-Heap (Priority Queue)',
        isCorrect: true,
        explanation: 'Provides instant O(1) peek of minimum element, O(log n) insertion, and O(log n) extraction. Perfect fit for continuous extremum extraction.',
      },
      {
        name: 'Unsorted Array',
        isCorrect: false,
        explanation: 'Insertion is O(1), but finding or extracting the minimum requires scanning the entire array in O(n) time, causing severe bottleneck on high throughput.',
      },
      {
        name: 'Hash Table',
        isCorrect: false,
        explanation: 'Hash tables offer O(1) key lookups, but do NOT maintain order or extremum invariants. Finding the minimum key requires an O(n) scan of all buckets.',
      },
      {
        name: 'Sorted Linked List',
        isCorrect: false,
        explanation: 'Extracting minimum is O(1) from the head, but inserting a new random element takes O(n) linear traversal because linked lists do not support binary search.',
      },
    ],
    detailedBreakdown: 'A Min-Heap maintains the semi-ordered invariant parent ≤ children in a compact array with zero pointer overhead. It beats both unsorted structures (which pay O(n) to find minimums) and fully sorted linear structures (which pay O(n) to insert).',
    recommendedVisualizer: '/visualizer/min-heap',
    theoryConcept: 'Binary Min-Heap & Priority Queue Semantics',
  },
  {
    id: 2,
    title: 'Search Engine Autocomplete',
    problem: 'You are designing an autocomplete search bar for a dictionary of 100,000 words. When a user types a prefix like "alg", you must return all candidate words instantly.',
    context: 'Mobile and web clients dispatch keystrokes every 50ms. Prefix lookups must be strictly bounded under 5ms without scanning irrelevant dictionary entries.',
    options: [
      {
        name: 'Trie (Prefix Tree)',
        isCorrect: true,
        explanation: 'Traversing prefix of length L takes strict O(L) time, completely independent of the 100,000 dictionary size. All matching words reside in the subtrie.',
      },
      {
        name: 'Hash Table',
        isCorrect: false,
        explanation: 'Hash tables only support exact key lookups O(1). Prefix matching requires scanning every single key in the dictionary in O(N) time.',
      },
      {
        name: 'Balanced AVL Tree',
        isCorrect: false,
        explanation: 'Can find prefix range in O(L log N), but string comparisons at each tree node add extra latency compared to direct character-by-character trie transitions.',
      },
      {
        name: 'Dynamic Array of Strings',
        isCorrect: false,
        explanation: 'Linear scan is O(N × L). Even with binary search on a sorted array, locating matching range boundaries and extracting candidates involves costly overhead.',
      },
    ],
    detailedBreakdown: 'In a Trie, all words sharing common prefixes share the same ancestor path in the tree. Once you walk L steps matching the query prefix, the subtree rooted at that node represents all possible completions.',
    recommendedVisualizer: '/visualizer/trie',
    theoryConcept: 'Prefix Trees, Digital Search, Character Transitions',
  },
  {
    id: 3,
    title: 'Dynamic Leaderboard with Range Queries',
    problem: 'You must maintain a live gaming leaderboard where players frequently gain/lose points. The system needs to query the top-K players and players within score range [1500, 2000].',
    context: 'Scores fluctuate dynamically every second. Queries must return ordered subsets without full table sorts.',
    options: [
      {
        name: 'AVL Tree (Self-Balancing BST)',
        isCorrect: true,
        explanation: 'Maintains strict O(log n) insert/delete while preserving in-order traversal for range queries [A, B] and k-th order statistics in O(log n + k).',
      },
      {
        name: 'Binary Heap',
        isCorrect: false,
        explanation: 'Heaps only guarantee root extremum. Left and right subtrees have no relative ordering, so range queries require an O(n) full heap traversal.',
      },
      {
        name: 'Hash Table',
        isCorrect: false,
        explanation: 'Keys are distributed pseudorandomly across buckets. There is no concept of order, making range queries require a full O(n) scan followed by sorting.',
      },
      {
        name: 'Sorted Array',
        isCorrect: false,
        explanation: 'Binary search allows fast range finding, but every score update requires shifting elements in O(n) time, making real-time mutations sluggish.',
      },
    ],
    detailedBreakdown: 'Self-balancing BSTs like AVL trees guarantee that tree height never exceeds 1.44 log₂(n). In-order traversal naturally yields elements in sorted order, making them the standard choice for ordered in-memory indexes.',
    recommendedVisualizer: '/visualizer/avl',
    theoryConcept: 'AVL Balance Factor, Rotations, Range Queries',
  },
  {
    id: 4,
    title: 'Session Token Cache with Instant Lookups',
    problem: 'You are implementing an authentication middleware service that validates incoming JWT/UUID session tokens on every API request.',
    context: 'The system handles 50,000 requests/sec. The token is an arbitrary opaque string; no range queries or prefix sorting are ever needed.',
    options: [
      {
        name: 'Hash Table (e.g. In-Memory Key-Value)',
        isCorrect: true,
        explanation: 'Offers expected O(1) constant-time lookup, insert, and invalidation by hashing the UUID token directly to memory buckets.',
      },
      {
        name: 'Trie',
        isCorrect: false,
        explanation: 'A 36-character UUID would require traversing 36 pointer indirections, incurring multiple CPU cache misses compared to a single hash computation.',
      },
      {
        name: 'AVL Tree',
        isCorrect: false,
        explanation: 'Requires O(log n) string comparisons on each lookup, creating unnecessary CPU overhead when ordered access is not needed.',
      },
      {
        name: 'Doubly Linked List',
        isCorrect: false,
        explanation: 'Finding a session token requires O(n) linear search from head to tail, which is unacceptably slow for 50,000 req/sec.',
      },
    ],
    detailedBreakdown: 'When queries are strictly point lookups on unique opaque identifiers with no need for sorted order, Hash Tables are unbeatable due to amortized O(1) indexing and minimal CPU branch mispredictions.',
    theoryConcept: 'Hashing, Collision Resolution, Constant-Time Access',
  },
  {
    id: 5,
    title: 'GPS Navigation Shortest Driving Path',
    problem: 'You are calculating the fastest driving route between two intersections in a road network where every street has a positive travel time.',
    context: 'The city graph consists of 250,000 intersections (vertices) and 600,000 one-way street segments (edges).',
    options: [
      {
        name: "Dijkstra's Algorithm with Min-Heap",
        isCorrect: true,
        explanation: 'Greedily settles the closest unsettled intersection in O((V + E) log V) using a priority queue. Guarantees global optimality with non-negative edge weights.',
      },
      {
        name: 'Breadth-First Search (BFS)',
        isCorrect: false,
        explanation: 'BFS only finds the shortest path on unweighted graphs (all edges weight = 1). It fails to find optimal routes when streets have different travel times.',
      },
      {
        name: 'Depth-First Search (DFS)',
        isCorrect: false,
        explanation: 'DFS explores arbitrarily deep branches before backtracking. It does not find shortest paths and can get trapped in lengthy detour routes.',
      },
      {
        name: 'Floyd-Warshall Algorithm',
        isCorrect: false,
        explanation: 'Floyd-Warshall computes all-pairs shortest paths in O(V³) time. For 250,000 intersections, (250,000)³ is computationally impossible.',
      },
    ],
    detailedBreakdown: "Dijkstra's algorithm combined with an Adjacency List and Min-Heap priority queue guarantees that once a node is extracted from the queue, its shortest distance is finalized. Non-negative weights guarantee optimal substructure.",
    recommendedVisualizer: '/visualizer/dijkstra',
    theoryConcept: 'Greedy Shortest Path, Priority Relaxation, Adjacency List',
  },
  {
    id: 6,
    title: 'DNA Pattern Search without Backtracking',
    problem: 'You need to check if a specific viral gene pattern of length 1,000 exists inside a human genome sequence of length 3,000,000,000 without rescanning input characters.',
    context: 'The text stream arrives from a gene sequencer in real-time. Backtracking in the input buffer is prohibitive due to stream memory limits.',
    options: [
      {
        name: 'KMP (Knuth-Morris-Pratt)',
        isCorrect: true,
        explanation: 'Preprocesses the pattern into a π (LPS) table in O(M) time. The text pointer never backtracks, guaranteeing strict O(N + M) single-pass runtime.',
      },
      {
        name: 'Naive String Matching',
        isCorrect: false,
        explanation: 'Can degenerate to O(N × M) worst-case time with repetitive genomic sequences (e.g. AAAA...A), and requires rewinding the text pointer.',
      },
      {
        name: 'Binary Search',
        isCorrect: false,
        explanation: 'Binary search requires random access into a sorted collection of keys; it cannot be applied directly across an unsorted continuous genomic character stream.',
      },
      {
        name: 'Counting Sort',
        isCorrect: false,
        explanation: 'Counting sort sorts integer frequencies; it does not perform substring pattern detection or preserve contiguous sequence positions.',
      },
    ],
    detailedBreakdown: 'KMP harnesses the failure function (longest proper prefix which is also a suffix) to shift the pattern forward logically without ever moving the text read head backwards.',
    recommendedVisualizer: '/visualizer/kmp',
    theoryConcept: 'LPS Prefix Table, Deterministic Finite Automaton, Single-Pass Stream Matching',
  },
  {
    id: 7,
    title: 'Massive Exam Score Distribution Sort',
    problem: 'You need to sort the test scores of 500,000 university applicants. All scores are whole integers strictly between 0 and 100.',
    context: 'Comparison-based sorting (Merge Sort/Quick Sort) takes O(N log N) ≈ 9.5 million operations. You need the fastest possible sort.',
    options: [
      {
        name: 'Counting Sort',
        isCorrect: true,
        explanation: 'Runs in non-comparison linear O(N + K) time, where K = 101. Processes all 500,000 scores in a single pass of ~500,100 operations!',
      },
      {
        name: 'Merge Sort',
        isCorrect: false,
        explanation: 'Runs in O(N log N) time and requires auxiliary O(N) array allocation, doing millions of unnecessary key-to-key comparisons.',
      },
      {
        name: 'Heap Sort',
        isCorrect: false,
        explanation: 'Takes O(N log N) and has poor CPU cache locality due to heap child index jumping across 500,000 elements.',
      },
      {
        name: 'Binary Search Tree Insertion',
        isCorrect: false,
        explanation: 'Allocates 500,000 tree nodes with massive pointer overhead, and duplicate keys cause skew or require frequency list handling.',
      },
    ],
    detailedBreakdown: 'Counting sort bypasses the theoretical Ω(N log N) comparison lower bound by exploiting the small integer range [0, 100]. It tallies frequencies in a tiny 101-element array and reconstructs the sorted output directly.',
    recommendedVisualizer: '/visualizer/counting-sort',
    theoryConcept: 'Non-Comparison Sorting, Prefix Sum Cumulative Offsets, Linear Time',
  },
  {
    id: 8,
    title: 'Text Editor Undo / Redo Buffer',
    problem: 'You are designing the undo history engine for a code editor. Whenever the user presses Ctrl+Z, the most recent edit action must be reverted immediately.',
    context: 'The buffer must support instant push of new edits, instant peek/pop of the last edit, and bounded memory capacity.',
    options: [
      {
        name: 'Stack (LIFO via Dynamic Array or Linked List)',
        isCorrect: true,
        explanation: 'Provides strict Last-In, First-Out (LIFO) semantics with O(1) push and O(1) pop. Exactly matches the chronological undo requirement.',
      },
      {
        name: 'Priority Queue (Heap)',
        isCorrect: false,
        explanation: 'Heaps order elements by priority rather than insertion chronology, adding unnecessary O(log n) sift operations on every edit.',
      },
      {
        name: 'Queue (FIFO)',
        isCorrect: false,
        explanation: 'First-In, First-Out reverses the required behavior: it would revert the oldest edit from an hour ago instead of the most recent keystroke!',
      },
      {
        name: 'Hash Table',
        isCorrect: false,
        explanation: 'Hash tables have no chronological ordering or top-of-stack pointer, making "pop last action" impossible without auxiliary tracking.',
      },
    ],
    detailedBreakdown: 'A Stack embodies LIFO ordering. Combined with a secondary "redo" stack, it delivers optimal O(1) memory and time guarantees for bi-directional transaction history.',
    theoryConcept: 'LIFO Discipline, Call Stack, Invariant Preservation',
  },
];

export default function ChallengePage() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const challenge = CHALLENGES[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = challenge.options[idx].isCorrect;
    if (isCorrect) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < CHALLENGES.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Educational Mini-Challenge
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Scenario {currentIdx + 1} of {CHALLENGES.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Choose the Optimal Data Structure
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Evaluate real-world engineering constraints and pick the optimal structure. Learn why the winner
            excels and where other candidates fall short.
          </p>
        </div>

        {/* Live Score & Streak */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shrink-0 font-mono text-xs">
          <div className="text-center px-2">
            <span className="text-slate-500 block text-[10px] uppercase">Score</span>
            <strong className="text-white text-base font-bold">
              {score}/{CHALLENGES.length}
            </strong>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-slate-500 block text-[10px] uppercase">Streak</span>
            <strong className="text-amber-400 text-base font-bold flex items-center gap-1 justify-center">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              {streak}
            </strong>
          </div>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-brand-500 to-accent-indigo h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / CHALLENGES.length) * 100}%` }}
            />
          </div>

          {/* Scenario Card */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-brand-400 font-mono font-semibold uppercase">
                  {challenge.theoryConcept}
                </span>
                <span className="text-slate-500 font-mono">PBL Challenge #{challenge.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{challenge.title}</h2>
              <div className="mt-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans">
                <strong className="text-brand-300 block mb-1">Problem Scenario:</strong>
                "{challenge.problem}"
                <p className="mt-2 text-xs text-slate-400">
                  <strong className="text-slate-300">Technical Context:</strong> {challenge.context}
                </p>
              </div>
            </div>

            {/* Options Selection */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-3 uppercase tracking-wider">
                Which data structure should you choose?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenge.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let cardStyle =
                    'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-brand-500 hover:bg-slate-900';

                  if (isAnswered) {
                    if (opt.isCorrect) {
                      cardStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !opt.isCorrect) {
                      cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    } else {
                      cardStyle = 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between min-h-[90px] ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm">{opt.name}</span>
                        {isAnswered && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isAnswered && isSelected && !opt.isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                      {isAnswered && (
                        <p className="text-xs mt-2 leading-relaxed opacity-90">{opt.explanation}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-depth Breakdown after answer */}
            {isAnswered && (
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in duration-300 text-xs leading-relaxed">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-brand-400" />
                    Deep-Dive Architectural Rationale
                  </span>
                  {challenge.recommendedVisualizer && (
                    <Link
                      href={challenge.recommendedVisualizer}
                      className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      See Live in Visualizer <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <p className="text-slate-300">{challenge.detailedBreakdown}</p>
              </div>
            )}

            {/* Bottom Actions */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-glow transition flex items-center gap-2"
                >
                  {currentIdx < CHALLENGES.length - 1 ? (
                    <>
                      Next Challenge <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View Results & Summary <Trophy className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results & Completion Summary Card */
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center mx-auto shadow-glow">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white">Challenge Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">
              You evaluated all {CHALLENGES.length} advanced data structure engineering scenarios.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Final Score</span>
              <strong className="text-2xl text-emerald-400 font-bold">
                {score}/{CHALLENGES.length}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Accuracy</span>
              <strong className="text-2xl text-brand-300 font-bold">
                {Math.round((score / CHALLENGES.length) * 100)}%
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Best Streak</span>
              <strong className="text-2xl text-amber-400 font-bold">{bestStreak}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            {score >= 7
              ? 'Outstanding! You have mastered the architectural intuition behind Heaps, Tries, AVL Trees, Hash Tables, and Graph traversal algorithms.'
              : score >= 4
              ? 'Good job! You have solid fundamentals. Review the trade-off matrix on the Comparison page to hone your edge cases.'
              : 'Keep practicing! Data structure choices depend on invariant guarantees and memory layouts. Explore each algorithm interactively in the Visualizer.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link
              href="/comparison"
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glow transition flex items-center gap-2"
            >
              Explore Comparison Matrix <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
