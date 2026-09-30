import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase/supabase.service.js';
import { aiService } from '../services/ai/groq.service.js';

const router = Router();

const PRACTICE_QUESTIONS = [
  {
    id: 'q-merge-1',
    algorithmId: 'merge-sort',
    title: 'Merge Sort Complexity & Subarrays',
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
    id: 'q-binary-1',
    algorithmId: 'binary-search',
    title: 'Binary Search Midpoint Invariant',
    question: 'In Binary Search, if low = 3 and high = 7, what is the midpoint index calculated with floor(low + (high - low) / 2)?',
    options: [
      { id: 'a', text: '4', isCorrect: false },
      { id: 'b', text: '5', isCorrect: true },
      { id: 'c', text: '6', isCorrect: false },
      { id: 'd', text: '3', isCorrect: false },
    ],
    explanation: 'low + (high - low)/2 = 3 + (7 - 3)/2 = 3 + 2 = 5.',
  },
  {
    id: 'q-avl-1',
    algorithmId: 'avl',
    title: 'AVL Tree Rotation Identification',
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
    id: 'q-kmp-1',
    algorithmId: 'kmp',
    title: 'KMP LPS Table Function',
    question: 'What does the LPS table in the Knuth-Morris-Pratt algorithm represent?',
    options: [
      { id: 'a', text: 'Length of the Longest Proper Prefix which is also a Suffix for each prefix of the pattern', isCorrect: true },
      { id: 'b', text: 'Total number of occurrences of each letter in the text', isCorrect: false },
      { id: 'c', text: 'Hash code of the pattern substring', isCorrect: false },
      { id: 'd', text: 'The sorted permutation index of characters', isCorrect: false },
    ],
    explanation: 'LPS stands for Longest Proper Prefix which is also Suffix. It allows KMP to determine how far the pattern pointer can jump after a character mismatch without rolling back the text pointer.',
  },
  {
    id: 'q-counting-1',
    algorithmId: 'counting-sort',
    title: 'Counting Sort Prefix Sums',
    question: 'Why does Counting Sort calculate cumulative prefix sums on the frequency count array?',
    options: [
      { id: 'a', text: 'To encrypt the values for safety', isCorrect: false },
      { id: 'b', text: 'To determine the exact end position of each element in the final sorted array', isCorrect: true },
      { id: 'c', text: 'To find the median element', isCorrect: false },
      { id: 'd', text: 'To eliminate duplicates', isCorrect: false },
    ],
    explanation: 'The prefix sum at count[i] indicates the total number of elements <= i, directly specifying where the element should be placed in the output array while preserving stability.',
  },
];

router.get('/questions', (req: Request, res: Response) => {
  const algorithmId = req.query.algorithmId as string;
  if (algorithmId) {
    const filtered = PRACTICE_QUESTIONS.filter((q) => q.algorithmId === algorithmId);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: PRACTICE_QUESTIONS });
});

// GET or POST /api/practice/personalized - Generate AI question tailored to user learning gaps
router.all('/personalized', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const userId =
    (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) ||
    (req.query.userId as string) ||
    (req.body?.userId as string) ||
    'demo_student';

  const algorithmId =
    (req.query.algorithmId as string) || (req.body?.algorithmId as string);

  try {
    const summary = await supabaseService.getUserLearningSummary(userId);

    const question = await aiService.generatePersonalizedQuestion({
      userId,
      algorithmId,
      completedAlgorithms: summary.completedAlgorithms,
      weakAlgorithms: summary.weakAlgorithms,
      recentErrors: summary.recentErrors,
    });

    res.json({
      success: true,
      data: question,
      studentContext: {
        weakAlgorithms: summary.weakAlgorithms,
        masteryPercentage: summary.masteryPercentage,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/attempt', async (req: Request, res: Response) => {
  const {
    questionId,
    selectedOption,
    userId = 'student_demo_user',
    algorithmId,
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
    // Dynamically generated AI question
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
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
