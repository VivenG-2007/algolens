import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase/supabase.service.js';

const router = Router();

// Helper to extract userId from Bearer token or query
function extractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.query.userId as string) || (req.body?.userId as string) || null;
}

// POST /api/auth/register - Create a new student account
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username, fullName, skillLevel } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email and password are required.' },
    });
  }

  try {
    const result = await supabaseService.signUp(
      email.trim(),
      password,
      username?.trim(),
      fullName?.trim(),
      skillLevel || 'Beginner'
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { message: err.message || 'Registration failed.' },
    });
  }
});

// POST /api/auth/login - Strict login: user MUST have an account
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email and password are required.' },
    });
  }

  try {
    const result = await supabaseService.signIn(email.trim(), password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { message: err.message || 'Invalid email or password.' },
    });
  }
});

// POST /api/auth/demo - Quick login to seeded accounts for presentation
router.post('/demo', async (req: Request, res: Response) => {
  const { role = 'intermediate' } = req.body;
  try {
    let email = 'alex@algolens.edu';
    let password = 'AlexPass123!';
    if (role === 'beginner') {
      email = 'priya@algolens.edu';
      password = 'PriyaPass123!';
    } else if (role === 'advanced') {
      email = 'marcus@algolens.edu';
      password = 'MarcusPass123!';
    }
    const result = await supabaseService.signIn(email, password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/auth/me - Validate current session token
router.get('/me', async (req: Request, res: Response) => {
  const token = extractUserId(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'No authorization token provided. Please log in.' },
    });
  }

  try {
    const user = await supabaseService.getUser(token);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { message: err.message || 'Invalid session. Please log in again.' },
    });
  }
});

// PUT /api/auth/skill-level - Update custom user skill level
router.put('/skill-level', async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const { skillLevel } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
  }
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(skillLevel)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid skill level' } });
  }

  try {
    const result = await supabaseService.updateSkillLevel(userId, skillLevel);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/auth/summary - Full user mastery summary
router.get('/summary', async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
  }

  try {
    const summary = await supabaseService.getUserLearningSummary(userId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/auth/analytics - Custom graphs, radar metrics, and category progress for user
router.get('/analytics', async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
  }

  try {
    const analytics = await supabaseService.getUserAnalytics(userId);
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
