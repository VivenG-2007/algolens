import { ExecutionStep } from '../execution/types.js';

export function executeBucketSort(inputArray: number[], bucketCount = 5): ExecutionStep[] {
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

  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const isDecimal = arr.some((num) => !Number.isInteger(num)) || (minVal >= 0 && maxVal <= 1);

  // Compute bucket ranges
  const range = maxVal - minVal;
  const k = Math.min(bucketCount, Math.max(2, n));
  const bucketRanges: { label: string; min: number; max: number }[] = [];

  const interval = range === 0 ? 1 : range / k;
  for (let b = 0; b < k; b++) {
    const low = minVal + b * interval;
    const high = b === k - 1 ? maxVal : minVal + (b + 1) * interval;
    const label = isDecimal
      ? `${low.toFixed(2)}–${high.toFixed(2)}`
      : `${Math.floor(low)}–${Math.floor(high)}`;
    bucketRanges.push({ label, min: low, max: high });
  }

  const buckets: number[][] = Array.from({ length: k }, () => []);

  steps.push({
    id: stepId++,
    title: 'Initialize Bucket Sort Containers',
    description: `Created ${k} range buckets from min (${minVal}) to max (${maxVal}). Preparing to scatter elements into intervals.`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { totalElements: n, bucketCount: k, range },
    arrayState: [...arr],
    highlights: [],
    dataStructureState: {
      type: 'bucket-sort',
      bucketRanges,
      buckets: buckets.map((b) => [...b]),
      currentElement: null,
      currentBucketIndex: -1,
      phase: 'INIT',
    },
    operation: 'INIT_BUCKETS',
    complexity: { time: 'O(n + k)', space: 'O(n + k)' },
  });

  // Step 2: Distribute elements into buckets
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    let bIdx = range === 0 ? 0 : Math.floor(((val - minVal) / range) * (k - 1));
    if (bIdx >= k) bIdx = k - 1;
    if (bIdx < 0) bIdx = 0;

    buckets[bIdx].push(val);

    steps.push({
      id: stepId++,
      title: `Distribute: ${val} → Bucket ${bIdx}`,
      description: `Element ${val} falls into range ${bucketRanges[bIdx].label}. Moving into Bucket ${bIdx}.`,
      algorithmLine: 4,
      codeLine: 6,
      variables: { i, val, bucketIndex: bIdx, bucketRange: bucketRanges[bIdx].label },
      arrayState: [...arr],
      highlights: [i],
      dataStructureState: {
        type: 'bucket-sort',
        bucketRanges,
        buckets: buckets.map((b) => [...b]),
        currentElement: val,
        currentBucketIndex: bIdx,
        highlightedArrayIndex: i,
        phase: 'DISTRIBUTE',
      },
      operation: 'DISTRIBUTE_ITEM',
    });
  }

  // Step 3: Sort individual buckets
  for (let b = 0; b < k; b++) {
    if (buckets[b].length > 1) {
      const original = [...buckets[b]];
      // Insertion sort on bucket
      buckets[b].sort((x, y) => x - y);

      steps.push({
        id: stepId++,
        title: `Sort Bucket ${b} (${bucketRanges[b].label})`,
        description: `Sorted bucket ${b} using insertion sort: [${original.join(', ')}] → [${buckets[b].join(', ')}].`,
        algorithmLine: 8,
        codeLine: 10,
        variables: { bucketIndex: b, before: original.join(', '), after: buckets[b].join(', ') },
        arrayState: [...arr],
        dataStructureState: {
          type: 'bucket-sort',
          bucketRanges,
          buckets: buckets.map((bk) => [...bk]),
          currentElement: null,
          currentBucketIndex: b,
          phase: 'SORT_BUCKET',
        },
        operation: 'SORT_BUCKET',
      });
    }
  }

  // Step 4: Concatenate buckets
  const sorted: number[] = [];
  for (let b = 0; b < k; b++) {
    for (const val of buckets[b]) {
      sorted.push(val);
    }
  }

  steps.push({
    id: stepId++,
    title: 'Concatenate Buckets: B0 → B1 → ... → Bk',
    description: `Concatenated all buckets in order into the final sorted array: [${sorted.join(', ')}].`,
    algorithmLine: 11,
    codeLine: 13,
    variables: { sortedArray: sorted.join(', ') },
    arrayState: [...sorted],
    highlights: Array.from({ length: n }, (_, i) => i),
    dataStructureState: {
      type: 'bucket-sort',
      bucketRanges,
      buckets: buckets.map((b) => [...b]),
      currentElement: null,
      currentBucketIndex: -1,
      phase: 'CONCATENATE',
      sortedResult: [...sorted],
    },
    operation: 'MERGE_BUCKETS',
  });

  return steps;
}
