'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '@/types';
import { apiClient } from '@/lib/api/client';
import {
  Bot,
  Sparkles,
  Send,
  X,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

interface AITutorDrawerProps {
  algorithm: string;
  currentStep: ExecutionStep;
  previousStep?: ExecutionStep;
  nextStep?: ExecutionStep;
  code?: string;
  pseudocode?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  algorithm,
  currentStep,
  previousStep,
  nextStep,
  code,
  pseudocode,
  isOpen: isOpenProp,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalOpen;

  const handleOpen = () => {
    if (isOpenProp === undefined) setInternalOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    if (isOpenProp === undefined) setInternalOpen(false);
    onOpenChange?.(false);
  };

  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationSource, setExplanationSource] = useState<string | null>(null);

  const quickPrompts = [
    'Explain This Step',
    'Why did this happen?',
    'Explain Simpler',
    'What Happens Next?',
    'Why did pointer move here?',
  ];

  const handleAskQuestion = async (queryText: string) => {
    setIsLoading(true);
    setExplanation(null);

    try {
      const res = await apiClient.explainStep({
        algorithm,
        currentStep,
        previousStep,
        nextStep,
        code,
        pseudocode,
        question: queryText,
      });

      setExplanation(res.explanation);
      setExplanationSource(res.source);
    } catch (err: any) {
      setExplanation(
        `Unable to reach AlgoLens AI Tutor: ${err.message || 'Please verify your backend connection.'}`
      );
      setExplanationSource('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim() && !isLoading) {
      handleAskQuestion(customQuestion.trim());
      setCustomQuestion('');
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open AI Tutor Chatbot"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-accent-indigo to-brand-600 hover:from-accent-indigo/90 hover:to-brand-500 text-white rounded-full shadow-glow font-medium text-sm transition transform hover:scale-105 min-h-[44px]"
      >
        <Bot className="w-5 h-5 text-accent-cyan" />
        <span>Ask AI Tutor</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-screen max-w-md bg-dark-card border-l border-dark-border shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-slate-900/90">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        AlgoLens AI Tutor
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300 font-mono">
                          Groq LLaMA 3.3
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Context-grounded explanation for Step #{currentStep?.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close AI Tutor Chatbot"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="p-4 border-b border-dark-border/60 bg-slate-950/40">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskQuestion(prompt)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content & Explanation */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {/* Current step context summary card */}
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-0.5">
                      Grounding Context
                    </span>
                    <strong className="text-white block">{currentStep.title}</strong>
                    <span className="text-slate-400 mt-1 block">{currentStep.description}</span>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
                      <span className="text-xs font-mono">Analyzing step execution trace...</span>
                    </div>
                  ) : explanation ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Explanation Ready
                        </span>
                        <span className="font-mono text-slate-500">
                          Source: {explanationSource || 'groq'}
                        </span>
                      </div>

                      <div className="prose prose-invert prose-xs text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                        {explanation}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                      <Lightbulb className="w-8 h-8 text-amber-500/50 mb-2" />
                      <p className="text-xs max-w-xs">
                        Click any prompt above or enter a question to ask the AI Tutor about this exact step.
                      </p>
                    </div>
                  )}
                </div>

                {/* Input Footer */}
                <form
                  onSubmit={handleSubmit}
                  className="p-4 border-t border-dark-border bg-slate-900/90 flex gap-2"
                >
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Ask about this step..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !customQuestion.trim()}
                    className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition disabled:opacity-40"
                    title="Send question"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
