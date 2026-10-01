import { ExecutionStep } from '../execution/types.js';

interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  x?: number;
  y?: number;
}

export function executeTreeSort(inputArray: number[]): ExecutionStep[] {
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

  let root: BSTNode | null = null;
  let nodeCount = 0;

  steps.push({
    id: stepId++,
    title: 'Initialize Tree Sort',
    description: `Tree Sort works in two phases: 1) Insert all ${n} elements into a Binary Search Tree (BST). 2) Perform Inorder Traversal (Left → Root → Right) to produce sorted output.`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { totalElements: n },
    arrayState: [...arr],
    highlights: [],
    dataStructureState: {
      type: 'tree-sort',
      phase: 'INIT',
      tree: null,
      currentVisitingNode: null,
      sortedOutput: [],
    },
    operation: 'INIT',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
  });

  // Helper to serialize BST for frontend SVG rendering
  function serializeTree(node: BSTNode | null, depth = 0, x = 300, spread = 120): any {
    if (!node) return null;
    const y = 60 + depth * 70;
    return {
      id: node.id,
      value: node.value,
      x,
      y,
      left: serializeTree(node.left, depth + 1, x - spread, Math.max(30, spread * 0.55)),
      right: serializeTree(node.right, depth + 1, x + spread, Math.max(30, spread * 0.55)),
    };
  }

  // Phase 1: Insert each element into BST
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    const newNode: BSTNode = { id: `node_${nodeCount++}`, value: val, left: null, right: null };

    if (!root) {
      root = newNode;
      steps.push({
        id: stepId++,
        title: `Insert ${val} as Root of BST`,
        description: `Tree was empty. Created root node with value ${val}.`,
        algorithmLine: 3,
        codeLine: 4,
        variables: { element: val, role: 'Root' },
        arrayState: [...arr],
        highlights: [i],
        dataStructureState: {
          type: 'tree-sort',
          phase: 'INSERT',
          activeNodeId: newNode.id,
          tree: serializeTree(root),
          sortedOutput: [],
        },
        operation: 'INSERT_ROOT',
      });
    } else {
      let curr: BSTNode | null = root;
      let parent: BSTNode | null = null;
      let direction = '';

      while (curr) {
        parent = curr;
        if (val < curr.value) {
          steps.push({
            id: stepId++,
            title: `Compare: ${val} < ${curr.value} → Go LEFT`,
            description: `${val} is less than current node ${curr.value}. Traversing down left subtree.`,
            algorithmLine: 5,
            codeLine: 6,
            variables: { inserting: val, atNode: curr.value, direction: 'LEFT' },
            arrayState: [...arr],
            highlights: [i],
            comparisons: {
              left: val,
              right: curr.value,
              result: `${val} < ${curr.value} (Go Left)`,
            },
            dataStructureState: {
              type: 'tree-sort',
              phase: 'INSERT_COMPARE',
              activeNodeId: curr.id,
              tree: serializeTree(root),
              sortedOutput: [],
            },
            operation: 'COMPARE_LEFT',
          });
          direction = 'left';
          curr = curr.left;
        } else {
          steps.push({
            id: stepId++,
            title: `Compare: ${val} >= ${curr.value} → Go RIGHT`,
            description: `${val} is greater than or equal to current node ${curr.value}. Traversing down right subtree.`,
            algorithmLine: 7,
            codeLine: 8,
            variables: { inserting: val, atNode: curr.value, direction: 'RIGHT' },
            arrayState: [...arr],
            highlights: [i],
            comparisons: {
              left: val,
              right: curr.value,
              result: `${val} >= ${curr.value} (Go Right)`,
            },
            dataStructureState: {
              type: 'tree-sort',
              phase: 'INSERT_COMPARE',
              activeNodeId: curr.id,
              tree: serializeTree(root),
              sortedOutput: [],
            },
            operation: 'COMPARE_RIGHT',
          });
          direction = 'right';
          curr = curr.right;
        }
      }

      if (direction === 'left' && parent) {
        parent.left = newNode;
      } else if (direction === 'right' && parent) {
        parent.right = newNode;
      }

      steps.push({
        id: stepId++,
        title: `Attached ${val} to ${direction.toUpperCase()} of ${parent?.value}`,
        description: `Successfully inserted node ${val} into BST. Invariant maintained: left < parent <= right.`,
        algorithmLine: 9,
        codeLine: 10,
        variables: { inserted: val, parent: parent ? parent.value : 'none', direction },
        arrayState: [...arr],
        highlights: [i],
        dataStructureState: {
          type: 'tree-sort',
          phase: 'INSERT_NODE',
          activeNodeId: newNode.id,
          tree: serializeTree(root),
          sortedOutput: [],
        },
        operation: 'INSERT_COMPLETE',
      });
    }
  }

  // Phase 2: Inorder Traversal (Left -> Root -> Right)
  const sortedResult: number[] = [];

  steps.push({
    id: stepId++,
    title: 'Phase 2: Inorder Traversal (Left → Root → Right)',
    description: 'BST construction complete. Now initiating Inorder Traversal. Inorder visits left subtree, root, then right subtree, naturally producing sorted order!',
    algorithmLine: 11,
    codeLine: 13,
    variables: { phase: 'Inorder Traversal' },
    arrayState: [...arr],
    dataStructureState: {
      type: 'tree-sort',
      phase: 'TRAVERSAL_START',
      tree: serializeTree(root),
      sortedOutput: [],
    },
    operation: 'START_TRAVERSAL',
  });

  function inorder(node: BSTNode | null) {
    if (!node) return;
    inorder(node.left);

    sortedResult.push(node.value);

    steps.push({
      id: stepId++,
      title: `Visit Node [${node.value}] → Append to Output`,
      description: `Inorder cursor visited node ${node.value}. Output array now: [${sortedResult.join(', ')}].`,
      algorithmLine: 13,
      codeLine: 15,
      variables: {
        visitedNode: node.value,
        sortedSoFar: sortedResult.join(', '),
      },
      arrayState: [...sortedResult],
      dataStructureState: {
        type: 'tree-sort',
        phase: 'TRAVERSAL_VISIT',
        activeNodeId: node.id,
        tree: serializeTree(root),
        sortedOutput: [...sortedResult],
      },
      operation: 'VISIT_INORDER',
    });

    inorder(node.right);
  }

  inorder(root);

  steps.push({
    id: stepId++,
    title: 'Tree Sort Complete',
    description: `Inorder traversal finished. All ${n} elements extracted in ascending order: [${sortedResult.join(', ')}].`,
    algorithmLine: 16,
    codeLine: 18,
    variables: { finalSorted: sortedResult.join(', ') },
    arrayState: [...sortedResult],
    highlights: Array.from({ length: n }, (_, i) => i),
    dataStructureState: {
      type: 'tree-sort',
      phase: 'COMPLETE',
      tree: serializeTree(root),
      sortedOutput: [...sortedResult],
    },
    operation: 'COMPLETE',
  });

  return steps;
}
