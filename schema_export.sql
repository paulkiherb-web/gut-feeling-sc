
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age INTEGER NOT NULL DEFAULT 25,
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
  condition TEXT NOT NULL DEFAULT 'healthy' CHECK (condition IN ('healthy', 'pregnancy', 'post_surgery', 'chronic', 'athlete')),
  goal TEXT NOT NULL DEFAULT 'energy' CHECK (goal IN ('weight_loss', 'energy', 'recovery', 'sleep')),
  surgery_days INTEGER,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  daily_scans_used INTEGER NOT NULL DEFAULT 0,
  last_scan_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create scans table
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('green', 'yellow', 'red')),
  reason TEXT NOT NULL,
  suggestion TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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

-- Favorites table
CREATE TABLE public.scan_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scan_id, user_id)
);

ALTER TABLE public.scan_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.scan_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.scan_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.scan_favorites FOR DELETE USING (auth.uid() = user_id);

-- Notes table
CREATE TABLE public.scan_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scan_id, user_id)
);

ALTER TABLE public.scan_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.scan_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.scan_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.scan_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.scan_notes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_scan_notes_updated_at BEFORE UPDATE ON public.scan_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow users to update/delete own scans
CREATE POLICY "Users can update own scans" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans" ON public.scans FOR DELETE USING (auth.uid() = user_id);
-- Boosta events table
CREATE TABLE IF NOT EXISTS public.boosta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  impact_real INTEGER NOT NULL,
  impact_ghost INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  note TEXT
);

ALTER TABLE public.boosta_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own boosta events" ON public.boosta_events
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert boosta events" ON public.boosta_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete boosta events" ON public.boosta_events
  FOR DELETE USING (auth.uid() = user_id);

-- Boosta daily summary table
CREATE TABLE IF NOT EXISTS public.boosta_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  course TEXT NOT NULL,
  end_real INTEGER NOT NULL,
  end_ghost INTEGER NOT NULL,
  events_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE public.boosta_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own boosta summaries" ON public.boosta_daily_summary
  USING (auth.uid() = user_id);
CREATE POLICY "Users upsert boosta summaries" ON public.boosta_daily_summary
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update boosta summaries" ON public.boosta_daily_summary
  FOR UPDATE USING (auth.uid() = user_id);

-- Extend profiles table for Boosta onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS boosta_onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS boosta_initial_course TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS long_goal TEXT;
-- Boosta Sprint 3: Social layer, bonds, teams, stories

CREATE TABLE IF NOT EXISTS public.boosta_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  days_active INTEGER NOT NULL DEFAULT 0,
  ghost_proximity_avg INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.boosta_bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  partner_id  UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  bond_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  course_shared TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.boosta_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_focus TEXT,
  created_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.boosta_team_members (
  team_id UUID REFERENCES public.boosta_teams ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.boosta_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  story_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'friends',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.boosta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosta_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosta_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosta_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosta_stories ENABLE ROW LEVEL SECURITY;

-- boosta_users
DROP POLICY IF EXISTS "Public profiles readable" ON public.boosta_users;
CREATE POLICY "Public profiles readable" ON public.boosta_users FOR SELECT
  USING (visibility <> 'private' OR user_id = auth.uid());
DROP POLICY IF EXISTS "Own profile insert" ON public.boosta_users;
CREATE POLICY "Own profile insert" ON public.boosta_users FOR INSERT
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Own profile update" ON public.boosta_users;
CREATE POLICY "Own profile update" ON public.boosta_users FOR UPDATE
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Own profile delete" ON public.boosta_users;
CREATE POLICY "Own profile delete" ON public.boosta_users FOR DELETE
  USING (user_id = auth.uid());

-- boosta_bonds
DROP POLICY IF EXISTS "See own bonds" ON public.boosta_bonds;
CREATE POLICY "See own bonds" ON public.boosta_bonds FOR SELECT
  USING (initiator_id = auth.uid() OR partner_id = auth.uid());
DROP POLICY IF EXISTS "Create own bonds" ON public.boosta_bonds;
CREATE POLICY "Create own bonds" ON public.boosta_bonds FOR INSERT
  WITH CHECK (initiator_id = auth.uid());
DROP POLICY IF EXISTS "Update own bonds" ON public.boosta_bonds;
CREATE POLICY "Update own bonds" ON public.boosta_bonds FOR UPDATE
  USING (initiator_id = auth.uid() OR partner_id = auth.uid());
DROP POLICY IF EXISTS "Delete own bonds" ON public.boosta_bonds;
CREATE POLICY "Delete own bonds" ON public.boosta_bonds FOR DELETE
  USING (initiator_id = auth.uid() OR partner_id = auth.uid());

-- boosta_teams
DROP POLICY IF EXISTS "Open teams or member" ON public.boosta_teams;
CREATE POLICY "Open teams or member" ON public.boosta_teams FOR SELECT
  USING (
    is_open = TRUE
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.boosta_team_members m WHERE m.team_id = id AND m.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Create team" ON public.boosta_teams;
CREATE POLICY "Create team" ON public.boosta_teams FOR INSERT
  WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "Captain updates team" ON public.boosta_teams;
CREATE POLICY "Captain updates team" ON public.boosta_teams FOR UPDATE
  USING (created_by = auth.uid());
DROP POLICY IF EXISTS "Captain deletes team" ON public.boosta_teams;
CREATE POLICY "Captain deletes team" ON public.boosta_teams FOR DELETE
  USING (created_by = auth.uid());

-- boosta_team_members
DROP POLICY IF EXISTS "Members visible to team" ON public.boosta_team_members;
CREATE POLICY "Members visible to team" ON public.boosta_team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.boosta_team_members m2 WHERE m2.team_id = team_id AND m2.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.boosta_teams t WHERE t.id = team_id AND (t.is_open OR t.created_by = auth.uid()))
  );
DROP POLICY IF EXISTS "Self join" ON public.boosta_team_members;
CREATE POLICY "Self join" ON public.boosta_team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Self leave" ON public.boosta_team_members;
CREATE POLICY "Self leave" ON public.boosta_team_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.boosta_teams t WHERE t.id = team_id AND t.created_by = auth.uid())
  );

-- boosta_stories
DROP POLICY IF EXISTS "Stories visible" ON public.boosta_stories;
CREATE POLICY "Stories visible" ON public.boosta_stories FOR SELECT
  USING (
    user_id = auth.uid()
    OR visibility = 'public'
    OR (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.boosta_bonds b
      WHERE b.status = 'active'
        AND ((b.initiator_id = auth.uid() AND b.partner_id = user_id)
          OR (b.partner_id = auth.uid() AND b.initiator_id = user_id))
    ))
  );
DROP POLICY IF EXISTS "Own story insert" ON public.boosta_stories;
CREATE POLICY "Own story insert" ON public.boosta_stories FOR INSERT
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Own story delete" ON public.boosta_stories;
CREATE POLICY "Own story delete" ON public.boosta_stories FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS boosta_bonds_initiator_idx ON public.boosta_bonds(initiator_id);
CREATE INDEX IF NOT EXISTS boosta_bonds_partner_idx   ON public.boosta_bonds(partner_id);
CREATE INDEX IF NOT EXISTS boosta_team_members_user_idx ON public.boosta_team_members(user_id);
CREATE INDEX IF NOT EXISTS boosta_stories_user_idx ON public.boosta_stories(user_id, created_at DESC);
