import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Generate sample curve points for n = 1 to 20
  const nPoints = [1, 2, 4, 8, 12, 16, 20, 25, 30, 40, 50];
  const chartData = nPoints.map((n) => ({
    n,
    'O(1)': 1,
    'O(log n)': Number(Math.log2(n).toFixed(2)),
    'O(n)': n,
    'O(n log n)': Number((n * Math.log2(n)).toFixed(2)),
    'O(n^2)': n * n,
  }));

  const algorithmComparisons = [
    {
      algorithm: 'Binary Search',
      category: 'Searching',
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
    },
    {
      algorithm: 'Fibonacci Search',
      category: 'Searching',
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
    },
    {
      algorithm: 'Linear Search',
      category: 'Searching',
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
    },
    {
      algorithm: 'Merge Sort',
      category: 'Sorting',
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
    },
    {
      algorithm: 'Counting Sort',
      category: 'Sorting',
      best: 'O(n + k)',
      average: 'O(n + k)',
      worst: 'O(n + k)',
      space: 'O(k)',
    },
    {
      algorithm: 'KMP String Matching',
      category: 'String',
      best: 'O(n + m)',
      average: 'O(n + m)',
      worst: 'O(n + m)',
      space: 'O(m)',
    },
    {
      algorithm: 'AVL Tree Insert/Search',
      category: 'Tree',
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(n)',
    },
  ];

  res.json({
    success: true,
    data: {
      chartData,
      algorithmComparisons,
    },
  });
});

export default router;
