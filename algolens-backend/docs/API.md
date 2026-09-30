# AlgoLens REST API Documentation

**Tagline:** *See the Code. Understand the Algorithm.*

AlgoLens provides a deterministic, real-time algorithm execution engine and contextual AI explanation API designed for cloud deployment on Render.

---

## Base URLs
- **Local Development:** `http://localhost:5000`
- **Render Production:** `https://your-backend.onrender.com`

---

## 1. Health Check

### `GET /api/health`
Verifies backend status and auxiliary connections (Redis, Supabase, Groq).

#### Response (200 OK):
```json
{
  "status": "ok",
  "service": "algolens-backend",
  "version": "1.0.0",
  "timestamp": "2026-09-30T14:00:00.000Z",
  "uptime": 128.45,
  "dependencies": {
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
    },
    "supabase": "connected",
    "groq": "active"
  }
}
```

---

## 2. Algorithm Directory

### `GET /api/algorithms`
Returns the catalog of all supported algorithms, metadata, and complexity bounds.

#### Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "merge-sort",
      "name": "Merge Sort",
      "category": "sorting",
      "description": "A classic divide-and-conquer sorting algorithm...",
      "timeComplexity": {
        "best": "O(n log n)",
        "average": "O(n log n)",
        "worst": "O(n log n)"
      },
      "spaceComplexity": "O(n)"
    }
  ]
}
```

---

## 3. Dynamic Algorithm Execution

### `POST /api/algorithms/:algorithm/execute`
Executes an algorithm on user-supplied input and returns an ordered list of `ExecutionStep` objects.

Supported algorithms:
- `merge-sort`
- `counting-sort`
- `linear-search`
- `binary-search`
- `fibonacci-search`
- `kmp`
- `avl`

#### Example A: Merge Sort
```json
// POST /api/algorithms/merge-sort/execute
{
  "input": [64, 25, 12, 22, 11]
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "algorithm": "merge-sort",
  "input": [64, 25, 12, 22, 11],
  "steps": [
    {
      "id": 1,
      "title": "Initialize Merge Sort",
      "description": "Starting Merge Sort with 5 elements...",
      "algorithmLine": 1,
      "codeLine": 1,
      "variables": { "low": 0, "high": 4, "length": 5 },
      "arrayState": [64, 25, 12, 22, 11],
      "highlights": [],
      "operation": "INIT"
    }
  ],
  "metadata": {
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "totalSteps": 27,
    "version": "v1.0.0"
  },
  "cached": false
}
```

#### Example B: Binary Search (Unsorted Rejection)
```json
// POST /api/algorithms/binary-search/execute
{
  "input": [50, 20, 80],
  "target": 20
}
```
**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Binary Search requires a sorted array."
  }
}
```

#### Example C: Knuth-Morris-Pratt (KMP)
```json
// POST /api/algorithms/kmp/execute
{
  "text": "ABABDABACDABABCABAB",
  "pattern": "ABABCABAB"
}
```

#### Example D: AVL Tree Insertion
```json
// POST /api/algorithms/avl/execute
{
  "values": [30, 10, 20]
}
```

---

## 4. Contextual AI Tutor

### `POST /api/ai/explain`
Requests an pedagogical explanation grounded strictly in the supplied execution step.

#### Request:
```json
{
  "algorithm": "merge-sort",
  "currentStep": {
    "id": 4,
    "title": "Compare Left[0] (25) and Right[0] (64)",
    "description": "Comparing elements: 25 <= 64.",
    "algorithmLine": 12,
    "codeLine": 14,
    "variables": { "leftVal": 25, "rightVal": 64 },
    "comparisons": { "left": 25, "right": 64, "result": "25 <= 64" }
  },
  "question": "Why did 25 get placed into the array first?"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "explanation": "### 💡 AlgoLens Tutor Explanation\n\n1. **What happened?**\nThe algorithm evaluated 25 <= 64...",
  "source": "groq"
}
```

---

## 5. Knowledge Graph

### `GET /api/knowledge/graph`
Returns full node-link graph connecting algorithms, data structures, concepts, and complexities.

### `GET /api/knowledge/related/:algorithm`
Returns direct prerequisite, related algorithm, and concept links for a given algorithm.
