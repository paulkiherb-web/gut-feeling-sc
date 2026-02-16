
-- Add new profile fields for expanded onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg numeric(5,1);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diets text[] DEFAULT '{}';

-- Social feed: likes
CREATE TABLE public.scan_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(scan_id, user_id)
);
ALTER TABLE public.scan_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.scan_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.scan_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.scan_likes FOR DELETE USING (auth.uid() = user_id);

-- Social feed: comments
CREATE TABLE public.scan_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.scan_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.scan_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.scan_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.scan_comments FOR DELETE USING (auth.uid() = user_id);

-- Social feed: follows
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Add is_public flag to scans for social feed
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Allow anyone to see public scans
CREATE POLICY "Anyone can view public scans" ON public.scans FOR SELECT USING (is_public = true);

-- Add display_name to profiles for social
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;

-- Allow anyone to view profiles (for social feed)
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

-- Drop the restrictive select policy on profiles since we now have a public one
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Enable realtime for social tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_comments;
