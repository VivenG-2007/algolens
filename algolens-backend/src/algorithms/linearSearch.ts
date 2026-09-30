import { ExecutionStep } from '../execution/types.js';

export function executeLinearSearch(
  inputArray: number[],
  target: number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const n = inputArray.length;

  steps.push({
    id: stepId++,
    title: 'Initialize Linear Search',
    description: `Searching sequentially for target ${target} across ${n} items.`,
    algorithmLine: 1,
    codeLine: 1,
    variables: { i: 0, target, length: n },
    arrayState: [...inputArray],
    highlights: [],
    operation: 'INIT',
    complexity: { time: 'O(n)', space: 'O(1)' },
  });

  for (let i = 0; i < n; i++) {
    const val = inputArray[i];
    const isMatch = val === target;

    steps.push({
      id: stepId++,
      title: `Inspect Element at Index ${i} (Value = ${val})`,
      description: `Comparing array[${i}] = ${val} with target = ${target}. Result: ${
        isMatch ? 'MATCH' : 'NO MATCH'
      }.`,
      algorithmLine: 3,
      codeLine: 4,
      variables: { i, currentValue: val, target, isMatch },
      arrayState: [...inputArray],
      highlights: [i],
      comparisons: {
        left: val,
        right: target,
        result: isMatch ? 'EQUAL' : 'NOT_EQUAL',
      },
      operation: 'COMPARE',
    });

    if (isMatch) {
      steps.push({
        id: stepId++,
        title: `Target ${target} Found at Index ${i}!`,
        description: `Successfully located target ${target} at index ${i} after ${
          i + 1
        } comparison(s).`,
        algorithmLine: 5,
        codeLine: 6,
        variables: { i, target, found: true, foundIndex: i },
        arrayState: [...inputArray],
        highlights: [i],
        operation: 'FOUND',
        complexity: { time: `O(${i + 1})`, space: 'O(1)' },
      });
      return steps;
    }
  }

  steps.push({
    id: stepId++,
    title: `Target ${target} Not Found`,
    description: `Scanned all ${n} elements. Target ${target} is not present in the array.`,
    algorithmLine: 8,
    codeLine: 9,
    variables: { target, found: false, totalScanned: n },
    arrayState: [...inputArray],
    highlights: [],
    operation: 'NOT_FOUND',
    complexity: { time: 'O(n)', space: 'O(1)' },
  });

  return steps;
}
