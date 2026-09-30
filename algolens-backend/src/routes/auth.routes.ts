import { Router, Request, Response } from 'express';
import { supabaseService } from '../services/supabase/supabase.service.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username, fullName } = req.body;

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
      fullName?.trim()
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { message: err.message || 'Registration failed.' },
    });
  }
});

// POST /api/auth/login
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

// POST /api/auth/demo - Instant login for college demos
router.post('/demo', async (req: Request, res: Response) => {
  try {
    const demoEmail = 'alex_student@algolens.edu';
    const demoPassword = 'DemoPassword123!';
    const result = await supabaseService.signUp(
      demoEmail,
      demoPassword,
      'alex_student',
      'Alex Student'
    );
    res.json({ success: true, data: result });
  } catch {
    res.json({
      success: true,
      data: {
        user: {
          id: 'demo_user_alex',
          email: 'alex_student@algolens.edu',
          username: 'alex_student',
          fullName: 'Alex Student',
        },
        token: 'demo_user_alex',
      },
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'No authorization token provided.' },
    });
  }

  try {
    const user = await supabaseService.getUser(token);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { message: err.message || 'Invalid session.' },
    });
  }
});

// GET /api/auth/summary - Full user mastery summary
router.get('/summary', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const userId =
    (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null) ||
    (req.query.userId as string) ||
    'demo_user_alex';

  try {
    const summary = await supabaseService.getUserLearningSummary(userId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
