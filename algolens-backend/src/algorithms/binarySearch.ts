import { ExecutionStep } from '../execution/types.js';

export function executeBinarySearch(
  inputArray: number[],
  target: number
): ExecutionStep[] {
  const n = inputArray.length;

  // Verify sorted order
  for (let idx = 1; idx < n; idx++) {
    if (inputArray[idx] < inputArray[idx - 1]) {
      throw new Error('Binary Search requires a sorted array.');
    }
  }

  const steps: ExecutionStep[] = [];
  let stepId = 1;
  let low = 0;
  let high = n - 1;

  steps.push({
    id: stepId++,
    title: 'Initialize Binary Search',
    description: `Binary Search on sorted array of ${n} elements. Low = 0, High = ${high}, Target = ${target}.`,
    algorithmLine: 1,
    codeLine: 1,
    variables: { low, high, target, length: n },
    arrayState: [...inputArray],
    highlights: [low, high],
    operation: 'INIT',
    complexity: { time: 'O(log n)', space: 'O(1)' },
  });

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    const midVal = inputArray[mid];

    steps.push({
      id: stepId++,
      title: `Compute Midpoint: mid = floor((${low} + ${high}) / 2) = ${mid}`,
      description: `Probing middle index ${mid} (value = ${midVal}). Current search bounds: [${low}..${high}].`,
      algorithmLine: 4,
      codeLine: 4,
      variables: { low, high, mid, midVal, target },
      arrayState: [...inputArray],
      highlights: [low, mid, high],
      operation: 'PROBE_MID',
    });

    const isMatch = midVal === target;
    const compText = isMatch ? '==' : midVal < target ? '<' : '>';

    steps.push({
      id: stepId++,
      title: `Compare arr[${mid}] (${midVal}) with Target (${target})`,
      description: `Evaluation: ${midVal} ${compText} ${target}.`,
      algorithmLine: 6,
      codeLine: 6,
      variables: { low, high, mid, midVal, target },
      arrayState: [...inputArray],
      highlights: [mid],
      comparisons: {
        left: midVal,
        right: target,
        result: `${midVal} ${compText} ${target}`,
      },
      operation: 'COMPARE',
    });

    if (isMatch) {
      steps.push({
        id: stepId++,
        title: `Target ${target} Found at Index ${mid}!`,
        description: `Target matched element at midpoint ${mid}. Search succeeds in logarithmic time.`,
        algorithmLine: 7,
        codeLine: 7,
        variables: { low, high, mid, target, found: true, foundIndex: mid },
        arrayState: [...inputArray],
        highlights: [mid],
        operation: 'FOUND',
        complexity: { time: 'O(log n)', space: 'O(1)' },
      });
      return steps;
    }

    if (midVal < target) {
      const oldLow = low;
      low = mid + 1;
      steps.push({
        id: stepId++,
        title: `Target is Greater: Eliminate Left Half, low = ${low}`,
        description: `${midVal} < ${target}, so target cannot be in [${oldLow}..${mid}]. Shifting low boundary to mid + 1 = ${low}.`,
        algorithmLine: 10,
        codeLine: 10,
        variables: { low, high, mid, target, direction: 'RIGHT' },
        arrayState: [...inputArray],
        highlights: [low, high],
        operation: 'ELIMINATE_LEFT',
      });
    } else {
      const oldHigh = high;
      high = mid - 1;
      steps.push({
        id: stepId++,
        title: `Target is Smaller: Eliminate Right Half, high = ${high}`,
        description: `${midVal} > ${target}, so target cannot be in [${mid}..${oldHigh}]. Shifting high boundary to mid - 1 = ${high}.`,
        algorithmLine: 13,
        codeLine: 13,
        variables: { low, high, mid, target, direction: 'LEFT' },
        arrayState: [...inputArray],
        highlights: [low, high],
        operation: 'ELIMINATE_RIGHT',
      });
    }
  }

  steps.push({
    id: stepId++,
    title: `Target ${target} Not Found`,
    description: `low (${low}) > high (${high}). Search interval is empty. Target does not exist in array.`,
    algorithmLine: 16,
    codeLine: 16,
    variables: { low, high, target, found: false },
    arrayState: [...inputArray],
    highlights: [],
    operation: 'NOT_FOUND',
    complexity: { time: 'O(log n)', space: 'O(1)' },
  });

  return steps;
}
