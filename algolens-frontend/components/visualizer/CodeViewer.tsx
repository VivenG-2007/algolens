'use client';

import React, { useState } from 'react';
import { ExecutionStep } from '@/types';
import { Code2, FileText, Check, Copy, Flame } from 'lucide-react';

interface CodeViewerProps {
  step: ExecutionStep;
  pseudocode: string[];
  sourceCode: {
    c?: string;
    cpp: string;
    typescript: string;
    python: string;
  };
}

type TabType = 'c' | 'cpp' | 'pseudocode' | 'python' | 'typescript';

export const CodeViewer: React.FC<CodeViewerProps> = ({
  step,
  pseudocode,
  sourceCode,
}) => {
  // Default to C as requested by PBL curriculum
  const [activeTab, setActiveTab] = useState<TabType>('c');
  const [copied, setCopied] = useState(false);

  const activeLine = activeTab === 'pseudocode' ? step.algorithmLine : step.codeLine || 1;

  const getCodeForTab = (tab: TabType): string => {
    if (tab === 'pseudocode') return pseudocode.join('\n');
    if (tab === 'c') return sourceCode.c || sourceCode.cpp || '';
    if (tab === 'cpp') return sourceCode.cpp || '';
    if (tab === 'python') return sourceCode.python || '';
    if (tab === 'typescript') return sourceCode.typescript || '';
    return '';
  };

  const currentCodeLines =
    activeTab === 'pseudocode'
      ? pseudocode
      : getCodeForTab(activeTab).split('\n');

  const handleCopy = () => {
    const textToCopy = getCodeForTab(activeTab);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-dark-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* C - Primary language */}
          <button
            type="button"
            onClick={() => setActiveTab('c')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'c'
                ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>C (Primary)</span>
          </button>

          {/* C++ */}
          <button
            type="button"
            onClick={() => setActiveTab('cpp')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'cpp'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            C++
          </button>

          {/* Pseudocode */}
          <button
            type="button"
            onClick={() => setActiveTab('pseudocode')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'pseudocode'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Pseudocode
          </button>

          {/* Python */}
          <button
            type="button"
            onClick={() => setActiveTab('python')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'python'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Python
          </button>

          {/* TypeScript */}
          <button
            type="button"
            onClick={() => setActiveTab('typescript')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'typescript'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            TypeScript
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded transition shrink-0 ml-2"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Area with Active Line Highlight */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto max-h-[360px] bg-slate-950/80">
        <div className="space-y-1">
          {currentCodeLines.map((line, idx) => {
            const lineNum = idx + 1;
            const isCurrentLine = lineNum === activeLine;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 px-2 py-0.5 rounded font-mono transition-colors duration-150 ${
                  isCurrentLine
                    ? 'bg-brand-950/80 border-l-2 border-brand-500 text-brand-200 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className={`select-none text-[11px] w-6 text-right shrink-0 ${
                    isCurrentLine ? 'text-brand-400 font-bold' : 'text-slate-600'
                  }`}
                >
                  {lineNum}
                </span>
                <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">
                  <code>{line || ' '}</code>
                </pre>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synchronized status footer */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-dark-border text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span>
          Synchronized to Line <strong className="text-brand-400">{activeLine}</strong>
        </span>
        <span className="text-slate-500">
          Language: <strong className="text-slate-300 uppercase">{activeTab}</strong>
        </span>
      </div>
    </div>
  );
};
