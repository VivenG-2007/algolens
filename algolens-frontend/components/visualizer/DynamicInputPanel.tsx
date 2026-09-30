'use client';

import React, { useState } from 'react';
import { AlgorithmId } from '@/types';
import { Play, Sparkles, Trash2, ArrowUpDown, Plus, AlertCircle, RefreshCw } from 'lucide-react';

interface DynamicInputPanelProps {
  algorithm: AlgorithmId;
  onGenerate: (payload: any) => void;
  isLoading: boolean;
  statusMessage?: string;
}

export const DynamicInputPanel: React.FC<DynamicInputPanelProps> = ({
  algorithm,
  onGenerate,
  isLoading,
  statusMessage,
}) => {
  // Array & Search states
  const [arrayChips, setArrayChips] = useState<number[]>([64, 25, 12, 22, 11]);
  const [newChipVal, setNewChipVal] = useState<string>('');
  const [rawTextArray, setRawTextArray] = useState<string>('64, 25, 12, 22, 11');
  const [targetVal, setTargetVal] = useState<number>(22);

  // KMP
  const [kmpText, setKmpText] = useState<string>('ABABDABACDABABCABAB');
  const [kmpPattern, setKmpPattern] = useState<string>('ABABCABAB');

  // AVL Tree (Insertions + Deletions)
  const [avlChips, setAvlChips] = useState<number[]>([30, 10, 20]);
  const [avlDeleteChips, setAvlDeleteChips] = useState<number[]>([10]);
  const [newAvlVal, setNewAvlVal] = useState<string>('');
  const [newAvlDelVal, setNewAvlDelVal] = useState<string>('');

  // Graph (BFS / DFS / Dijkstra)
  const [graphStartNode, setGraphStartNode] = useState<string>('A');
  const [graphTargetNode, setGraphTargetNode] = useState<string>('F');

  // Heap (Min/Max Heap)
  const [heapChips, setHeapChips] = useState<number[]>([45, 20, 14, 12, 31, 7, 11]);
  const [newHeapVal, setNewHeapVal] = useState<string>('');
  const [triggerExtract, setTriggerExtract] = useState<boolean>(true);

  // Trie (Prefix Tree)
  const [trieWords, setTrieWords] = useState<string>('cat, car, cart, dog');
  const [trieSearchWord, setTrieSearchWord] = useState<string>('car');
  const [trieDeleteWord, setTrieDeleteWord] = useState<string>('cat');

  // Validation
  const [validationError, setValidationError] = useState<string | null>(null);

  const parseRawArray = (text: string): number[] => {
    return text
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s !== '' && !isNaN(Number(s)))
      .map(Number);
  };

  const handleRawTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawTextArray(val);
    const parsed = parseRawArray(val);
    setArrayChips(parsed);
    setValidationError(null);
  };

  const handleAddChip = () => {
    const num = Number(newChipVal.trim());
    if (newChipVal.trim() !== '' && !isNaN(num)) {
      const updated = [...arrayChips, num];
      setArrayChips(updated);
      setRawTextArray(updated.join(', '));
      setNewChipVal('');
      setValidationError(null);
    }
  };

  const handleRemoveChip = (index: number) => {
    const updated = arrayChips.filter((_, idx) => idx !== index);
    setArrayChips(updated);
    setRawTextArray(updated.join(', '));
  };

  const handleGenerateRandomArray = () => {
    const size = 8;
    const randoms = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setArrayChips(randoms);
    setRawTextArray(randoms.join(', '));
    if (algorithm === 'binary-search' || algorithm === 'fibonacci-search') {
      const sorted = [...randoms].sort((a, b) => a - b);
      setArrayChips(sorted);
      setRawTextArray(sorted.join(', '));
      setTargetVal(sorted[Math.floor(sorted.length / 2)]);
    }
    setValidationError(null);
  };

  const handleSortAutomatically = () => {
    const sorted = [...arrayChips].sort((a, b) => a - b);
    setArrayChips(sorted);
    setRawTextArray(sorted.join(', '));
    setValidationError(null);
  };

  const isSearchAlgo =
    algorithm === 'linear-search' ||
    algorithm === 'binary-search' ||
    algorithm === 'fibonacci-search';

  const isGraphAlgo =
    algorithm === 'bfs' || algorithm === 'dfs' || algorithm === 'dijkstra';

  const isHeapAlgo = algorithm === 'min-heap' || algorithm === 'max-heap';

  const isArraySorted = () => {
    for (let i = 1; i < arrayChips.length; i++) {
      if (arrayChips[i] < arrayChips[i - 1]) return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (algorithm === 'kmp') {
      if (!kmpText.trim() || !kmpPattern.trim()) {
        setValidationError('Both Text and Pattern cannot be empty.');
        return;
      }
      onGenerate({ text: kmpText.trim(), pattern: kmpPattern.trim() });
      return;
    }

    if (algorithm === 'avl') {
      if (avlChips.length === 0) {
        setValidationError('Please specify at least one value to insert.');
        return;
      }
      onGenerate({ values: avlChips, deleteValues: avlDeleteChips });
      return;
    }

    if (isGraphAlgo) {
      onGenerate({
        startNode: graphStartNode,
        targetNode: graphTargetNode,
      });
      return;
    }

    if (isHeapAlgo) {
      if (heapChips.length === 0) {
        setValidationError('Heap requires at least one initial value.');
        return;
      }
      const operations: any[] = [];
      if (triggerExtract) {
        operations.push({ type: 'extract' });
      }
      onGenerate({ input: heapChips, operations });
      return;
    }

    if (algorithm === 'trie') {
      const words = trieWords
        .split(/[\s,]+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);
      if (words.length === 0) {
        setValidationError('Please enter at least one word for the Trie.');
        return;
      }
      const queries: any[] = [];
      if (trieSearchWord.trim()) {
        queries.push({ type: 'search', word: trieSearchWord.trim().toLowerCase() });
      }
      if (trieDeleteWord.trim()) {
        queries.push({ type: 'delete', word: trieDeleteWord.trim().toLowerCase() });
      }
      onGenerate({ words, queries });
      return;
    }

    if (arrayChips.length === 0) {
      setValidationError('Array must have at least one element.');
      return;
    }

    if (
      (algorithm === 'binary-search' || algorithm === 'fibonacci-search') &&
      !isArraySorted()
    ) {
      setValidationError(
        'This algorithm requires a sorted array. Click "Sort Automatically" or enter sorted values.'
      );
      return;
    }

    if (isSearchAlgo) {
      if (targetVal === undefined || isNaN(targetVal)) {
        setValidationError('Please specify a valid numeric search target.');
        return;
      }
      onGenerate({ input: arrayChips, target: Number(targetVal) });
      return;
    }

    // Default Sorting
    onGenerate({ input: arrayChips });
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-dark-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-400">
            Dynamic Execution Parameters
          </h3>
          <p className="text-xs text-slate-400">
            Real algorithm execution on user-defined data structures — no pre-baked traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isGraphAlgo && algorithm !== 'kmp' && algorithm !== 'trie' && (
            <button
              type="button"
              onClick={handleGenerateRandomArray}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
              Generate Random
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setArrayChips([]);
              setRawTextArray('');
              setAvlChips([]);
              setAvlDeleteChips([]);
              setValidationError(null);
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            title="Clear inputs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* GRAPH INPUTS (BFS, DFS, Dijkstra) */}
        {isGraphAlgo && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Start Node
                </label>
                <select
                  value={graphStartNode}
                  onChange={(e) => setGraphStartNode(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                >
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((node) => (
                    <option key={node} value={node}>
                      Node {node}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Destination Node (Optional / Dijkstra End)
                </label>
                <select
                  value={graphTargetNode}
                  onChange={(e) => setGraphTargetNode(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                >
                  {['F', 'E', 'D', 'C', 'B', 'A'].map((node) => (
                    <option key={node} value={node}>
                      Node {node}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Graph Topology: 6-node weighted interconnected mesh (A, B, C, D, E, F) with positive weights.
            </div>
          </div>
        )}

        {/* HEAP INPUTS */}
        {isHeapAlgo && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Heap Elements:
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                {heapChips.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-brand-950 border border-brand-500/40 text-brand-300 px-2 py-0.5 rounded text-xs font-mono"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => setHeapChips(heapChips.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                value={newHeapVal}
                onChange={(e) => setNewHeapVal(e.target.value)}
                placeholder="+ Add Value"
                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (newHeapVal.trim()) {
                    setHeapChips([...heapChips, Number(newHeapVal.trim())]);
                    setNewHeapVal('');
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
              >
                + Add to Heap
              </button>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={triggerExtract}
                  onChange={(e) => setTriggerExtract(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-0"
                />
                <span>Demonstrate <strong>Extract Root & Sift-Down</strong></span>
              </label>
            </div>
          </div>
        )}

        {/* TRIE INPUTS */}
        {algorithm === 'trie' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Insert Words (Comma-separated)
              </label>
              <input
                type="text"
                value={trieWords}
                onChange={(e) => setTrieWords(e.target.value)}
                placeholder="e.g. cat, car, cart, dog, door"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Word to Search
                </label>
                <input
                  type="text"
                  value={trieSearchWord}
                  onChange={(e) => setTrieSearchWord(e.target.value)}
                  placeholder="e.g. car"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Word to Delete (Tests recursive branch pruning)
                </label>
                <input
                  type="text"
                  value={trieDeleteWord}
                  onChange={(e) => setTrieDeleteWord(e.target.value)}
                  placeholder="e.g. cat"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* AVL Tree Inputs with Insert & Delete */}
        {algorithm === 'avl' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400 block mb-1">1. Insertion Sequence:</span>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                {avlChips.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-brand-950/60 border border-brand-500/40 text-brand-300 px-2.5 py-1 rounded-md text-xs font-mono"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => setAvlChips(avlChips.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={newAvlVal}
                onChange={(e) => setNewAvlVal(e.target.value)}
                placeholder="+ Insert Val"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono w-28 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const num = Number(newAvlVal.trim());
                  if (newAvlVal.trim() && !isNaN(num) && !avlChips.includes(num)) {
                    setAvlChips([...avlChips, num]);
                    setNewAvlVal('');
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Insert
              </button>

              <div className="flex items-center gap-2 ml-auto text-xs">
                <span className="text-slate-400">Rotation Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAvlChips([30, 10, 20]);
                    setAvlDeleteChips([]);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-brand-900/40 text-slate-300 rounded border border-slate-700"
                >
                  LR (30,10,20)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvlChips([10, 20, 30]);
                    setAvlDeleteChips([]);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-brand-900/40 text-slate-300 rounded border border-slate-700"
                >
                  RR (10,20,30)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvlChips([30, 20, 10]);
                    setAvlDeleteChips([]);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-brand-900/40 text-slate-300 rounded border border-slate-700"
                >
                  LL (30,20,10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvlChips([10, 30, 20]);
                    setAvlDeleteChips([]);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-brand-900/40 text-slate-300 rounded border border-slate-700"
                >
                  RL (10,30,20)
                </button>
              </div>
            </div>

            {/* Deletion Sequence */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs text-rose-400 block mb-1">2. Deletion Sequence (Tests Rebalancing on Node Removal):</span>
              <div className="flex flex-wrap items-center gap-2">
                {avlDeleteChips.map((delVal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-rose-950/70 border border-rose-500/40 text-rose-200 px-2.5 py-1 rounded-md text-xs font-mono"
                  >
                    <span>Delete {delVal}</span>
                    <button
                      type="button"
                      onClick={() => setAvlDeleteChips(avlDeleteChips.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-white ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="number"
                  value={newAvlDelVal}
                  onChange={(e) => setNewAvlDelVal(e.target.value)}
                  placeholder="Val to Delete"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono w-28"
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = Number(newAvlDelVal.trim());
                    if (newAvlDelVal.trim() && !isNaN(num) && !avlDeleteChips.includes(num)) {
                      setAvlDeleteChips([...avlDeleteChips, num]);
                      setNewAvlDelVal('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-700/60 rounded-lg"
                >
                  + Add Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KMP Inputs */}
        {algorithm === 'kmp' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Main Text (Haystack)
              </label>
              <input
                type="text"
                value={kmpText}
                onChange={(e) => setKmpText(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. ABABDABACDABABCABAB"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pattern to Match (Needle)
              </label>
              <input
                type="text"
                value={kmpPattern}
                onChange={(e) => setKmpPattern(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. ABABCABAB"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Standard Array Inputs for Sorting and Searching */}
        {!isGraphAlgo && !isHeapAlgo && algorithm !== 'kmp' && algorithm !== 'avl' && algorithm !== 'trie' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] p-2 bg-slate-900/70 border border-slate-800 rounded-lg">
              <span className="text-xs text-slate-400 mr-2 font-mono">Parsed:</span>
              {arrayChips.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No elements in array</span>
              ) : (
                arrayChips.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 bg-brand-950/80 border border-brand-500/40 text-brand-300 rounded-md text-xs font-mono group"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(idx)}
                      className="text-slate-400 hover:text-rose-400 transition"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={isSearchAlgo ? 'md:col-span-2' : 'md:col-span-3'}>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter Array (comma or space separated)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rawTextArray}
                    onChange={handleRawTextChange}
                    disabled={isLoading}
                    placeholder="e.g. 64 25 12 22 11"
                    className="flex-1 bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={newChipVal}
                      onChange={(e) => setNewChipVal(e.target.value)}
                      placeholder="+val"
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddChip}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                      title="Add to end"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {isSearchAlgo && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Search Target Value
                  </label>
                  <input
                    type="number"
                    value={targetVal}
                    onChange={(e) => setTargetVal(Number(e.target.value))}
                    disabled={isLoading}
                    placeholder="Target number"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sorted check warning for Binary / Fibonacci search */}
        {(algorithm === 'binary-search' || algorithm === 'fibonacci-search') &&
          !isArraySorted() && (
            <div className="flex items-center justify-between p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Requirement:</strong> {algorithm === 'binary-search' ? 'Binary' : 'Fibonacci'} Search requires a strictly sorted array.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSortAutomatically}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded font-medium transition"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort Automatically
              </button>
            </div>
          )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Execution Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            {isLoading ? (
              <span className="flex items-center gap-2 text-brand-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {statusMessage || 'Executing algorithm engine on Render backend...'}
              </span>
            ) : (
              <span>Ready to generate real execution trace</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-accent-indigo hover:from-brand-500 hover:to-accent-indigo/90 text-white font-medium text-sm rounded-lg shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            {isLoading ? 'Generating Trace...' : 'Generate Visualization'}
          </button>
        </div>
      </form>
    </div>
  );
};
