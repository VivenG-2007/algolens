import { executeMergeSort } from '../mergeSort.js';
import { executeBinarySearch } from '../binarySearch.js';
import { executeCountingSort } from '../countingSort.js';
import { executeKMP } from '../kmp.js';
import { executeAVL } from '../avl.js';

describe('AlgoLens Algorithm Execution Engines', () => {
  test('Merge Sort generates dynamic traces for different inputs', () => {
    const trace1 = executeMergeSort([64, 25, 12, 22, 11]);
    const trace2 = executeMergeSort([90, 10, 50, 30, 70]);

    expect(trace1.length).toBeGreaterThan(5);
    expect(trace2.length).toBeGreaterThan(5);

    // Final array state must be sorted
    const lastStep1 = trace1[trace1.length - 1];
    expect(lastStep1.arrayState).toEqual([11, 12, 22, 25, 64]);

    const lastStep2 = trace2[trace2.length - 1];
    expect(lastStep2.arrayState).toEqual([10, 30, 50, 70, 90]);

    // Traces must NOT be identical
    expect(trace1[1].description).not.toEqual(trace2[1].description);
  });

  test('Counting Sort properly counts frequencies and sorts', () => {
    const trace = executeCountingSort([4, 2, 2, 8, 3, 3, 1]);
    const finalStep = trace[trace.length - 1];
    expect(finalStep.arrayState).toEqual([1, 2, 2, 3, 3, 4, 8]);
  });

  test('Binary Search identifies target and rejects unsorted inputs', () => {
    const sortedTrace = executeBinarySearch([10, 20, 30, 40, 50, 60, 70], 60);
    const foundStep = sortedTrace.find((s) => s.operation === 'FOUND');
    expect(foundStep).toBeDefined();
    expect(foundStep?.variables.foundIndex).toBe(5);

    // Should reject unsorted input
    expect(() => {
      executeBinarySearch([40, 10, 50, 20], 20);
    }).toThrow('Binary Search requires a sorted array.');
  });

  test('KMP constructs LPS dynamically and detects all occurrences', () => {
    const trace = executeKMP('ABABDABACDABABCABAB', 'ABABCABAB');
    const matchStep = trace.find((s) => s.operation === 'MATCH_FOUND');
    expect(matchStep).toBeDefined();
    expect(matchStep?.variables.matchIndex).toBe(10);
  });

  test('AVL detects and executes LR and RR rotations', () => {
    // 30, 10, 20 triggers LR rotation
    const lrTrace = executeAVL([30, 10, 20]);
    const lrStep = lrTrace.find((s) => s.operation === 'ROTATION_LR');
    expect(lrStep).toBeDefined();

    // 10, 20, 30 triggers RR rotation
    const rrTrace = executeAVL([10, 20, 30]);
    const rrStep = rrTrace.find((s) => s.operation === 'ROTATION_RR');
    expect(rrStep).toBeDefined();
  });

  test('Upstash Cache Service buffers in L1 memory and tracks saved commands', async () => {
    const { cacheService } = await import('../../services/redis/cache.service.js');
    const testKey = cacheService.generateKey('test-sort', [1, 2, 3]);

    await cacheService.set(testKey, { sample: 'result' }, 60);

    // Immediate read should hit L1 buffer (0 IOPS)
    const cached = await cacheService.get<{ sample: string }>(testKey);
    expect(cached).toEqual({ sample: 'result' });

    const metrics = cacheService.getMetrics();
    expect(metrics.l1Hits).toBeGreaterThan(0);
    expect(metrics.commandsSaved).toBeGreaterThan(0);
    expect(metrics.iopsSavedPercentage).toBeGreaterThan(0);
  });
});
