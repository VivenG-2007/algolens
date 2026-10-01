'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlgorithmId, ExecutionStep, ExecutionResult } from '@/types';
import { STATIC_ALGORITHMS } from '@/lib/data/algorithms';
import { apiClient } from '@/lib/api/client';
import { DynamicInputPanel } from '@/components/visualizer/DynamicInputPanel';
import { ArrayVisualizer } from '@/components/visualizer/ArrayVisualizer';
import { CountingSortVisualizer } from '@/components/visualizer/CountingSortVisualizer';
import { KMPVisualizer } from '@/components/visualizer/KMPVisualizer';
import { AVLVisualizer } from '@/components/visualizer/AVLVisualizer';
import { GraphVisualizer } from '@/components/visualizer/GraphVisualizer';
import { HeapVisualizer } from '@/components/visualizer/HeapVisualizer';
import { TrieVisualizer } from '@/components/visualizer/TrieVisualizer';
import { RadixSortVisualizer } from '@/components/visualizer/RadixSortVisualizer';
import { BucketSortVisualizer } from '@/components/visualizer/BucketSortVisualizer';
import { InterpolationSearchVisualizer } from '@/components/visualizer/InterpolationSearchVisualizer';
import { ShellSortVisualizer } from '@/components/visualizer/ShellSortVisualizer';
import { TreeSortVisualizer } from '@/components/visualizer/TreeSortVisualizer';
import { QuickSortVisualizer } from '@/components/visualizer/QuickSortVisualizer';
import { PlaybackControls } from '@/components/visualizer/PlaybackControls';
import { CodeViewer } from '@/components/visualizer/CodeViewer';
import { VariablesPanel } from '@/components/visualizer/VariablesPanel';
import { AITutorDrawer } from '@/components/visualizer/AITutorDrawer';
import {
  Sparkles,
  Bookmark,
  Share2,
  Check,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Database,
  Activity,
  Layers,
} from 'lucide-react';

const ALGO_ALIASES: Record<string, AlgorithmId> = {
  'avl-tree': 'avl',
  'heap': 'min-heap',
  'binary-heap': 'min-heap',
  'trie-tree': 'trie',
};

