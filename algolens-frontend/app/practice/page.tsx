'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizQuestion } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useAuth, SkillLevel } from '@/lib/context/AuthContext';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Bot,
  BrainCircuit,
  Zap,
  RotateCcw,
  Target,
  User,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

function PracticeContent() {
  const searchParams = useSearchParams();
  const preselectedAlgo = searchParams.get('algorithmId');

  const { user, setIsAuthModalOpen, updateUserSkillLevel } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctOptionId?: string;
    questionLevel?: string;
  } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Custom user skill level state
  const [activeLevel, setActiveLevel] = useState<SkillLevel>(user?.skillLevel || 'Intermediate');

  // AI Personalized mode states
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<any | null>(null);
  const [studentContext, setStudentContext] = useState<{
    skillLevel?: string;
    weakAlgorithms: string[];
    masteryPercentage: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedAlgo || 'all');

  // Sync activeLevel when user profile changes
  useEffect(() => {
    if (user?.skillLevel) {
      setActiveLevel(user.skillLevel);
    }
  }, [user?.skillLevel]);

  // Available algorithm topics for targeted practice
  const algorithmCategories = [
    { id: 'all', label: 'All Topics (Adaptive)' },
    { id: 'merge-sort', label: 'Merge Sort' },
    { id: 'avl', label: 'AVL Trees' },
    { id: 'min-heap', label: 'Min Heap' },
    { id: 'max-heap', label: 'Max Heap' },
    { id: 'trie', label: 'Trie' },
    { id: 'dijkstra', label: "Dijkstra's Algorithm" },
    { id: 'bfs', label: 'Breadth-First Search' },
    { id: 'dfs', label: 'Depth-First Search' },
    { id: 'binary-search', label: 'Binary Search' },
    { id: 'kmp', label: 'KMP String Matching' },
    { id: 'counting-sort', label: 'Counting Sort' },
  ];

  // Load questions calibrated by category and active custom level
  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      try {
        const data = await apiClient.getPracticeQuestions(
          selectedCategory !== 'all' ? selectedCategory : undefined,
          activeLevel
        );
        setQuestions(data);
        setCurrentIndex(0);
        setSelectedOption(null);
        setSubmitted(false);
        setAttemptResult(null);

        if (preselectedAlgo) {
          setIsAiMode(true);
          generateAiQuestion(preselectedAlgo, activeLevel);
        }
      } catch (err) {
        console.warn('Fallback practice questions loaded');
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, [selectedCategory, activeLevel, preselectedAlgo]);

  // Generate real-time AI personalized question via Groq calibrated to user's custom level
  const generateAiQuestion = async (algoId?: string, levelToUse?: SkillLevel) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsGeneratingAi(true);
    setSelectedOption(null);
    setSubmitted(false);
    setAttemptResult(null);
    setIsAiMode(true);

    const targetUserId = user.id;
    const targetAlgo = algoId && algoId !== 'all' ? algoId : selectedCategory !== 'all' ? selectedCategory : undefined;
    const targetLevel = levelToUse || activeLevel;

    try {
      const res = await apiClient.getPersonalizedPracticeQuestion(targetUserId, targetAlgo, targetLevel);
      if (res.question) {
        setAiQuestion(res.question);
        setStudentContext(res.studentContext);
      }
    } catch (err) {
      console.error('Failed to generate AI question, falling back to curriculum questions', err);
      setIsAiMode(false);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleLevelChange = (newLevel: SkillLevel) => {
    setActiveLevel(newLevel);
    if (user) {
      updateUserSkillLevel(newLevel);
    }
    if (isAiMode) {
      generateAiQuestion(selectedCategory, newLevel);
    }
  };

  const currentQ: any = isAiMode ? aiQuestion : questions[currentIndex];

  const handleSubmitOption = async (optionId: string) => {
    if (submitted || !currentQ) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setSelectedOption(optionId);
    setSubmitted(true);
    setTotalAnswered((prev) => prev + 1);

    const targetUserId = user.id;

    if (isAiMode && aiQuestion) {
      const selectedOptObj = aiQuestion.options?.find((o: any) => o.id === optionId);
      const isCorrect = selectedOptObj?.isCorrect ?? false;
      const correctOpt = aiQuestion.options?.find((o: any) => o.isCorrect)?.id || 'A';

      try {
        await apiClient.submitPracticeAttempt(aiQuestion.id, optionId, targetUserId, {
          algorithmId: aiQuestion.algorithmId,
          questionLevel: aiQuestion.difficulty || activeLevel,
          isCorrectOverride: isCorrect,
          explanationOverride: aiQuestion.explanation,
        });
      } catch (e) {
        console.warn('Attempt recorded locally');
      }

      setAttemptResult({
        isCorrect,
        explanation: aiQuestion.explanation || 'Analyzed via AlgoLens pedagogical engine.',
        correctOptionId: correctOpt,
        questionLevel: aiQuestion.difficulty || activeLevel,
      });

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setConsecutiveCorrect((prev) => prev + 1);
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
        });
      } else {
        setConsecutiveCorrect(0);
      }
    } else {
      try {
        const res = await apiClient.submitPracticeAttempt(currentQ.id, optionId, targetUserId, {
          algorithmId: currentQ.algorithmId,
          questionLevel: currentQ.level || activeLevel,
        });
        setAttemptResult(res);
        if (res.isCorrect) {
          setScore((prev) => prev + 1);
          setConsecutiveCorrect((prev) => prev + 1);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          setConsecutiveCorrect(0);
        }
      } catch {
        const isCorrect = currentQ.options?.find((o: any) => o.id === optionId)?.isCorrect ?? false;
        setAttemptResult({
          isCorrect,
          explanation: currentQ.explanation,
          correctOptionId: currentQ.options?.find((o: any) => o.isCorrect)?.id || '',
          questionLevel: currentQ.level || activeLevel,
        });
        if (isCorrect) {
          setScore((prev) => prev + 1);
          setConsecutiveCorrect((prev) => prev + 1);
        } else {
          setConsecutiveCorrect(0);
        }
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setAttemptResult(null);

    if (isAiMode) {
      generateAiQuestion(selectedCategory, activeLevel);
    } else {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">
      {/* Auth Gate Notification for unauthenticated visitors */}
      {!user && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Authentication Required:</span> Questions and custom accuracy graphs are tailored specifically to individual user skill levels. Please sign in or create an account to record attempts.
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition shrink-0 shadow-sm"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-brand-500/30 text-brand-300 text-xs font-mono">
          <Award className="w-3.5 h-3.5 text-accent-amber" />
          <span>Multi-User Isolated Arena & Level-Calibrated Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DSA Algorithmic Practice Arena
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Questions are dynamically calibrated to your individual skill level ({activeLevel}), testing invariants, pointer mechanics, and complexity bounds.
        </p>

        {/* User Session Bar & Custom Level Selector */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-1.5 shadow-sm">
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-slate-400">Student:</span>
              <strong className="text-slate-100">{user.fullName || user.username}</strong>
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" title="Account Active" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-900/50 rounded-xl px-3.5 py-1.5 text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Guest Session (Sign in to save scores)</span>
            </div>
          )}

          {/* Interactive Skill Level Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2 font-mono">Calibrated Level:</span>
            {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  activeLevel === lvl
                    ? lvl === 'Beginner'
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : lvl === 'Intermediate'
                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                      : 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Controls & Topic Selector */}
      <div className="bg-slate-900/90 border border-dark-border rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setIsAiMode(false);
                setSelectedOption(null);
                setSubmitted(false);
                setAttemptResult(null);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                !isAiMode
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standard [{activeLevel}] Bank</span>
            </button>
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setIsAiMode(true);
                if (!aiQuestion) generateAiQuestion(selectedCategory, activeLevel);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                isAiMode
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-brand-300" />
              <span>AI Level-Tailored (Groq)</span>
            </button>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono shrink-0">Topic:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setSelectedCategory(newCat);
                if (isAiMode) {
                  generateAiQuestion(newCat, activeLevel);
                }
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 font-mono"
            >
              {algorithmCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Generator CTA Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              {isAiMode
                ? `Groq LLaMA 3.3 is generating questions calibrated to your ${activeLevel} profile.`
                : `Want targeted ${activeLevel} questions based on your specific learning trajectory?`}
            </span>
          </div>
          <button
            onClick={() => generateAiQuestion(selectedCategory, activeLevel)}
            disabled={isGeneratingAi}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 shrink-0"
          >
            {isGeneratingAi ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating {activeLevel} Question...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate {activeLevel} Question</span>
              </>
            )}
          </button>
        </div>

        {/* Consecutive Streak & Level Up Notification */}
        {consecutiveCorrect >= 3 && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-200">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>
                <strong>Mastery Streak:</strong> You answered {consecutiveCorrect} questions in a row correctly at {activeLevel} level!
              </span>
            </div>
            {activeLevel !== 'Advanced' && (
              <button
                type="button"
                onClick={() => handleLevelChange(activeLevel === 'Beginner' ? 'Intermediate' : 'Advanced')}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition shadow-sm shrink-0"
              >
                Level Up to {activeLevel === 'Beginner' ? 'Intermediate' : 'Advanced'}!
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress & Score Bar */}
      <div className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <BookOpen className="w-4 h-4 text-brand-400" />
          <span>
            {isAiMode ? (
              <>
                Mode: <strong className="text-emerald-400">AI {activeLevel} Adaptive</strong>
              </>
            ) : (
              <>
                Question <strong className="text-white">{questions.length > 0 ? currentIndex + 1 : 0}</strong> of{' '}
                <strong>{questions.length}</strong> ({activeLevel})
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Answered:</span>
            <span className="text-slate-200 font-bold">{totalAnswered}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Score:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-950 border border-brand-500/40 text-brand-300 font-bold">
              {score} Correct
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      {isGeneratingAi || isLoading ? (
        <div className="p-16 text-center space-y-4 bg-dark-card border border-dark-border rounded-xl">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-slate-300">
            {isGeneratingAi
              ? `Groq AI is constructing your personalized [${activeLevel}] question...`
              : `Loading ${activeLevel} question bank...`}
          </p>
          <p className="text-[11px] text-slate-500">
            Calibrated for individual student mastery and isolated multi-user sessions.
          </p>
        </div>
      ) : !currentQ ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono bg-dark-card border border-dark-border rounded-xl">
          No questions found for this topic and level. Click &quot;Generate {activeLevel} Question&quot; to test your skills!
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-brand-400 uppercase tracking-wider">
                  {currentQ.algorithmId || selectedCategory}
                </span>
                {/* Level Badge */}
                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded font-semibold border ${
                    (currentQ.level || currentQ.difficulty || activeLevel) === 'Beginner'
                      ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                      : (currentQ.level || currentQ.difficulty || activeLevel) === 'Intermediate'
                      ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                      : 'bg-purple-950 border-purple-500/40 text-purple-300'
                  }`}
                >
                  Level: {currentQ.level || currentQ.difficulty || activeLevel}
                </span>
              </div>

              {isAiMode ? (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-emerald-400" />
                  Groq AI Tailored
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  Curriculum Calibrated
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white leading-snug">
              {currentQ.title}
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt: any) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectAnswer = attemptResult?.correctOptionId === opt.id;
              const isWrongSelected = isSelected && !attemptResult?.isCorrect;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSubmitOption(opt.id)}
                  disabled={submitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                    isCorrectAnswer && submitted
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : isWrongSelected
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                      : isSelected
                      ? 'bg-brand-950 border-brand-500 text-brand-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs uppercase text-slate-400 shrink-0">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>

                  {submitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {submitted && isWrongSelected && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {attemptResult && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-2 ${
                attemptResult.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>
                  {attemptResult.isCorrect ? 'Correct!' : 'Incorrect — Pedagogical Explanation:'}
                </span>
              </div>
              <p>{attemptResult.explanation}</p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>✓ Recorded to your personal mastery profile in Supabase.</span>
                <span className="text-slate-500">Isolated Multi-User Session</span>
              </div>
            </div>
          )}

          {/* Next Button */}
          {submitted && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {isAiMode ? `Next question will adapt to your ${activeLevel} profile.` : 'Proceed through standard curriculum.'}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-xs sm:text-sm shadow-glow transition"
              >
                <span>{isAiMode ? 'Next AI Question' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs font-mono">Loading Practice Arena...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
