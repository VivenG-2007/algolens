import React from 'react';
import Link from 'next/link';
import { Code, Heart, Sparkles, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-dark-bg border-t border-dark-border py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">AlgoLens</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              An educational algorithm laboratory bridging source code with real-time execution, dynamic variable watches, and context-grounded AI tutoring.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>Full-Stack PBL Architecture: Vercel Frontend + Render Backend</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider block">
              Algorithms
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link href="/visualizer/merge-sort" className="hover:text-brand-400 transition">
                  Merge Sort (Divide & Conquer)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/counting-sort" className="hover:text-brand-400 transition">
                  Counting Sort (Linear Time)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/binary-search" className="hover:text-brand-400 transition">
                  Binary Search (Logarithmic)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/fibonacci-search" className="hover:text-brand-400 transition">
                  Fibonacci Search (Intervals)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/kmp" className="hover:text-brand-400 transition">
                  KMP Pattern Matcher (LPS)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/avl" className="hover:text-brand-400 transition">
                  AVL Tree (LL/RR/LR/RL)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/dijkstra" className="hover:text-brand-400 transition">
                  Dijkstra (Shortest Path)
                </Link>
              </li>
              <li>
                <Link href="/visualizer/min-heap" className="hover:text-brand-400 transition">
                  Min-Heap / Max-Heap
                </Link>
              </li>
              <li>
                <Link href="/visualizer/trie" className="hover:text-brand-400 transition">
                  Trie (Prefix Tree)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider block">
              Platform
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link href="/comparison" className="hover:text-brand-400 transition text-brand-300 font-medium">
                  DS Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/challenge" className="hover:text-brand-400 transition text-amber-300 font-medium">
                  Choose the DS Challenge
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-brand-400 transition">
                  Algorithm Catalog
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-brand-400 transition">
                  Practice Questions
                </Link>
              </li>
              <li>
                <Link href="/complexity" className="hover:text-brand-400 transition">
                  Big-O Complexity Chart
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="hover:text-brand-400 transition">
                  Knowledge Graph
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition">
                  College PBL Team & Specs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AlgoLens. Built for College Project-Based Learning (PBL).</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Engineered for 100+ concurrent learners</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
