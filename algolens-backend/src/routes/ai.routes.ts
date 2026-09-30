import { Router, Request, Response } from 'express';
import { aiService } from '../services/ai/groq.service.js';

const router = Router();

router.post('/explain', async (req: Request, res: Response) => {
  const { algorithm, currentStep, previousStep, nextStep, code, pseudocode, question } = req.body;

  if (!algorithm || !currentStep) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CONTEXT',
        message: 'algorithm and currentStep are required fields.',
      },
    });
  }

  try {
    const result = await aiService.explainStep({
      algorithm,
      currentStep,
      previousStep,
      nextStep,
      code,
      pseudocode,
      question,
    });

    res.json({
      success: true,
      explanation: result.explanation,
      source: result.source,
    });
  } catch (err: any) {
    console.error('[AI Tutor Error]:', err.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_ERROR',
        message: 'Unable to generate explanation at this time.',
      },
    });
  }
});

export default router;
