import { ExecutionStep } from '../execution/types.js';

export function executeInterpolationSearch(inputArray: number[], target: number): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const arr = [...inputArray].sort((a, b) => a - b);
  const n = arr.length;

  if (n === 0) {
    return [
      {
        id: stepId++,
        title: 'Empty Array',
        description: 'Input array is empty, target cannot be found.',
        algorithmLine: 1,
        codeLine: 1,
        variables: { target, length: 0 },
        arrayState: [],
        operation: 'NOT_FOUND',
      },
    ];
  }

  let low = 0;
  let high = n - 1;

  steps.push({
    id: stepId++,
    title: 'Initialize Interpolation Search',
    description: `Searching for target ${target} across sorted array of ${n} elements. Search interval [low=${low}, high=${high}].`,
    algorithmLine: 1,
    codeLine: 2,
    variables: { low, high, target, 'arr[low]': arr[low], 'arr[high]': arr[high] },
    arrayState: [...arr],
    highlights: [low, high],
    dataStructureState: {
      type: 'interpolation-search',
      low,
      high,
      target,
      pos: null,
      formulaExplanation: 'pos = low + floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]))',
      found: false,
    },
    operation: 'INIT',
    complexity: { time: 'O(log log n)', space: 'O(1)' },
  });

  let found = false;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      if (arr[low] === target) {
        steps.push({
          id: stepId++,
          title: `Match Found at Single Index ${low}!`,
          description: `arr[${low}] = ${arr[low]} matches target ${target}.`,
          algorithmLine: 12,
          codeLine: 14,
          variables: { pos: low, target, found: true },
          arrayState: [...arr],
          highlights: [low],
          dataStructureState: {
            type: 'interpolation-search',
            low,
            high,
            target,
            pos: low,
            calculatedPos: low,
            found: true,
          },
          operation: 'FOUND',
        });
        found = true;
      }
      break;
    }

    // Formula calculation
    const numerator = (target - arr[low]) * (high - low);
    const denominator = arr[high] - arr[low];
    const fraction = denominator === 0 ? 0 : numerator / denominator;
    const pos = low + Math.floor(fraction);

    const calculationStr = `pos = ${low} + floor(((${target} - ${arr[low]}) * (${high} - ${low})) / (${arr[high]} - ${arr[low]})) = ${pos}`;

    steps.push({
      id: stepId++,
      title: `Estimate Position: pos = ${pos}`,
      description: `Interpolation formula estimated target ${target} to be at index ${pos}. Calculation: ${calculationStr}.`,
      algorithmLine: 4,
      codeLine: 5,
      variables: {
        low,
        high,
        target,
        'arr[low]': arr[low],
        'arr[high]': arr[high],
        pos,
        calculation: calculationStr,
      },
      arrayState: [...arr],
      highlights: [pos],
      dataStructureState: {
        type: 'interpolation-search',
        low,
        high,
        target,
        pos,
        calculatedPos: pos,
        calculationStr,
        found: false,
      },
      operation: 'CALCULATE_POS',
    });

    // Check position
    if (arr[pos] === target) {
      steps.push({
        id: stepId++,
        title: `✓ Target Found at Index ${pos}!`,
        description: `arr[${pos}] (${arr[pos]}) == target (${target}). Element successfully located!`,
        algorithmLine: 7,
        codeLine: 8,
        variables: { pos, target, 'arr[pos]': arr[pos], found: true },
        arrayState: [...arr],
        highlights: [pos],
        dataStructureState: {
          type: 'interpolation-search',
          low,
          high,
          target,
          pos,
          found: true,
        },
        operation: 'FOUND',
      });
      found = true;
      break;
    }

    if (arr[pos] < target) {
      steps.push({
        id: stepId++,
        title: `arr[${pos}] (${arr[pos]}) < target (${target}) → Shrink Low`,
        description: `Target is greater than estimated value. Shifting low from ${low} to ${pos + 1}.`,
        algorithmLine: 9,
        codeLine: 10,
        variables: { oldLow: low, newLow: pos + 1, high, target },
        arrayState: [...arr],
        highlights: [pos],
        dataStructureState: {
          type: 'interpolation-search',
          low: pos + 1,
          high,
          target,
          pos,
          direction: 'RIGHT',
          found: false,
        },
        operation: 'SHRINK_RIGHT',
      });
      low = pos + 1;
    } else {
      steps.push({
        id: stepId++,
        title: `arr[${pos}] (${arr[pos]}) > target (${target}) → Shrink High`,
        description: `Target is smaller than estimated value. Shifting high from ${high} to ${pos - 1}.`,
        algorithmLine: 11,
        codeLine: 12,
        variables: { low, oldHigh: high, newHigh: pos - 1, target },
        arrayState: [...arr],
        highlights: [pos],
        dataStructureState: {
          type: 'interpolation-search',
          low,
          high: pos - 1,
          target,
          pos,
          direction: 'LEFT',
          found: false,
        },
        operation: 'SHRINK_LEFT',
      });
      high = pos - 1;
    }
  }

  if (!found) {
    steps.push({
      id: stepId++,
      title: `Target ${target} Not Found in Array`,
      description: `Search space exhausted [low=${low}, high=${high}]. Target does not exist in the array.`,
      algorithmLine: 14,
      codeLine: 16,
      variables: { target, low, high, found: false },
      arrayState: [...arr],
      highlights: [],
      dataStructureState: {
        type: 'interpolation-search',
        low,
        high,
        target,
        pos: null,
        found: false,
      },
      operation: 'NOT_FOUND',
    });
  }

  return steps;
}
