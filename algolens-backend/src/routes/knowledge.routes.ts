import { Router, Request, Response } from 'express';
import { knowledgeGraphService } from '../services/graph/knowledgeGraph.service.js';

const router = Router();

router.get('/graph', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const userId =
    (req.query.userId as string) ||
    (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  try {
    if (userId) {
      const personalized = await knowledgeGraphService.getUserPersonalizedGraph(userId);
      return res.json({
        success: true,
        data: personalized,
        personalized: true,
      });
    }

    const graphData = await knowledgeGraphService.getFullGraph();
    res.json({
      success: true,
      data: graphData,
      personalized: false,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/user-graph/:userId', async (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  try {
    const personalized = await knowledgeGraphService.getUserPersonalizedGraph(userId);
    res.json({
      success: true,
      data: personalized,
      personalized: true,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/related/:algorithm', async (req: Request, res: Response) => {
  const algoId = String(req.params.algorithm);
  try {
    const related = await knowledgeGraphService.getRelatedForAlgorithm(algoId);
    res.json({
      success: true,
      data: related,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
