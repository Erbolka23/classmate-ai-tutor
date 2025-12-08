-- Create table for storing user's recent tutor queries
CREATE TABLE IF NOT EXISTS public.user_recent_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  original_problem TEXT NOT NULL,
  simplified_problem TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_recent_queries ENABLE ROW LEVEL SECURITY;

-- Users can insert their own queries
CREATE POLICY "Users can insert their own queries"
ON public.user_recent_queries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own queries
CREATE POLICY "Users can view their own queries"
ON public.user_recent_queries FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own queries
CREATE POLICY "Users can delete their own queries"
ON public.user_recent_queries FOR DELETE
USING (auth.uid() = user_id);