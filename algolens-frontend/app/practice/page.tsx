'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  RefreshCw,
  Trophy,
  Sliders,
  Flame,
  Check,
  Compass,
  ArrowLeft,
} from 'lucide-react';

function PracticeContent() {
  const searchParams = useSearchParams();
  const preselectedAlgo = searchParams.get('algorithmId');

  const { user, setIsAuthModalOpen, updateUserSkillLevel } = useAuth();

  // Mode: 'dynamic-quiz' (10 new AI questions) vs 'single-practice'
  const [practiceMode, setPracticeMode] = useState<'dynamic-quiz' | 'curriculum'>('dynamic-quiz');

  // Dynamic 10-Question Quiz States
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, {
    selectedOption: string;
    isCorrect: boolean;
    explanation: string;
    correctOptionId: string;
  }>>({});
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [quizTopic, setQuizTopic] = useState<string>(preselectedAlgo || 'all');
  const [quizLevel, setQuizLevel] = useState<SkillLevel | 'Adaptive'>(user?.skillLevel || 'Adaptive');

  // Curriculum practice states
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Custom user skill level state
  const [activeLevel, setActiveLevel] = useState<SkillLevel>(user?.skillLevel || 'Intermediate');

  // Available algorithm topics for targeted practice
  const algorithmCategories = [
    { id: 'all', label: 'All Topics (Comprehensive DSA)' },
    { id: 'sorting', label: 'All Sorting Techniques' },
    { id: 'searching', label: 'All Searching Techniques' },
    { id: 'merge-sort', label: 'Merge Sort' },
    { id: 'quick-sort', label: 'Quick Sort' },
    { id: 'counting-sort', label: 'Counting Sort' },
    { id: 'binary-search', label: 'Binary Search' },
    { id: 'interpolation-search', label: 'Interpolation Search' },
    { id: 'fibonacci-search', label: 'Fibonacci Search' },
    { id: 'kmp', label: 'KMP String Matching' },
    { id: 'avl', label: 'AVL Trees & Rotations' },
    { id: 'min-heap', label: 'Binary Min/Max Heaps' },
    { id: 'dijkstra', label: "Dijkstra's & Graph Traversal" },
  ];

  // Sync activeLevel when user profile changes
  useEffect(() => {
    if (user?.skillLevel) {
      setActiveLevel(user.skillLevel);
    }
  }, [user?.skillLevel]);

  // Generate 10 brand-new dynamic questions powered by AI
  const startDynamicAiQuiz = async (topicToUse?: string, levelToUse?: string) => {
    setIsQuizLoading(true);
    setIsQuizCompleted(false);
    setQuizAnswers({});
    setQuizIndex(0);

    const targetTopic = topicToUse || quizTopic;
    const targetLevel = levelToUse || quizLevel;

    try {
      const res = await apiClient.generateDynamicAiQuiz({
        topic: targetTopic,
        level: targetLevel,
        count: 10,
        userId: user?.id,
      });

      if (res.questions && res.questions.length > 0) {
        setQuizQuestions(res.questions);
        setPracticeMode('dynamic-quiz');
      }
    } catch (err) {
      console.warn('Fallback dynamic quiz loaded', err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Initial load: start dynamic 10-question AI quiz on first visit
  useEffect(() => {
    startDynamicAiQuiz(preselectedAlgo || 'all', 'Adaptive');
  }, []);

  // Load standard curriculum questions when switching to curriculum mode
  useEffect(() => {
    if (practiceMode === 'curriculum') {
      const loadQuestions = async () => {
        setIsLoading(true);
        try {
          const data = await apiClient.getPracticeQuestions(
            quizTopic !== 'all' ? quizTopic : undefined,
            activeLevel
          );
          setQuestions(data);
          setCurrentIndex(0);
          setSelectedOption(null);
          setSubmitted(false);
          setAttemptResult(null);
        } catch (err) {
          console.warn('Fallback practice questions loaded');
        } finally {
          setIsLoading(false);
        }
      };
      loadQuestions();
    }
  }, [practiceMode, quizTopic, activeLevel]);

  // Handle Dynamic Quiz Option Submission
  const handleQuizOptionSelect = async (optionId: string) => {
    if (quizAnswers[quizIndex]) return; // Already answered this question

    const q = quizQuestions[quizIndex];
    if (!q) return;

    const selectedOptObj = q.options?.find((o: any) => o.id === optionId);
    const isCorrect = selectedOptObj?.isCorrect ?? false;
    const correctOpt = q.options?.find((o: any) => o.isCorrect)?.id || 'a';

    const answerRecord = {
      selectedOption: optionId,
      isCorrect,
      explanation: q.explanation || 'Verified DSA algorithm invariant.',
      correctOptionId: correctOpt,
    };

    const newAnswers = { ...quizAnswers, [quizIndex]: answerRecord };
    setQuizAnswers(newAnswers);
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setConsecutiveCorrect((prev) => prev + 1);
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.65 },
      });
    } else {
      setConsecutiveCorrect(0);
    }

    // Record attempt to Supabase if logged in
    if (user) {
      try {
        await apiClient.submitPracticeAttempt(q.id, optionId, user.id, {
          algorithmId: q.algorithmId,
          questionLevel: (q as any).difficulty || activeLevel,
          isCorrectOverride: isCorrect,
          explanationOverride: q.explanation,
        });
      } catch (e) {
        console.warn('Quiz attempt recorded locally');
      }
    }

    // Check if all 10 questions are answered
    if (Object.keys(newAnswers).length === quizQuestions.length && quizQuestions.length > 0) {
      setIsQuizCompleted(true);
      const totalCorrect = Object.values(newAnswers).filter((a) => a.isCorrect).length;
      if (totalCorrect >= 7) {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
      }
    }
  };

  // Dynamic Quiz Navigation
  const handleNextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else if (Object.keys(quizAnswers).length === quizQuestions.length) {
      setIsQuizCompleted(true);
    }
  };

  const handlePrevQuizQuestion = () => {
    if (quizIndex > 0) {
      setQuizIndex(quizIndex - 1);
    }
  };

  // Curriculum Question Handlers
  const handleCurriculumSubmit = async (optionId: string) => {
    const currentQ = questions[currentIndex];
    if (submitted || !currentQ) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setSelectedOption(optionId);
    setSubmitted(true);
    setTotalAnswered((prev) => prev + 1);

    try {
      const res = await apiClient.submitPracticeAttempt(currentQ.id, optionId, user.id, {
        algorithmId: currentQ.algorithmId,
        questionLevel: (currentQ as any).level || activeLevel,
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
    } catch (e) {
      console.warn('Recorded locally');
    }
  };

  const handleCurriculumNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setAttemptResult(null);
    }
  };

  const currentQuizQ = quizQuestions[quizIndex];
  const currentQuizAnswer = quizAnswers[quizIndex];
  const currentCurriculumQ = questions[currentIndex];

  // Quiz completion calculation
  const quizAnsweredCount = Object.keys(quizAnswers).length;
  const quizCorrectCount = Object.values(quizAnswers).filter((a) => a.isCorrect).length;
  const quizScorePercentage = quizQuestions.length > 0 ? Math.round((quizCorrectCount / quizQuestions.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950/70 to-slate-900 border border-dark-border rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-2 sm:space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-brand-400" />
              Dynamic AI Evaluation Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              10 Dynamic Questions / Quiz
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Algorithmic Practice & AI Arena
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Evaluate your DSA mastery with dynamically generated questions powered by AI. Each quiz generates 10 fresh, targeted problems testing invariants, complexities, edge cases, and architectural trade-offs.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => startDynamicAiQuiz(quizTopic, quizLevel)}
              disabled={isQuizLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-xs sm:text-sm font-semibold shadow-glow transition min-h-[42px]"
            >
              {isQuizLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>AI is Generating 10 Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  <span>Generate 10 New Questions (AI)</span>
                </>
              )}
            </button>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setPracticeMode('dynamic-quiz')}
                className={`px-3 py-1.5 rounded-lg font-medium transition min-h-[34px] ${
                  practiceMode === 'dynamic-quiz'
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                10-Question AI Quiz
              </button>
              <button
                type="button"
                onClick={() => setPracticeMode('curriculum')}
                className={`px-3 py-1.5 rounded-lg font-medium transition min-h-[34px] ${
                  practiceMode === 'curriculum'
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Curriculum Bank
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Controls & Filters Bar */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Topic Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Quiz Topic Focus
            </label>
            <select
              value={quizTopic}
              onChange={(e) => {
                setQuizTopic(e.target.value);
                if (practiceMode === 'dynamic-quiz') {
                  startDynamicAiQuiz(e.target.value, quizLevel);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium focus:border-brand-500 focus:outline-none min-h-[38px]"
            >
              {algorithmCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Level Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Target Difficulty
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Adaptive', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setQuizLevel(lvl);
                    if (practiceMode === 'dynamic-quiz') {
                      startDynamicAiQuiz(quizTopic, lvl);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition min-h-[38px] ${
                    quizLevel === lvl
                      ? 'bg-slate-800 text-white border border-brand-500 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Session Stats */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Session Progress
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Score</span>
                <span className="text-xs font-bold text-emerald-400">{score} Points</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Active Streak</span>
                <span className="text-xs font-bold text-amber-400">{consecutiveCorrect} Correct</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: DYNAMIC 10-QUESTION AI QUIZ */}
      {/* ======================================================== */}
      {practiceMode === 'dynamic-quiz' && (
        <div className="space-y-6">
          {/* Quiz Stepper & Progress Tracker */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-brand-400" />
                Dynamic AI Quiz:{' '}
                <strong className="text-white">
                  Question {quizQuestions.length > 0 ? quizIndex + 1 : 0} of {quizQuestions.length}
                </strong>
              </span>

              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Answered: <strong className="text-white">{quizAnsweredCount}</strong> / {quizQuestions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-950 border border-brand-500/40 text-brand-300 font-bold">
                  {quizCorrectCount} Correct
                </span>
              </div>
            </div>

            {/* Visual 10-Step Pills */}
            <div className="grid grid-cols-10 gap-1 sm:gap-2">
              {quizQuestions.map((_, idx) => {
                const answer = quizAnswers[idx];
                const isCurrent = idx === quizIndex;
                let bgStyle = 'bg-slate-900 border-slate-800 text-slate-500';

                if (answer) {
                  bgStyle = answer.isCorrect
                    ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300 font-bold'
                    : 'bg-rose-950 border-rose-500/60 text-rose-300 font-bold';
                } else if (isCurrent) {
                  bgStyle = 'bg-brand-900 border-brand-400 text-white font-bold ring-2 ring-brand-500/50';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuizIndex(idx)}
                    className={`h-8 sm:h-9 rounded-lg border text-xs font-mono flex items-center justify-center transition ${bgStyle}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {isQuizLoading ? (
            <div className="p-16 text-center space-y-4 bg-dark-card border border-dark-border rounded-xl">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-slate-300">
                AI Engine is crafting 10 dynamic, calibrated questions for [{quizTopic}]...
              </p>
              <p className="text-[11px] text-slate-500">
                Calibrating difficulty, invariants, randomized options, and pedagogical explanations.
              </p>
            </div>
          ) : isQuizCompleted ? (
            /* ======================================================== */
            /* QUIZ COMPLETED REPORT CARD */
            /* ======================================================== */
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-indigo flex items-center justify-center shadow-glow">
                <Trophy className="w-8 h-8 text-amber-300" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Quiz Completed!
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  You scored <strong className="text-emerald-400 text-base">{quizCorrectCount}</strong> out of{' '}
                  <strong className="text-white text-base">{quizQuestions.length}</strong> ({quizScorePercentage}%) on this AI-generated session.
                </p>
              </div>

              {/* Assessment Grade */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  AI Pedagogical Diagnosis
                </span>
                <span className="text-lg font-bold text-white block">
                  {quizScorePercentage >= 80
                    ? '🌟 Advanced Conceptual Mastery'
                    : quizScorePercentage >= 60
                    ? '🎯 Solid Foundation, Ready for Edge Cases'
                    : '📚 Foundational Review Recommended'}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {quizScorePercentage >= 80
                    ? 'You demonstrated strong grasp of invariants, asymptotic trade-offs, and worst-case bounds across topics.'
                    : quizScorePercentage >= 60
                    ? 'Good overall intuition. Focus on tree balance factors, pivot worst-cases, and non-comparison distribution rules.'
                    : 'Spend time stepping through execution traces in the Visualizer to build visual intuition before attempting again.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startDynamicAiQuiz(quizTopic, quizLevel)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo text-white text-sm font-semibold shadow-glow transition min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  <span>Generate 10 New Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuizCompleted(false);
                    setQuizIndex(0);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-sm font-medium transition min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Review Answers & Explanations</span>
                </button>

                <Link
                  href="/comparison"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-sm font-medium transition min-h-[44px]"
                >
                  <Compass className="w-4 h-4 text-brand-400" />
                  <span>Compare Techniques Matrix</span>
                </Link>
              </div>
            </div>
          ) : !currentQuizQ ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono bg-dark-card border border-dark-border rounded-xl">
              No questions found. Click &quot;Generate 10 New Questions&quot; to test your skills!
            </div>
          ) : (
            /* ======================================================== */
            /* ACTIVE QUIZ QUESTION CARD */
            /* ======================================================== */
            <div className="bg-dark-card border border-dark-border rounded-xl p-5 sm:p-8 shadow-xl space-y-6">
              {/* Question Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-brand-400 uppercase tracking-wider">
                      {currentQuizQ.algorithmId || quizTopic}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-semibold border ${
                        ((currentQuizQ as any).difficulty || quizLevel) === 'Beginner'
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                          : ((currentQuizQ as any).difficulty || quizLevel) === 'Intermediate'
                          ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                          : 'bg-purple-950 border-purple-500/40 text-purple-300'
                      }`}
                    >
                      {(currentQuizQ as any).difficulty || quizLevel}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-400" />
                    AI Generated Problem #{quizIndex + 1}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {currentQuizQ.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {currentQuizQ.question}
                </p>
              </div>

              {/* 4 Interactive Options */}
              <div className="space-y-3">
                {currentQuizQ.options?.map((opt: any) => {
                  const isSelected = currentQuizAnswer?.selectedOption === opt.id;
                  const isCorrectAnswer = currentQuizAnswer && (opt.isCorrect || currentQuizAnswer.correctOptionId === opt.id);
                  const isWrongSelected = isSelected && !currentQuizAnswer.isCorrect;

                  let optionStyle =
                    'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-brand-500 hover:bg-slate-800/90';

                  if (currentQuizAnswer) {
                    if (isCorrectAnswer) {
                      optionStyle =
                        'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                    } else if (isWrongSelected) {
                      optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    } else {
                      optionStyle = 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleQuizOptionSelect(opt.id)}
                      disabled={Boolean(currentQuizAnswer)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between min-h-[48px] ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs uppercase text-slate-300 shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      {currentQuizAnswer && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {currentQuizAnswer && isWrongSelected && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* In-depth AI Pedagogical Explanation */}
              {currentQuizAnswer && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-2 ${
                    currentQuizAnswer.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {currentQuizAnswer.isCorrect ? 'Correct Deduction!' : 'Pedagogical Explanation & Concept:'}
                    </span>
                  </div>
                  <p>{currentQuizAnswer.explanation}</p>
                  {(currentQuizQ as any).pedagogicalReason && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                      💡 Reason: {(currentQuizQ as any).pedagogicalReason}
                    </p>
                  )}
                </div>
              )}

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePrevQuizQuestion}
                  disabled={quizIndex === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition disabled:opacity-40 min-h-[38px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {quizAnsweredCount === quizQuestions.length ? (
                    <button
                      type="button"
                      onClick={() => setIsQuizCompleted(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-glow transition min-h-[40px]"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>View Final Performance Score</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      disabled={quizIndex >= quizQuestions.length - 1}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-xs sm:text-sm shadow-glow transition disabled:opacity-40 min-h-[40px]"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: STANDARD CURRICULUM QUESTIONS */}
      {/* ======================================================== */}
      {practiceMode === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono bg-dark-card border border-dark-border rounded-xl p-3 px-4">
            <span className="text-slate-400">
              Curriculum Bank: Question <strong className="text-white">{currentIndex + 1}</strong> of{' '}
              {questions.length}
            </span>
            <span className="text-brand-300 font-bold">Standard Practice Mode</span>
          </div>

          {isLoading ? (
            <div className="p-16 text-center space-y-4 bg-dark-card border border-dark-border rounded-xl">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-slate-300">Loading curriculum question bank...</p>
            </div>
          ) : !currentCurriculumQ ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono bg-dark-card border border-dark-border rounded-xl">
              No curriculum questions found for this topic. Switch back to 10-Question AI Quiz!
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-brand-400 uppercase tracking-wider">
                    {currentCurriculumQ.algorithmId}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    Curriculum Level: {(currentCurriculumQ as any).level || activeLevel}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white leading-snug">
                  {currentCurriculumQ.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {currentCurriculumQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentCurriculumQ.options?.map((opt: any) => {
                  const isSelected = selectedOption === opt.id;
                  const isCorrectAnswer = attemptResult?.correctOptionId === opt.id;
                  const isWrongSelected = isSelected && !attemptResult?.isCorrect;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleCurriculumSubmit(opt.id)}
                      disabled={submitted}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between min-h-[48px] ${
                        isCorrectAnswer && submitted
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
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
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {submitted && isWrongSelected && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
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
                      {attemptResult.isCorrect ? 'Correct!' : 'Explanation:'}
                    </span>
                  </div>
                  <p>{attemptResult.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {submitted && (
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCurriculumNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-xs sm:text-sm shadow-glow transition min-h-[40px]"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
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
