import { ExecutionStep } from '../execution/types.js';

export function executeCountingSort(inputArray: number[]): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const arr = [...inputArray];
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

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  const output = new Array(n).fill(0);

  steps.push({
    id: stepId++,
    title: 'Initialize Counting Sort',
    description: `Found min: ${min}, max: ${max}. Created frequency array of size ${range} (offset = ${min}).`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { min, max, range, length: n },
    arrayState: [...arr],
    highlights: [],
    dataStructureState: {
      type: 'counting-sort',
      min,
      max,
      range,
      countArray: [...count],
      outputArray: [...output],
    },
    operation: 'INIT',
    complexity: { time: 'O(n + k)', space: 'O(k)' },
  });

  // Step 1: Count frequencies
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    const countIndex = val - min;
    count[countIndex]++;

    steps.push({
      id: stepId++,
      title: `Count Frequency of ${val}`,
      description: `Element ${val} maps to frequency index ${countIndex}. Incremented count to ${count[countIndex]}.`,
      algorithmLine: 4,
      codeLine: 6,
      variables: { i, val, countIndex, countValue: count[countIndex] },
      arrayState: [...arr],
      highlights: [i],
      dataStructureState: {
        type: 'counting-sort',
        min,
        max,
        range,
        countArray: [...count],
        highlightedCountIndex: countIndex,
        outputArray: [...output],
      },
      operation: 'COUNT_FREQUENCY',
    });
  }

  // Step 2: Accumulate counts
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
    steps.push({
      id: stepId++,
      title: `Accumulate Prefix Counts at Index ${i}`,
      description: `Cumulative sum: count[${i}] = count[${i}] + count[${i - 1}] = ${count[i]}. Indicates position in sorted array.`,
      algorithmLine: 8,
      codeLine: 10,
      variables: { i, cumulativeCount: count[i], previousCount: count[i - 1] },
      arrayState: [...arr],
      dataStructureState: {
        type: 'counting-sort',
        min,
        max,
        range,
        countArray: [...count],
        highlightedCountIndex: i,
        outputArray: [...output],
      },
      operation: 'PREFIX_SUM',
    });
  }

  // Step 3: Build output array (traverse backwards for stability)
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const countIndex = val - min;
    const outputIndex = count[countIndex] - 1;
    output[outputIndex] = val;
    count[countIndex]--;

    steps.push({
      id: stepId++,
      title: `Place ${val} at Sorted Index ${outputIndex}`,
      description: `Input element ${val} (offset ${countIndex}) positioned at output[${outputIndex}]. Decremented count to ${count[countIndex]}.`,
      algorithmLine: 12,
      codeLine: 15,
      variables: {
        i,
        val,
        countIndex,
        targetOutputIndex: outputIndex,
        remainingCount: count[countIndex],
      },
      arrayState: [...arr],
      highlights: [i],
      dataStructureState: {
        type: 'counting-sort',
        min,
        max,
        range,
        countArray: [...count],
        highlightedCountIndex: countIndex,
        outputArray: [...output],
        highlightedOutputIndex: outputIndex,
      },
      operation: 'BUILD_OUTPUT',
    });
  }

  // Step 4: Final array state
  steps.push({
    id: stepId++,
    title: 'Counting Sort Complete',
    description: `All elements sorted stably: [${output.join(', ')}].`,
    algorithmLine: 16,
    codeLine: 19,
    variables: { completed: true },
    arrayState: [...output],
    highlights: Array.from({ length: n }, (_, idx) => idx),
    dataStructureState: {
      type: 'counting-sort',
      min,
      max,
      range,
      countArray: [...count],
      outputArray: [...output],
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(n + k)', space: 'O(n + k)' },
  });

  return steps;
}
