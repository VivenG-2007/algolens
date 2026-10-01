import { ExecutionStep } from '../execution/types.js';

interface QuickRecursionNode {
  id: string;
  subarray: number[];
  low: number;
  high: number;
  pivotVal?: number;
  pivotIndex?: number;
  status: 'active' | 'partitioned' | 'complete';
  children?: QuickRecursionNode[];
}

export function executeQuickSort(inputArray: number[]): ExecutionStep[] {
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

  const completedPivots = new Set<number>();
  let recursionTree: QuickRecursionNode = {
    id: 'root',
    subarray: [...arr],
    low: 0,
    high: n - 1,
    status: 'active',
  };

  steps.push({
    id: stepId++,
    title: 'Initialize Quick Sort',
    description: `Array of ${n} elements. Quick Sort recursively selects a pivot, partitions elements into smaller (left) and larger (right), and places the pivot in its final position.`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { length: n, initialArray: arr.join(', ') },
    arrayState: [...arr],
    highlights: [],
    dataStructureState: {
      type: 'quick-sort',
      pivotIndex: null,
      i: null,
      j: null,
      low: 0,
      high: n - 1,
      completedPivots: Array.from(completedPivots),
      recursionTree,
      phase: 'INIT',
    },
    operation: 'INIT',
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
  });

  function quickSortHelper(low: number, high: number, parentNode: QuickRecursionNode) {
    if (low >= high) {
      if (low === high) {
        completedPivots.add(low);
        parentNode.status = 'complete';
        steps.push({
          id: stepId++,
          title: `Single Element Subarray at Index ${low}`,
          description: `Subarray [${arr[low]}] of size 1 is already in its final sorted position.`,
          algorithmLine: 2,
          codeLine: 3,
          variables: { low, high, value: arr[low] },
          arrayState: [...arr],
          highlights: [low],
          dataStructureState: {
            type: 'quick-sort',
            pivotIndex: low,
            low,
            high,
            completedPivots: Array.from(completedPivots),
            recursionTree: JSON.parse(JSON.stringify(recursionTree)),
            phase: 'BASE_CASE',
          },
          operation: 'BASE_CASE',
        });
      }
      return;
    }

    // Step 1: Select Pivot (Last element)
    const pivot = arr[high];
    parentNode.pivotVal = pivot;

    steps.push({
      id: stepId++,
      title: `Select Pivot: A[${high}] = ${pivot}`,
      description: `Partitioning subarray [${low} ... ${high}]. Chosen pivot is ${pivot} at index ${high}.`,
      algorithmLine: 4,
      codeLine: 5,
      variables: { low, high, pivotIndex: high, pivotValue: pivot },
      arrayState: [...arr],
      highlights: [high],
      dataStructureState: {
        type: 'quick-sort',
        pivotIndex: high,
        pivotValue: pivot,
        i: low - 1,
        j: low,
        low,
        high,
        completedPivots: Array.from(completedPivots),
        recursionTree: JSON.parse(JSON.stringify(recursionTree)),
        phase: 'SELECT_PIVOT',
      },
      operation: 'PIVOT_SELECT',
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      // Comparison step BEFORE swap
      const compResult =
        arr[j] < pivot
          ? `${arr[j]} < ${pivot} (Move to left partition)`
          : `${arr[j]} >= ${pivot} (Stays on right partition)`;

      steps.push({
        id: stepId++,
        title: `Compare A[${j}] (${arr[j]}) with Pivot (${pivot})`,
        description: `Evaluating pointer j=${j}: ${arr[j]} vs pivot ${pivot}. ${arr[j] < pivot ? `Increment i and swap with A[${i + 1}].` : 'No swap needed.'}`,
        algorithmLine: 6,
        codeLine: 8,
        variables: { i, j, 'A[j]': arr[j], pivot, low, high },
        arrayState: [...arr],
        highlights: [j, high],
        comparisons: {
          left: arr[j],
          right: pivot,
          result: compResult,
        },
        dataStructureState: {
          type: 'quick-sort',
          pivotIndex: high,
          pivotValue: pivot,
          i,
          j,
          low,
          high,
          candidateSwapIndex: arr[j] < pivot ? i + 1 : undefined,
          completedPivots: Array.from(completedPivots),
          recursionTree: JSON.parse(JSON.stringify(recursionTree)),
          phase: 'COMPARE',
        },
        operation: 'COMPARE',
      });

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;

          steps.push({
            id: stepId++,
            title: `Swap A[${i}] and A[${j}] (${arr[i]} ↔ ${arr[j]})`,
            description: `Swapped smaller element ${arr[i]} into left partition at index ${i}.`,
            algorithmLine: 8,
            codeLine: 10,
            variables: { i, j, swapped_i: arr[i], swapped_j: arr[j], pivot },
            arrayState: [...arr],
            highlights: [i, j],
            dataStructureState: {
              type: 'quick-sort',
              pivotIndex: high,
              pivotValue: pivot,
              i,
              j,
              low,
              high,
              completedPivots: Array.from(completedPivots),
              recursionTree: JSON.parse(JSON.stringify(recursionTree)),
              phase: 'SWAP',
            },
            operation: 'SWAP',
          });
        }
      }
    }

    // Place pivot in final position at i + 1
    const finalPivotIndex = i + 1;
    const temp = arr[finalPivotIndex];
    arr[finalPivotIndex] = arr[high];
    arr[high] = temp;

    completedPivots.add(finalPivotIndex);
    parentNode.pivotIndex = finalPivotIndex;
    parentNode.status = 'partitioned';

    steps.push({
      id: stepId++,
      title: `Pivot ${pivot} Placed at Final Position ${finalPivotIndex}`,
      description: `Pivot ${pivot} is now at its permanent sorted position. Everything to the left (${arr.slice(low, finalPivotIndex).join(', ') || 'empty'}) < ${pivot}, and everything to the right (${arr.slice(finalPivotIndex + 1, high + 1).join(', ') || 'empty'}) >= ${pivot}.`,
      algorithmLine: 10,
      codeLine: 12,
      variables: {
        pivotIndex: finalPivotIndex,
        pivotValue: pivot,
        leftPartition: arr.slice(low, finalPivotIndex).join(', '),
        rightPartition: arr.slice(finalPivotIndex + 1, high + 1).join(', '),
      },
      arrayState: [...arr],
      highlights: [finalPivotIndex],
      dataStructureState: {
        type: 'quick-sort',
        pivotIndex: finalPivotIndex,
        pivotValue: pivot,
        low,
        high,
        completedPivots: Array.from(completedPivots),
        recursionTree: JSON.parse(JSON.stringify(recursionTree)),
        phase: 'PIVOT_PLACED',
      },
      operation: 'PIVOT_PLACED',
    });

    const leftNode: QuickRecursionNode = {
      id: `node_${low}_${finalPivotIndex - 1}`,
      subarray: arr.slice(low, finalPivotIndex),
      low,
      high: finalPivotIndex - 1,
      status: 'active',
    };

    const rightNode: QuickRecursionNode = {
      id: `node_${finalPivotIndex + 1}_${high}`,
      subarray: arr.slice(finalPivotIndex + 1, high + 1),
      low: finalPivotIndex + 1,
      high,
      status: 'active',
    };

    parentNode.children = [leftNode, rightNode];

    // Recursively sort left
    quickSortHelper(low, finalPivotIndex - 1, leftNode);

    // Recursively sort right
    quickSortHelper(finalPivotIndex + 1, high, rightNode);
  }

  quickSortHelper(0, n - 1, recursionTree);

  steps.push({
    id: stepId++,
    title: 'Quick Sort Complete',
    description: `All partitions completed. Final sorted array: [${arr.join(', ')}].`,
    algorithmLine: 12,
    codeLine: 14,
    variables: { finalSorted: arr.join(', ') },
    arrayState: [...arr],
    highlights: Array.from({ length: n }, (_, i) => i),
    dataStructureState: {
      type: 'quick-sort',
      pivotIndex: null,
      low: 0,
      high: n - 1,
      completedPivots: Array.from({ length: n }, (_, i) => i),
      recursionTree: JSON.parse(JSON.stringify(recursionTree)),
      phase: 'COMPLETE',
    },
    operation: 'COMPLETE',
  });

  return steps;
}
