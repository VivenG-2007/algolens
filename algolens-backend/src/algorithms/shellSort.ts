import { ExecutionStep } from '../execution/types.js';

export function executeShellSort(inputArray: number[]): ExecutionStep[] {
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

  let gap = Math.floor(n / 2);

  steps.push({
    id: stepId++,
    title: 'Initialize Shell Sort',
    description: `Array of ${n} elements. Initializing gap to floor(n / 2) = ${gap}. Shell Sort performs gapped insertion sorting, gradually reducing gap to 1.`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { n, gap, arrayState: arr.join(', ') },
    arrayState: [...arr],
    highlights: [],
    dataStructureState: {
      type: 'shell-sort',
      gap,
      comparingIndices: [],
      connectedChains: getGappedChains(n, gap),
      phase: 'INIT',
    },
    operation: 'INIT',
    complexity: { time: 'O(n log² n)', space: 'O(1)' },
  });

  while (gap > 0) {
    steps.push({
      id: stepId++,
      title: `Active Gap Interval: gap = ${gap}`,
      description: `Comparing and ordering elements separated by distance ${gap}. ${gap === 1 ? 'Final pass: Standard Insertion Sort.' : `Active stride: ${gap}.`}`,
      algorithmLine: 3,
      codeLine: 4,
      variables: { gap, chains: getGappedChains(n, gap).map((c) => c.join('→')).join(' | ') },
      arrayState: [...arr],
      highlights: [],
      dataStructureState: {
        type: 'shell-sort',
        gap,
        comparingIndices: [],
        connectedChains: getGappedChains(n, gap),
        phase: 'GAP_START',
      },
      operation: 'SET_GAP',
    });

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      steps.push({
        id: stepId++,
        title: `Examine A[${i}] = ${temp} with Gap ${gap}`,
        description: `Comparing element at index ${i} (${temp}) with predecessor index ${i - gap} (${arr[i - gap]}).`,
        algorithmLine: 5,
        codeLine: 6,
        variables: { i, 'A[i]': temp, predecessorIndex: i - gap, 'A[i-gap]': arr[i - gap], gap },
        arrayState: [...arr],
        highlights: [j - gap, j],
        comparisons: {
          left: arr[j - gap],
          right: temp,
          result: arr[j - gap] > temp ? `${arr[j - gap]} > ${temp} (Shift needed)` : `${arr[j - gap]} <= ${temp} (In order)`,
        },
        dataStructureState: {
          type: 'shell-sort',
          gap,
          comparingIndices: [j - gap, j],
          connectedChains: getGappedChains(n, gap),
          phase: 'COMPARE',
        },
        operation: 'COMPARE',
      });

      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];

        steps.push({
          id: stepId++,
          title: `Shift A[${j - gap}] (${arr[j]}) → A[${j}]`,
          description: `Gapped shift: ${arr[j]} > ${temp}. Moved ${arr[j]} forward by gap ${gap}.`,
          algorithmLine: 7,
          codeLine: 8,
          variables: { from: j - gap, to: j, shiftedValue: arr[j], temp, gap },
          arrayState: [...arr],
          highlights: [j - gap, j],
          dataStructureState: {
            type: 'shell-sort',
            gap,
            comparingIndices: [j - gap, j],
            connectedChains: getGappedChains(n, gap),
            phase: 'SHIFT',
          },
          operation: 'SHIFT',
        });

        j -= gap;
      }

      arr[j] = temp;

      if (j !== i) {
        steps.push({
          id: stepId++,
          title: `Insert ${temp} at Index ${j}`,
          description: `Placed ${temp} into its correct gapped position at index ${j}.`,
          algorithmLine: 9,
          codeLine: 10,
          variables: { insertedIndex: j, insertedValue: temp, gap },
          arrayState: [...arr],
          highlights: [j],
          dataStructureState: {
            type: 'shell-sort',
            gap,
            comparingIndices: [j],
            connectedChains: getGappedChains(n, gap),
            phase: 'INSERT',
          },
          operation: 'INSERT',
        });
      }
    }

    gap = Math.floor(gap / 2);
  }

  steps.push({
    id: stepId++,
    title: 'Shell Sort Complete',
    description: `Gap reached 0. All gapped insertion passes completed. Final sorted array: [${arr.join(', ')}].`,
    algorithmLine: 11,
    codeLine: 12,
    variables: { finalArray: arr.join(', '), gap: 0 },
    arrayState: [...arr],
    highlights: Array.from({ length: n }, (_, i) => i),
    dataStructureState: {
      type: 'shell-sort',
      gap: 0,
      comparingIndices: [],
      connectedChains: [],
      phase: 'COMPLETE',
    },
    operation: 'COMPLETE',
  });

  return steps;
}

function getGappedChains(n: number, gap: number): number[][] {
  if (gap <= 0) return [];
  const chains: number[][] = [];
  for (let offset = 0; offset < gap; offset++) {
    const chain: number[] = [];
    for (let i = offset; i < n; i += gap) {
      chain.push(i);
    }
    if (chain.length > 0) chains.push(chain);
  }
  return chains;
}
