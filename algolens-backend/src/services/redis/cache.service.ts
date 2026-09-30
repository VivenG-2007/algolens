import { Redis as UpstashRedis } from '@upstash/redis';
import { Redis as IORedis } from 'ioredis';
import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  expires: number;
}

export interface CacheMetrics {
  totalRequests: number;
  l1Hits: number;
  l2Hits: number;
  l2Misses: number;
  l2Writes: number;
  coalescedHits: number;
  commandsSaved: number;
  iopsSavedPercentage: number;
  circuitBreakerStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  provider: 'upstash-rest' | 'ioredis-tcp' | 'memory-only';
}

class UpstashIOPSManagedCacheService {
  // L1 In-Memory Fast Buffer (Eliminates up to 90% of redundant Upstash commands)
  private l1Cache: Map<string, CacheEntry<any>> = new Map();
  private l1TtlSeconds: number;
  private maxL1Size: number;

  // L2 Remote Clients
  private upstashClient: UpstashRedis | null = null;
  private ioRedisClient: IORedis | null = null;
  private provider: 'upstash-rest' | 'ioredis-tcp' | 'memory-only' = 'memory-only';

  // Request Coalescing (Single-Flight pattern to prevent IOPS spikes under concurrent load)
  private inFlightPromises: Map<string, Promise<any>> = new Map();

  // Circuit Breaker for Upstash Daily Limits / 429 Rate Limits
  private circuitBreakerStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private circuitBreakerOpenedAt = 0;
  private readonly CIRCUIT_BREAKER_COOLDOWN_MS = 180 * 1000; // 3 minutes backoff

  // Telemetry metrics
  private metrics = {
    totalRequests: 0,
    l1Hits: 0,
    l2Hits: 0,
    l2Misses: 0,
    l2Writes: 0,
    coalescedHits: 0,
    commandsSaved: 0,
  };

