'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code,
  Compass,
  PlayCircle,
  HelpCircle,
  LineChart,
  Network,
  Info,
  Sparkles,
  Scale,
  Target,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, setIsAuthModalOpen } = useAuth();

  const navLinks = [
    { href: '/learn', label: 'Learn', icon: Compass },
    { href: '/visualizer/merge-sort', label: 'Visualizer', icon: PlayCircle },
    { href: '/comparison', label: 'Comparison', icon: Scale },
    { href: '/challenge', label: 'DS Challenge', icon: Target },
    { href: '/practice', label: 'Practice', icon: HelpCircle },
    { href: '/complexity', label: 'Complexity', icon: LineChart },
    { href: '/knowledge', label: 'Graph', icon: Network },
    { href: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-indigo flex items-center justify-center shadow-glow group-hover:scale-105 transition">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              AlgoLens
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300">
                Live
              </span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              See the Code. Understand the Algorithm.
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href.startsWith('/visualizer') && pathname.startsWith('/visualizer'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Supabase Auth */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[11px] font-semibold text-slate-200 leading-tight flex items-center gap-1">
                  <span>{user.fullName || user.username || 'Student'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Supabase Auth</div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="text-[10px] text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-1.5 py-0.5 rounded transition ml-1"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span>Sign In</span>
            </button>
          )}

          <Link
            href="/visualizer/merge-sort"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-xs font-semibold rounded-lg shadow-glow transition transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Engine</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
