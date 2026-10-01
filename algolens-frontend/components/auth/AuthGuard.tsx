'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/about'];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, setIsAuthModalOpen } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Auto-open modal if user lands directly on a protected route while unauthenticated
  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      setIsAuthModalOpen(true);
    }
  }, [isLoading, user, isPublicRoute, setIsAuthModalOpen]);

  // Public route: render normally
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Loading state while checking localStorage / auth session
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-400">Verifying session credentials...</span>
      </div>
    );
  }

  // Unauthenticated user attempting to access a protected route
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl text-center backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto mb-5 shadow-glow">
            <Lock className="w-7 h-7" />
          </div>

          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-400 font-semibold block mb-1">
            Authentication Required
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to Unlock
          </h2>
          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            The algorithm visualizer, execution engine, challenges, and AI tutor are protected features. Please sign in or create an account to continue.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-xs font-bold shadow-glow transition transform hover:scale-[1.02] min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 py-2 transition"
            >
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
