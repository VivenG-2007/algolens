export type ExecutionStep = {
  id: number;
  title: string;
  description: string;
  algorithmLine: number;
  codeLine?: number;
  variables: Record<string, string | number | boolean>;
  arrayState?: number[];
  highlights?: number[];
  comparisons?: {
    left: number;
    right: number;
    result: string;
  };
  operation?: string;
  dataStructure?: 'AVL' | 'HEAP' | 'GRAPH' | 'TRIE' | 'ARRAY' | 'STRING';
  dataStructureState?: unknown;
  complexity?: {
    time?: string;
    space?: string;
  };
  operationStats?: {
    comparisons?: number;
    swaps?: number;
    rotations?: number;
    nodesVisited?: number;
    treeHeight?: number;
    pathDistance?: number;
  };
  predictionChallenge?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

export type ExecutionResult = {
  success: boolean;
  algorithm: string;
  input: unknown;
  steps: ExecutionStep[];
  metadata: {
    timeComplexity: string;
    spaceComplexity: string;
    totalSteps: number;
    version: string;
    actualStats?: {
      comparisons: number;
      swapsOrRotations: number;
      maxDepthOrHeight: number;
      nodesVisited?: number;
    };
  };
};

export type AlgorithmId =
  | 'merge-sort'
  | 'counting-sort'
  | 'linear-search'
  | 'binary-search'
  | 'fibonacci-search'
  | 'kmp'
  | 'avl'
  | 'bfs'
  | 'dfs'
  | 'dijkstra'
  | 'min-heap'
  | 'max-heap'
  | 'trie'
  | 'radix-sort'
  | 'bucket-sort'
  | 'interpolation-search'
  | 'shell-sort'
  | 'tree-sort'
  | 'quick-sort';

export interface AlgorithmMetadata {
  id: AlgorithmId;
  name: string;
  category: 'sorting' | 'searching' | 'string' | 'tree' | 'graph' | 'heap' | 'trie';
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  pseudocode: string[];
  sourceCode: {
    c?: string;
    cpp: string;
    typescript: string;
    python: string;
  };
}
