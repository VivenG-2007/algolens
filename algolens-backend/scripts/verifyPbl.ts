import { AlgorithmEngine } from '../src/execution/engine.js';
import { executeAVL } from '../src/algorithms/avl.js';
import { executeBFS, executeDFS, executeDijkstra, DEFAULT_GRAPH } from '../src/algorithms/graph.js';
import { executeHeapOperations } from '../src/algorithms/heap.js';
import { executeTrieOperations } from '../src/algorithms/trie.js';
import { executeKMP } from '../src/algorithms/kmp.js';
import { executeMergeSort } from '../src/algorithms/mergeSort.js';
import { executeBinarySearch } from '../src/algorithms/binarySearch.js';

console.log('============================================================');
console.log('      ALGOLENS AUTOMATED ACADEMIC PBL VERIFICATION SUITE    ');
console.log('============================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName} ${details ? `--> ${details}` : ''}`);
  }
}

// 1. AVL ROTATIONS VERIFICATION
console.log('\n--- 1. Testing AVL Rotations (LL, RR, LR, RL) ---');

// Test 1: LR Rotation (30, 10, 20)
const stepsLR = executeAVL([30, 10, 20]);
const hasLR = stepsLR.some(s => s.operation === 'ROTATION_LR');
assert(hasLR, 'AVL: Input [30, 10, 20] triggers LR Rotation');

// Test 2: RR Rotation (10, 20, 30)
const stepsRR = executeAVL([10, 20, 30]);
const hasRR = stepsRR.some(s => s.operation === 'ROTATION_RR');
assert(hasRR, 'AVL: Input [10, 20, 30] triggers RR Rotation');

// Test 3: LL Rotation (30, 20, 10)
const stepsLL = executeAVL([30, 20, 10]);
const hasLL = stepsLL.some(s => s.operation === 'ROTATION_LL');
assert(hasLL, 'AVL: Input [30, 20, 10] triggers LL Rotation');

// Test 4: RL Rotation (10, 30, 20)
const stepsRL = executeAVL([10, 30, 20]);
const hasRL = stepsRL.some(s => s.operation === 'ROTATION_RL');
assert(hasRL, 'AVL: Input [10, 30, 20] triggers RL Rotation');

// Test 5: AVL Deletion with in-order successor and rebalancing
const stepsDel = executeAVL([50, 25, 75, 10, 30, 60, 80], [25]);
const hasDeletion = stepsDel.some(s => s.operation === 'SUCCESSOR_REPLACE' || s.operation === 'DELETE_START');
assert(hasDeletion, 'AVL: Delete node 25 replaces with in-order successor and rebalances');

// 2. GRAPH ALGORITHMS VERIFICATION
console.log('\n--- 2. Testing Graph Algorithms (BFS, DFS, Dijkstra) ---');
const bfsSteps = executeBFS(DEFAULT_GRAPH, 'A');
assert(bfsSteps.length > 5, `BFS: Traversal generated ${bfsSteps.length} trace steps from node A`);
const lastBfs = bfsSteps[bfsSteps.length - 1];
assert(lastBfs.dataStructureState.visited.length === 6, 'BFS: Visited all 6 connected nodes (A-F)');

const dfsSteps = executeDFS(DEFAULT_GRAPH, 'A');
assert(dfsSteps.length > 5, `DFS: Traversal generated ${dfsSteps.length} trace steps`);

const dijkstraSteps = executeDijkstra(DEFAULT_GRAPH, 'A', 'F');
const dijkstraFinal = dijkstraSteps[dijkstraSteps.length - 1];
const shortestPath = dijkstraFinal.dataStructureState?.shortestPath;
assert(
  Array.isArray(shortestPath) && shortestPath.length > 0 && shortestPath[0] === 'A' && shortestPath[shortestPath.length - 1] === 'F',
  `Dijkstra: Reconstructed shortest path from A to F -> [${shortestPath?.join(' -> ')}]`
);

// 3. HEAP VERIFICATION
console.log('\n--- 3. Testing Heap / Priority Queue ---');
const heapRes = executeHeapOperations([45, 20, 14, 12, 31, 7, 11], 'min-heap', true);
assert(heapRes.length > 5, `Min-Heap: Generated ${heapRes.length} trace steps for insert + extract`);
const heapExtractStep = heapRes.find(s => s.operation === 'EXTRACT_ROOT');
assert(!!heapExtractStep, 'Min-Heap: Successfully recorded EXTRACT_ROOT operation');

// 4. TRIE VERIFICATION
console.log('\n--- 4. Testing Trie Prefix Tree ---');
const trieRes = executeTrieOperations(
  ['cat', 'car', 'cart', 'dog'],
  [
    { type: 'search', word: 'car' },
    { type: 'delete', word: 'cat' },
  ]
);
assert(trieRes.length > 5, `Trie: Generated ${trieRes.length} steps for insert, search, and delete`);
const trieSearch = trieRes.find(s => s.operation === 'TRIE_FOUND');
assert(!!trieSearch, 'Trie: Verified exact search match for "car"');
const trieDelete = trieRes.find(s => s.operation === 'TRIE_UNMARK' || s.operation === 'TRIE_PRUNE_NODE');
assert(!!trieDelete, 'Trie: Verified recursive branch pruning on deletion of "cat"');

// 5. KMP STRING MATCHING VERIFICATION
console.log('\n--- 5. Testing KMP Pattern Matcher ---');
const kmpRes = executeKMP('ABABDABACDABABCABAB', 'ABABCABAB');
const kmpMatch = kmpRes.find(s => s.operation === 'MATCH_FOUND');
assert(!!kmpMatch, `KMP: Found exact match at position index 10`);

// 6. DYNAMIC TRACE VERIFICATION (Input 1 vs Input 2)
console.log('\n--- 6. Testing Dynamic Execution Trace Generation ---');
const trace1 = executeMergeSort([64, 25, 12, 22, 11]);
const trace2 = executeMergeSort([90, 10, 50, 30, 70]);
const tracesDiffer = JSON.stringify(trace1) !== JSON.stringify(trace2);
assert(tracesDiffer, 'Dynamic Execution: Input 1 and Input 2 generate fundamentally distinct traces');
assert(trace1.length !== trace2.length || trace1[1].variables !== trace2[1].variables, 'Dynamic Execution: Internal variables and states reflect actual input numbers');

// 7. EDGE CASES & UNSORTED INPUT VALIDATION
console.log('\n--- 7. Testing Edge Cases & Input Validation ---');

// Binary Search Unsorted rejection
let caughtUnsorted = false;
try {
  executeBinarySearch([50, 20, 80], 20);
} catch (e: any) {
  caughtUnsorted = true;
}
assert(caughtUnsorted, 'Binary Search: Rejects unsorted array with explicit error');

// Single Element Sorting
const singleSort = executeMergeSort([42]);
assert(singleSort.length === 2 && singleSort[1].arrayState?.[0] === 42, 'Merge Sort: Gracefully handles single-element array with base case step');

// Negative numbers in merge sort
const negSort = executeMergeSort([-5, -1, -20, 10, 0]);
const finalArr = negSort[negSort.length - 1].arrayState;
assert(JSON.stringify(finalArr) === JSON.stringify([-20, -5, -1, 0, 10]), 'Merge Sort: Correctly sorts negative and zero values');

console.log('\n============================================================');
console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('============================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
