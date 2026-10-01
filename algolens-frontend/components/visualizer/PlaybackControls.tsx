'use client';

import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
} from 'lucide-react';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number | ((prev: number) => number)) => void;
  isLoading?: boolean;
  isPlaying?: boolean;
  onIsPlayingChange?: (playing: boolean) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  isLoading = false,
  isPlaying: isPlayingProp,
  onIsPlayingChange,
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const isPlaying = isPlayingProp !== undefined ? isPlayingProp : internalPlaying;

  const setIsPlaying = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isPlaying) : val;
    if (isPlayingProp === undefined) {
      setInternalPlaying(nextVal);
    }
    onIsPlayingChange?.(nextVal);
  };

  const [speed, setSpeed] = useState<number>(1800); // ms per step (Slower, highly explanatory)

  // Auto-play interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && totalSteps > 0) {
      interval = setInterval(() => {
        onStepChange((prev: number) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalSteps, speed, onStepChange]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    if (totalSteps > 0) onStepChange(totalSteps - 1);
  };

  const isAtStart = currentStep === 0;
  const isAtEnd = totalSteps === 0 || currentStep >= totalSteps - 1;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Scrubber slider & Progress Text */}
      <div className="w-full md:w-1/2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Step <strong className="text-brand-400">{totalSteps > 0 ? currentStep + 1 : 0}</strong> of{' '}
            <strong className="text-slate-200">{totalSteps}</strong>
          </span>
          <span className="text-slate-500">
            {totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0}% Complete
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            onStepChange(Number(e.target.value));
          }}
          disabled={isLoading || totalSteps <= 1}
          aria-label="Algorithm playback progress scrubber"
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 disabled:opacity-50"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading || isAtStart}
          aria-label="Reset to beginning"
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Reset to beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handlePrev}
          disabled={isLoading || isAtStart}
          aria-label="Previous step"
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Previous step"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isLoading || isAtEnd}
          aria-label={isPlaying ? 'Pause playback' : 'Play algorithm step-by-step'}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition shadow-glow flex items-center gap-1.5 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading || isAtEnd}
          aria-label="Next step"
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Next step"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleJumpToEnd}
          disabled={isLoading || isAtEnd}
          aria-label="Jump to final sorted step"
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Jump to end"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="playback-speed-select" className="text-xs text-slate-400 font-mono">Speed:</label>
        <select
          id="playback-speed-select"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={isLoading}
          aria-label="Playback speed selector"
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:border-brand-500 focus:outline-none min-h-[44px]"
        >
          <option value={3000}>0.3x (Super Slow & Explanatory)</option>
          <option value={1800}>0.5x (Slow - Recommended)</option>
          <option value={1200}>0.75x (Moderate)</option>
          <option value={800}>1.0x (Normal)</option>
          <option value={400}>1.5x (Fast)</option>
          <option value={200}>2.0x (Speedy)</option>
        </select>
      </div>
    </div>
  );
};
