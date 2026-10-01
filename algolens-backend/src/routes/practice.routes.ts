import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase/supabase.service.js';
import { aiService } from '../services/ai/groq.service.js';

const router = Router();

export interface QuestionDefinition {
  id: string;
  algorithmId: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

const PRACTICE_QUESTIONS: QuestionDefinition[] = [
  // ===================== BEGINNER QUESTIONS =====================
  {
    id: 'q-merge-beg-1',
    algorithmId: 'merge-sort',
    level: 'Beginner',
    title: 'Merge Sort: Base Case',
    question: 'In Merge Sort, when does the recursive division of an array segment stop?',
    options: [
      { id: 'a', text: 'When the subarray has 0 or 1 element', isCorrect: true },
      { id: 'b', text: 'When all elements are negative', isCorrect: false },
      { id: 'c', text: 'When the array length reaches 10', isCorrect: false },
      { id: 'd', text: 'Only after 100 recursive calls', isCorrect: false },
    ],
    explanation: 'A single element or empty subarray is inherently sorted, forming the foundational base case (left >= right).',
  },
  {
    id: 'q-binary-beg-1',
    algorithmId: 'binary-search',
    level: 'Beginner',
    title: 'Binary Search: Precondition',
    question: 'What crucial precondition must be satisfied before performing Binary Search on an array?',
    options: [
      { id: 'a', text: 'The array must be sorted in monotonic order', isCorrect: true },
      { id: 'b', text: 'The array length must be an even power of 2', isCorrect: false },
      { id: 'c', text: 'The elements must all be positive integers', isCorrect: false },
      { id: 'd', text: 'The array must have no duplicates', isCorrect: false },
    ],
    explanation: 'Binary Search relies on sorted order to eliminate half the search space with a single comparison at the midpoint.',
  },
  {
    id: 'q-avl-beg-1',
    algorithmId: 'avl',
    level: 'Beginner',
    title: 'AVL Tree: Balance Factor Definition',
    question: 'In an AVL Tree, what is the Balance Factor (BF) of a node defined as?',
    options: [
      { id: 'a', text: 'Height(Left Subtree) - Height(Right Subtree)', isCorrect: true },
      { id: 'b', text: 'Number of left nodes + number of right nodes', isCorrect: false },
      { id: 'c', text: 'The value of the root node divided by 2', isCorrect: false },
      { id: 'd', text: 'Depth of the deepest leaf node', isCorrect: false },
    ],
    explanation: 'Balance factor is calculated as height(left) - height(right) and must stay in {-1, 0, 1} for every node.',
  },
  {
    id: 'q-kmp-beg-1',
    algorithmId: 'kmp',
    level: 'Beginner',
    title: 'KMP: Primary Advantage',
    question: 'What is the primary advantage of the Knuth-Morris-Pratt (KMP) string matching algorithm over brute force search?',
    options: [
      { id: 'a', text: 'It never backtracks the main text pointer during scanning', isCorrect: true },
      { id: 'b', text: 'It sorts the characters before matching', isCorrect: false },
      { id: 'c', text: 'It compresses the text into binary format', isCorrect: false },
      { id: 'd', text: 'It uses 0 memory', isCorrect: false },
    ],
    explanation: 'KMP uses the LPS table to resume matching pattern characters without ever moving the text pointer backwards, achieving O(n + m) time.',
  },
  {
    id: 'q-counting-beg-1',
    algorithmId: 'counting-sort',
    level: 'Beginner',
    title: 'Counting Sort: Key Trait',
    question: 'Why is Counting Sort classified as a non-comparison sorting algorithm?',
    options: [
      { id: 'a', text: 'It counts element frequencies into buckets rather than comparing elements pairwise', isCorrect: true },
      { id: 'b', text: 'It requires a random number generator', isCorrect: false },
      { id: 'c', text: 'It only works on arrays of strings', isCorrect: false },
      { id: 'd', text: 'It executes in O(1) time', isCorrect: false },
    ],
    explanation: 'Counting sort bypasses the Omega(n log n) comparison lower bound by indexing element values directly into a frequency array.',
  },

  // ===================== INTERMEDIATE QUESTIONS =====================
  {
    id: 'q-merge-int-1',
    algorithmId: 'merge-sort',
    level: 'Intermediate',
    title: 'Merge Sort: Recursive Levels',
    question: 'Given an array of 8 elements, how many recursive division levels are performed before reaching 1-element subarrays?',
    options: [
      { id: 'a', text: '3 levels (log2(8))', isCorrect: true },
      { id: 'b', text: '4 levels', isCorrect: false },
      { id: 'c', text: '7 levels', isCorrect: false },
      { id: 'd', text: '8 levels', isCorrect: false },
    ],
    explanation: 'Merge sort repeatedly halves the array size until n=1. For 8 elements, 8 -> 4 -> 2 -> 1, which equals log2(8) = 3 levels.',
  },
  {
    id: 'q-binary-int-1',
    algorithmId: 'binary-search',
    level: 'Intermediate',
    title: 'Binary Search: Overflow Safe Midpoint',
    question: 'Why is floor(low + (high - low) / 2) preferred over floor((low + high) / 2) in systems programming?',
    options: [
      { id: 'a', text: 'It prevents integer overflow when low + high exceeds the maximum integer limit', isCorrect: true },
      { id: 'b', text: 'It runs twice as fast in assembly language', isCorrect: false },
      { id: 'c', text: 'It handles floating point precision errors', isCorrect: false },
      { id: 'd', text: 'It automatically sorts unsorted input', isCorrect: false },
    ],
    explanation: 'In 32-bit signed integers, low + high can overflow beyond 2^31 - 1, producing a negative number. low + (high - low)/2 is mathematically equivalent and overflow-safe.',
  },
  {
    id: 'q-avl-int-1',
    algorithmId: 'avl',
    level: 'Intermediate',
    title: 'AVL Tree: Rotation Identification',
    question: 'If you insert elements 30, then 10, then 20 sequentially into an empty AVL tree, which rotation is triggered to restore balance?',
    options: [
      { id: 'a', text: 'Right Rotation (LL)', isCorrect: false },
      { id: 'b', text: 'Left-Right Double Rotation (LR)', isCorrect: true },
      { id: 'c', text: 'Left Rotation (RR)', isCorrect: false },
      { id: 'd', text: 'Right-Left Double Rotation (RL)', isCorrect: false },
    ],
    explanation: '10 is in the left subtree of 30, and 20 is in the right subtree of 10. The balance factor of 30 becomes +2 with child balance -1, triggering an LR (Left-Right) rotation.',
  },
  {
    id: 'q-kmp-int-1',
    algorithmId: 'kmp',
    level: 'Intermediate',
    title: 'KMP: LPS State Transition',
    question: 'In KMP, when pattern pointer j = 4 experiences a character mismatch, what determines the new index to check next?',
    options: [
      { id: 'a', text: 'j = LPS[j - 1]', isCorrect: true },
      { id: 'b', text: 'j resets to index 0 always', isCorrect: false },
      { id: 'c', text: 'j increments to j + 1', isCorrect: false },
      { id: 'd', text: 'The text pointer i decrements by 4', isCorrect: false },
    ],
    explanation: 'On a mismatch after matching j characters, KMP knows the previous LPS[j-1] characters already match, so j moves directly to LPS[j-1].',
  },
  {
    id: 'q-counting-int-1',
    algorithmId: 'counting-sort',
    level: 'Intermediate',
    title: 'Counting Sort: Prefix Sum Invariant',
    question: 'Why does Counting Sort calculate cumulative prefix sums on the frequency count array?',
    options: [
      { id: 'a', text: 'To determine the exact end position of each element in the final sorted array and ensure stability', isCorrect: true },
      { id: 'b', text: 'To hash duplicate values', isCorrect: false },
      { id: 'c', text: 'To find the median element', isCorrect: false },
      { id: 'd', text: 'To encrypt array memory', isCorrect: false },
    ],
    explanation: 'The prefix sum at count[i] indicates the total number of elements <= i, directly specifying the index in the output array while traversing from right to left preserves stability.',
  },

  // ===================== ADVANCED QUESTIONS =====================
  {
    id: 'q-merge-adv-1',
    algorithmId: 'merge-sort',
    level: 'Advanced',
    title: 'Merge Sort: Memory Bandwidth & In-Place Cost',
    question: 'Standard Merge Sort requires O(n) auxiliary space. What is the time complexity consequence of strictly in-place merge sort without extra space?',
    options: [
      { id: 'a', text: 'In-place block merging degrades to O(n log^2 n) or higher constant factor overhead', isCorrect: true },
      { id: 'b', text: 'It remains O(n log n) with fewer CPU instructions', isCorrect: false },
      { id: 'c', text: 'It reduces time complexity to O(n)', isCorrect: false },
      { id: 'd', text: 'It eliminates the need for comparisons', isCorrect: false },
    ],
    explanation: 'Truly in-place merging requires intricate cyclic block swapping (e.g. Kronrod/Symmerge), increasing execution constant factors or degradation to O(n log^2 n).',
  },
  {
    id: 'q-avl-adv-1',
    algorithmId: 'avl',
    level: 'Advanced',
    title: 'AVL Tree: Worst-Case Fibonacci Height',
    question: 'What mathematical recurrence defines the minimum number of nodes N(h) in an AVL tree of height h?',
    options: [
      { id: 'a', text: 'N(h) = N(h - 1) + N(h - 2) + 1 (Fibonacci Tree)', isCorrect: true },
      { id: 'b', text: 'N(h) = 2^h - 1', isCorrect: false },
      { id: 'c', text: 'N(h) = h^2 + 1', isCorrect: false },
      { id: 'd', text: 'N(h) = 2 * N(h - 1)', isCorrect: false },
    ],
    explanation: 'The worst-case minimally populated AVL tree has one subtree of height h-1 and the other of height h-2. This yields a Fibonacci recurrence proving max height <= 1.44 log2(n).',
  },
  {
    id: 'q-kmp-adv-1',
    algorithmId: 'kmp',
    level: 'Advanced',
    title: 'KMP: Amortized Comparison Bound',
    question: 'Even though pattern pointer j can backtrack through the LPS table on a mismatch, why is the total number of comparisons across the entire search strictly bounded by 2n?',
    options: [
      { id: 'a', text: 'Each comparison either advances i or decreases j, and j can only decrease as many times as it was incremented', isCorrect: true },
      { id: 'b', text: 'The text length is capped at 256 bytes', isCorrect: false },
      { id: 'c', text: 'The CPU branch target buffer caches pattern characters', isCorrect: false },
      { id: 'd', text: 'LPS lookup requires 0 comparisons', isCorrect: false },
    ],
    explanation: 'By potential function / amortized analysis: j increases by at most 1 per text step (at most n increments). Therefore j can decrease at most n times, bounding total comparisons by 2n.',
  },
];

// Helper to extract userId from auth header
function getAuthUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.query.userId as string) || (req.body?.userId as string) || null;
}

