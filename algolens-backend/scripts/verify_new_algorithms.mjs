import { AlgorithmEngine } from '../dist/execution/engine.js';

console.log('====================================================');
console.log('🧪 VERIFYING 6 NEW ALGORITHMS EXECUTION ENGINE');
console.log('====================================================\n');

// 1. Radix Sort
console.log('--- 1. Radix Sort Verification ---');
const radixInput = [170, 45, 75, 90, 802, 24, 2, 66];
const radixRes = AlgorithmEngine.execute('radix-sort', { input: radixInput });
console.log('Radix Sort success:', radixRes.success);
console.log('Total Steps:', radixRes.steps.length);
const radixLast = radixRes.steps[radixRes.steps.length - 1];
console.log('Final Sorted Array:', radixLast.arrayState);
const expectedRadix = [2, 24, 45, 66, 75, 90, 170, 802];
const radixMatches = JSON.stringify(radixLast.arrayState) === JSON.stringify(expectedRadix);
console.log('Matches expected sorted array:', radixMatches);
if (!radixMatches) throw new Error('Radix Sort failed sorted assertion');
console.log('✓ Radix Sort verification passed.\n');

// 2. Bucket Sort
console.log('--- 2. Bucket Sort Verification ---');
const bucketInput = [0.42, 0.32, 0.73, 0.25, 0.52, 0.38, 0.91];
const bucketRes = AlgorithmEngine.execute('bucket-sort', { input: bucketInput });
console.log('Bucket Sort success:', bucketRes.success);
console.log('Total Steps:', bucketRes.steps.length);
const bucketLast = bucketRes.steps[bucketRes.steps.length - 1];
const expectedBucket = [...bucketInput].sort((a, b) => a - b);
const bucketMatches = JSON.stringify(bucketLast.arrayState) === JSON.stringify(expectedBucket);
console.log('Final Sorted Array:', bucketLast.arrayState);
console.log('Matches expected sorted array:', bucketMatches);
if (!bucketMatches) throw new Error('Bucket Sort failed sorted assertion');
console.log('✓ Bucket Sort verification passed.\n');

// 3. Interpolation Search
console.log('--- 3. Interpolation Search Verification ---');
const interpInput = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const interpRes = AlgorithmEngine.execute('interpolation-search', { input: interpInput, target: 70 });
console.log('Interpolation Search success:', interpRes.success);
console.log('Total Steps:', interpRes.steps.length);
const interpLast = interpRes.steps[interpRes.steps.length - 1];
console.log('Found target:', interpLast.dataStructureState?.found);
console.log('Calculated pos:', interpLast.dataStructureState?.pos);
if (!interpLast.dataStructureState?.found || interpLast.dataStructureState?.pos !== 6) {
  throw new Error('Interpolation Search failed target index assertion');
}
console.log('✓ Interpolation Search verification passed.\n');

// 4. Shell Sort
console.log('--- 4. Shell Sort Verification ---');
const shellInput = [12, 34, 54, 2, 3];
const shellRes = AlgorithmEngine.execute('shell-sort', { input: shellInput });
console.log('Shell Sort success:', shellRes.success);
console.log('Total Steps:', shellRes.steps.length);
const shellLast = shellRes.steps[shellRes.steps.length - 1];
console.log('Final Sorted Array:', shellLast.arrayState);
const expectedShell = [2, 3, 12, 34, 54];
const shellMatches = JSON.stringify(shellLast.arrayState) === JSON.stringify(expectedShell);
if (!shellMatches) throw new Error('Shell Sort failed sorted assertion');
console.log('✓ Shell Sort verification passed.\n');

// 5. Tree Sort
console.log('--- 5. Tree Sort Verification ---');
const treeInput = [50, 30, 70, 20, 40, 60, 80];
const treeRes = AlgorithmEngine.execute('tree-sort', { input: treeInput });
console.log('Tree Sort success:', treeRes.success);
console.log('Total Steps:', treeRes.steps.length);
const treeLast = treeRes.steps[treeRes.steps.length - 1];
console.log('Final Sorted Output (Inorder):', treeLast.dataStructureState?.sortedOutput);
const expectedTree = [20, 30, 40, 50, 60, 70, 80];
const treeMatches = JSON.stringify(treeLast.dataStructureState?.sortedOutput) === JSON.stringify(expectedTree);
if (!treeMatches) throw new Error('Tree Sort failed sorted assertion');
console.log('✓ Tree Sort verification passed.\n');

// 6. Quick Sort
console.log('--- 6. Quick Sort Verification ---');
const quickInput = [8, 3, 1, 7, 0, 10, 2];
const quickRes = AlgorithmEngine.execute('quick-sort', { input: quickInput });
console.log('Quick Sort success:', quickRes.success);
console.log('Total Steps:', quickRes.steps.length);
const quickLast = quickRes.steps[quickRes.steps.length - 1];
console.log('Final Sorted Array:', quickLast.arrayState);
const expectedQuick = [0, 1, 2, 3, 7, 8, 10];
const quickMatches = JSON.stringify(quickLast.arrayState) === JSON.stringify(expectedQuick);
if (!quickMatches) throw new Error('Quick Sort failed sorted assertion');
console.log('Recursion Tree Root Subarray:', quickLast.dataStructureState?.recursionTree?.subarray);
console.log('✓ Quick Sort verification passed.\n');

console.log('====================================================');
console.log('🎉 ALL 6 NEW ALGORITHMS FULLY VERIFIED!');
console.log('====================================================');