export default function VisualizerPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = (params.algorithm as string) || 'merge-sort';
  const resolvedParam = ALGO_ALIASES[rawParam] || rawParam;
  const algorithm = (
    STATIC_ALGORITHMS[resolvedParam as AlgorithmId] ? resolvedParam : 'merge-sort'
  ) as AlgorithmId;

  const meta = STATIC_ALGORITHMS[algorithm];

  // Execution trace state
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Prediction challenge state for "Predict the Next Step"
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<boolean | null>(null);

  // Playback & Chatbot interaction synchronization (pause when chatbot opens, resume when closed)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [wasPlayingBeforeChatbot, setWasPlayingBeforeChatbot] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  const handleChatbotOpenChange = (open: boolean) => {
    setIsChatbotOpen(open);
    if (open) {
      // Pause visualization immediately at current step
      if (isPlaying) {
        setWasPlayingBeforeChatbot(true);
        setIsPlaying(false);
      } else {
        setWasPlayingBeforeChatbot(false);
      }
    } else {
      // Once closed, continue playback if it was previously playing
      if (wasPlayingBeforeChatbot) {
        setIsPlaying(true);
        setWasPlayingBeforeChatbot(false);
      }
    }
  };

  // Reset prediction state when step changes
  useEffect(() => {
    setSelectedPrediction(null);
    setPredictionFeedback(null);
  }, [currentStepIndex]);

  // Initial execution trigger on mount with default placeholder input
  useEffect(() => {
    let defaultPayload: any = { input: [64, 25, 12, 22, 11] };
    if (algorithm === 'counting-sort') defaultPayload = { input: [4, 2, 2, 8, 3, 3, 1] };
    if (algorithm === 'linear-search') defaultPayload = { input: [12, 5, 30, 18, 7], target: 18 };
    if (algorithm === 'binary-search') defaultPayload = { input: [10, 20, 30, 40, 50, 60], target: 40 };
    if (algorithm === 'fibonacci-search') defaultPayload = { input: [10, 20, 30, 40, 50, 60], target: 40 };
    if (algorithm === 'kmp') defaultPayload = { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' };
    if (algorithm === 'avl') defaultPayload = { values: [30, 10, 20] };
    if (algorithm === 'bfs' || algorithm === 'dfs') defaultPayload = { startNode: 'A' };
    if (algorithm === 'dijkstra') defaultPayload = { startNode: 'A', targetNode: 'F' };
    if (algorithm === 'min-heap' || algorithm === 'max-heap') defaultPayload = { input: [45, 20, 14, 12, 31, 7, 11], operations: [{ type: 'extract' }] };
    if (algorithm === 'trie') defaultPayload = { words: ['cat', 'car', 'cart', 'dog'], queries: [{ type: 'search', word: 'car' }, { type: 'delete', word: 'cat' }] };
    if (algorithm === 'radix-sort') defaultPayload = { input: [170, 45, 75, 90, 802, 24, 2, 66] };
    if (algorithm === 'bucket-sort') defaultPayload = { input: [0.42, 0.32, 0.73, 0.25, 0.52, 0.38, 0.91] };
    if (algorithm === 'interpolation-search') defaultPayload = { input: [10, 20, 30, 40, 50, 60, 70, 80, 90], target: 70 };
    if (algorithm === 'shell-sort') defaultPayload = { input: [12, 34, 54, 2, 3] };
    if (algorithm === 'tree-sort') defaultPayload = { input: [50, 30, 70, 20, 40, 60, 80] };
    if (algorithm === 'quick-sort') defaultPayload = { input: [8, 3, 1, 7, 0, 10, 2] };

    handleGenerateTrace(defaultPayload);
  }, [algorithm]);

  const handleGenerateTrace = async (payload: any, isRetry = false) => {
    setIsLoading(true);
    setStatusMessage('Connecting to AlgoLens execution engine...');
    setErrorMessage(null);

    try {
      setStatusMessage('Executing algorithm and generating trace...');
      const result = await apiClient.executeAlgorithm(algorithm, payload);

      if (result.success && result.steps && result.steps.length > 0) {
        setSteps(result.steps);
        setCurrentStepIndex(0);
        setStatusMessage('');
      } else {
        throw new Error('Algorithm returned an empty execution trace.');
      }
    } catch (err: any) {
      if (!isRetry) {
        // Automatic single retry in case of brief server restart or initial handshake
        setTimeout(() => handleGenerateTrace(payload, true), 1000);
        return;
      }
      console.warn('[Trace Fetch Error]:', err.message);
      setErrorMessage(
        err.message || 'Unable to generate visualization. Please verify your inputs.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = steps[currentStepIndex] || {
    id: 1,
    title: 'Awaiting User Input',
    description: 'Configure your parameters above and click "Generate Visualization".',
    algorithmLine: 1,
    codeLine: 1,
    variables: {},
    arrayState: [],
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await apiClient.toggleBookmark(algorithm);
      setIsBookmarked(res.bookmarked);
    } catch {
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300">
              {meta.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Avg Time: <strong className="text-amber-400">{meta.timeComplexity.average}</strong>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Space: <strong className="text-cyan-400">{meta.spaceComplexity}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {meta.name}
            {steps.length > 0 && (
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({steps.length} dynamic steps)
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">{meta.description}</p>
        </div>

        {/* Algorithm Quick Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={algorithm}
            onChange={(e) => router.push(`/visualizer/${e.target.value}`)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-brand-500 focus:outline-none"
          >
            {Object.values(STATIC_ALGORITHMS).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-lg border text-xs transition flex items-center gap-1.5 ${
              isBookmarked
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Bookmark Algorithm"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition flex items-center gap-1.5"
            title="Share URL"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </motion.div>

      {/* Dynamic Input System Component */}
      <DynamicInputPanel
        algorithm={algorithm}
        onGenerate={handleGenerateTrace}
        isLoading={isLoading}
        statusMessage={statusMessage}
      />

      {/* Error Alert Box if any */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong>Execution Error:</strong> {errorMessage}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                let defaultPayload: any = { input: [64, 25, 12, 22, 11] };
                if (algorithm === 'avl') defaultPayload = { values: [30, 10, 20] };
                if (algorithm === 'min-heap' || algorithm === 'max-heap') defaultPayload = { input: [45, 20, 14, 12, 31, 7, 11], operations: [{ type: 'extract' }] };
                if (algorithm === 'trie') defaultPayload = { words: ['cat', 'car', 'cart', 'dog'], queries: [{ type: 'search', word: 'car' }] };
                handleGenerateTrace(defaultPayload, true);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-medium border border-rose-600/40 transition shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Visualizer Stage */}
      <div className="space-y-4">
        <motion.div
          key={algorithm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {algorithm === 'counting-sort' ? (
            <CountingSortVisualizer step={currentStep} />
          ) : algorithm === 'radix-sort' ? (
            <RadixSortVisualizer step={currentStep} />
          ) : algorithm === 'bucket-sort' ? (
            <BucketSortVisualizer step={currentStep} />
          ) : algorithm === 'interpolation-search' ? (
            <InterpolationSearchVisualizer step={currentStep} />
          ) : algorithm === 'shell-sort' ? (
            <ShellSortVisualizer step={currentStep} />
          ) : algorithm === 'tree-sort' ? (
            <TreeSortVisualizer step={currentStep} />
          ) : algorithm === 'quick-sort' ? (
            <QuickSortVisualizer step={currentStep} />
          ) : algorithm === 'kmp' ? (
            <KMPVisualizer step={currentStep} />
          ) : algorithm === 'avl' ? (
            <AVLVisualizer step={currentStep} />
          ) : algorithm === 'bfs' || algorithm === 'dfs' || algorithm === 'dijkstra' ? (
            <GraphVisualizer step={currentStep} />
          ) : algorithm === 'min-heap' || algorithm === 'max-heap' ? (
            <HeapVisualizer step={currentStep} />
          ) : algorithm === 'trie' ? (
            <TrieVisualizer step={currentStep} />
          ) : (
            <ArrayVisualizer step={currentStep} />
          )}
        </motion.div>

        {/* Predict the Next Step Interactive Challenge */}
        <AnimatePresence>
          {currentStep.predictionChallenge && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="p-4 bg-gradient-to-r from-brand-950/70 via-slate-900 to-indigo-950/60 border border-brand-500/50 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
                <span>Predict the Next Step Challenge</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-900/60 text-brand-200 border border-brand-700/50">
                Interactive Check
              </span>
            </div>
            <p className="text-sm font-medium text-white mb-3">
              {currentStep.predictionChallenge.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {currentStep.predictionChallenge.options.map((option, idx) => {
                const isSelected = selectedPrediction === idx;
                const isCorrect = idx === currentStep.predictionChallenge?.correctIndex;
                let btnStyle =
                  'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-brand-500 hover:text-white';
                if (selectedPrediction !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950 border-rose-500 text-rose-200';
                  } else if (isCorrect) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (selectedPrediction === null) {
                        setSelectedPrediction(idx);
                        setPredictionFeedback(isCorrect);
                      }
                    }}
                    disabled={selectedPrediction !== null}
                    className={`p-2.5 rounded-lg border text-xs font-mono text-left transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {selectedPrediction !== null && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            {predictionFeedback !== null && (
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed ${
                  predictionFeedback
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-200 border border-rose-500/40'
                }`}
              >
                <strong className="block mb-1 font-semibold">
                  {predictionFeedback ? '🎯 Excellent deduction!' : '❌ Not quite!'}
                </strong>
                {currentStep.predictionChallenge.explanation}
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Complexity & Actual Execution Telemetry (Item 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs font-mono">
          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
              Comparisons
            </span>
            <span className="text-amber-400 font-bold text-base">
              {currentStep.operationStats?.comparisons ??
                (typeof currentStep.variables?.comparisons === 'number'
                  ? currentStep.variables.comparisons
                  : 0)}
            </span>
            <span className="text-[10px] text-slate-500 block">Actual runtime checks</span>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
              {algorithm === 'avl'
                ? 'Rotations'
                : algorithm === 'dijkstra'
                ? 'Edge Relaxations'
                : 'Swaps / Updates'}
            </span>
            <span className="text-emerald-400 font-bold text-base">
              {currentStep.operationStats?.rotations ??
                currentStep.operationStats?.swaps ??
                (typeof currentStep.variables?.swaps === 'number'
                  ? currentStep.variables.swaps
                  : 0)}
            </span>
            <span className="text-[10px] text-slate-500 block">Structural mutations</span>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
              {algorithm === 'bfs' || algorithm === 'dfs' || algorithm === 'dijkstra'
                ? 'Nodes Visited'
                : 'Tree Depth / Height'}
            </span>
            <span className="text-cyan-400 font-bold text-base">
              {currentStep.operationStats?.nodesVisited ??
                currentStep.operationStats?.treeHeight ??
                currentStep.variables?.height ??
                currentStep.variables?.queueSize ??
                '—'}
            </span>
            <span className="text-[10px] text-slate-500 block">Active traversal depth</span>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
              Theoretical Bound
            </span>
            <span className="text-brand-300 font-bold text-base">
              {meta.timeComplexity.average}
            </span>
            <span className="text-[10px] text-slate-500 block">Big-O asymptotically</span>
          </div>
        </div>

        {/* Playback Scrubber & Control Bar */}
        <PlaybackControls
          currentStep={currentStepIndex}
          totalSteps={steps.length}
          onStepChange={setCurrentStepIndex}
          isLoading={isLoading}
          isPlaying={isPlaying}
          onIsPlayingChange={setIsPlaying}
        />
      </div>

      {/* Code, Variables, and Pseudocode Synchronized Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Code & Pseudocode View (2 columns) */}
        <div className="lg:col-span-2">
          <CodeViewer
            step={currentStep}
            pseudocode={meta.pseudocode}
            sourceCode={meta.sourceCode}
          />
        </div>

        {/* Step Explanation & Live Variables Watch (1 column) */}
        <div>
          <VariablesPanel step={currentStep} />
        </div>
      </div>

      {/* Contextual AI Tutor Slide-over Drawer */}
      <AITutorDrawer
        algorithm={algorithm}
        currentStep={currentStep}
        previousStep={currentStepIndex > 0 ? steps[currentStepIndex - 1] : undefined}
        nextStep={
          currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : undefined
        }
        code={meta.sourceCode.typescript}
        pseudocode={meta.pseudocode.join('\n')}
        isOpen={isChatbotOpen}
        onOpenChange={handleChatbotOpenChange}
      />
    </div>
  );
}