// GET /api/practice/questions - Filtered by algorithm and/or user custom level
router.get('/questions', async (req: Request, res: Response) => {
  const algorithmId = req.query.algorithmId as string;
  let level = req.query.level as 'Beginner' | 'Intermediate' | 'Advanced' | undefined;
  const userId = getAuthUserId(req);

  // If level not explicitly passed in query, attempt to read from logged-in user's profile
  if (!level && userId) {
    try {
      const user = await supabaseService.getUser(userId);
      if (user?.skillLevel) {
        level = user.skillLevel;
      }
    } catch {}
  }

  let filtered = [...PRACTICE_QUESTIONS];

  if (algorithmId && algorithmId !== 'all') {
    filtered = filtered.filter((q) => q.algorithmId === algorithmId);
  }

  if (level) {
    const levelMatches = filtered.filter((q) => q.level === level);
    // If we have level-specific questions, use them, otherwise return full set
    if (levelMatches.length > 0) {
      filtered = levelMatches;
    }
  }

  res.json({
    success: true,
    data: filtered,
    userLevel: level || 'All',
  });
});

// GET or POST /api/practice/personalized - Generate AI question tailored to user level and learning gaps
router.all('/personalized', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. Please sign in to generate personalized questions.' },
    });
  }

  const algorithmId =
    (req.query.algorithmId as string) || (req.body?.algorithmId as string);

  try {
    const user = await supabaseService.getUser(userId);
    const summary = await supabaseService.getUserLearningSummary(userId);

    const customLevel: 'Beginner' | 'Intermediate' | 'Advanced' =
      (req.query.level as any) ||
      (req.body?.level as any) ||
      user?.skillLevel ||
      'Beginner';

    const question = await aiService.generatePersonalizedQuestion({
      userId,
      skillLevel: customLevel,
      algorithmId,
      completedAlgorithms: summary.completedAlgorithms,
      weakAlgorithms: summary.weakAlgorithms,
      recentErrors: summary.recentErrors,
    });

    res.json({
      success: true,
      data: question,
      studentContext: {
        skillLevel: customLevel,
        weakAlgorithms: summary.weakAlgorithms,
        masteryPercentage: summary.masteryPercentage,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/practice/attempt - Record attempt with user isolation and level tracking
router.post('/attempt', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required to submit quiz attempts.' },
    });
  }

  const {
    questionId,
    selectedOption,
    algorithmId,
    questionLevel,
    isCorrectOverride,
    explanationOverride,
  } = req.body;

  let question = PRACTICE_QUESTIONS.find((q) => q.id === questionId);
  let isCorrect = false;
  let explanation = '';
  let correctOptionId: string | undefined = undefined;

  if (question) {
    const selected = question.options.find((opt) => opt.id === selectedOption);
    isCorrect = selected?.isCorrect ?? false;
    explanation = question.explanation;
    correctOptionId = question.options.find((o) => o.isCorrect)?.id;
  } else if (typeof isCorrectOverride === 'boolean') {
    isCorrect = isCorrectOverride;
    explanation = explanationOverride || 'AI verified answer.';
  } else {
    return res.status(404).json({ success: false, error: { message: 'Question not found' } });
  }

  try {
    await supabaseService.recordPracticeAttempt({
      userId,
      algorithmId: question?.algorithmId || algorithmId || 'dsa-general',
      questionId,
      selectedOption,
      isCorrect,
    });

    res.json({
      success: true,
      data: {
        isCorrect,
        explanation,
        correctOptionId,
        questionLevel: question?.level || questionLevel || 'Intermediate',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
