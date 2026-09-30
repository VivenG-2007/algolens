import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

// Import Routes
import healthRouter from './routes/health.routes.js';
import algorithmRouter from './routes/algorithm.routes.js';
import aiRouter from './routes/ai.routes.js';
import progressRouter from './routes/progress.routes.js';
import practiceRouter from './routes/practice.routes.js';
import knowledgeRouter from './routes/knowledge.routes.js';
import complexityRouter from './routes/complexity.routes.js';
import authRouter from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());

// CORS Configuration
const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : [];

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  ...configuredOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost / 127.0.0.1 port or configured origin
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        defaultAllowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-load-test'],
  })
);

// Body parser with size limits
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Gracefully handle malformed client JSON syntax errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    console.warn(`[Client JSON Notice]: Malformed JSON body on ${req.method} ${req.path} (${err.message})`);
    return res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON_PAYLOAD',
        message: 'The request body contained invalid JSON syntax. Please verify string quotes and escapes.',
      },
    });
  }
  next(err);
});

// Global Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.headers['x-load-test'] === 'algolens-benchmark',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down and try again in a minute.',
    },
  },
});
app.use('/api', generalLimiter);

// Specific Rate Limiting for Algorithm Execution (prevent compute exhaustion)
const algorithmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 executions per minute per IP
  skip: (req) => req.headers['x-load-test'] === 'algolens-benchmark',
  message: {
    success: false,
    error: {
      code: 'EXECUTION_RATE_LIMIT',
      message: 'Algorithm execution rate limit reached. Please wait before generating another trace.',
    },
  },
});
app.use('/api/algorithms/:algorithm/execute', algorithmLimiter);

// Specific Rate Limiting for AI Tutor (prevent token abuse)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15, // 15 explanations per minute
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT',
      message: 'AI Tutor rate limit reached. Please wait 1 minute before asking more questions.',
    },
  },
});
app.use('/api/ai', aiLimiter);

// Register API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/algorithms', algorithmRouter);
app.use('/api/ai', aiRouter);
app.use('/api/progress', progressRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/complexity', complexityRouter);

// Root Welcome Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'AlgoLens Engine API',
    tagline: 'See the Code. Understand the Algorithm.',
    status: 'online',
    documentation: '/docs/API.md',
    healthCheck: '/api/health',
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The endpoint ${req.method} ${req.path} does not exist.`,
    },
  });
});

// Global Error Handler - Never leaks internal stack traces to client
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  if (statusCode >= 500) {
    console.error('[Unhandled Server Exception]:', err.message);
  } else {
    console.warn(`[Client Warning ${statusCode}]:`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: isProduction && statusCode >= 500
        ? 'An unexpected server error occurred. Please try again later.'
        : err.message || 'Internal Server Error',
    },
  });
});

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`============================================================`);
  console.log(`           ALGOLENS BACKEND EXECUTION ENGINE                `);
  console.log(`============================================================`);
  console.log(` Server active on port: ${PORT} (0.0.0.0)`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(` Allowed Origins: ${defaultAllowedOrigins.join(', ')}`);
  console.log(`============================================================`);
});

export default app;
