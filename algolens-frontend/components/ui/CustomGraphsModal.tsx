'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import {
  X,
  LineChart,
  Target,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export const CustomGraphsModal: React.FC = () => {
  const { user, isCustomGraphsOpen, setIsCustomGraphsOpen, updateUserSkillLevel } = useAuth();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isCustomGraphsOpen || !user) return;

    let mounted = true;
    async function loadUserAnalytics() {
      setIsLoading(true);
      try {
        const data = await apiClient.getAnalytics(user?.id);
        if (mounted) setAnalytics(data);
      } catch (err) {
        console.warn('Failed to load user analytics', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadUserAnalytics();
    return () => {
      mounted = false;
    };
  }, [isCustomGraphsOpen, user]);

  if (!isCustomGraphsOpen || !user) return null;

  // Radar chart SVG points calculation
  // 6 dimensions on a 300x300 viewBox centered at (150, 150)
  const radarDimensions = [
    { key: 'divideConquer', label: 'Divide & Conquer' },
    { key: 'balancedTrees', label: 'Balanced Trees' },
    { key: 'graphAlgorithms', label: 'Graph Theory' },
    { key: 'stringMatching', label: 'String Matching' },
    { key: 'heapsPriority', label: 'Priority Heaps' },
    { key: 'asymptoticsInvariants', label: 'Invariants & Complexity' },
  ];

  const center = 150;
  const maxRadius = 100;
  const radarScores = analytics?.radarScores || {
    divideConquer: 50,
    balancedTrees: 30,
    graphAlgorithms: 20,
    stringMatching: 40,
    heapsPriority: 30,
    asymptoticsInvariants: 45,
  };

  const getPoint = (index: number, score: number) => {
    const angle = (Math.PI * 2 / 6) * index - Math.PI / 2;
    const r = (score / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getAxisPoint = (index: number) => {
    const angle = (Math.PI * 2 / 6) * index - Math.PI / 2;
    const x = center + maxRadius * Math.cos(angle);
    const y = center + maxRadius * Math.sin(angle);
    return { x, y };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 / 6) * index - Math.PI / 2;
    const x = center + (maxRadius + 24) * Math.cos(angle);
    const y = center + (maxRadius + 18) * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarDimensions
    .map((dim, i) => {
      const score = radarScores[dim.key] ?? 10;
      const pt = getPoint(i, score);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsCustomGraphsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono font-semibold flex items-center gap-1.5">
                <LineChart className="w-3.5 h-3.5" />
                Custom User Performance & Knowledge Graphs
              </span>
              <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                User ID: {user.id.slice(0, 14)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{user.fullName || user.username}</span>
              <span className="text-sm font-normal text-slate-400 font-mono">({user.email})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time algorithmic mastery charts and knowledge topology computed dynamically for your profile.
            </p>
          </div>

          {/* Level Switcher */}
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-medium">
              Calibrated Skill Level:
            </span>
            <div className="flex items-center gap-1.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateUserSkillLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    user.skillLevel === lvl
                      ? lvl === 'Beginner'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : lvl === 'Intermediate'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-brand-400" />
              OVERALL MASTERY
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {analytics?.masteryPercentage ?? 0}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {analytics?.completedAlgorithms?.length ?? 0} of 13 algorithms mastered
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              QUIZ ACCURACY
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {analytics?.accuracyPercentage ?? 0}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {analytics?.correctAttempts ?? 0} / {analytics?.totalAttempts ?? 0} questions correct
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-amber-400" />
              IN PROGRESS
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {analytics?.inProgressAlgorithms?.length ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Active algorithm traces</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-400" />
              CUSTOM LEVEL
            </div>
            <div className="text-lg font-bold text-purple-300 mt-1">
              {user.skillLevel}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Adaptive Groq calibration</div>
          </div>
        </div>

        {/* 2-Column Visual Charts: Radar Chart & Level Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom SVG Competency Radar Graph */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Algorithm Competency Radar
              </span>
              <span className="text-[10px] font-mono text-slate-500">6 Core Dimensions</span>
            </div>

            <div className="w-full flex justify-center py-2">
              <svg viewBox="0 0 300 300" className="w-full max-w-[280px] h-auto overflow-visible">
                {/* Background Concentric Polygons */}
                {[0.25, 0.5, 0.75, 1].map((scale, sIdx) => {
                  const pts = radarDimensions
                    .map((_, i) => {
                      const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                      const r = maxRadius * scale;
                      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={sIdx}
                      points={pts}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray={scale === 1 ? 'none' : '3 3'}
                    />
                  );
                })}

                {/* Dimension Axes */}
                {radarDimensions.map((_, i) => {
                  const pt = getAxisPoint(i);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={pt.x}
                      y2={pt.y}
                      stroke="#475569"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* User Radar Polygon */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(99, 102, 241, 0.35)"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  className="transition-all duration-500"
                />

                {/* Score Nodes */}
                {radarDimensions.map((dim, i) => {
                  const score = radarScores[dim.key] ?? 10;
                  const pt = getPoint(i, score);
                  return (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#6366f1"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Dimension Labels */}
                {radarDimensions.map((dim, i) => {
                  const pt = getLabelPoint(i);
                  const score = radarScores[dim.key] ?? 0;
                  return (
                    <text
                      key={i}
                      x={pt.x}
                      y={pt.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#cbd5e1"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {dim.label.split(' ')[0]} ({score}%)
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="w-full text-center text-[10px] text-slate-400 mt-2">
              Points represent your computed proficiency based on traces analyzed and quiz answers.
            </div>
          </div>

          {/* Level Accuracy & Category Progress Breakdown */}
          <div className="space-y-4">
            {/* Accuracy by Question Level */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Accuracy by Question Level</span>
                <span className="text-[10px] font-mono text-slate-400">Custom Calibration</span>
              </div>

              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
                const data = analytics?.levelBreakdown?.[lvl] || { attempted: 0, correct: 0, accuracy: 0 };
                const color =
                  lvl === 'Beginner' ? 'emerald' : lvl === 'Intermediate' ? 'amber' : 'purple';
                return (
                  <div key={lvl} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            lvl === 'Beginner'
                              ? 'bg-emerald-400'
                              : lvl === 'Intermediate'
                              ? 'bg-amber-400'
                              : 'bg-purple-400'
                          }`}
                        />
                        {lvl} Questions
                      </span>
                      <span className="font-mono text-slate-400">
                        {data.correct}/{data.attempted} correct ({data.accuracy}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          lvl === 'Beginner'
                            ? 'bg-emerald-500'
                            : lvl === 'Intermediate'
                            ? 'bg-amber-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.max(4, data.accuracy)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Progress Bars */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">DSA Category Progress</span>
                <span className="text-[10px] font-mono text-slate-400">Curriculum Tracking</span>
              </div>

              {(analytics?.categoryProgress || [
                { name: 'Divide & Conquer', completed: 1, total: 2, percentage: 50 },
                { name: 'Trees & Balanced Structures', completed: 0, total: 1, percentage: 0 },
                { name: 'String Matching', completed: 0, total: 1, percentage: 0 },
                { name: 'Graph Theory & SSSP', completed: 0, total: 3, percentage: 0 },
              ]).map((cat: any) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="font-mono text-slate-400">
                      {cat.completed}/{cat.total} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.max(2, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-User Session Active: All traces and graphs are isolated to your profile.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsCustomGraphsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Close
            </button>
            <Link
              href="/knowledge"
              onClick={() => setIsCustomGraphsOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo rounded-lg transition flex items-center gap-1.5 shadow-glow"
            >
              <span>Explore Interactive Topology Graph</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