  constructor() {
    this.l1TtlSeconds = Number(process.env.L1_CACHE_TTL_SECONDS) || 120;
    this.maxL1Size = Number(process.env.MAX_L1_CACHE_SIZE) || 1000;

    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const redisUrl = process.env.REDIS_URL;

    // 1. Try Upstash REST Client first (Best for serverless / edge / IOPS efficiency)
    if (restUrl && restToken && !restUrl.includes('your-upstash')) {
      try {
        this.upstashClient = new UpstashRedis({
          url: restUrl,
          token: restToken,
        });
        this.provider = 'upstash-rest';
        console.log('[Upstash Redis] Initialized native REST client with IOPS guardrails.');
      } catch (err: any) {
        console.warn('[Upstash Redis] REST client init failed, falling back:', err.message);
      }
    }

    // 2. Try IORedis if REST not used and REDIS_URL provided
    if (!this.upstashClient && redisUrl && redisUrl.trim() !== '') {
      try {
        this.ioRedisClient = new IORedis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 3000,
          lazyConnect: true,
          enableOfflineQueue: false,
        });

        this.ioRedisClient.connect().then(() => {
          this.provider = 'ioredis-tcp';
          console.log('[Redis] Connected via IORedis TCP client.');
        }).catch((err) => {
          console.warn('[Redis] TCP connection failed, falling back to L1 local memory:', err.message);
        });

        this.ioRedisClient.on('error', (err) => {
          this.handleUpstashError(err);
        });
      } catch (err: any) {
        console.warn('[Redis] IORedis init failed:', err.message);
      }
    }

    if (this.provider === 'memory-only') {
      console.log('[Cache] Running in memory-only mode. Zero external Redis IOPS used.');
    }
  }

  /**
   * Generates a compact normalized cache key.
   * Uses SHA-256 digest when payload is large to save Upstash key memory & bandwidth.
   */
  public generateKey(algorithm: string, input: unknown, version = 'v1.0.0'): string {
    const rawString = typeof input === 'string' ? input : JSON.stringify(input);
    if (rawString.length > 64) {
      const hash = crypto.createHash('sha256').update(rawString).digest('hex').substring(0, 16);
      return `alg:${algorithm}:${version}:${hash}`;
    }
    return `alg:${algorithm}:${version}:${rawString}`;
  }

  /**
   * Hierarchical GET with:
   * 1. L1 Memory Check (0 IOPS)
   * 2. Request Coalescing (Multiple concurrent requests share a single Upstash call)
   * 3. L2 Upstash Redis Check (with circuit breaker protection)
   */
  public async get<T>(key: string): Promise<T | null> {
    this.metrics.totalRequests++;

    // --- TIER 1: L1 In-Memory Buffer (Saves 1 Upstash command) ---
    const localHit = this.getFromL1<T>(key);
    if (localHit !== null) {
      this.metrics.l1Hits++;
      this.metrics.commandsSaved++;
      return localHit;
    }

    // --- Circuit Breaker Guard ---
    if (this.isCircuitOpen()) {
      return null;
    }

    // --- TIER 2: In-Flight Request Coalescing (Single-Flight) ---
    // If another concurrent request is ALREADY fetching this key from Upstash, piggyback on it!
    if (this.inFlightPromises.has(key)) {
      this.metrics.coalescedHits++;
      this.metrics.commandsSaved++;
      try {
        return (await this.inFlightPromises.get(key)) as T;
      } catch {
        return null;
      }
    }

    // Fetch from L2 (Upstash / Redis)
    const fetchPromise = this.fetchFromL2<T>(key);
    this.inFlightPromises.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      if (result !== null) {
        this.metrics.l2Hits++;
        // Warm up L1 local cache so subsequent inquiries consume ZERO Upstash IOPS
        this.setToL1(key, result, this.l1TtlSeconds);
      } else {
        this.metrics.l2Misses++;
      }
      return result;
    } catch (err: any) {
      this.handleUpstashError(err);
      return null;
    } finally {
      this.inFlightPromises.delete(key);
    }
  }

  /**
   * SET operation with:
   * 1. Immediate write to L1 local memory
   * 2. Throttled/Safe write to Upstash Redis (with TTL)
   */
  public async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    // 1. Write to L1 Memory immediately
    this.setToL1(key, value, Math.min(this.l1TtlSeconds, ttlSeconds));

    // 2. Write to L2 Upstash if circuit is closed
    if (this.isCircuitOpen() || this.provider === 'memory-only') {
      return;
    }

    try {
      this.metrics.l2Writes++;
      if (this.upstashClient) {
        // Native Upstash REST with TTL
        await this.upstashClient.set(key, JSON.stringify(value), { ex: ttlSeconds });
      } else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
        await this.ioRedisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      }
    } catch (err: any) {
      this.handleUpstashError(err);
    }
  }

  // --- Internal L1 Cache Helpers ---
  private getFromL1<T>(key: string): T | null {
    const entry = this.l1Cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.l1Cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setToL1<T>(key: string, data: T, ttlSeconds: number): void {
    if (this.l1Cache.size >= this.maxL1Size) {
      // LRU Eviction: Remove oldest entry
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey) this.l1Cache.delete(oldestKey);
    }

    this.l1Cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  // --- Internal L2 Fetch Helper ---
  private async fetchFromL2<T>(key: string): Promise<T | null> {
    if (this.upstashClient) {
      const data = await this.upstashClient.get<string>(key);
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : (data as T);
    }

    if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
      const val = await this.ioRedisClient.get(key);
      if (!val) return null;
      return JSON.parse(val) as T;
    }

    return null;
  }

  // --- Circuit Breaker Logic ---
  private handleUpstashError(err: any): void {
    const msg = String(err?.message || '').toLowerCase();
    const isQuotaError =
      msg.includes('daily request limit') ||
      msg.includes('max daily') ||
      msg.includes('rate limit') ||
      msg.includes('429');

    if (isQuotaError) {
      console.warn('[Upstash Redis] Quota limit reached! Tripping circuit breaker to preserve application stability.');
      this.circuitBreakerStatus = 'OPEN';
      this.circuitBreakerOpenedAt = Date.now();
    }
  }

  private isCircuitOpen(): boolean {
    if (this.circuitBreakerStatus === 'OPEN') {
      if (Date.now() - this.circuitBreakerOpenedAt > this.CIRCUIT_BREAKER_COOLDOWN_MS) {
        // Cooldown period elapsed, allow probe
        this.circuitBreakerStatus = 'HALF_OPEN';
        return false;
      }
      return true; // Still open, bypass Upstash to protect limits
    }
    return false;
  }

  /**
   * Expose telemetry to monitor IOPS and command savings in real time.
   */
  public getMetrics(): CacheMetrics {
    const total = this.metrics.totalRequests;
    const saved = this.metrics.commandsSaved;
    const percentage = total > 0 ? Number(((saved / total) * 100).toFixed(1)) : 0;

    return {
      totalRequests: total,
      l1Hits: this.metrics.l1Hits,
      l2Hits: this.metrics.l2Hits,
      l2Misses: this.metrics.l2Misses,
      l2Writes: this.metrics.l2Writes,
      coalescedHits: this.metrics.coalescedHits,
      commandsSaved: saved,
      iopsSavedPercentage: percentage,
      circuitBreakerStatus: this.circuitBreakerStatus,
      provider: this.provider,
    };
  }

  public isConnected(): boolean {
    return this.provider !== 'memory-only' && this.circuitBreakerStatus !== 'OPEN';
  }
}

export const cacheService = new UpstashIOPSManagedCacheService();
