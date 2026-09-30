import { ExecutionStep } from '../execution/types.js';

export function executeKMP(text: string, pattern: string): ExecutionStep[] {
  if (!text || !pattern) {
    throw new Error('Both text and pattern must be non-empty strings.');
  }

  const steps: ExecutionStep[] = [];
  let stepId = 1;
  const n = text.length;
  const m = pattern.length;
  const lps: number[] = new Array(m).fill(0);

  steps.push({
    id: stepId++,
    title: 'Initialize Knuth-Morris-Pratt (KMP) Algorithm',
    description: `Preparing KMP Search. Text length: ${n}, Pattern length: ${m}. Step 1 will construct the LPS (Longest Prefix Suffix) table.`,
    algorithmLine: 1,
    codeLine: 1,
    variables: { textLength: n, patternLength: m },
    dataStructureState: {
      type: 'kmp',
      text,
      pattern,
      lps: [...lps],
      i: 0,
      j: 0,
      matches: [],
    },
    operation: 'INIT',
    complexity: { time: 'O(n + m)', space: 'O(m)' },
  });

  // LPS Table Generation Phase
  let len = 0;
  let idx = 1;

  steps.push({
    id: stepId++,
    title: 'Begin LPS Table Preprocessing',
    description: `LPS[0] is always 0 because a single character cannot have a proper prefix equal to suffix.`,
    algorithmLine: 3,
    codeLine: 4,
    variables: { len: 0, idx: 1, 'lps[0]': 0 },
    dataStructureState: {
      type: 'kmp',
      text,
      pattern,
      lps: [...lps],
      i: 0,
      j: 0,
      matches: [],
    },
    operation: 'LPS_INIT',
  });

  while (idx < m) {
    if (pattern[idx] === pattern[len]) {
      len++;
      lps[idx] = len;
      steps.push({
        id: stepId++,
        title: `LPS: pattern[${idx}] ('${pattern[idx]}') == pattern[${len - 1}] ('${pattern[len - 1]}')`,
        description: `Prefix-suffix matched! Extended length to ${len}. Set LPS[${idx}] = ${len}.`,
        algorithmLine: 6,
        codeLine: 7,
        variables: { idx, len, 'pattern[idx]': pattern[idx], 'pattern[len-1]': pattern[len - 1] },
        dataStructureState: {
          type: 'kmp',
          text,
          pattern,
          lps: [...lps],
          lpsUpdatedIndex: idx,
          i: 0,
          j: 0,
          matches: [],
        },
        operation: 'LPS_EXTEND',
      });
      idx++;
    } else {
      if (len !== 0) {
        const oldLen = len;
        len = lps[len - 1];
        steps.push({
          id: stepId++,
          title: `LPS: Mismatch pattern[${idx}] ('${pattern[idx]}') != pattern[${oldLen}] ('${pattern[oldLen]}')`,
          description: `Fall back length using LPS[${oldLen - 1}] = ${len}.`,
          algorithmLine: 9,
          codeLine: 10,
          variables: { idx, oldLen, newLen: len },
          dataStructureState: {
            type: 'kmp',
            text,
            pattern,
            lps: [...lps],
            i: 0,
            j: 0,
            matches: [],
          },
          operation: 'LPS_FALLBACK',
        });
      } else {
        lps[idx] = 0;
        steps.push({
          id: stepId++,
          title: `LPS: No Prefix Match for pattern[${idx}] ('${pattern[idx]}')`,
          description: `No prefix found. Set LPS[${idx}] = 0.`,
          algorithmLine: 12,
          codeLine: 12,
          variables: { idx, len: 0, 'lps[idx]': 0 },
          dataStructureState: {
            type: 'kmp',
            text,
            pattern,
            lps: [...lps],
            lpsUpdatedIndex: idx,
            i: 0,
            j: 0,
            matches: [],
          },
          operation: 'LPS_ZERO',
        });
        idx++;
      }
    }
  }

  steps.push({
    id: stepId++,
    title: 'LPS Table Preprocessing Complete',
    description: `Computed LPS array: [${lps.join(', ')}]. Now scanning Text with Pattern.`,
    algorithmLine: 14,
    codeLine: 15,
    variables: { completedLps: lps.join(', ') },
    dataStructureState: {
      type: 'kmp',
      text,
      pattern,
      lps: [...lps],
      i: 0,
      j: 0,
      matches: [],
    },
    operation: 'LPS_COMPLETE',
  });

  // String Matching Phase
  let i = 0; // index for text
  let j = 0; // index for pattern
  const matches: number[] = [];

  while (i < n) {
    const isCharMatch = text[i] === pattern[j];

    steps.push({
      id: stepId++,
      title: `Compare text[${i}] ('${text[i]}') and pattern[${j}] ('${pattern[j]}')`,
      description: `Comparing characters: '${text[i]}' and '${pattern[j]}'. Match: ${
        isCharMatch ? 'YES' : 'NO'
      }.`,
      algorithmLine: 16,
      codeLine: 18,
      variables: {
        i,
        j,
        'text[i]': text[i],
        'pattern[j]': pattern[j],
        match: isCharMatch,
      },
      highlights: [i],
      dataStructureState: {
        type: 'kmp',
        text,
        pattern,
        lps: [...lps],
        i,
        j,
        matches: [...matches],
        currentCharMatch: isCharMatch,
      },
      comparisons: {
        left: text.charCodeAt(i),
        right: pattern.charCodeAt(j),
        result: `'${text[i]}' ${isCharMatch ? '==' : '!='} '${pattern[j]}'`,
      },
      operation: 'COMPARE_CHAR',
    });

    if (isCharMatch) {
      i++;
      j++;
    }

    if (j === m) {
      const matchIndex = i - j;
      matches.push(matchIndex);

      steps.push({
        id: stepId++,
        title: `Pattern Found at Text Index ${matchIndex}!`,
        description: `Full pattern "${pattern}" successfully matched at text index ${matchIndex}. Utilizing LPS[${
          j - 1
        }] = ${lps[j - 1]} to continue searching.`,
        algorithmLine: 19,
        codeLine: 21,
        variables: {
          matchIndex,
          i,
          j,
          matchesCount: matches.length,
        },
        highlights: Array.from({ length: m }, (_, offset) => matchIndex + offset),
        dataStructureState: {
          type: 'kmp',
          text,
          pattern,
          lps: [...lps],
          i,
          j,
          matches: [...matches],
        },
        operation: 'MATCH_FOUND',
      });

      j = lps[j - 1];
    } else if (i < n && text[i] !== pattern[j]) {
      if (j !== 0) {
        const prevJ = j;
        j = lps[j - 1];
        steps.push({
          id: stepId++,
          title: `Mismatch at text[${i}]: Shift Pattern Using LPS`,
          description: `Mismatch between '${text[i]}' and '${pattern[prevJ]}'. Fast-forwarding pattern pointer: j = LPS[${
            prevJ - 1
          }] = ${j}. No redundant text re-scans!`,
          algorithmLine: 23,
          codeLine: 25,
          variables: { i, oldJ: prevJ, newJ: j },
          dataStructureState: {
            type: 'kmp',
            text,
            pattern,
            lps: [...lps],
            i,
            j,
            matches: [...matches],
          },
          operation: 'SHIFT_PATTERN',
        });
      } else {
        steps.push({
          id: stepId++,
          title: `Mismatch at Pattern Start: Advance Text Pointer`,
          description: `Mismatch with first character '${pattern[0]}'. Incrementing text index i to ${i + 1}.`,
          algorithmLine: 26,
          codeLine: 28,
          variables: { i: i + 1, j: 0 },
          dataStructureState: {
            type: 'kmp',
            text,
            pattern,
            lps: [...lps],
            i: i + 1,
            j: 0,
            matches: [...matches],
          },
          operation: 'ADVANCE_TEXT',
        });
        i++;
      }
    }
  }

  steps.push({
    id: stepId++,
    title: 'KMP Search Finished',
    description: `Completed search. Total matches found: ${matches.length} at indices [${matches.join(
      ', '
    )}].`,
    algorithmLine: 28,
    codeLine: 30,
    variables: { totalMatches: matches.length, matchPositions: matches.join(',') },
    dataStructureState: {
      type: 'kmp',
      text,
      pattern,
      lps: [...lps],
      i: n,
      j,
      matches: [...matches],
    },
    operation: 'COMPLETE',
    complexity: { time: 'O(n + m)', space: 'O(m)' },
  });

  return steps;
}
