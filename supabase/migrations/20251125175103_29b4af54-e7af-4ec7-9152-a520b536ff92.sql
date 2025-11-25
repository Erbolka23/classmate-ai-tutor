-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_ratings table
CREATE TABLE public.user_ratings (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_rating INTEGER NOT NULL DEFAULT 1000,
  math_rating INTEGER NOT NULL DEFAULT 1000,
  physics_rating INTEGER NOT NULL DEFAULT 1000,
  programming_rating INTEGER NOT NULL DEFAULT 1000,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_solved_at TIMESTAMP WITH TIME ZONE,
  solved_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ratings"
  ON public.user_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON public.user_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create problems table
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  rating INTEGER NOT NULL,
  correct_answer TEXT,
  source TEXT DEFAULT 'ai',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Problems are viewable by everyone"
  ON public.problems FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert problems"
  ON public.problems FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create problem_attempts table
CREATE TABLE public.problem_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_answer TEXT,
  rating_before INTEGER NOT NULL,
  rating_after INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.problem_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.problem_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.problem_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  ur.total_rating,
  ur.math_rating,
  ur.physics_rating,
  ur.programming_rating,
  ur.streak_days,
  ur.solved_count
FROM public.profiles p
JOIN public.user_ratings ur ON p.id = ur.user_id
ORDER BY ur.total_rating DESC
LIMIT 10;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  
  INSERT INTO public.user_ratings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();