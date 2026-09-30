-- ============================================================
-- AlgoLens Database Schema & Supabase RLS Policies
-- ============================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Algorithm Progress Table
CREATE TABLE IF NOT EXISTS public.algorithm_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  algorithm_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('started', 'in_progress', 'completed')) NOT NULL DEFAULT 'started',
  last_step INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, algorithm_id)
);

ALTER TABLE public.algorithm_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" 
ON public.algorithm_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own progress" 
ON public.algorithm_progress FOR ALL USING (auth.uid() = user_id);


-- 3. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  algorithm_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, algorithm_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bookmarks" 
ON public.bookmarks FOR ALL USING (auth.uid() = user_id);


-- 4. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  algorithm_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and record quiz attempts" 
ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);


-- 5. Learning Sessions Table
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  algorithm_id TEXT NOT NULL,
  session_duration_seconds INTEGER DEFAULT 0,
  steps_viewed INTEGER DEFAULT 0,
  ai_questions_asked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning sessions" 
ON public.learning_sessions FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- Performance Indexes (Requirement 34)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_progress_user_algo ON public.algorithm_progress(user_id, algorithm_id);
CREATE INDEX IF NOT EXISTS idx_progress_updated ON public.algorithm_progress(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_user_algo ON public.quiz_attempts(user_id, algorithm_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempted_at ON public.quiz_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON public.learning_sessions(user_id, created_at DESC);
