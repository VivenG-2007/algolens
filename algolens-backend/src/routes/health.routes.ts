import { Router } from 'express';
import { cacheService } from '../services/redis/cache.service.js';
import { supabaseService } from '../services/supabase/supabase.service.js';

const router = Router();

router.get('/', (req, res) => {
  const metrics = cacheService.getMetrics();

  res.json({
    status: 'ok',
    service: 'algolens-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: {
      redis: {
        status: cacheService.isConnected() ? 'connected' : 'memory-fallback',
        provider: metrics.provider,
        circuitBreaker: metrics.circuitBreakerStatus,
        telemetry: {
          totalRequests: metrics.totalRequests,
          l1MemoryHits: metrics.l1Hits,
          upstashRemoteHits: metrics.l2Hits,
          coalescedConcurrentHits: metrics.coalescedHits,
          upstashCommandsSaved: metrics.commandsSaved,
          iopsSavedPercentage: `${metrics.iopsSavedPercentage}%`,
        },
      },
      supabase: supabaseService.isAvailable() ? 'connected' : 'local-store',
      groq: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq'))
        ? 'active'
        : 'fallback-rules',
    },
  });
});

export default router;
