'use client';

import React, { useState } from 'react';
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
  Shield,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { CustomGraphsModal } from './CustomGraphsModal';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, setIsAuthModalOpen, setIsCustomGraphsOpen } = useAuth();

  const navLinks = [
    { href: '/learn', label: 'Learn', icon: Compass },
    { href: '/visualizer/merge-sort', label: 'Visualizer', icon: PlayCircle },
    { href: '/comparison', label: 'Comparison', icon: Scale },
    { href: '/challenge', label: 'Challenge', icon: Target },
    { href: '/practice', label: 'Practice', icon: HelpCircle },
    { href: '/complexity', label: 'Complexity', icon: LineChart },
    { href: '/knowledge', label: 'Graph', icon: Network },
    { href: '/about', label: 'About', icon: Info },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-dark-bg/85 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="AlgoLens Home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-indigo flex items-center justify-center shadow-glow group-hover:scale-105 transition shrink-0">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div className="shrink-0">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                AlgoLens
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300">
                  Live
                </span>
              </span>
              <span className="hidden 2xl:block text-[10px] text-slate-400 font-medium mt-0.5">
                See the Code. Understand the Algorithm.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 overflow-hidden" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href.startsWith('/visualizer') && pathname.startsWith('/visualizer'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right CTA & Account Management */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    user.skillLevel === 'Beginner'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : user.skillLevel === 'Intermediate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                    <span>{user.fullName || user.username || 'Student'}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${
                        user.skillLevel === 'Beginner'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : user.skillLevel === 'Intermediate'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {user.skillLevel}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[130px]">
                    {user.email}
                  </div>
                </div>

                {/* My Custom Graphs Trigger */}
                <button
                  onClick={() => setIsCustomGraphsOpen(true)}
                  className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[11px] font-medium transition flex items-center gap-1 min-h-[36px]"
                  title="View my personalized graphs & analytics"
                  aria-label="View personalized graphs and analytics"
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">My Graphs</span>
                </button>

                <button
                  onClick={logout}
                  title="Sign out of student account"
                  aria-label="Sign out of student account"
                  className="text-[11px] text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-2 py-1 rounded-lg transition min-h-[36px]"
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  aria-label="Sign In or Create Account"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-500/40 bg-brand-950/60 hover:bg-brand-900/80 text-brand-200 text-xs font-semibold shadow-glow transition min-h-[40px] whitespace-nowrap shrink-0"
                >
                  <Shield className="w-3.5 h-3.5 text-brand-400" />
                  <span className="hidden xl:inline">Sign In / Create Account</span>
                  <span className="xl:hidden">Sign In</span>
                </button>
              </div>
            )}

            <Link
              href="/visualizer/merge-sort"
              aria-label="Launch Algorithm Engine"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-xs font-semibold rounded-xl shadow-glow transition transform hover:scale-105 shrink-0 min-h-[40px] whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Engine</span>
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <nav
            className="lg:hidden bg-slate-950/95 border-b border-dark-border px-4 py-4 space-y-2 backdrop-blur-lg animate-in slide-in-from-top duration-200"
            aria-label="Mobile Navigation"
          >
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href.startsWith('/visualizer') && pathname.startsWith('/visualizer'));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition min-h-[44px] ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCustomGraphsOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-950/80 border border-indigo-700 text-indigo-300 text-xs font-semibold min-h-[44px]"
                >
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>View My Analytics & Radar Chart</span>
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Render the Custom Graphs Modal for logged in users */}
      <CustomGraphsModal />
    </>
  );
};

