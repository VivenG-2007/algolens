'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Search,
  ExternalLink,
  Flame,
  Gauge,
  Sliders,
  Shield,
  Activity,
  ArrowLeftRight,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface TechniqueComparison {
  id: string;
  name: string;
  type: 'sorting' | 'searching' | 'data-structure';
  category: string;
  paradigm: string;
  timeComplexity: {
    best: string;
    avg: string;
    worst: string;
  };
  spaceComplexity: string;
  inPlace: boolean;
  stable: boolean | 'N/A';
  concept: string;
  advantages: string[];
  disadvantages: string[];
  visualizerLink?: string;
  bestFor: string;
  simulateOps: (n: number) => number;
}

export const COMPARISON_DATA: TechniqueComparison[] = [
  // ==========================================
  // SORTING ALGORITHMS
  // ==========================================
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Divide & Conquer',
    timeComplexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: true,
    concept: 'Recursively bisects array into singletons, then merges sorted subarrays using two pointers.',
    advantages: [
      'Guaranteed deterministic O(n log n) runtime across all inputs (even adversarial)',
      'Structurally stable: preserves original relative order of equivalent keys',
      'Optimal sequential memory streaming for external sorting on magnetic disk or tapes',
    ],
    disadvantages: [
      'Requires O(n) auxiliary memory for buffer merging (out-of-place for arrays)',
      'Substantial copy overhead for small arrays compared to Insertion Sort',
    ],
    visualizerLink: '/visualizer/merge-sort',
    bestFor: 'Linked list sorting, external out-of-core sorting, datasets where stability and worst-case guarantees are strictly required.',
    simulateOps: (n) => Math.round(n * Math.log2(Math.max(n, 2))),
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Divide & Conquer (Partitioning)',
    timeComplexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    inPlace: true,
    stable: false,
    concept: 'Selects a pivot, partitions array such that elements < pivot precede it, and recurses.',
    advantages: [
      'Industry gold standard for in-memory sorting due to superior L1/L2 CPU cache locality',
      'In-place sorting requiring only O(log n) call stack frames (tail call recursion)',
      'Extremely low constant factor hidden by asymptotic notation',
    ],
    disadvantages: [
      'Degenerates to O(n²) if pivot selection repeatedly yields 0 and (n-1) splits on sorted inputs',
      'Unstable: long-range element swaps disrupt relative ordering of equal elements',
    ],
    visualizerLink: '/visualizer/quick-sort',
    bestFor: 'General-purpose in-memory array sorting (standard library qsort, C++ std::sort intro-sort engine).',
    simulateOps: (n) => Math.round(n * Math.log2(Math.max(n, 2))),
  },
  {
    id: 'counting-sort',
    name: 'Counting Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Non-Comparison (Integer Key Indexing)',
    timeComplexity: { best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n + k)' },
    spaceComplexity: 'O(k)',
    inPlace: false,
    stable: true,
    concept: 'Counts frequencies of integer values into an index table, computes prefix sums, and writes output.',
    advantages: [
      'Bypasses the fundamental Ω(n log n) comparison lower bound, achieving linear O(n) when k = O(n)',
      'Completely stable when iterated right-to-left during placement',
      'Zero comparisons between elements',
    ],
    disadvantages: [
      'Requires discrete integer keys or mapped discrete tokens',
      'Memory explosion O(k) if max key value k is vastly larger than input size n',
    ],
    visualizerLink: '/visualizer/counting-sort',
    bestFor: 'Dense integer arrays with small known range k (e.g. test scores 0-100, ages 0-120, pixel brightness 0-255).',
    simulateOps: (n) => n + 100,
  },
  {
    id: 'radix-sort',
    name: 'Radix Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Non-Comparison (Digit-by-Digit)',
    timeComplexity: { best: 'O(d · (n + b))', avg: 'O(d · (n + b))', worst: 'O(d · (n + b))' },
    spaceComplexity: 'O(n + b)',
    inPlace: false,
    stable: true,
    concept: 'Sorts keys digit by digit starting from least significant digit (LSD) using a stable bucket/counting subroutine.',
    advantages: [
      'Linear time O(n) for fixed word sizes (e.g. 32-bit or 64-bit integers)',
      'Substantially outperforms comparison sorts when n is in the millions and keys have fixed width',
      'Stable ordering preserved across passes',
    ],
    disadvantages: [
      'Requires auxiliary buffers and integer/byte representations',
      'Cache efficiency degrades if base b is too large or too small',
    ],
    visualizerLink: '/visualizer/radix-sort',
    bestFor: 'Massive datasets of fixed-length integers, IP addresses, dates, or fixed-width string keys.',
    simulateOps: (n) => 4 * (n + 10),
  },
  {
    id: 'bucket-sort',
    name: 'Bucket Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Distribution Sorting',
    timeComplexity: { best: 'O(n + k)', avg: 'O(n)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: true,
    concept: 'Uniformly partitions range into k buckets, sorts each bucket individually, and concatenates.',
    advantages: [
      'O(n) linear average time when inputs follow uniform continuous distribution over [0, 1)',
      'Highly parallelizable: individual buckets can be sorted independently across CPU threads',
    ],
    disadvantages: [
      'Degenerates to O(n²) if adversarial clustering maps all elements into a single bucket',
      'Memory overhead for bucket list allocations',
    ],
    visualizerLink: '/visualizer/bucket-sort',
    bestFor: 'Uniformly distributed floating-point numbers in a known interval, geographic longitude/latitude bins.',
    simulateOps: (n) => Math.round(n * 1.2),
  },
  {
    id: 'shell-sort',
    name: 'Shell Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Diminishing Increment Insertion',
    timeComplexity: { best: 'O(n log n)', avg: 'O(n^1.3)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: false,
    concept: 'Performs insertion sort on elements separated by decreasing step gaps (h-sorting), finishing with gap = 1.',
    advantages: [
      'Strictly in-place O(1) auxiliary space without recursion call stack overhead',
      'Dramatically outperforms simple O(n²) Insertion Sort on medium sized datasets (up to 50,000 elements)',
      'Simple implementation without pointer chasing',
    ],
    disadvantages: [
      'Runtime bounds depend heavily on chosen gap sequence (Shell, Hibbard, Sedgewick, Pratt)',
      'Unstable due to long gap leaps',
    ],
    visualizerLink: '/visualizer/shell-sort',
    bestFor: 'Embedded systems with constrained RAM (microcontrollers, automotive firmware, RTOS kernels).',
    simulateOps: (n) => Math.round(Math.pow(n, 1.25)),
  },
  {
    id: 'tree-sort',
    name: 'Tree Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'BST Insertion & Inorder Traversal',
    timeComplexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: true,
    concept: 'Builds a Binary Search Tree from the input array, then performs inorder traversal to retrieve sorted sequence.',
    advantages: [
      'Produces dynamic sorted order on the fly as items stream in',
      'Supports efficient concurrent search and range queries during sorting',
    ],
    disadvantages: [
      'Degenerates to O(n²) linked list on already sorted inputs unless balanced (AVL/Red-Black)',
      'Heavy pointer memory overhead (left, right, parent per node)',
    ],
    visualizerLink: '/visualizer/tree-sort',
    bestFor: 'Scenarios where data is dynamically inserted into an existing BST and full sorted output is intermittently read.',
    simulateOps: (n) => Math.round(n * Math.log2(Math.max(n, 2))),
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Selection via Binary Heap',
    timeComplexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: false,
    concept: 'Builds max-heap in O(n) in place, then repeatedly swaps root to end and sifts down.',
    advantages: [
      'Strict deterministic O(n log n) worst-case bound with zero auxiliary memory O(1)',
      'Immune to adversarial pivot attacks that degrade Quick Sort to O(n²)',
    ],
    disadvantages: [
      'Terrible CPU cache locality: parent-child array jumps (2i+1) cause frequent cache line misses',
      'Unstable sort',
    ],
    visualizerLink: '/visualizer/min-heap',
    bestFor: 'Safety-critical real-time flight controllers and Linux kernel fallbacks where worst-case O(n²) cannot be tolerated.',
    simulateOps: (n) => Math.round(n * Math.log2(Math.max(n, 2)) * 1.3),
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Incremental Insertion',
    timeComplexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: true,
    concept: 'Iteratively takes next element and inserts it into correct position within already-sorted prefix.',
    advantages: [
      'Adaptive: linear O(n) performance on nearly sorted or small datasets (n < 16)',
      'Zero memory overhead and exceptionally tight inner loop instruction count',
      'Stable and online (can sort streaming inputs incrementally)',
    ],
    disadvantages: [
      'O(n²) time complexity makes it unviable for large unsorted arrays (n > 1,000)',
    ],
    visualizerLink: '/visualizer/merge-sort',
    bestFor: 'Small arrays (used as base case in Timsort and Introsort for n ≤ 16), appending items to nearly-sorted feeds.',
    simulateOps: (n) => (n <= 10 ? n : Math.round((n * n) / 4)),
  },
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Adjacent Comparison Swapping',
    timeComplexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: true,
    concept: 'Repeatedly steps through list, compares adjacent elements, and swaps them if out of order.',
    advantages: [
      'Detects already-sorted array in a single O(n) pass with early-exit flag',
      'Conceptual simplicity for teaching algorithmic invariant mechanics',
    ],
    disadvantages: [
      'Severely inefficient quadratic runtime O(n²) with excessive swap mutations',
      'Almost never used in production software',
    ],
    visualizerLink: '/visualizer/merge-sort',
    bestFor: 'Pedagogical demonstration of swapping mechanics and loop invariants.',
    simulateOps: (n) => Math.round((n * n) / 2),
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    type: 'sorting',
    category: 'Sorting',
    paradigm: 'Greedy Minimum Selection',
    timeComplexity: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: false,
    concept: 'Repeatedly finds minimum element from unsorted portion and swaps it with the first unsorted position.',
    advantages: [
      'Minimizes total write operations: performs exactly O(n) memory swaps over entire run',
      'Strictly in-place O(1) memory',
    ],
    disadvantages: [
      'Always O(n²) comparisons even if input array is already sorted',
      'Unstable due to long distance element swaps',
    ],
    visualizerLink: '/visualizer/merge-sort',
    bestFor: 'Flash EEPROM storage where write wear cycles are precious and read operations are cheap.',
    simulateOps: (n) => Math.round((n * n) / 2),
  },

  // ==========================================
  // SEARCHING ALGORITHMS
  // ==========================================
  {
    id: 'binary-search',
    name: 'Binary Search',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Divide & Conquer (Interval Bisection)',
    timeComplexity: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Calculates midpoint of sorted array, discards half of search range, and repeats iteratively.',
    advantages: [
      'Logarithmic O(log n) efficiency: searches 1 billion elements in maximum 30 comparisons',
      'Strict O(1) auxiliary space when written iteratively',
      'Cache-friendly memory reads on localized segments',
    ],
    disadvantages: [
      'Strictly requires monotonic sorted array precondition; cost of sorting first is O(n log n)',
      'Suboptimal on non-random-access structures like linked lists',
    ],
    visualizerLink: '/visualizer/binary-search',
    bestFor: 'Lookups in static sorted arrays, database B-Tree index page traversals, lower_bound / upper_bound queries.',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(n, 2)))),
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Sequential Exhaustive Scan',
    timeComplexity: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Scans each element sequentially from index 0 to n-1 until target is encountered or end is reached.',
    advantages: [
      'Zero preconditions: works on unsorted, ordered, streaming, or non-contiguous data',
      'Excellent L1 CPU prefetching throughput across contiguous arrays',
      'Cost-effective when only 1-2 searches are performed on an unsorted dataset',
    ],
    disadvantages: [
      'Linear O(n) scaling becomes unacceptable for high-throughput queries on large datasets',
    ],
    visualizerLink: '/visualizer/linear-search',
    bestFor: 'Unsorted arrays, short lists (n < 50), single-pass queries where sorting first would waste O(n log n).',
    simulateOps: (n) => Math.max(1, Math.round(n / 2)),
  },
  {
    id: 'fibonacci-search',
    name: 'Fibonacci Search',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Golden Ratio Interval Probing',
    timeComplexity: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Partitions sorted array using Fibonacci numbers (Fib[k], Fib[k-1], Fib[k-2]) with only addition & subtraction.',
    advantages: [
      'Eliminates hardware division (/) and bit shifts, using only low-power addition and subtraction instructions',
      'Golden ratio division exhibits non-symmetric interval inspection matching certain non-uniform access latencies',
    ],
    disadvantages: [
      'Requires sorted array and precomputed or cached Fibonacci index lookups',
      'Slightly more complex loop termination bounds than Binary Search',
    ],
    visualizerLink: '/visualizer/fibonacci-search',
    bestFor: 'Low-power microcontrollers, DSP processors lacking division ALU hardware, flash memory blocks with asymmetric read costs.',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(n, 2)))),
  },
  {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Predictive Probing (Phonebook Estimator)',
    timeComplexity: { best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Estimates target position based on key value distribution formula: pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low]).',
    advantages: [
      'Achieves doubly-logarithmic O(log log n) speed on uniformly distributed numerical datasets',
      'Searches a 1,000,000 element uniform array in ~3-4 probe steps',
    ],
    disadvantages: [
      'Degenerates to O(n) if key values are exponentially skewed or adversarially clustered',
      'Probe calculation requires floating point arithmetic or 64-bit multiplication and division',
    ],
    visualizerLink: '/visualizer/interpolation-search',
    bestFor: 'Huge datasets of uniformly distributed numerical data (timestamps, GPS coordinates, uniform sensor logs).',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(Math.log2(Math.max(n, 4)), 1.5)))),
  },
  {
    id: 'kmp',
    name: 'KMP String Matching',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Deterministic Finite Automaton (LPS Table)',
    timeComplexity: { best: 'O(m)', avg: 'O(n + m)', worst: 'O(n + m)' },
    spaceComplexity: 'O(m)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Precomputes Longest Prefix Suffix (LPS) table of pattern to skip redundant comparisons without backtracking text pointer.',
    advantages: [
      'Strict worst-case O(n + m) runtime: guarantees linear search through text of length n',
      'Never backtracks the text stream pointer (essential for streaming network sockets and unbuffered disk reads)',
    ],
    disadvantages: [
      'Requires O(m) auxiliary memory and preprocessing step for pattern LPS table',
      'More complex to implement than Boyer-Moore for simple English text',
    ],
    visualizerLink: '/visualizer/kmp',
    bestFor: 'DNA genomic sequence matching, network packet pattern filters, streaming logs where backwards seeking is prohibited.',
    simulateOps: (n) => Math.max(1, Math.round(n * 0.15 + 10)),
  },
  {
    id: 'exponential-search',
    name: 'Exponential Search',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Bound Doubling & Binary Search',
    timeComplexity: { best: 'O(1)', avg: 'O(log i)', worst: 'O(log i)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Finds range containing target by exponentially doubling index (1, 2, 4, 8, 16...), then performs binary search within bounded interval.',
    advantages: [
      'Time complexity O(log i) depends on target position i rather than total array size n',
      'Ideal for unbounded, infinite, or dynamically growing arrays where total length n is unknown',
    ],
    disadvantages: [
      'Requires sorted array',
      'Slightly higher constant overhead than standard binary search when target is near the end',
    ],
    visualizerLink: '/visualizer/binary-search',
    bestFor: 'Unbounded streaming buffers, searching infinite continuous sequences, finding targets close to the beginning.',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(n / 4, 2)))),
  },
  {
    id: 'jump-search',
    name: 'Jump Search',
    type: 'searching',
    category: 'Searching',
    paradigm: 'Block Skipping (Step = √n)',
    timeComplexity: { best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)' },
    spaceComplexity: 'O(1)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Skips forward by fixed steps of size √n until target value is bounded, then performs backward linear scan in block.',
    advantages: [
      'O(√n) is faster than linear search and only jumps backwards once',
      'Optimal when seeking backwards in memory has a high cost penalty compared to forward stepping',
    ],
    disadvantages: [
      'Slower than O(log n) Binary Search',
      'Requires sorted array',
    ],
    visualizerLink: '/visualizer/linear-search',
    bestFor: 'Systems where backward jumps are expensive or on tape-based sequential storage media.',
    simulateOps: (n) => Math.max(1, Math.round(Math.sqrt(n))),
  },

  // ==========================================
  // DATA STRUCTURES
  // ==========================================
  {
    id: 'avl',
    name: 'AVL Tree',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Self-Balancing Binary Search Tree',
    timeComplexity: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Self-balancing BST with strict |Balance Factor| ≤ 1 invariant. Restores height through LL, RR, LR, RL rotations.',
    advantages: [
      'Guaranteed deterministic O(log n) worst-case search, insert, and delete',
      'Strict balance factor makes lookups faster than Red-Black trees',
      'Maintains sorted order and supports range queries in O(log n + k)',
    ],
    disadvantages: [
      'More frequent rotations on insert/delete compared to Red-Black trees',
      'High pointer memory overhead (parent, left, right, height per node)',
    ],
    visualizerLink: '/visualizer/avl',
    bestFor: 'Lookup-intensive workloads requiring strict real-time guarantees, ordered range queries, and sorted keys.',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(n, 2)))),
  },
  {
    id: 'bst',
    name: 'BST (Unbalanced)',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Hierarchical Key Tree',
    timeComplexity: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Hierarchical node tree where left < root < right. Prone to degenerating into a linked list on sorted inputs.',
    advantages: [
      'Simple implementation without rotation rebalancing logic',
      'Maintains sorted keys on average when inputs arrive randomly',
    ],
    disadvantages: [
      'Degenerates to O(n) linked list on sorted or nearly sorted insertion',
      'No worst-case height guarantees',
    ],
    visualizerLink: '/visualizer/avl',
    bestFor: 'Academic learning or situations where keys are mathematically provable to arrive in random uniform order.',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(n, 2)) * 1.5)),
  },
  {
    id: 'hash-table',
    name: 'Hash Table',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Key-to-Index Hashing',
    timeComplexity: { best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Maps arbitrary keys to table indices via hash function with collision resolution (chaining or open addressing).',
    advantages: [
      'Expected O(1) constant-time lookup, insertion, and deletion',
      'Extremely high throughput for point key queries',
    ],
    disadvantages: [
      'Does not preserve key ordering: cannot perform range queries or find predecessor/successor',
      'Degenerates to O(n) under hash collision attacks or bad hash distributions',
      'Costly rehashing latency spikes during dynamic table resizing',
    ],
    visualizerLink: '/visualizer/trie',
    bestFor: 'Exact-key lookups, session caches, symbol tables, deduplication filters, key-value stores.',
    simulateOps: () => 1,
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Digital Character Tree',
    timeComplexity: { best: 'O(L)', avg: 'O(L)', worst: 'O(L)' },
    spaceComplexity: 'O(N · L)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Tree keyed by string character sequences. Shared prefixes share common ancestor paths from root.',
    advantages: [
      'Lookup time depends only on string length L, completely decoupled from total word count N',
      'Native O(L) prefix autocomplete, spell-checking, and lexical range queries',
      'No hash collision degradation',
    ],
    disadvantages: [
      'High pointer memory footprint per character node',
      'Poor CPU cache locality due to scattered node heap allocations',
    ],
    visualizerLink: '/visualizer/trie',
    bestFor: 'Search engine autocomplete, IP router longest prefix routing, spell-checkers, dictionary lookups.',
    simulateOps: () => 8,
  },
  {
    id: 'min-heap',
    name: 'Binary Heap (Min/Max)',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Complete Binary Array Tree',
    timeComplexity: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Array-packed complete binary tree maintaining the invariant: parent ≤ children (min) or parent ≥ children (max).',
    advantages: [
      'Instant O(1) peek access to extremum (minimum or maximum element)',
      'Linear time O(n) buildHeap via bottom-up sift-down',
      'Zero pointer overhead: stored contiguously in an array with 2i+1, 2i+2 indexing',
    ],
    disadvantages: [
      'Arbitrary key search is slow O(n) because sibling subtrees lack relative ordering',
      'Deleting non-root elements requires an auxiliary hash map index',
    ],
    visualizerLink: '/visualizer/min-heap',
    bestFor: 'Priority queues, task schedulers, Dijkstra shortest path, streaming Top-K and median tracking.',
    simulateOps: (n) => Math.max(1, Math.round(Math.log2(Math.max(n, 2)))),
  },
  {
    id: 'dynamic-array',
    name: 'Dynamic Array (Vector)',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Contiguous Buffer with Amortized Resizing',
    timeComplexity: { best: 'O(1)', avg: 'O(1)*', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    inPlace: true,
    stable: 'N/A',
    concept: 'Contiguous memory buffer that doubles capacity when full, achieving amortized O(1) append operations.',
    advantages: [
      'Instant O(1) random access indexing (arr[i])',
      'Best-in-class CPU cache locality (L1/L2 prefetching across contiguous memory lines)',
      'Minimal memory overhead per element',
    ],
    disadvantages: [
      'Arbitrary insertions or deletions require O(n) memory shifting of subsequent elements',
      'Periodic buffer reallocation spikes on geometric capacity expansion',
    ],
    visualizerLink: '/visualizer/merge-sort',
    bestFor: 'Sequential iteration, random index lookups, stack implementations, general default container.',
    simulateOps: () => 1,
  },
  {
    id: 'linked-list',
    name: 'Doubly Linked List',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Pointer Chained Nodes',
    timeComplexity: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Non-contiguous heap nodes linked via next and prev pointers. Instant mutation given node pointer.',
    advantages: [
      'Strict O(1) insertion and deletion once node pointer reference is already known',
      'No contiguous memory reallocation pauses or capacity limits',
    ],
    disadvantages: [
      'No random access: accessing index k requires O(k) linear traversal',
      'Severe CPU cache misses due to pointer chasing across scattered heap memory',
      '16-24 bytes of pointer overhead per payload',
    ],
    visualizerLink: '/visualizer/linear-search',
    bestFor: 'LRU Cache backing list (paired with Hash Map), OS free-list allocators, undo/redo history buffers.',
    simulateOps: (n) => Math.max(1, Math.round(n / 2)),
  },
  {
    id: 'graph-adj-list',
    name: 'Graph (Adjacency List)',
    type: 'data-structure',
    category: 'Data Structure',
    paradigm: 'Vertex-to-Edge List Mapping',
    timeComplexity: { best: 'O(1)', avg: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V + E)',
    inPlace: false,
    stable: 'N/A',
    concept: 'Array of vertices mapping to dynamic lists of incident edges. Optimal representation for sparse graphs (E ≪ V²).',
    advantages: [
      'Space efficient O(V + E) for sparse real-world networks',
      'Iterating through incident neighbors of vertex v takes optimal O(deg(v)) time',
    ],
    disadvantages: [
      'Checking if specific edge (u, v) exists takes O(deg(u)) rather than O(1)',
      'Multiple pointer indirections during traversal',
    ],
    visualizerLink: '/visualizer/dijkstra',
    bestFor: 'Road networks, web link graphs, social networks, shortest path traversals (Dijkstra, BFS, DFS).',
    simulateOps: (n) => Math.round(n * 1.5),
  },
];

export default function ComparisonPage() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Sorting' | 'Searching' | 'Data Structure'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('All');
  
  // Head-to-Head Comparative Battle selection
  const [headA, setHeadA] = useState<string>('quick-sort');
  const [headB, setHeadB] = useState<string>('merge-sort');

  // Interactive Operations Simulator State
  const [simN, setSimN] = useState<number>(1000);

  // Filtered dataset for Matrix Table & Cards
  const filteredData = COMPARISON_DATA.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' ||
      (selectedCategory === 'Sorting' && item.type === 'sorting') ||
      (selectedCategory === 'Searching' && item.type === 'searching') ||
      (selectedCategory === 'Data Structure' && item.type === 'data-structure');

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.timeComplexity.avg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bestFor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      filterTag === 'All' ||
      (filterTag === 'O(n log n)' && item.timeComplexity.avg.includes('log n')) ||
      (filterTag === 'O(1) Space' && item.spaceComplexity === 'O(1)') ||
      (filterTag === 'In-Place' && item.inPlace) ||
      (filterTag === 'Stable' && item.stable === true) ||
      (filterTag === 'Linear O(n)' && (item.timeComplexity.avg.includes('O(n)') || item.timeComplexity.avg.includes('O(n + k)')));

    return matchesCat && matchesSearch && matchesTag;
  });

  const structA = COMPARISON_DATA.find((x) => x.id === headA) || COMPARISON_DATA[0];
  const structB = COMPARISON_DATA.find((x) => x.id === headB) || COMPARISON_DATA[1];

  // Simulator operation computation
  const opsA = structA.simulateOps(simN);
  const opsB = structB.simulateOps(simN);
  const maxOps = Math.max(opsA, opsB, 1);
  const percentA = Math.max(6, Math.min(100, Math.round((opsA / maxOps) * 100)));
  const percentB = Math.max(6, Math.min(100, Math.round((opsB / maxOps) * 100)));

  // Preset Battle Matchups
  const presets = [
    { label: 'Quick Sort vs Merge Sort', a: 'quick-sort', b: 'merge-sort' },
    { label: 'Binary Search vs Interpolation Search', a: 'binary-search', b: 'interpolation-search' },
    { label: 'Counting Sort vs Radix Sort', a: 'counting-sort', b: 'radix-sort' },
    { label: 'Heap Sort vs Quick Sort', a: 'heap-sort', b: 'quick-sort' },
    { label: 'Linear Search vs Binary Search', a: 'linear-search', b: 'binary-search' },
    { label: 'AVL Tree vs Hash Table', a: 'avl', b: 'hash-table' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950/70 to-slate-900 border border-dark-border rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-2 sm:space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Unified DSA Benchmark Matrix
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              All Sorting & Searching Techniques
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sorting, Searching & Structure Arena
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Directly connect theoretical complexity bounds to implementation trade-offs. Compare
            invariants, memory footprints, asymptotic curves, cache locality, and production suitability side by side.
          </p>
        </div>
      </div>

      {/* Head-to-Head Comparative Battle Card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Head-to-Head Technique Matchup
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any two sorting algorithms, search techniques, or data structures to analyze their trade-offs.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Popular Battles:
            </span>
            {presets.slice(0, 3).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setHeadA(p.a);
                  setHeadB(p.b);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-brand-500 transition min-h-[32px]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Selector A */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Select First Technique (A)
            </label>
            <div className="relative">
              <select
                value={headA}
                onChange={(e) => setHeadA(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium focus:border-brand-500 focus:outline-none appearance-none cursor-pointer"
              >
                <optgroup label="--- Sorting Algorithms ---">
                  {COMPARISON_DATA.filter((x) => x.type === 'sorting').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.timeComplexity.avg})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="--- Searching Algorithms ---">
                  {COMPARISON_DATA.filter((x) => x.type === 'searching').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.timeComplexity.avg})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="--- Data Structures ---">
                  {COMPARISON_DATA.filter((x) => x.type === 'data-structure').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.timeComplexity.avg})
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Selector B */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-accent-indigo flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse" />
              Select Second Technique (B)
            </label>
            <div className="relative">
              <select
                value={headB}
                onChange={(e) => setHeadB(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium focus:border-brand-500 focus:outline-none appearance-none cursor-pointer"
              >
                <optgroup label="--- Sorting Algorithms ---">
                  {COMPARISON_DATA.filter((x) => x.type === 'sorting').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.timeComplexity.avg})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="--- Searching Algorithms ---">
                  {COMPARISON_DATA.filter((x) => x.type === 'searching').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.timeComplexity.avg})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="--- Data Structures ---">
                  {COMPARISON_DATA.filter((x) => x.type === 'data-structure').map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.timeComplexity.avg})
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Side-by-Side Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A */}
          <div className="bg-slate-900/90 border border-brand-500/40 rounded-xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300">
                  {structA.category} • {structA.paradigm}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {structA.inPlace ? '✓ In-Place' : 'Out-of-Place'}
                  {structA.stable !== 'N/A' && (structA.stable ? ' • Stable' : ' • Unstable')}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {structA.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{structA.concept}</p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Best Time</span>
                  <span className="text-xs font-bold text-emerald-400">{structA.timeComplexity.best}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Avg Time</span>
                  <span className="text-xs font-bold text-amber-400">{structA.timeComplexity.avg}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Worst Time</span>
                  <span className="text-xs font-bold text-rose-400">{structA.timeComplexity.worst}</span>
                </div>
              </div>

              {/* Space & Invariants */}
              <div className="flex items-center justify-between text-xs font-mono bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-400">Space Complexity:</span>
                <span className="text-purple-300 font-bold">{structA.spaceComplexity}</span>
              </div>

              {/* Pros */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Architectural Advantages:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {structA.advantages.map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Engineering Constraints:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {structA.disadvantages.map((dis, idx) => (
                    <li key={idx}>{dis}</li>
                  ))}
                </ul>
              </div>

              {/* Best For */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <strong className="text-brand-300 block mb-0.5">Production Sweet Spot:</strong>
                <span className="text-slate-300">{structA.bestFor}</span>
              </div>
            </div>

            {structA.visualizerLink && (
              <Link
                href={structA.visualizerLink}
                className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow transition min-h-[40px]"
              >
                <span>Launch {structA.name} in Visualizer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Card B */}
          <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                  {structB.category} • {structB.paradigm}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {structB.inPlace ? '✓ In-Place' : 'Out-of-Place'}
                  {structB.stable !== 'N/A' && (structB.stable ? ' • Stable' : ' • Unstable')}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {structB.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{structB.concept}</p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Best Time</span>
                  <span className="text-xs font-bold text-emerald-400">{structB.timeComplexity.best}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Avg Time</span>
                  <span className="text-xs font-bold text-amber-400">{structB.timeComplexity.avg}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Worst Time</span>
                  <span className="text-xs font-bold text-rose-400">{structB.timeComplexity.worst}</span>
                </div>
              </div>

              {/* Space & Invariants */}
              <div className="flex items-center justify-between text-xs font-mono bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-400">Space Complexity:</span>
                <span className="text-purple-300 font-bold">{structB.spaceComplexity}</span>
              </div>

              {/* Pros */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Architectural Advantages:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {structB.advantages.map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Engineering Constraints:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {structB.disadvantages.map((dis, idx) => (
                    <li key={idx}>{dis}</li>
                  ))}
                </ul>
              </div>

              {/* Best For */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <strong className="text-indigo-300 block mb-0.5">Production Sweet Spot:</strong>
                <span className="text-slate-300">{structB.bestFor}</span>
              </div>
            </div>

            {structB.visualizerLink && (
              <Link
                href={structB.visualizerLink}
                className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition min-h-[40px]"
              >
                <span>Launch {structB.name} in Visualizer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Interactive Growth & Operations Benchmark Simulator */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-brand-400" />
                Live Theoretical Operations Simulator
              </h4>
              <p className="text-[11px] text-slate-400">
                Observe how required operations diverge as input scale N scales from 10 to 100,000.
              </p>
            </div>

            {/* Input Size Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[10, 100, 1000, 10000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSimN(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition min-h-[30px] ${
                    simN === val
                      ? 'bg-brand-600 text-white font-bold shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  N={val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Operation Bars */}
          <div className="space-y-3 pt-1">
            {/* Tech A Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-300 font-semibold">{structA.name}</span>
                <span className="text-white font-bold">{opsA.toLocaleString()} expected ops</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-accent-cyan rounded-full transition-all duration-300"
                  style={{ width: `${percentA}%` }}
                />
              </div>
            </div>

            {/* Tech B Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-300 font-semibold">{structB.name}</span>
                <span className="text-white font-bold">{opsB.toLocaleString()} expected ops</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentB}%` }}
                />
              </div>
            </div>

            {/* Verdict Note */}
            <div className="text-[11px] text-slate-400 font-mono pt-1 flex items-center justify-between flex-wrap gap-2">
              <span>
                At N = {simN.toLocaleString()}, {opsA < opsB ? structA.name : structB.name} requires{' '}
                <strong className="text-emerald-400">
                  {Math.max(1, Math.round(maxOps / Math.max(Math.min(opsA, opsB), 1)))}× fewer
                </strong>{' '}
                theoretical operations.
              </span>
              <span className="text-slate-500">Big-O asymptotically</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Filterable Comparison Matrix */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" />
              Full Algorithmic Complexity Directory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Complete matrix across all sorting techniques, search techniques, and data structures.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, O(n), paradigm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Category Tabs & Quick Filter Tags */}
        <div className="space-y-3">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['All', 'Sorting', 'Searching', 'Data Structure'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition min-h-[36px] ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'All' ? 'All Techniques' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-500 font-mono text-[11px] mr-1">Filter by:</span>
            {['All', 'O(n log n)', 'Linear O(n)', 'O(1) Space', 'In-Place', 'Stable'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition ${
                  filterTag === tag
                    ? 'bg-slate-800 text-brand-300 border border-brand-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View: Cards (< 768px) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-brand-300">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.inPlace ? 'In-Place' : 'Auxiliary Space'}
                  {item.stable !== 'N/A' && (item.stable ? ' • Stable' : ' • Unstable')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">{item.name}</h3>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Avg: {item.timeComplexity.avg}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{item.concept}</p>

              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-2 rounded-lg text-center font-mono text-[10px]">
                <div>
                  <span className="text-slate-500 block">Best</span>
                  <span className="text-emerald-400 font-semibold">{item.timeComplexity.best}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Worst</span>
                  <span className="text-rose-400 font-semibold">{item.timeComplexity.worst}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Space</span>
                  <span className="text-purple-400 font-semibold">{item.spaceComplexity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                  {item.bestFor}
                </span>
                {item.visualizerLink && (
                  <Link
                    href={item.visualizerLink}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>Visualize</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Comprehensive Matrix Table (>= 768px) */}
        <div className="hidden md:block bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Algorithm / Technique</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Best Time</th>
                  <th className="py-3 px-3 font-semibold">Avg Time</th>
                  <th className="py-3 px-3 font-semibold">Worst Time</th>
                  <th className="py-3 px-3 font-semibold">Space</th>
                  <th className="py-3 px-3 font-semibold">In-Place</th>
                  <th className="py-3 px-3 font-semibold">Stability</th>
                  <th className="py-3 px-4 font-semibold">Primary Use Case</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/60">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-brand-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 whitespace-nowrap">
                      {item.timeComplexity.best}
                    </td>
                    <td className="py-3 px-3 text-amber-400 whitespace-nowrap font-bold">
                      {item.timeComplexity.avg}
                    </td>
                    <td className="py-3 px-3 text-rose-400 whitespace-nowrap">
                      {item.timeComplexity.worst}
                    </td>
                    <td className="py-3 px-3 text-purple-400 whitespace-nowrap">
                      {item.spaceComplexity}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {item.inPlace ? (
                        <span className="text-emerald-400">Yes</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      {item.stable === true ? (
                        <span className="text-emerald-400">Stable</span>
                      ) : item.stable === false ? (
                        <span className="text-amber-400">Unstable</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={item.bestFor}>
                      {item.bestFor}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {item.visualizerLink ? (
                        <Link
                          href={item.visualizerLink}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition"
                        >
                          <span>Visualize</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
