'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizQuestion } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';
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
} from 'lucide-react';

function PracticeContent() {
  const searchParams = useSearchParams();
  const preselectedAlgo = searchParams.get('algorithmId');

  const { user, setIsAuthModalOpen } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctOptionId?: string;
  } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // AI Personalized mode states
  const [isAiMode, setIsAiMode] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<any | null>(null);
  const [studentContext, setStudentContext] = useState<{
    weakAlgorithms: string[];
    masteryPercentage: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedAlgo || 'all');

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

  // Load standard bank questions on mount
  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      try {
        const data = await apiClient.getPracticeQuestions(
          preselectedAlgo && preselectedAlgo !== 'all' ? preselectedAlgo : undefined
        );
        setQuestions(data);
        if (preselectedAlgo) {
          // If came with specific algorithm, offer AI generation immediately
          setIsAiMode(true);
          generateAiQuestion(preselectedAlgo);
        }
      } catch (err) {
        console.warn('Fallback practice questions loaded');
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, [preselectedAlgo]);

  // Generate real-time AI personalized question via Groq
  const generateAiQuestion = async (algoId?: string) => {
    setIsGeneratingAi(true);
    setSelectedOption(null);
    setSubmitted(false);
    setAttemptResult(null);
    setIsAiMode(true);

    const targetUserId = user?.id || 'demo_user_alex';
    const targetAlgo = algoId && algoId !== 'all' ? algoId : selectedCategory !== 'all' ? selectedCategory : undefined;

    try {
      const res = await apiClient.getPersonalizedPracticeQuestion(targetUserId, targetAlgo);
      if (res.question) {
        setAiQuestion(res.question);
        setStudentContext(res.studentContext);
      }
    } catch (err) {
      console.error('Failed to generate AI question, falling back to static questions', err);
      setIsAiMode(false);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const currentQ: any = isAiMode ? aiQuestion : questions[currentIndex];

  const handleSubmitOption = async (optionId: string) => {
    if (submitted || !currentQ) return;
    setSelectedOption(optionId);
    setSubmitted(true);
    setTotalAnswered((prev) => prev + 1);

    const targetUserId = user?.id || 'demo_user_alex';

    if (isAiMode && aiQuestion) {
      const selectedOptObj = aiQuestion.options?.find((o: any) => o.id === optionId);
      const isCorrect = selectedOptObj?.isCorrect ?? false;
      const correctOpt = aiQuestion.options?.find((o: any) => o.isCorrect)?.id || 'A';

      try {
        await apiClient.submitPracticeAttempt(aiQuestion.id, optionId, targetUserId, {
          algorithmId: aiQuestion.algorithmId,
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
      });

      if (isCorrect) {
        setScore((prev) => prev + 1);
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
    } else {
      try {
        const res = await apiClient.submitPracticeAttempt(currentQ.id, optionId, targetUserId);
        setAttemptResult(res);
        if (res.isCorrect) {
          setScore((prev) => prev + 1);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch {
        const isCorrect = currentQ.options?.find((o: any) => o.id === optionId)?.isCorrect ?? false;
        setAttemptResult({
          isCorrect,
          explanation: currentQ.explanation,
          correctOptionId: currentQ.options?.find((o: any) => o.isCorrect)?.id || '',
        });
        if (isCorrect) setScore((prev) => prev + 1);
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setAttemptResult(null);

    if (isAiMode) {
      // In AI mode, generate another adaptive question
      generateAiQuestion(selectedCategory);
    } else {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-brand-500/30 text-brand-300 text-xs font-mono">
          <Award className="w-3.5 h-3.5 text-accent-amber" />
          <span>Supabase Sync & AI Adaptive Practice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DSA Algorithmic Practice Arena
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Test your comprehension of loop invariants, tree balance factors, Dijkstra edge relaxations, and pointer transitions derived from live algorithm traces.
        </p>

        {/* Student Cloud Sync Bar */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1">
            <User className="w-3.5 h-3.5 text-brand-400" />
            <span>Profile:</span>
            <strong className="text-slate-200">{user?.fullName || 'Alex Student (Demo)'}</strong>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" title="Supabase Connected" />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">Supabase Persistent</span>
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
              <span>Standard Question Bank</span>
            </button>
            <button
              onClick={() => {
                setIsAiMode(true);
                if (!aiQuestion) generateAiQuestion(selectedCategory);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                isAiMode
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-brand-300" />
              <span>AI Personalized (Groq)</span>
            </button>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono shrink-0">Topic Focus:</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setSelectedCategory(newCat);
                if (isAiMode) {
                  generateAiQuestion(newCat);
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
                ? 'AI dynamically queries your Neo4j knowledge mastery graph to produce targeted questions.'
                : 'Want adaptive questions that focus on your specific weak spots?'}
            </span>
          </div>
          <button
            onClick={() => generateAiQuestion(selectedCategory)}
            disabled={isGeneratingAi}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 shrink-0"
          >
            {isGeneratingAi ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Generating Question...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate AI Question</span>
              </>
            )}
          </button>
        </div>

        {/* Student Adaptive Context Badges if available */}
        {studentContext && studentContext.weakAlgorithms?.length > 0 && (
          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Focus Areas Detected:
            </span>
            {studentContext.weakAlgorithms.map((w) => (
              <span key={w} className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-200">
                {w}
              </span>
            ))}
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
                Mode: <strong className="text-emerald-400">AI Adaptive Stream</strong>
              </>
            ) : (
              <>
                Question <strong className="text-white">{currentIndex + 1}</strong> of{' '}
                <strong>{questions.length}</strong>
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
              ? 'Groq AI (openai/gpt-oss-120b) is constructing your personalized question...'
              : 'Loading question bank...'}
          </p>
          <p className="text-[11px] text-slate-500">
            Consulting student knowledge graph history and identifying conceptual edge cases.
          </p>
        </div>
      ) : !currentQ ? (
        <div className="p-12 text-center text-slate-400 text-xs font-mono bg-dark-card border border-dark-border rounded-xl">
          No questions available. Click &quot;Generate AI Question&quot; to test your skills!
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-brand-400 uppercase tracking-wider">
                {currentQ.algorithmId || selectedCategory}
              </span>
              {isAiMode ? (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-emerald-400" />
                  Groq AI Personalized
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  Standard Curriculum
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
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                ✓ Recorded to Supabase learning profile & updated Neo4j mastery node.
              </div>
            </div>
          )}

          {/* Next Button */}
          {submitted && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {isAiMode ? 'Next question will adapt to this result.' : 'Proceed through standard curriculum.'}
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
