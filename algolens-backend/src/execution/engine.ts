import { ExecutionResult, AlgorithmId } from './types.js';
import { executeMergeSort } from '../algorithms/mergeSort.js';
import { executeCountingSort } from '../algorithms/countingSort.js';
import { executeLinearSearch } from '../algorithms/linearSearch.js';
import { executeBinarySearch } from '../algorithms/binarySearch.js';
import { executeFibonacciSearch } from '../algorithms/fibonacciSearch.js';
import { executeKMP } from '../algorithms/kmp.js';
import { executeAVL } from '../algorithms/avl.js';
import { executeBFS, executeDFS, executeDijkstra, DEFAULT_GRAPH } from '../algorithms/graph.js';
import { executeHeapOperations } from '../algorithms/heap.js';
import { executeTrieOperations } from '../algorithms/trie.js';
import { ALGORITHM_REGISTRY } from '../algorithms/metadata.js';

export class AlgorithmEngine {
  public static readonly VERSION = 'v2.1.0';

  /**
   * Purely stateless algorithm execution dispatcher.
   * Safe for concurrent execution across 100+ simultaneous requests.
   */
  public static execute(
    algorithm: AlgorithmId,
    payload: {
      input?: number[];
      elements?: number[];
      extract?: boolean;
      target?: number;
      text?: string;
      pattern?: string;
      values?: number[];
      deleteValues?: number[];
      deletions?: number[];
      graph?: any;
      startNode?: string;
      targetNode?: string;
      operations?: any[];
      words?: string[];
      queries?: any[];
      search?: string;
      deleteWord?: string;
    }
  ): ExecutionResult {
    const meta = ALGORITHM_REGISTRY[algorithm];
    if (!meta) {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    switch (algorithm) {
      case 'merge-sort': {
        const arr = payload.input;
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('Merge Sort requires a non-empty array of numbers.');
        }
        if (arr.length > 100) {
          throw new Error('Input size exceeds maximum limit of 100 elements.');
        }
        const steps = executeMergeSort(arr);
        return {
          success: true,
          algorithm,
          input: arr,
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: steps.filter((s) => s.comparisons).length,
              swapsOrRotations: steps.filter((s) => s.operation === 'ASSIGN').length,
              maxDepthOrHeight: Math.floor(Math.log2(arr.length)) + 1,
            },
          },
        };
      }

