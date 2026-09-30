'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { User, LogIn, Sparkles, X, Check, ArrowRight } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string, fullName?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Form states inside modal
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load persisted user on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('algolens_user');
      const storedToken = localStorage.getItem('algolens_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        // Default to Demo Student for immediate PBL evaluation
        const defaultUser: AuthUser = {
          id: 'demo_user_alex',
          email: 'alex_student@algolens.edu',
          username: 'alex_student',
          fullName: 'Alex Student',
        };
        setUser(defaultUser);
        setToken('demo_user_alex');
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePersist = (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    try {
      localStorage.setItem('algolens_user', JSON.stringify(u));
      localStorage.setItem('algolens_token', t);
    } catch {}
  };

  const login = async (email: string, password: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await apiClient.login(email, password);
      if (res.user && res.token) {
        handlePersist(res.user, res.token);
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (email: string, password: string, username?: string, fullName?: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await apiClient.register(email, password, username, fullName);
      if (res.user && res.token) {
        handlePersist(res.user, res.token);
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginDemo = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await apiClient.loginDemo();
      if (res.user && res.token) {
        handlePersist(res.user, res.token);
        setIsAuthModalOpen(false);
      }
    } catch {
      const defaultUser: AuthUser = {
        id: 'demo_user_alex',
        email: 'alex_student@algolens.edu',
        username: 'alex_student',
        fullName: 'Alex Student',
      };
      handlePersist(defaultUser, 'demo_user_alex');
      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('algolens_user');
      localStorage.removeItem('algolens_token');
    } catch {}
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (isRegisterMode) {
      await register(emailInput, passwordInput, usernameInput, fullNameInput).catch(() => {});
    } else {
      await login(emailInput, passwordInput).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        loginDemo,
        logout,
      }}
    >
      {children}

      {/* Supabase User Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {isRegisterMode ? 'Create Student Account' : 'Supabase Student Sign In'}
                </h3>
                <p className="text-xs text-slate-400">
                  Sync your personalized knowledge graph & AI progress
                </p>
              </div>
            </div>

            {/* Fast Demo One-Click Access */}
            <div className="mb-5 p-3 rounded-xl bg-brand-950/60 border border-brand-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-brand-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Instant Evaluator Demo Login
                </div>
                <div className="text-[11px] text-slate-400">
                  Pre-configured student with personalized history
                </div>
              </div>
              <button
                type="button"
                onClick={loginDemo}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-sm shrink-0"
              >
                1-Click Demo
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono">
                {authError}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullNameInput}
                      onChange={(e) => setFullNameInput(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. alex_student"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Authenticating with Supabase...</span>
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Complete Registration' : 'Sign In to AlgoLens'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              {isRegisterMode ? (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setAuthError(null);
                    }}
                    className="text-brand-400 hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setAuthError(null);
                    }}
                    className="text-brand-400 hover:underline font-medium"
                  >
                    Register New Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
