import { ExecutionStep } from '../execution/types.js';

export function executeFibonacciSearch(
  inputArray: number[],
  target: number
): ExecutionStep[] {
  const n = inputArray.length;

  for (let idx = 1; idx < n; idx++) {
    if (inputArray[idx] < inputArray[idx - 1]) {
      throw new Error('Fibonacci Search requires a sorted array.');
    }
  }

  const steps: ExecutionStep[] = [];
  let stepId = 1;

  // Initialize fibonacci numbers
  let fibM2 = 0; // (m-2)'th Fibonacci No.
  let fibM1 = 1; // (m-1)'th Fibonacci No.
  let fibM = fibM2 + fibM1; // m'th Fibonacci

  while (fibM < n) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 + fibM1;
  }

  let offset = -1;

  steps.push({
    id: stepId++,
    title: 'Initialize Fibonacci Search',
    description: `Generated smallest Fibonacci number >= array size (${n}): fibM = ${fibM}, fibM1 = ${fibM1}, fibM2 = ${fibM2}, offset = ${offset}.`,
    algorithmLine: 1,
    codeLine: 1,
    variables: { fibM, fibM1, fibM2, offset, target, length: n },
    arrayState: [...inputArray],
    highlights: [],
    operation: 'INIT',
    complexity: { time: 'O(log n)', space: 'O(1)' },
  });

  while (fibM > 1) {
    const probeIndex = Math.min(offset + fibM2, n - 1);
    const probeVal = inputArray[probeIndex];

    steps.push({
      id: stepId++,
      title: `Probe Index min(offset + fibM2, n - 1) = min(${offset} + ${fibM2}, ${n - 1}) = ${probeIndex}`,
      description: `Checking value at probe index ${probeIndex}: ${probeVal}. fibM = ${fibM}, fibM1 = ${fibM1}, fibM2 = ${fibM2}.`,
      algorithmLine: 5,
      codeLine: 6,
      variables: {
        fibM,
        fibM1,
        fibM2,
        offset,
        probeIndex,
        probeVal,
        target,
      },
      arrayState: [...inputArray],
      highlights: [probeIndex],
      operation: 'PROBE',
    });

    if (probeVal < target) {
      steps.push({
        id: stepId++,
        title: `arr[${probeIndex}] (${probeVal}) < target (${target}): Move Down 1 Fib Step`,
        description: `Target is to the right. Cut subarray from offset to probeIndex. New offset = ${probeIndex}, fibM = ${fibM1}, fibM1 = ${fibM2}, fibM2 = ${fibM - fibM1}.`,
        algorithmLine: 8,
        codeLine: 9,
        variables: {
          fibM: fibM1,
          fibM1: fibM2,
          fibM2: fibM - fibM1,
          offset: probeIndex,
          target,
        },
        arrayState: [...inputArray],
        highlights: [probeIndex],
        comparisons: {
          left: probeVal,
          right: target,
          result: `${probeVal} < ${target}`,
        },
        operation: 'MOVE_RIGHT',
      });

      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
      offset = probeIndex;
    } else if (probeVal > target) {
      steps.push({
        id: stepId++,
        title: `arr[${probeIndex}] (${probeVal}) > target (${target}): Move Down 2 Fib Steps`,
        description: `Target is to the left. Cut subarray after probeIndex. fibM = ${fibM2}, fibM1 = ${fibM1 - fibM2}, fibM2 = ${fibM - fibM1}.`,
        algorithmLine: 12,
        codeLine: 13,
        variables: {
          fibM: fibM2,
          fibM1: fibM1 - fibM2,
          fibM2: fibM - fibM1,
          offset,
          target,
        },
        arrayState: [...inputArray],
        highlights: [probeIndex],
        comparisons: {
          left: probeVal,
          right: target,
          result: `${probeVal} > ${target}`,
        },
        operation: 'MOVE_LEFT',
      });

      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      steps.push({
        id: stepId++,
        title: `Target ${target} Found at Index ${probeIndex}!`,
        description: `Fibonacci search located matching target ${target} at index ${probeIndex}.`,
        algorithmLine: 15,
        codeLine: 16,
        variables: {
          fibM,
          fibM1,
          fibM2,
          offset,
          probeIndex,
          target,
          found: true,
        },
        arrayState: [...inputArray],
        highlights: [probeIndex],
        operation: 'FOUND',
        complexity: { time: 'O(log n)', space: 'O(1)' },
      });
      return steps;
    }
  }

  // Check remaining single candidate if fibM1 is 1
  if (fibM1 === 1 && offset + 1 < n && inputArray[offset + 1] === target) {
    const foundIdx = offset + 1;
    steps.push({
      id: stepId++,
      title: `Target ${target} Found at Boundary Index ${foundIdx}!`,
      description: `Final check: arr[offset + 1] matched target ${target}.`,
      algorithmLine: 18,
      codeLine: 19,
      variables: { offset, foundIndex: foundIdx, target, found: true },
      arrayState: [...inputArray],
      highlights: [foundIdx],
      operation: 'FOUND',
      complexity: { time: 'O(log n)', space: 'O(1)' },
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    title: `Target ${target} Not Found`,
    description: `Fibonacci intervals depleted. Target ${target} does not exist in the array.`,
    algorithmLine: 20,
    codeLine: 21,
    variables: { offset, target, found: false },
    arrayState: [...inputArray],
    highlights: [],
    operation: 'NOT_FOUND',
    complexity: { time: 'O(log n)', space: 'O(1)' },
  });

  return steps;
}