      case 'counting-sort': {
        const arr = payload.input;
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('Counting Sort requires a non-empty array of numbers.');
        }
        if (arr.length > 100) {
          throw new Error('Input size exceeds maximum limit of 100 elements.');
        }
        for (const num of arr) {
          if (!Number.isInteger(num)) {
            throw new Error('Counting Sort requires integer numbers.');
          }
        }
        const minVal = Math.min(...arr);
        const maxVal = Math.max(...arr);
        if (maxVal - minVal > 1000) {
          throw new Error('Value range exceeds safe limit (max - min must be <= 1000).');
        }
        const steps = executeCountingSort(arr);
        return {
          success: true,
          algorithm,
          input: arr,
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: 0,
              swapsOrRotations: arr.length,
              maxDepthOrHeight: 1,
            },
          },
        };
      }

      case 'linear-search': {
        const arr = payload.input;
        const target = payload.target;
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('Linear Search requires a non-empty array of numbers.');
        }
        if (typeof target !== 'number' || isNaN(target)) {
          throw new Error('Linear Search requires a valid numeric target.');
        }
        if (arr.length > 500) {
          throw new Error('Input size exceeds maximum limit of 500 elements.');
        }
        const steps = executeLinearSearch(arr, target);
        return {
          success: true,
          algorithm,
          input: { array: arr, target },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: steps.filter((s) => s.comparisons).length,
              swapsOrRotations: 0,
              maxDepthOrHeight: 1,
            },
          },
        };
      }

      case 'binary-search': {
        const arr = payload.input;
        const target = payload.target;
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('Binary Search requires a non-empty array of numbers.');
        }
        if (typeof target !== 'number' || isNaN(target)) {
          throw new Error('Binary Search requires a valid numeric target.');
        }
        if (arr.length > 500) {
          throw new Error('Input size exceeds maximum limit of 500 elements.');
        }
        const steps = executeBinarySearch(arr, target);
        return {
          success: true,
          algorithm,
          input: { array: arr, target },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: steps.filter((s) => s.comparisons).length,
              swapsOrRotations: 0,
              maxDepthOrHeight: Math.floor(Math.log2(arr.length)) + 1,
            },
          },
        };
      }

      case 'fibonacci-search': {
        const arr = payload.input;
        const target = payload.target;
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('Fibonacci Search requires a non-empty array of numbers.');
        }
        if (typeof target !== 'number' || isNaN(target)) {
          throw new Error('Fibonacci Search requires a valid numeric target.');
        }
        if (arr.length > 500) {
          throw new Error('Input size exceeds maximum limit of 500 elements.');
        }
        const steps = executeFibonacciSearch(arr, target);
        return {
          success: true,
          algorithm,
          input: { array: arr, target },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: steps.filter((s) => s.comparisons).length,
              swapsOrRotations: 0,
              maxDepthOrHeight: Math.floor(Math.log2(arr.length)) + 1,
            },
          },
        };
      }

      case 'kmp': {
        const text = payload.text;
        const pattern = payload.pattern;
        if (typeof text !== 'string' || typeof pattern !== 'string') {
          throw new Error('KMP requires valid string text and pattern.');
        }
        if (text.length === 0 || pattern.length === 0) {
          throw new Error('Text and pattern must be non-empty.');
        }
        if (text.length > 2000) {
          throw new Error('Text exceeds maximum limit of 2,000 characters.');
        }
        if (pattern.length > 500) {
          throw new Error('Pattern exceeds maximum limit of 500 characters.');
        }
        const steps = executeKMP(text, pattern);
        return {
          success: true,
          algorithm,
          input: { text, pattern },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: steps.filter((s) => s.comparisons).length,
              swapsOrRotations: 0,
              maxDepthOrHeight: 1,
            },
          },
        };
      }

      case 'avl': {
        const values = payload.values || payload.input || [30, 10, 20];
        const deleteValues = payload.deleteValues || payload.deletions || [];
        if (!Array.isArray(values) || values.length === 0) {
          throw new Error('AVL Tree requires an array of numeric values to insert.');
        }
        if (values.length > 100) {
          throw new Error('AVL Tree insertion limit is 100 values.');
        }
        const steps = executeAVL(values, deleteValues);
        const lastStep = steps[steps.length - 1];
        return {
          success: true,
          algorithm,
          input: { values, deleteValues },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: lastStep.operationStats?.comparisons || 0,
              swapsOrRotations: lastStep.operationStats?.rotations || 0,
              maxDepthOrHeight: lastStep.operationStats?.treeHeight || 0,
            },
          },
        };
      }

      case 'bfs': {
        const graph = payload.graph || DEFAULT_GRAPH;
        const startNode = payload.startNode || 'A';
        const targetNode = payload.targetNode;
        const steps = executeBFS(graph, startNode, targetNode);
        const lastStep = steps[steps.length - 1];
        return {
          success: true,
          algorithm,
          input: { graph, startNode, targetNode },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: lastStep.operationStats?.comparisons || 0,
              swapsOrRotations: 0,
              maxDepthOrHeight: graph.nodes.length,
              nodesVisited: lastStep.operationStats?.nodesVisited || 0,
            },
          },
        };
      }

      case 'dfs': {
        const graph = payload.graph || DEFAULT_GRAPH;
        const startNode = payload.startNode || 'A';
        const targetNode = payload.targetNode;
        const steps = executeDFS(graph, startNode, targetNode);
        const lastStep = steps[steps.length - 1];
        return {
          success: true,
          algorithm,
          input: { graph, startNode, targetNode },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: lastStep.operationStats?.comparisons || 0,
              swapsOrRotations: 0,
              maxDepthOrHeight: graph.nodes.length,
              nodesVisited: lastStep.operationStats?.nodesVisited || 0,
            },
          },
        };
      }

      case 'dijkstra': {
        const graph = payload.graph || DEFAULT_GRAPH;
        const startNode = payload.startNode || 'A';
        const targetNode = payload.targetNode || 'F';
        const steps = executeDijkstra(graph, startNode, targetNode);
        const lastStep = steps[steps.length - 1];
        return {
          success: true,
          algorithm,
          input: { graph, startNode, targetNode },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: lastStep.operationStats?.comparisons || 0,
              swapsOrRotations: 0,
              maxDepthOrHeight: graph.nodes.length,
              nodesVisited: lastStep.operationStats?.nodesVisited || 0,
            },
          },
        };
      }

      case 'min-heap':
      case 'max-heap': {
        const values = payload.input || payload.elements || payload.values || [45, 20, 14, 12, 31, 7, 11, 13, 7];
        const operations = payload.operations || (payload.extract ? [{ type: 'extract' }] : []);
        const steps = executeHeapOperations(algorithm, values, operations);
        const lastStep = steps[steps.length - 1];
        return {
          success: true,
          algorithm,
          input: { values, operations },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: lastStep.operationStats?.comparisons || 0,
              swapsOrRotations: lastStep.operationStats?.swaps || 0,
              maxDepthOrHeight: lastStep.operationStats?.treeHeight || 0,
            },
          },
        };
      }

      case 'trie': {
        const words = payload.words || ['cat', 'car', 'cart', 'dog'];
        let queries = payload.queries;
        if (!queries || !Array.isArray(queries) || queries.length === 0) {
          queries = [];
          if (payload.search) queries.push({ type: 'search', word: payload.search });
          if (payload.deleteWord) queries.push({ type: 'delete', word: payload.deleteWord });
          if (queries.length === 0) {
            queries = [
              { type: 'search', word: 'car' },
              { type: 'delete', word: 'cat' },
            ];
          }
        }
        const steps = executeTrieOperations(words, queries);
        const lastStep = steps[steps.length - 1];
        return {
          success: true,
          algorithm,
          input: { words, queries },
          steps,
          metadata: {
            timeComplexity: meta.timeComplexity.average,
            spaceComplexity: meta.spaceComplexity,
            totalSteps: steps.length,
            version: this.VERSION,
            actualStats: {
              comparisons: lastStep.operationStats?.comparisons || 0,
              swapsOrRotations: 0,
              maxDepthOrHeight: Math.max(...words.map((w) => w.length), 1),
            },
          },
        };
      }

      default:
        throw new Error(`Algorithm ${algorithm} is not supported.`);
    }
  }
}
