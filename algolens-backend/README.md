# AlgoLens Backend Engine

> **"See the Code. Understand the Algorithm."**

AlgoLens Backend is a high-performance, stateless TypeScript Express service powering real-time algorithm execution tracing, contextual AI explanations via Groq, Redis-backed acceleration, and Supabase data persistence.

---

## 🛠️ Tech Stack
- **Runtime:** Node.js & Express
- **Language:** TypeScript (NodeNext / ES2022)
- **Validation:** Zod
- **Security:** Helmet, CORS, Express-Rate-Limit
- **AI Integration:** Groq SDK (LLaMA 3.3 70B Versatile)
- **Database & Auth:** Supabase PostgreSQL
- **Caching & Scalability:** Redis (ioredis) with in-memory fallback
- **Testing & Benchmarking:** Jest, ts-jest, Autocannon

---

## 🚀 Quick Start (Local Development)

### 1. Installation
```bash
cd algolens-backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GROQ_API_KEY=gsk_your_groq_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=redis://localhost:6379
```
*(Note: Redis, Supabase, and Groq have built-in graceful degradation and local memory fallbacks. The core algorithm visualizer engine runs cleanly even without external API credentials).*

### 3. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### 4. Run Unit Tests
```bash
npm test
```

### 5. Run 100 Concurrent Users Load Test
```bash
npm run load-test
```

---

## 🌐 Cloud Deployment (Render)

1. Create a **New Web Service** on [Render.com](https://render.com).
2. Connect your repository and set:
   - **Root Directory:** `algolens-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `PORT`: `10000` (or leave default Render port)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://your-algolens-frontend.vercel.app`
   - `GROQ_API_KEY`: `gsk_...`
   - `SUPABASE_URL`: `https://...supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `...`
   - `REDIS_URL`: `rediss://...` (from Upstash or Render Redis)

---

## 📊 Upstash Redis & IOPS Management (Production Ready)

Upstash Redis enforces daily command limits (e.g. Free Tier allows 10,000 requests/day). Under heavy concurrent usage or load testing, naive systems burn thousands of commands in minutes. AlgoLens employs a **4-tier IOPS mitigation architecture**:

### 1. Multi-Tier Hierarchical Cache (L1 Memory + L2 Upstash)
- **L1 In-Memory Buffer:** Node.js process memory caches hot execution traces and AI responses for 120s (`L1_CACHE_TTL_SECONDS`). Repeated user steps or concurrent requests hit L1 with **0 network calls and 0 Upstash IOPS**.
- **L2 Upstash Redis:** Queried only when L1 suffers a miss.

### 2. In-Flight Request Coalescing (Single-Flight Pattern)
- If 50 students request Merge Sort for the same array simultaneously, AlgoLens combines them into a **single in-flight Upstash command**. The other 49 share the promise, dropping IOPS consumption by up to 98%.

### 3. Circuit Breaker for Upstash Quota Protection
- If Upstash returns a quota error (`max daily request limit exceeded` or `429 Too Many Requests`), the circuit breaker trips into `OPEN` state for 3 minutes.
- The engine automatically shifts all traffic to the local L1 buffer. **Users never experience 500 errors or application crashes.**

### 4. Upstash IOPS Live Telemetry
- Inspect live command metrics and savings percentage anytime via `GET /api/health`:
  ```json
  "redis": {
    "status": "connected",
    "provider": "upstash-rest",
    "circuitBreaker": "CLOSED",
    "telemetry": {
      "totalRequests": 450,
      "l1MemoryHits": 380,
      "upstashRemoteHits": 70,
      "coalescedConcurrentHits": 45,
      "upstashCommandsSaved": 425,
      "iopsSavedPercentage": "94.4%"
    }
  }
  ```

---

## 📊 100 Concurrent Users Scalability Architecture
1. **Zero Global Mutable State:** Every request receives an isolated execution trace. No shared session counters or backend playback step variables.
2. **Stateless Compute:** All executions take input parameters and return the full `ExecutionStep[]` trace deterministically.
3. **Response Caching:** Identical inputs are hashed and cached with Redis TTL to eliminate redundant CPU cycles.
4. **Resilient Degradation:** If Redis, Neo4j, or Groq is unavailable, the core algorithm execution remains completely functional.
