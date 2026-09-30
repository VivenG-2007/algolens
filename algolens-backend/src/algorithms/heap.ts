import { ExecutionStep } from '../execution/types.js';

export interface HeapSerializedNode {
  index: number;
  value: number;
  leftIndex?: number;
  rightIndex?: number;
  parentIndex?: number;
}

export function executeHeapOperations(
  type: 'min-heap' | 'max-heap',
  initialValues: number[] = [45, 20, 14, 12, 31, 7, 11, 13, 7],
  operations: { type: 'insert' | 'extract' | 'delete'; value?: number; index?: number }[] = []
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const isMin = type === 'min-heap';
  const heap: number[] = [];
  let comparisonsCount = 0;
  let swapsCount = 0;

  function compare(a: number, b: number): boolean {
    comparisonsCount++;
    return isMin ? a < b : a > b;
  }

  function serializeTree(): HeapSerializedNode[] {
    return heap.map((val, idx) => ({
      index: idx,
      value: val,
      leftIndex: 2 * idx + 1 < heap.length ? 2 * idx + 1 : undefined,
      rightIndex: 2 * idx + 2 < heap.length ? 2 * idx + 2 : undefined,
      parentIndex: idx > 0 ? Math.floor((idx - 1) / 2) : undefined,
    }));
  }

  function getHeapHeight(): number {
    return heap.length === 0 ? 0 : Math.floor(Math.log2(heap.length)) + 1;
  }

  steps.push({
    id: stepId++,
    title: `Initialize ${isMin ? 'Min Heap' : 'Max Heap'}`,
    description: `Binary heap where every parent node is ${
      isMin ? '≤' : '≥'
    } its children. Represented as both dynamic Array and complete Binary Tree.`,
    algorithmLine: 1,
    codeLine: 1,
    dataStructure: 'HEAP',
    variables: { heapType: type, size: 0, height: 0 },
    arrayState: [],
    dataStructureState: {
      type: 'binary-heap',
      heapType: type,
      array: [],
      tree: [],
    },
    operation: 'INIT_HEAP',
    complexity: { time: 'O(log n) per op', space: 'O(n)' },
    operationStats: { comparisons: 0, swaps: 0, treeHeight: 0 },
  });

  function siftUp(index: number) {
    let curr = index;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      const isPriorityHigher = compare(heap[curr], heap[parent]);

      steps.push({
        id: stepId++,
        title: `Compare heap[${curr}] (${heap[curr]}) with Parent heap[${parent}] (${heap[parent]})`,
        description: `Parent index formula: floor((${curr} - 1) / 2) = ${parent}. Condition (${heap[curr]} ${
          isMin ? '<' : '>'
        } ${heap[parent]}): ${isPriorityHigher ? 'VIOLATED (Swap needed)' : 'SATISFIED'}.`,
        algorithmLine: 6,
        codeLine: 8,
        dataStructure: 'HEAP',
        variables: {
          currentIdx: curr,
          parentIdx: parent,
          currentVal: heap[curr],
          parentVal: heap[parent],
        },
        arrayState: [...heap],
        highlights: [curr, parent],
        dataStructureState: {
          type: 'binary-heap',
          heapType: type,
          array: [...heap],
          tree: serializeTree(),
          activeIndices: [curr, parent],
        },
        comparisons: {
          left: heap[curr],
          right: heap[parent],
          result: `${heap[curr]} ${isMin ? '<' : '>'} ${heap[parent]} is ${isPriorityHigher}`,
        },
        operation: 'SIFT_UP_COMPARE',
        operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
        predictionChallenge: {
          question: `In a ${isMin ? 'Min' : 'Max'} Heap, does child ${heap[curr]} swap with parent ${heap[parent]}?`,
          options: [
            isPriorityHigher ? 'Yes, swap to restore heap invariant' : 'No, heap property already holds',
            !isPriorityHigher ? 'Yes, swap to restore heap invariant' : 'No, heap property already holds',
            'Delete the element',
            'Rotate tree left',
          ],
          correctIndex: 0,
          explanation: `A ${isMin ? 'Min' : 'Max'} Heap requires parent to be ${isMin ? '<=' : '>='} children.`,
        },
      });

      if (isPriorityHigher) {
        // Swap
        const temp = heap[curr];
        heap[curr] = heap[parent];
        heap[parent] = temp;
        swapsCount++;

        steps.push({
          id: stepId++,
          title: `Swap Indices ${curr} and ${parent}`,
          description: `Promoted ${temp} up the tree towards root. New position: index ${parent}.`,
          algorithmLine: 9,
          codeLine: 11,
          dataStructure: 'HEAP',
          variables: { swappedVal: temp, newPosition: parent },
          arrayState: [...heap],
          highlights: [parent],
          dataStructureState: {
            type: 'binary-heap',
            heapType: type,
            array: [...heap],
            tree: serializeTree(),
            activeIndices: [parent],
          },
          operation: 'SIFT_UP_SWAP',
          operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
        });

        curr = parent;
      } else {
        break;
      }
    }
  }

  function siftDown(index: number) {
    let curr = index;
    const length = heap.length;

    while (true) {
      let targetIdx = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < length && compare(heap[left], heap[targetIdx])) {
        targetIdx = left;
      }
      if (right < length && compare(heap[right], heap[targetIdx])) {
        targetIdx = right;
      }

      if (targetIdx !== curr) {
        const swapVal = heap[targetIdx];
        const currentVal = heap[curr];

        steps.push({
          id: stepId++,
          title: `Sift Down: Compare Parent ${currentVal} with Children (${heap[left] ?? 'N/A'}, ${heap[right] ?? 'N/A'})`,
          description: `Identified optimal swap child at index ${targetIdx} (Value = ${swapVal}).`,
          algorithmLine: 14,
          codeLine: 17,
          dataStructure: 'HEAP',
          variables: { curr, leftChild: left, rightChild: right, targetSwap: targetIdx },
          arrayState: [...heap],
          highlights: [curr, targetIdx],
          dataStructureState: {
            type: 'binary-heap',
            heapType: type,
            array: [...heap],
            tree: serializeTree(),
            activeIndices: [curr, targetIdx],
          },
          operation: 'SIFT_DOWN_COMPARE',
          operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
        });

        heap[curr] = swapVal;
        heap[targetIdx] = currentVal;
        swapsCount++;

        steps.push({
          id: stepId++,
          title: `Swapped Index ${curr} with Child Index ${targetIdx}`,
          description: `Demoted ${currentVal} down. Heapifying subtree.`,
          algorithmLine: 18,
          codeLine: 21,
          dataStructure: 'HEAP',
          variables: { curr: targetIdx },
          arrayState: [...heap],
          highlights: [targetIdx],
          dataStructureState: {
            type: 'binary-heap',
            heapType: type,
            array: [...heap],
            tree: serializeTree(),
            activeIndices: [targetIdx],
          },
          operation: 'SIFT_DOWN_SWAP',
          operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
        });

        curr = targetIdx;
      } else {
        break;
      }
    }
  }

  function insert(val: number) {
    heap.push(val);
    const insertIdx = heap.length - 1;

    steps.push({
      id: stepId++,
      title: `Insert Element ${val} at Array End (Index ${insertIdx})`,
      description: `Appended ${val} at index ${insertIdx}. Now bubbling up (sift-up) to maintain heap condition.`,
      algorithmLine: 3,
      codeLine: 4,
      dataStructure: 'HEAP',
      variables: { insertedVal: val, index: insertIdx, totalSize: heap.length },
      arrayState: [...heap],
      highlights: [insertIdx],
      dataStructureState: {
        type: 'binary-heap',
        heapType: type,
        array: [...heap],
        tree: serializeTree(),
        activeIndices: [insertIdx],
      },
      operation: 'HEAP_INSERT',
      operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
    });

    siftUp(insertIdx);
  }

  function extractRoot() {
    if (heap.length === 0) return;
    const rootVal = heap[0];
    const lastVal = heap.pop()!;

    if (heap.length === 0) {
      steps.push({
        id: stepId++,
        title: `Extracted Last Element ${rootVal}`,
        description: `Extracted only remaining element from heap. Heap is now empty.`,
        algorithmLine: 22,
        codeLine: 25,
        dataStructure: 'HEAP',
        variables: { extracted: rootVal, heapSize: 0 },
        arrayState: [],
        dataStructureState: {
          type: 'binary-heap',
          heapType: type,
          array: [],
          tree: [],
        },
        operation: 'EXTRACT_ROOT',
      });
      return;
    }

    heap[0] = lastVal;

    steps.push({
      id: stepId++,
      title: `Extract ${isMin ? 'Min' : 'Max'} Root (${rootVal}) & Replace with Last Leaf (${lastVal})`,
      description: `Removed root ${rootVal}. Moved element ${lastVal} from last position to root index 0. Now sifting down.`,
      algorithmLine: 24,
      codeLine: 27,
      dataStructure: 'HEAP',
      variables: { extracted: rootVal, movedToRoot: lastVal, newSize: heap.length },
      arrayState: [...heap],
      highlights: [0],
      dataStructureState: {
        type: 'binary-heap',
        heapType: type,
        array: [...heap],
        tree: serializeTree(),
        activeIndices: [0],
      },
      operation: 'EXTRACT_ROOT',
      operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
    });

    siftDown(0);
  }

  // Initial batch insert
  for (const v of initialValues) {
    insert(v);
  }

  // Optional user operations (e.g. extracts or additional inserts)
  if (operations.length > 0) {
    for (const op of operations) {
      if (op.type === 'insert' && typeof op.value === 'number') {
        insert(op.value);
      } else if (op.type === 'extract') {
        extractRoot();
      }
    }
  } else {
    // Default demo: Demonstrate extraction of root to prove extract operation
    extractRoot();
  }

  steps.push({
    id: stepId++,
    title: `${isMin ? 'Min' : 'Max'} Heap Operations Finished`,
    description: `Final valid heap state: [${heap.join(', ')}]. Height: ${getHeapHeight()}.`,
    algorithmLine: 28,
    codeLine: 32,
    dataStructure: 'HEAP',
    variables: { finalSize: heap.length, height: getHeapHeight() },
    arrayState: [...heap],
    dataStructureState: {
      type: 'binary-heap',
      heapType: type,
      array: [...heap],
      tree: serializeTree(),
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(log n)', space: 'O(n)' },
    operationStats: { comparisons: comparisonsCount, swaps: swapsCount, treeHeight: getHeapHeight() },
  });

  return steps;
}
