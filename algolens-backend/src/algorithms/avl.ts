import { ExecutionStep } from '../execution/types.js';

export interface AVLNodeSerialized {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  left: AVLNodeSerialized | null;
  right: AVLNodeSerialized | null;
}

class AVLNode {
  value: number;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;

  constructor(value: number) {
    this.value = value;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

function getHeight(node: AVLNode | null): number {
  return node ? node.height : 0;
}

function getBalance(node: AVLNode | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function serializeTree(node: AVLNode | null, prefix = 'root'): AVLNodeSerialized | null {
  if (!node) return null;
  return {
    id: `${prefix}_${node.value}`,
    value: node.value,
    height: node.height,
    balanceFactor: getBalance(node),
    left: serializeTree(node.left, `${prefix}_L`),
    right: serializeTree(node.right, `${prefix}_R`),
  };
}

function getMinValueNode(node: AVLNode): AVLNode {
  let current = node;
  while (current.left !== null) {
    current = current.left;
  }
  return current;
}

export function executeAVL(
  valuesToInsert: number[] = [30, 10, 20],
  valuesToDelete: number[] = []
): ExecutionStep[] {
  if (!valuesToInsert || valuesToInsert.length === 0) {
    throw new Error('Please provide at least one number to insert into AVL tree.');
  }

  const steps: ExecutionStep[] = [];
  let stepId = 1;
  let root: AVLNode | null = null;
  let rotationsCount = 0;
  let comparisonsCount = 0;

  steps.push({
    id: stepId++,
    title: 'Initialize AVL Self-Balancing Tree',
    description: `Preparing to insert ${valuesToInsert.length} values and delete ${valuesToDelete.length} values. Maintains balance factor BF ∈ {-1, 0, 1}.`,
    algorithmLine: 1,
    codeLine: 1,
    dataStructure: 'AVL',
    variables: { totalInsertions: valuesToInsert.length, totalDeletions: valuesToDelete.length },
    dataStructureState: {
      type: 'avl-tree',
      root: null,
      insertedValues: [],
    },
    operation: 'INIT_AVL',
    complexity: { time: 'O(log n) per op', space: 'O(n)' },
    operationStats: { comparisons: 0, rotations: 0, treeHeight: 0 },
  });

  function rightRotate(y: AVLNode): AVLNode {
    rotationsCount++;
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

    return x;
  }

  function leftRotate(x: AVLNode): AVLNode {
    rotationsCount++;
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;

    return y;
  }

  function rebalance(node: AVLNode, valHint?: number): AVLNode {
    node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
    const balance = getBalance(node);

    // Left Heavy (LL or LR)
    if (balance > 1) {
      const leftChildBf = getBalance(node.left);

      // LL Case
      if (leftChildBf >= 0) {
        steps.push({
          id: stepId++,
          title: `Left-Left (LL) Imbalance at Node ${node.value} (BF = ${balance})`,
          description: `Node ${node.value} is left-heavy with left-heavy child. Executing single Right Rotation.`,
          algorithmLine: 15,
          codeLine: 18,
          dataStructure: 'AVL',
          variables: { nodeValue: node.value, balanceFactor: balance, rotation: 'LL_ROTATE_RIGHT' },
          dataStructureState: {
            type: 'avl-tree',
            root: serializeTree(root),
            imbalancedNode: node.value,
            rotationType: 'LL',
          },
          operation: 'ROTATION_LL',
          operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
          predictionChallenge: {
            question: `Node ${node.value} has balance factor ${balance} and left child has BF ${leftChildBf}. What rotation occurs next?`,
            options: ['LL (Right Rotation)', 'RR (Left Rotation)', 'LR (Left-Right Double)', 'No Rotation'],
            correctIndex: 0,
            explanation: 'When parent BF > 1 and left child BF >= 0, a single Right Rotation (LL) restores balance.',
          },
        });
        return rightRotate(node);
      }

      // LR Case
      if (leftChildBf < 0) {
        steps.push({
          id: stepId++,
          title: `Left-Right (LR) Imbalance at Node ${node.value} (BF = ${balance})`,
          description: `Left child ${node.left!.value} is right-heavy. Left Rotate child, then Right Rotate node ${node.value}.`,
          algorithmLine: 21,
          codeLine: 26,
          dataStructure: 'AVL',
          variables: { nodeValue: node.value, balanceFactor: balance, rotation: 'LR_DOUBLE_ROTATION' },
          dataStructureState: {
            type: 'avl-tree',
            root: serializeTree(root),
            imbalancedNode: node.value,
            rotationType: 'LR',
          },
          operation: 'ROTATION_LR',
          operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
          predictionChallenge: {
            question: `Node ${node.value} has BF ${balance} and left child has BF ${leftChildBf}. What rotation occurs?`,
            options: ['LR (Left-Right Double Rotation)', 'LL (Right Rotation)', 'RR (Left Rotation)', 'RL (Right-Left Double)'],
            correctIndex: 0,
            explanation: 'When parent BF > 1 and left child BF < 0, an LR double rotation is necessary.',
          },
        });
        node.left = leftRotate(node.left!);
        return rightRotate(node);
      }
    }

    // Right Heavy (RR or RL)
    if (balance < -1) {
      const rightChildBf = getBalance(node.right);

      // RR Case
      if (rightChildBf <= 0) {
        steps.push({
          id: stepId++,
          title: `Right-Right (RR) Imbalance at Node ${node.value} (BF = ${balance})`,
          description: `Node ${node.value} is right-heavy with right-heavy child. Executing single Left Rotation.`,
          algorithmLine: 18,
          codeLine: 22,
          dataStructure: 'AVL',
          variables: { nodeValue: node.value, balanceFactor: balance, rotation: 'RR_ROTATE_LEFT' },
          dataStructureState: {
            type: 'avl-tree',
            root: serializeTree(root),
            imbalancedNode: node.value,
            rotationType: 'RR',
          },
          operation: 'ROTATION_RR',
          operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
          predictionChallenge: {
            question: `Node ${node.value} has balance factor ${balance} and right child has BF ${rightChildBf}. What rotation occurs next?`,
            options: ['RR (Left Rotation)', 'LL (Right Rotation)', 'RL (Right-Left Double)', 'No Rotation'],
            correctIndex: 0,
            explanation: 'When parent BF < -1 and right child BF <= 0, a single Left Rotation (RR) restores balance.',
          },
        });
        return leftRotate(node);
      }

      // RL Case
      if (rightChildBf > 0) {
        steps.push({
          id: stepId++,
          title: `Right-Left (RL) Imbalance at Node ${node.value} (BF = ${balance})`,
          description: `Right child ${node.right!.value} is left-heavy. Right Rotate child, then Left Rotate node ${node.value}.`,
          algorithmLine: 24,
          codeLine: 31,
          dataStructure: 'AVL',
          variables: { nodeValue: node.value, balanceFactor: balance, rotation: 'RL_DOUBLE_ROTATION' },
          dataStructureState: {
            type: 'avl-tree',
            root: serializeTree(root),
            imbalancedNode: node.value,
            rotationType: 'RL',
          },
          operation: 'ROTATION_RL',
          operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
          predictionChallenge: {
            question: `Node ${node.value} has BF ${balance} and right child has BF ${rightChildBf}. What rotation occurs?`,
            options: ['RL (Right-Left Double Rotation)', 'RR (Left Rotation)', 'LR (Left-Right Double)', 'LL (Right Rotation)'],
            correctIndex: 0,
            explanation: 'When parent BF < -1 and right child BF > 0, an RL double rotation restores balance.',
          },
        });
        node.right = rightRotate(node.right!);
        return leftRotate(node);
      }
    }

    return node;
  }

  function insert(node: AVLNode | null, val: number): AVLNode {
    if (!node) {
      return new AVLNode(val);
    }

    comparisonsCount++;
    if (val < node.value) {
      node.left = insert(node.left, val);
    } else if (val > node.value) {
      node.right = insert(node.right, val);
    } else {
      return node; // Duplicate
    }

    return rebalance(node, val);
  }

  function deleteNode(node: AVLNode | null, val: number): AVLNode | null {
    if (!node) return null;

    comparisonsCount++;
    if (val < node.value) {
      node.left = deleteNode(node.left, val);
    } else if (val > node.value) {
      node.right = deleteNode(node.right, val);
    } else {
      // Node found to delete!
      steps.push({
        id: stepId++,
        title: `Found Node ${val} for Deletion`,
        description: `Target node ${val} located. Assessing children (Left: ${node.left ? node.left.value : 'none'}, Right: ${node.right ? node.right.value : 'none'}).`,
        algorithmLine: 26,
        codeLine: 34,
        dataStructure: 'AVL',
        variables: { deletingValue: val, hasLeft: Boolean(node.left), hasRight: Boolean(node.right) },
        dataStructureState: {
          type: 'avl-tree',
          root: serializeTree(root),
          activeDeletingValue: val,
        },
        operation: 'DELETE_LOCATED',
      });

      // Case 1 & 2: Node with 0 or 1 child
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right;
        if (!temp) {
          // No child
          node = null;
        } else {
          // One child
          node = temp;
        }
      } else {
        // Case 3: Node with 2 children
        // Get in-order successor (smallest in right subtree)
        const successor = getMinValueNode(node.right);
        steps.push({
          id: stepId++,
          title: `Replace ${node.value} with In-order Successor ${successor.value}`,
          description: `Node has 2 children. Successor ${successor.value} (smallest in right subtree) replaces root value.`,
          algorithmLine: 29,
          codeLine: 39,
          dataStructure: 'AVL',
          variables: { replaced: node.value, successorValue: successor.value },
          dataStructureState: {
            type: 'avl-tree',
            root: serializeTree(root),
          },
          operation: 'SUCCESSOR_REPLACE',
        });

        node.value = successor.value;
        node.right = deleteNode(node.right, successor.value);
      }
    }

    if (!node) return null;
    return rebalance(node);
  }

  // 1. Process Insertions
  for (const val of valuesToInsert) {
    steps.push({
      id: stepId++,
      title: `Insert Value ${val}`,
      description: `Traversing BST path to insert ${val} and updating balance factors.`,
      algorithmLine: 4,
      codeLine: 6,
      dataStructure: 'AVL',
      variables: { currentVal: val },
      dataStructureState: {
        type: 'avl-tree',
        root: serializeTree(root),
        activeInsertingValue: val,
      },
      operation: 'INSERT_VAL',
      operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
    });

    root = insert(root, val);

    steps.push({
      id: stepId++,
      title: `Node ${val} Inserted & Subtree Balanced`,
      description: `Tree balanced. Root is ${root.value}, Height = ${root.height}, Balance Factor = ${getBalance(root)}.`,
      algorithmLine: 10,
      codeLine: 12,
      dataStructure: 'AVL',
      variables: { rootValue: root.value, treeHeight: root.height, rootBF: getBalance(root) },
      dataStructureState: {
        type: 'avl-tree',
        root: serializeTree(root),
      },
      operation: 'BALANCED',
      operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
    });
  }

  // 2. Process Deletions
  for (const delVal of valuesToDelete) {
    steps.push({
      id: stepId++,
      title: `Initiate Delete: Node ${delVal}`,
      description: `Starting deletion of node ${delVal} followed by recursive AVL rebalancing.`,
      algorithmLine: 25,
      codeLine: 33,
      dataStructure: 'AVL',
      variables: { targetDelete: delVal },
      dataStructureState: {
        type: 'avl-tree',
        root: serializeTree(root),
        activeDeletingValue: delVal,
      },
      operation: 'DELETE_START',
      operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
    });

    root = deleteNode(root, delVal);

    steps.push({
      id: stepId++,
      title: `Node ${delVal} Deleted & AVL Tree Rebalanced`,
      description: `Deletion complete. Rebalancing verified across all ancestor paths.`,
      algorithmLine: 31,
      codeLine: 43,
      dataStructure: 'AVL',
      variables: { deleted: delVal, newHeight: getHeight(root) },
      dataStructureState: {
        type: 'avl-tree',
        root: serializeTree(root),
      },
      operation: 'DELETE_COMPLETE',
      operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
    });
  }

  steps.push({
    id: stepId++,
    title: 'AVL Construction & Maintenance Finished',
    description: `All operations completed. Tree height: ${getHeight(root)}. Total rotations performed: ${rotationsCount}.`,
    algorithmLine: 33,
    codeLine: 46,
    dataStructure: 'AVL',
    variables: {
      finalRoot: root?.value ?? 'empty',
      finalHeight: getHeight(root),
      rotationsCount,
    },
    dataStructureState: {
      type: 'avl-tree',
      root: serializeTree(root),
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(log n)', space: 'O(n)' },
    operationStats: { comparisons: comparisonsCount, rotations: rotationsCount, treeHeight: getHeight(root) },
  });

  return steps;
}
