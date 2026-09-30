'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { LineChart as ChartIcon, CheckSquare, Square } from 'lucide-react';

export default function ComplexityPage() {
  const chartData = [
    { n: 1, 'O(1)': 1, 'O(log n)': 0, 'O(n)': 1, 'O(n log n)': 0, 'O(n^2)': 1 },
    { n: 2, 'O(1)': 1, 'O(log n)': 1, 'O(n)': 2, 'O(n log n)': 2, 'O(n^2)': 4 },
    { n: 4, 'O(1)': 1, 'O(log n)': 2, 'O(n)': 4, 'O(n log n)': 8, 'O(n^2)': 16 },
    { n: 8, 'O(1)': 1, 'O(log n)': 3, 'O(n)': 8, 'O(n log n)': 24, 'O(n^2)': 64 },
    { n: 12, 'O(1)': 1, 'O(log n)': 3.58, 'O(n)': 12, 'O(n log n)': 43, 'O(n^2)': 144 },
    { n: 16, 'O(1)': 1, 'O(log n)': 4, 'O(n)': 16, 'O(n log n)': 64, 'O(n^2)': 256 },
    { n: 20, 'O(1)': 1, 'O(log n)': 4.32, 'O(n)': 20, 'O(n log n)': 86.4, 'O(n^2)': 400 },
  ];

  const [activeCurves, setActiveCurves] = useState<Record<string, boolean>>({
    'O(1)': true,
    'O(log n)': true,
    'O(n)': true,
    'O(n log n)': true,
    'O(n^2)': true,
  });

  const curveColors: Record<string, string> = {
    'O(1)': '#10b981', // green
    'O(log n)': '#06b6d4', // cyan
    'O(n)': '#3b82f6', // blue
    'O(n log n)': '#f59e0b', // amber
    'O(n^2)': '#f43f5e', // rose
  };

  const toggleCurve = (key: string) => {
    setActiveCurves((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tableData = [
    { name: 'Binary Search', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    { name: 'Fibonacci Search', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
    { name: 'AVL Tree Insert/Search', best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
    { name: 'Linear Search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
    { name: 'Counting Sort', best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n + k)', space: 'O(k)' },
    { name: 'KMP String Matching', best: 'O(n + m)', avg: 'O(n + m)', worst: 'O(n + m)', space: 'O(m)' },
    { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-400 mb-1">
          <ChartIcon className="w-4 h-4" />
          <span>Big-O Mathematical Foundations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Algorithmic Complexity & Growth Rate Laboratory
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Visualize growth rates of fundamental asymptotic notations as the input size (n) scales.
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
          <h2 className="text-base font-bold text-white">Interactive Asymptotic Growth Curves</h2>

          {/* Curve Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {Object.keys(activeCurves).map((curveKey) => (
              <button
                key={curveKey}
                type="button"
                onClick={() => toggleCurve(curveKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition border ${
                  activeCurves[curveKey]
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: curveColors[curveKey] }}
                />
                <span>{curveKey}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="n" stroke="#64748b" label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#64748b" label={{ value: 'Operations (f(n))', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />

              {Object.keys(activeCurves).map((key) =>
                activeCurves[key] ? (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={curveColors[key]}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cheatsheet Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Algorithm Complexity Cheatsheet</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-dark-border text-slate-400">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Best Case</th>
                <th className="py-3 px-4">Average Case</th>
                <th className="py-3 px-4">Worst Case</th>
                <th className="py-3 px-4">Space Complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{row.name}</td>
                  <td className="py-3 px-4 text-emerald-400">{row.best}</td>
                  <td className="py-3 px-4 text-cyan-400">{row.avg}</td>
                  <td className="py-3 px-4 text-amber-400">{row.worst}</td>
                  <td className="py-3 px-4 text-purple-400">{row.space}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
