# AlgoLens — Full-Stack Educational DSA Platform

> **"See the Code. Understand the Algorithm."**

---

## 👥 College PBL Engineering Team (3 Members)
- **Role 1:** Full-Stack & Algorithm Systems Architect
- **Role 2:** Interactive Visualizer & Frontend UX Engineer
- **Role 3:** AI Context Grounding & Cloud Data Persistence Engineer

---

## 🏛️ System Architecture

```
                 STUDENT
                    │
                    ▼
         ┌─────────────────────┐
         │   VERCEL FRONTEND   │
         │   Next.js 14        │
         │   React & TypeScript│
         │   Tailwind CSS      │
         │   Framer Motion     │
         └──────────┬──────────┘
                    │
                    │ HTTPS REST API
                    ▼
         ┌─────────────────────┐
         │   RENDER BACKEND    │
         │   Node.js & Express │
         │   TypeScript        │
         │   Algorithm Engine  │
         │   Stateless Traces  │
         └──────┬───────┬──────┘
                │       │
       ┌────────┘       └────────┐
       ▼                         ▼
┌──────────────┐         ┌──────────────┐
│UPSTASH REDIS │         │   SUPABASE   │
│IOPS-Managed  │         │  PostgreSQL  │
│L1+L2 Caching │         │  Auth & RLS  │
└──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   GROQ AI    │
                         │  LLaMA 3.3   │
                         │  Contextual  │
                         └──────────────┘
```

---

## ⚡ Production-Ready Upstash Redis & IOPS Management

Upstash Redis Free Tier has a limit of **10,000 commands/day**. Naive implementations burn through this in minutes. AlgoLens solves this with a **4-tier IOPS mitigation architecture**:

1. **L1 In-Memory Buffer (Node.js Memory):** Hot execution traces and AI explanations are cached in memory for 120s. 80-90% of repeated requests hit L1 with **0 network calls and 0 Upstash IOPS**.
2. **In-Flight Request Coalescing (Single-Flight):** If 50 concurrent users request the same algorithm trace simultaneously, AlgoLens combines them into **1 single Upstash command**. The other 49 share the in-flight promise.
3. **Circuit Breaker:** If Upstash ever returns a quota limit (`daily limit exceeded` or `429 Too Many Requests`), the circuit breaker opens for 3 minutes, automatically falling back to local memory without crashing or returning 500 errors.
4. **IOPS Telemetry:** Track live Upstash command metrics and percentage saved via `GET /api/health`.

---

## 📁 Repository Structure
```
c:\Users\viven\Desktop\algolens/
├── algolens-backend/       # Independent Render Backend API Service
│   ├── src/
│   │   ├── algorithms/     # Real MergeSort, CountingSort, Binary, Fibonacci, KMP, AVL
│   │   ├── execution/      # Pure stateless ExecutionEngine
│   │   ├── routes/         # REST API endpoints (/health, /algorithms, /ai, /progress)
│   │   └── services/       # Groq AI Tutor, Upstash Cache (IOPS-managed), Supabase
│   ├── scripts/loadTest.js # 100 Concurrent Users Benchmark
│   ├── supabase/schema.sql # PostgreSQL schema with RLS policies & indexes
│   ├── docs/API.md         # Comprehensive REST API Documentation
│   └── package.json
│
└── algolens-frontend/      # Independent Vercel Next.js 14 Application
    ├── app/                # App Router: /, /learn, /visualizer, /practice, /complexity, /knowledge, /about
    ├── components/
    │   ├── visualizer/     # DynamicInputPanel, Array, AVL, KMP, CountingSort, CodeViewer, AI Tutor
    │   └── ui/             # Navbar, Footer
    ├── lib/
    │   ├── api/client.ts   # Central REST API client with cold-start detection
    │   └── data/           # Algorithm metadata, multi-language code snippets
    └── package.json
```

---

## 🎯 Live Presentation Demo Script

### 🎬 DEMO 1: Dynamic Input Proof (Merge Sort)
1. Open `/visualizer/merge-sort`.
2. Enter custom numbers: `64 25 12 22 11`. Click **Generate Visualization**.
3. Point out that the backend generates 27 execution steps specifically for this sequence.
4. Open the **AI Tutor** drawer and click *"Explain This Step"*.
5. Change input to: `90 10 50 30 70`. Click **Generate Visualization**.
6. **Proof Point:** The trace completely mutates to match the new values, proving zero pre-baked static animations.

### 🎬 DEMO 2: Search Validation & Auto-Sort (Binary Search)
1. Open `/visualizer/binary-search`.
2. Enter an unsorted array: `50 20 80 10 40`, Target: `20`.
3. Notice the warning alert: *"Binary Search requires a sorted array."*
4. Click **[Sort Automatically]**. The array is reordered to `10 20 40 50 80`.
5. Run the visualizer. Notice the search interval [low..high] eliminating the right half in logarithmic time.

### 🎬 DEMO 3: String Matching with LPS (KMP)
1. Open `/visualizer/kmp`.
2. Enter custom Text: `ABABDABACDABABCABAB` and Pattern: `ABABCABAB`.
3. Watch the visualizer build the dynamic **LPS table** first.
4. Watch character matching in real-time. Notice how on mismatch, `j` falls back to `LPS[j-1]` without backtracking the text pointer `i`.

### 🎬 DEMO 4: Self-Balancing AVL Rotations (LL vs RR vs LR)
1. Open `/visualizer/avl`.
2. Enter insertion sequence: `30 10 20`.
3. Watch the SVG tree insert `30`, then `10`, then `20`, trigger an **LR (Left-Right Double Rotation)**, and balance the root at `20` with balance factor `0`.
4. Click preset `10 20 30`. Watch the tree execute an **RR (Right-Right Single Rotation)**.

### 🎬 DEMO 5: Algorithm Knowledge Graph
1. Open `/knowledge`.
2. Click **AVL Tree** node. Watch it highlight relationships:
   - *Implements:* Binary Search Tree
   - *Monitors:* Balance Factor
   - *Restores Balance via:* Tree Rotations (LL, RR, LR, RL)
   - *Complexity:* O(log n)
