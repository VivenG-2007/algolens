# AlgoLens Frontend

> **"See the Code. Understand the Algorithm."**

AlgoLens is an educational algorithm laboratory built with **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, designed for deployment on **Vercel** and pairing seamlessly with the AlgoLens Express Backend on **Render**.

---

## ✨ Key Features
- **Dynamic User Inputs:** Enter custom numbers, strings, or patterns — the system runs the real algorithm rather than playing a pre-recorded animation.
- **Code-to-Execution Sync:** Highlights active source code lines (TypeScript, Python, C++) and pseudocode matching the current execution step.
- **Live Variables Watch:** Real-time register inspection tracking pointers (`low`, `high`, `mid`, `i`, `j`, `k`), offsets, and balance factors.
- **Context-Grounded AI Tutor:** Built-in Groq LLaMA 3.3 conversational tutor answering questions strictly based on the active step's execution trace.
- **Interactive Knowledge Graph:** SVG-based interactive graph linking algorithms, data structures, and mathematical complexity.
- **Algorithmic Practice Arena:** Instant evaluation quizzes testing comprehension of loop invariants and tree rotations.

---

## 🚀 Quick Start (Local Development)

### 1. Installation
```bash
cd algolens-frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure `NEXT_PUBLIC_API_URL` points to your running backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push your code to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project**.
3. Select your repository and set the **Root Directory** to `algolens-frontend`.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-anon-key`
5. Click **Deploy**. Vercel will build and host your production Next.js application with automatic SSL and global CDN edges.

---

## 🏛️ Application Structure
```
algolens-frontend/
├── app/
│   ├── page.tsx               # Landing page & PBL overview
│   ├── learn/page.tsx         # Algorithm catalog & filters
│   ├── visualizer/[algorithm] # Core interactive visualizer stage
│   ├── practice/page.tsx      # Algorithmic challenges & quizzes
│   ├── complexity/page.tsx    # Interactive Big-O growth curves
│   ├── knowledge/page.tsx     # Algorithm Knowledge Graph
│   └── about/page.tsx         # PBL presentation documentation
├── components/
│   ├── visualizer/            # InputPanel, Array, AVL, KMP, CodeViewer, AI Tutor
│   └── ui/                    # Navbar, Footer
├── lib/
│   ├── api/client.ts          # Central typed REST API client
│   ├── data/algorithms.ts     # Algorithm metadata & multi-language code
│   └── supabase/client.ts     # Supabase anon authentication
└── types/                     # Shared TypeScript schemas
```
