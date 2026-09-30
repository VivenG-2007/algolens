import { Router, Request, Response } from 'express';
import { AlgorithmEngine } from '../execution/engine.js';
import { AlgorithmId } from '../execution/types.js';
import { ALGORITHM_REGISTRY } from '../algorithms/metadata.js';
import { cacheService } from '../services/redis/cache.service.js';

const router = Router();

// GET /api/algorithms - List all supported algorithms
router.get('/', (req: Request, res: Response) => {
  const algorithms = Object.values(ALGORITHM_REGISTRY).map((algo) => ({
    id: algo.id,
    name: algo.name,
    category: algo.category,
    description: algo.description,
    timeComplexity: algo.timeComplexity,
    spaceComplexity: algo.spaceComplexity,
  }));

  res.json({
    success: true,
    data: algorithms,
  });
});

const ALIASES: Record<string, AlgorithmId> = {
  'avl-tree': 'avl',
  'heap': 'min-heap',
  'binary-heap': 'min-heap',
  'trie-tree': 'trie',
};

const resolveAlgoId = (id: string): AlgorithmId => {
  return ALIASES[id] || (id as AlgorithmId);
};

// GET /api/algorithms/:algorithm - Get single algorithm metadata and code
router.get('/:algorithm', (req: Request, res: Response) => {
  const algoId = resolveAlgoId(String(req.params.algorithm));
  const meta = ALGORITHM_REGISTRY[algoId];

  if (!meta) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Algorithm '${algoId}' not found.`,
      },
    });
  }

  res.json({
    success: true,
    data: meta,
  });
});

// POST /api/algorithms/:algorithm/execute - Execute dynamic user input
router.post('/:algorithm/execute', async (req: Request, res: Response) => {
  const algoId = resolveAlgoId(String(req.params.algorithm));

  if (!ALGORITHM_REGISTRY[algoId]) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ALGORITHM',
        message: `Algorithm '${algoId}' is not supported. Supported algorithms: ${Object.keys(
          ALGORITHM_REGISTRY
        ).join(', ')}`,
      },
    });
  }

  const payload = req.body;

  // Generate cache key based on algorithm + payload
  const cacheKey = cacheService.generateKey(algoId, payload, AlgorithmEngine.VERSION);

  try {
    // Check cache
    const cachedResult = await cacheService.get<any>(cacheKey);
    if (cachedResult) {
      return res.json({
        ...cachedResult,
        cached: true,
      });
    }

    // Execute real algorithm engine
    const result = AlgorithmEngine.execute(algoId, payload);

    // Save to cache (1 hour)
    await cacheService.set(cacheKey, result, 3600);

    return res.json({
      ...result,
      cached: false,
    });
  } catch (err: any) {
    console.error(`[Execution Error] ${algoId}:`, err.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: err.message || 'Failed to execute algorithm on provided input.',
      },
    });
  }
});

export default router;
