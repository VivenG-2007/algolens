import { ExecutionStep } from '../execution/types.js';

export function executeRadixSort(inputArray: number[]): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  let arr = [...inputArray];
  const n = arr.length;

  if (n === 0) {
    return [
      {
        id: stepId++,
        title: 'Empty Array',
        description: 'Input array is empty, nothing to sort.',
        algorithmLine: 1,
        codeLine: 1,
        variables: { length: 0 },
        arrayState: [],
        operation: 'COMPLETE',
      },
    ];
  }

  // Ensure positive integers for LSD radix sort
  for (const num of arr) {
    if (!Number.isInteger(num) || num < 0) {
      throw new Error('Radix Sort requires non-negative integers.');
    }
  }

  const maxVal = Math.max(...arr);
  const maxDigits = maxVal === 0 ? 1 : Math.floor(Math.log10(maxVal)) + 1;

  steps.push({
    id: stepId++,
    title: 'Initialize Radix Sort (LSD)',
    description: `Maximum element is ${maxVal} (${maxDigits} digit${maxDigits > 1 ? 's' : ''}). Preparing 10 buckets (0–9) for LSD digit-by-digit distribution.`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { maxVal, maxDigits, arrayLength: n },
    arrayState: [...arr],
    highlights: [],
    dataStructureState: {
      type: 'radix-sort',
      exp: 1,
      digitPlace: 'Ones',
      currentDigitIndex: -1,
      currentElement: null,
      buckets: Array.from({ length: 10 }, () => []),
      outputArray: [...arr],
    },
    operation: 'INIT',
    complexity: { time: 'O(d · (n + k))', space: 'O(n + k)' },
  });

  let exp = 1;
  const digitNames: Record<number, string> = {
    1: 'Ones',
    10: 'Tens',
    100: 'Hundreds',
    1000: 'Thousands',
    10000: 'Ten Thousands',
  };

  while (Math.floor(maxVal / exp) > 0 || exp === 1) {
    const digitPlace = digitNames[exp] || `10^${Math.log10(exp)}`;
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    steps.push({
      id: stepId++,
      title: `Step — ${digitPlace} Digit Pass (exp = ${exp})`,
      description: `Analyzing the ${digitPlace} digit (val / ${exp} % 10) for all elements. Distributing into 10 buckets [0..9].`,
      algorithmLine: 3,
      codeLine: 5,
      variables: { exp, digitPlace, maxVal },
      arrayState: [...arr],
      highlights: [],
      dataStructureState: {
        type: 'radix-sort',
        exp,
        digitPlace,
        currentDigitIndex: -1,
        currentElement: null,
        buckets: buckets.map((b) => [...b]),
        outputArray: [...arr],
      },
      operation: 'DIGIT_PASS_START',
    });

    // Distribute into buckets
    for (let i = 0; i < n; i++) {
      const val = arr[i];
      const digit = Math.floor(val / exp) % 10;
      buckets[digit].push(val);

      steps.push({
        id: stepId++,
        title: `Distribute ${val} → Bucket ${digit}`,
        description: `Element ${val}: ${digitPlace} digit is ${digit} (${val} / ${exp} % 10 = ${digit}). Moving into Bucket ${digit}.`,
        algorithmLine: 6,
        codeLine: 8,
        variables: { i, val, digit, digitPlace, exp },
        arrayState: [...arr],
        highlights: [i],
        dataStructureState: {
          type: 'radix-sort',
          exp,
          digitPlace,
          currentDigitIndex: digit,
          currentElement: val,
          highlightedIndex: i,
          buckets: buckets.map((b) => [...b]),
          outputArray: [...arr],
        },
        operation: 'DISTRIBUTE',
      });
    }

    // Collect back from buckets
    const collected: number[] = [];
    for (let d = 0; d < 10; d++) {
      for (const item of buckets[d]) {
        collected.push(item);
      }
    }

    arr = [...collected];

    steps.push({
      id: stepId++,
      title: `Collect Buckets for ${digitPlace} Digit`,
      description: `Concatenated buckets 0 through 9 in FIFO order: [${arr.join(', ')}]. Elements are now sorted by their ${digitPlace.toLowerCase()} digit.`,
      algorithmLine: 9,
      codeLine: 12,
      variables: { exp, digitPlace, arrayState: arr.join(', ') },
      arrayState: [...arr],
      highlights: [],
      dataStructureState: {
        type: 'radix-sort',
        exp,
        digitPlace,
        currentDigitIndex: -1,
        currentElement: null,
        buckets: Array.from({ length: 10 }, () => []),
        outputArray: [...arr],
        isCollectionStep: true,
      },
      operation: 'COLLECT',
    });

    if (Math.floor(maxVal / (exp * 10)) === 0) {
      break;
    }
    exp *= 10;
  }

  steps.push({
    id: stepId++,
    title: 'Radix Sort Complete',
    description: `All digits processed. Final sorted array: [${arr.join(', ')}].`,
    algorithmLine: 12,
    codeLine: 15,
    variables: { totalPasses: Math.log10(exp) + 1, finalState: arr.join(', ') },
    arrayState: [...arr],
    highlights: Array.from({ length: n }, (_, i) => i),
    dataStructureState: {
      type: 'radix-sort',
      exp,
      digitPlace: 'Complete',
      currentDigitIndex: -1,
      currentElement: null,
      buckets: Array.from({ length: 10 }, () => []),
      outputArray: [...arr],
    },
    operation: 'COMPLETE',
  });

  return steps;
}
