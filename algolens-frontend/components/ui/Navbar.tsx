'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Lock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { CustomGraphsModal } from './CustomGraphsModal';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, setIsAuthModalOpen, setIsCustomGraphsOpen } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (!user && href !== '/' && href !== '/about') {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  const handleExit = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/visualizer/merge-sort', label: 'Visualizer', icon: PlayCircle },
    { href: '/learn', label: 'Learn', icon: Compass },
    { href: '/comparison', label: 'Comparison', icon: Scale },
    { href: '/challenge', label: 'Challenge', icon: Target },
    { href: '/practice', label: 'Practice', icon: HelpCircle },
    { href: '/complexity', label: 'Complexity', icon: LineChart },
    { href: '/knowledge', label: 'Graph', icon: Network },
    { href: '/about', label: 'About', icon: Info },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-dark-bg/90 backdrop-blur-md border-b border-dark-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label="AlgoLens Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-indigo flex items-center justify-center shadow-glow group-hover:scale-105 transition shrink-0">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-brand-300 transition leading-none">
                AlgoLens
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300 font-semibold">
                Live
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Organized, Visible & Accessible */}
          <nav
            className="hidden xl:flex items-center gap-1 shrink-0"
            aria-label="Main Navigation"
          >
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href.startsWith('/visualizer') && pathname.startsWith('/visualizer'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-brand-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {!user && item.href !== '/about' && item.href !== '/' && (
                    <Lock className="w-2.5 h-2.5 text-slate-500 ml-0.5 opacity-60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Desktop Nav for Large Screens (1024px-1280px) */}
          <nav
            className="hidden lg:flex xl:hidden items-center gap-1 shrink-0"
            aria-label="Compact Main Navigation"
          >
            {navLinks.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href.startsWith('/visualizer') && pathname.startsWith('/visualizer'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-brand-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {!user && (
                    <Lock className="w-2.5 h-2.5 text-slate-500 ml-0.5 opacity-60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA & Account Management */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* User Pill */}
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1 shadow-sm">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                      user.skillLevel === 'Beginner'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : user.skillLevel === 'Intermediate'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[90px] sm:max-w-[110px]">
                      {user.fullName?.split(' ')[0] || user.username || 'Student'}
                    </span>
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

                  {/* My Custom Graphs Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCustomGraphsOpen(true)}
                    className="p-1 rounded-md text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/80 transition ml-1"
                    title="View my personalized graphs & analytics"
                    aria-label="View personalized graphs and analytics"
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </button>

                  {/* Exit / Logout Button (Redirects to /) */}
                  <button
                    type="button"
                    onClick={handleExit}
                    title="Exit to Landing Page"
                    aria-label="Exit to Landing Page"
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 px-1.5 py-0.5 rounded transition"
                  >
                    <LogOut className="w-3 h-3 text-rose-400/80" />
                    <span>Exit</span>
                  </button>
                </div>

                {/* Launch Engine Button — Visible after login */}
                <Link
                  href="/visualizer/merge-sort"
                  aria-label="Launch Algorithm Engine"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-xs font-semibold rounded-xl shadow-glow transition transform hover:scale-105 shrink-0 min-h-[38px] whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                  <span className="hidden sm:inline">Launch Engine</span>
                  <span className="sm:hidden">Launch</span>
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                aria-label="Sign In or Create Account"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-500/40 bg-brand-950/60 hover:bg-brand-900/80 text-brand-200 text-xs font-semibold shadow-glow transition min-h-[38px] whitespace-nowrap shrink-0"
              >
                <Shield className="w-3.5 h-3.5 text-brand-400" />
                <span>Sign In / Create Account</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition min-h-[40px] min-w-[40px] flex items-center justify-center ml-1"
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
            className="lg:hidden bg-slate-950/95 border-b border-dark-border px-4 py-4 space-y-3 backdrop-blur-lg animate-in slide-in-from-top duration-200"
            aria-label="Mobile Navigation"
          >
            {/* Routes Grid */}
            <div className="grid grid-cols-2 gap-2 pb-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href.startsWith('/visualizer') && pathname.startsWith('/visualizer'));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleNavClick(e, item.href);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition min-h-[44px] ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-brand-400' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {!user && item.href !== '/about' && item.href !== '/' && (
                      <Lock className="w-3.5 h-3.5 text-slate-500 opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Account & Actions */}
            {user ? (
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center text-xs font-bold">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {user.fullName || user.username}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {user.skillLevel} Student Account
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleExit();
                    }}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-md transition min-h-[36px]"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Exit</span>
                  </button>
                </div>

                <Link
                  href="/visualizer/merge-sort"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-accent-indigo text-white text-xs font-semibold shadow-glow min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Algorithm Engine</span>
                </Link>

                <button
                  type="button"
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
            ) : (
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-xs font-semibold shadow-glow transition min-h-[44px]"
                >
                  <Shield className="w-4 h-4 text-brand-300" />
                  <span>Sign In / Create Account to Unlock</span>
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Render Custom Graphs Modal for logged in users */}
      <CustomGraphsModal />
    </>
  );
};
