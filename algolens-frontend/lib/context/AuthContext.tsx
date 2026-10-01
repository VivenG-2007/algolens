'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import {
  User,
  LogIn,
  Sparkles,
  X,
  Check,
  ArrowRight,
  Shield,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Users,
  LineChart,
} from 'lucide-react';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  skillLevel: SkillLevel;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCustomGraphsOpen: boolean;
  setIsCustomGraphsOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username?: string,
    fullName?: string,
    skillLevel?: SkillLevel
  ) => Promise<void>;
  loginDemoRole: (role: 'beginner' | 'intermediate' | 'advanced') => Promise<void>;
  updateUserSkillLevel: (skillLevel: SkillLevel) => Promise<void>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCustomGraphsOpen, setIsCustomGraphsOpen] = useState<boolean>(false);

  // Form states inside modal
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [skillLevelInput, setSkillLevelInput] = useState<SkillLevel>('Intermediate');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load persisted user on client mount - NO AUTO-LOGIN WITHOUT ACCOUNT
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('algolens_user');
      const storedToken = localStorage.getItem('algolens_token');
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
        apiClient.setAuthToken(storedToken);
      } else {
        // STRICT AUTH GATE: Unauthenticated user stays null
        setUser(null);
        setToken(null);
        apiClient.setAuthToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
      apiClient.setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePersist = (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    apiClient.setAuthToken(t);
    try {
      localStorage.setItem('algolens_user', JSON.stringify(u));
      localStorage.setItem('algolens_token', t);
    } catch {}
  };

  const login = async (email: string, password: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await apiClient.login(email, password);
      if (res.user && res.token) {
        handlePersist(res.user, res.token);
        setAuthSuccess(`Welcome back, ${res.user.fullName || res.user.username}!`);
        setTimeout(() => setIsAuthModalOpen(false), 500);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    username?: string,
    fullName?: string,
    skillLevel: SkillLevel = 'Beginner'
  ) => {
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const res = await apiClient.register(email, password, username, fullName, skillLevel);
      if (res.user && res.token) {
        handlePersist(res.user, res.token);
        setAuthSuccess(`Account created! Welcome, ${res.user.fullName || res.user.username}!`);
        setTimeout(() => setIsAuthModalOpen(false), 500);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginDemoRole = async (role: 'beginner' | 'intermediate' | 'advanced') => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await apiClient.loginDemo(role);
      if (res.user && res.token) {
        handlePersist(res.user, res.token);
        setAuthSuccess(`Logged into ${res.user.fullName} (${res.user.skillLevel}) account!`);
        setTimeout(() => setIsAuthModalOpen(false), 500);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate sample account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserSkillLevel = async (skillLevel: SkillLevel) => {
    if (!user) return;
    try {
      await apiClient.updateSkillLevel(skillLevel);
      const updated = { ...user, skillLevel };
      handlePersist(updated, token || user.id);
    } catch (err) {
      console.error('Failed to update skill level:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.setAuthToken(null);
    try {
      localStorage.removeItem('algolens_user');
      localStorage.removeItem('algolens_token');
    } catch {}
  };

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Email and password are required.');
      return;
    }
    if (isRegisterMode) {
      await register(emailInput, passwordInput, usernameInput, fullNameInput, skillLevelInput).catch(() => {});
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
        isCustomGraphsOpen,
        setIsCustomGraphsOpen,
        login,
        register,
        loginDemoRole,
        updateUserSkillLevel,
        logout,
        requireAuth,
      }}
    >
      {children}

      {/* Primary Authentication Gate Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close authentication modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge & Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {isRegisterMode ? 'Create Student Account' : 'Student Account Sign In'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 font-semibold uppercase">
                    Primary Gate
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  An account is required for custom mastery graphs & adaptive quiz level calibration.
                </p>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  !isRegisterMode
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  isRegisterMode
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register Account
              </button>
            </div>

            {/* Feedback Alerts */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Authentication Error:</span> {authError}
                </div>
              </div>
            )}
            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder="e.g. Maya Lin"
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
                        placeholder="e.g. maya_cs"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Custom Skill Level Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Custom Starting Skill Level *</span>
                      <span className="text-[10px] text-brand-400 font-mono">Calibrates AI Questions</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSkillLevelInput(lvl)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition ${
                            skillLevelInput === lvl
                              ? lvl === 'Beginner'
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                                : lvl === 'Intermediate'
                                ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-semibold shadow-sm'
                                : 'bg-purple-950/80 border-purple-500 text-purple-300 font-semibold shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {skillLevelInput === 'Beginner' && '🟢 Beginner: Foundational concepts, step-by-step traces, core time complexity.'}
                      {skillLevelInput === 'Intermediate' && '🟡 Intermediate: Pointer mechanics, loop invariants, tree rotations, LPS failure.'}
                      {skillLevelInput === 'Advanced' && '🟣 Advanced: Amortized bounds, adversarial worst-cases, cache locality, hard proofs.'}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
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
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Password *</span>
                  <span className="text-[10px] text-slate-500">Min 6 characters</span>
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
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Verifying Account...</span>
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Create Account & Start Learning' : 'Log In to Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Multi-User Simultaneous Demo Testing Accounts */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  Simultaneous Multi-User Test Accounts
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Isolated Data</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2.5">
                Log into predefined student accounts to test isolated custom graphs and varying question levels simultaneously in different browser windows:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loginDemoRole('beginner')}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-slate-950 border border-emerald-900/50 hover:border-emerald-500 text-left transition group"
                >
                  <div className="text-[11px] font-semibold text-emerald-300 group-hover:text-emerald-200">
                    Priya (Beg.)
                  </div>
                  <div className="text-[9px] text-slate-500">priya@algolens.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => loginDemoRole('intermediate')}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-slate-950 border border-amber-900/50 hover:border-amber-500 text-left transition group"
                >
                  <div className="text-[11px] font-semibold text-amber-300 group-hover:text-amber-200">
                    Alex (Inter.)
                  </div>
                  <div className="text-[9px] text-slate-500">alex@algolens.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => loginDemoRole('advanced')}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-slate-950 border border-purple-900/50 hover:border-purple-500 text-left transition group"
                >
                  <div className="text-[11px] font-semibold text-purple-300 group-hover:text-purple-200">
                    Marcus (Adv.)
                  </div>
                  <div className="text-[9px] text-slate-500">marcus@algolens.edu</div>
                </button>
              </div>
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
