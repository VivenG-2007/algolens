'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { STATIC_ALGORITHMS } from '@/lib/data/algorithms';
import { AlgorithmMetadata } from '@/types';
import { Search, Compass, ArrowRight, Clock, Box } from 'lucide-react';

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allAlgorithms = Object.values(STATIC_ALGORITHMS);

  const filteredAlgorithms = allAlgorithms.filter((algo) => {
    const matchesCategory =
      selectedCategory === 'all' || algo.category === selectedCategory;
    const matchesQuery =
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.timeComplexity.average.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-dark-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>Algorithm Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Curated Algorithms Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Select an algorithm to explore its time complexity, code implementations, and interactive execution engine.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search algorithms, O(n)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {[
          { id: 'all', label: 'All Categories' },
          { id: 'sorting', label: 'Sorting' },
          { id: 'searching', label: 'Searching' },
          { id: 'string', label: 'String Matching' },
          { id: 'tree', label: 'Trees & BST' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlgorithms.map((algo) => (
          <div
            key={algo.id}
            className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-lg flex flex-col justify-between hover:border-brand-500/50 transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-brand-300">
                  {algo.category}
                </span>
                <span className="text-xs font-mono font-bold text-accent-amber">
                  Avg: {algo.timeComplexity.average}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white group-hover:text-brand-300 transition">
                {algo.name}
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {algo.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Worst: {algo.timeComplexity.worst}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Space: {algo.spaceComplexity}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-dark-border/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Live Dynamic Visualizer</span>
              <Link
                href={`/visualizer/${algo.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white border border-brand-500/30 transition"
              >
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
