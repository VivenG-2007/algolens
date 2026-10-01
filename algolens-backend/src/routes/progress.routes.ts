import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase/supabase.service.js';

const router = Router();

// Middleware to extract user ID strictly from auth header or user query
function getUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.query.userId as string) || (req.body?.userId as string) || null;
}

router.get('/progress', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required. Please log in.' } });
  }

  try {
    const progress = await supabaseService.getProgress(userId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/progress', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required. Please log in.' } });
  }

  const { algorithmId, status, lastStep } = req.body;

  if (!algorithmId || !status) {
    return res.status(400).json({
      success: false,
      error: { message: 'algorithmId and status are required' },
    });
  }

  try {
    const result = await supabaseService.saveProgress(
      userId,
      algorithmId,
      status,
      Number(lastStep) || 0
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.get('/bookmarks', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required. Please log in.' } });
  }

  try {
    const bookmarks = await supabaseService.getBookmarks(userId);
    res.json({ success: true, data: bookmarks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.post('/bookmarks', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required. Please log in.' } });
  }

  const { algorithmId } = req.body;

  if (!algorithmId) {
    return res.status(400).json({
      success: false,
      error: { message: 'algorithmId is required' },
    });
  }

  try {
    const result = await supabaseService.toggleBookmark(userId, algorithmId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
