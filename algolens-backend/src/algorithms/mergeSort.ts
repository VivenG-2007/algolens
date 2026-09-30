import { ExecutionStep } from '../execution/types.js';

interface SubarrayRange {
  low: number;
  high: number;
  mid: number;
  level: number;
}

export function executeMergeSort(inputArray: number[]): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const arr = [...inputArray];
  const n = arr.length;

  steps.push({
    id: stepId++,
    title: 'Initialize Merge Sort',
    description: `Starting Merge Sort with ${n} elements: [${arr.join(', ')}]. Algorithm follows Divide & Conquer in two distinct phases: (1) Complete Divide, then (2) Step-by-Step Compare & Merge.`,
    algorithmLine: 1,
    codeLine: 1,
    variables: { low: 0, high: n - 1, length: n, phase: 'INITIALIZE' },
    arrayState: [...arr],
    highlights: Array.from({ length: n }, (_, i) => i),
    operation: 'INIT',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  });

  if (n <= 1) {
    steps.push({
      id: stepId++,
      title: 'Base Case Reached',
      description: 'Array has 1 or 0 elements, already sorted by definition.',
      algorithmLine: 2,
      codeLine: 2,
      variables: { low: 0, high: n - 1, isBaseCase: true, phase: 'COMPLETE' },
      arrayState: [...arr],
      highlights: [0],
      operation: 'BASE_CASE',
      complexity: { time: 'O(1)', space: 'O(1)' },
    });
    return steps;
  }

  // ============================================================
  // PHASE 1: COMPLETE DIVIDE PHASE
  // The entire array is divided down level by level into
  // single-element atomic subarrays before merging begins.
  // ============================================================
  const divideSchedule: SubarrayRange[] = [];
  let queue: { low: number; high: number; level: number }[] = [
    { low: 0, high: n - 1, level: 0 },
  ];

  while (queue.length > 0) {
    const nextQueue: { low: number; high: number; level: number }[] = [];
    for (const range of queue) {
      if (range.low < range.high) {
        const mid = Math.floor(range.low + (range.high - range.low) / 2);
        divideSchedule.push({
          low: range.low,
          high: range.high,
          mid,
          level: range.level,
        });

        steps.push({
          id: stepId++,
          title: `Phase 1 (Divide): Split Subarray [${range.low}..${range.high}] at Midpoint Index ${mid}`,
          description: `Splitting subarray [${arr.slice(range.low, range.high + 1).join(', ')}] into Left: [${arr.slice(range.low, mid + 1).join(', ')}] (indices ${range.low}..${mid}) and Right: [${arr.slice(mid + 1, range.high + 1).join(', ')}] (indices ${mid + 1}..${range.high}).`,
          algorithmLine: 3,
          codeLine: 5,
          variables: {
            phase: 'DIVIDE',
            level: range.level,
            low: range.low,
            mid,
            high: range.high,
            leftSize: mid - range.low + 1,
            rightSize: range.high - mid,
          },
          arrayState: [...arr],
          highlights: Array.from(
            { length: range.high - range.low + 1 },
            (_, idx) => range.low + idx
          ),
          operation: 'DIVIDE',
          complexity: { time: 'O(log n) tree depth', space: 'O(log n) stack' },
        });

        nextQueue.push({ low: range.low, high: mid, level: range.level + 1 });
        nextQueue.push({ low: mid + 1, high: range.high, level: range.level + 1 });
      }
    }
    queue = nextQueue;
  }

  // Divide phase milestone
  steps.push({
    id: stepId++,
    title: 'Phase 1 Complete: All Elements Divided to Atomic Units (Size 1)',
    description: `All ${n} elements are now isolated into single-element subarrays. No comparisons have occurred yet. Phase 2 (Conquer & Merge) will now compare adjacent sorted subarrays and join them step-by-step.`,
    algorithmLine: 6,
    codeLine: 8,
    variables: {
      phase: 'DIVIDE_COMPLETE',
      totalAtomicSubarrays: n,
    },
    arrayState: [...arr],
    highlights: Array.from({ length: n }, (_, i) => i),
    operation: 'DIVIDE_COMPLETE',
    complexity: { time: 'O(n) partitioning', space: 'O(n)' },
  });

  // ============================================================
  // PHASE 2: CONQUER & MERGE PHASE
  // Subarrays are now compared pairwise and joined step by step.
  // ============================================================
  function merge(low: number, mid: number, high: number) {
    const leftPart = arr.slice(low, mid + 1);
    const rightPart = arr.slice(mid + 1, high + 1);

    steps.push({
      id: stepId++,
      title: `Phase 2 (Merge): Prepare to Join [${low}..${mid}] and [${mid + 1}..${high}]`,
      description: `Comparing and merging Left sorted segment [${leftPart.join(', ')}] with Right sorted segment [${rightPart.join(', ')}].`,
      algorithmLine: 8,
      codeLine: 12,
      variables: {
        phase: 'MERGE',
        low,
        mid,
        high,
        leftSize: leftPart.length,
        rightSize: rightPart.length,
      },
      arrayState: [...arr],
      highlights: Array.from({ length: high - low + 1 }, (_, idx) => low + idx),
      operation: 'PREPARE_MERGE',
    });

    let i = 0;
    let j = 0;
    let k = low;

    while (i < leftPart.length && j < rightPart.length) {
      const leftVal = leftPart[i];
      const rightVal = rightPart[j];
      const compResult = leftVal <= rightVal ? '<=' : '>';

      steps.push({
        id: stepId++,
        title: `Compare Elements: Left[${i}] (${leftVal}) vs Right[${j}] (${rightVal})`,
        description: `Comparing elements: ${leftVal} ${compResult} ${rightVal}. ${
          leftVal <= rightVal
            ? `${leftVal} is smaller or equal; select from Left.`
            : `${rightVal} is strictly smaller; select from Right.`
        }`,
        algorithmLine: 12,
        codeLine: 17,
        variables: {
          phase: 'MERGE',
          low,
          mid,
          high,
          i,
          j,
          k,
          leftVal,
          rightVal,
        },
        arrayState: [...arr],
        highlights: [low + i, mid + 1 + j],
        comparisons: {
          left: leftVal,
          right: rightVal,
          result: `${leftVal} ${compResult} ${rightVal}`,
        },
        operation: 'COMPARE',
      });

      if (leftVal <= rightVal) {
        arr[k] = leftVal;
        steps.push({
          id: stepId++,
          title: `Place ${leftVal} into Index ${k}`,
          description: `Placed smaller element ${leftVal} at array index ${k}. Advancing left pointer i -> ${i + 1}.`,
          algorithmLine: 14,
          codeLine: 19,
          variables: { phase: 'MERGE', low, mid, high, i: i + 1, j, k, placedValue: leftVal },
          arrayState: [...arr],
          highlights: [k],
          operation: 'ASSIGN',
        });
        i++;
      } else {
        arr[k] = rightVal;
        steps.push({
          id: stepId++,
          title: `Place ${rightVal} into Index ${k}`,
          description: `Placed smaller element ${rightVal} at array index ${k}. Advancing right pointer j -> ${j + 1}.`,
          algorithmLine: 16,
          codeLine: 21,
          variables: { phase: 'MERGE', low, mid, high, i, j: j + 1, k, placedValue: rightVal },
          arrayState: [...arr],
          highlights: [k],
          operation: 'ASSIGN',
        });
        j++;
      }
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      steps.push({
        id: stepId++,
        title: `Copy Remaining Left Element: ${leftPart[i]} to Index ${k}`,
        description: `Right subarray exhausted. Copying remaining sorted element ${leftPart[i]} to position ${k}.`,
        algorithmLine: 19,
        codeLine: 25,
        variables: { phase: 'MERGE', low, mid, high, i, j, k, placedValue: leftPart[i] },
        arrayState: [...arr],
        highlights: [k],
        operation: 'COPY_REMAINING',
      });
      i++;
      k++;
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      steps.push({
        id: stepId++,
        title: `Copy Remaining Right Element: ${rightPart[j]} to Index ${k}`,
        description: `Left subarray exhausted. Copying remaining sorted element ${rightPart[j]} to position ${k}.`,
        algorithmLine: 22,
        codeLine: 28,
        variables: { phase: 'MERGE', low, mid, high, i, j, k, placedValue: rightPart[j] },
        arrayState: [...arr],
        highlights: [k],
        operation: 'COPY_REMAINING',
      });
      j++;
      k++;
    }

    steps.push({
      id: stepId++,
      title: `Subarray [${low}..${high}] Merged and Sorted`,
      description: `Merged result for indices [${low}..${high}]: [${arr.slice(low, high + 1).join(', ')}] is now fully sorted.`,
      algorithmLine: 25,
      codeLine: 31,
      variables: { phase: 'MERGE', low, mid, high },
      arrayState: [...arr],
      highlights: Array.from({ length: high - low + 1 }, (_, idx) => low + idx),
      operation: 'MERGE_COMPLETE',
    });
  }

  // Recursive bottom-up conquer execution
  function sortMerge(low: number, high: number) {
    if (low >= high) return;
    const mid = Math.floor(low + (high - low) / 2);
    sortMerge(low, mid);
    sortMerge(mid + 1, high);
    merge(low, mid, high);
  }

  sortMerge(0, n - 1);

  steps.push({
    id: stepId++,
    title: 'Merge Sort Complete',
    description: `All divide-and-conquer steps finished. Entire array is now fully sorted: [${arr.join(', ')}]`,
    algorithmLine: 26,
    codeLine: 34,
    variables: { low: 0, high: n - 1, sorted: true, phase: 'COMPLETE' },
    arrayState: [...arr],
    highlights: Array.from({ length: n }, (_, i) => i),
    operation: 'COMPLETE',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  });

  return steps;
}
