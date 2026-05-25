-- =============================================================
-- Full Boosta schema for own Supabase project (all sprints).
-- Run this once in the SQL Editor of your own Supabase project.
-- =============================================================

-- Sprint 2 tables -----------------------------------------------

CREATE TABLE IF NOT EXISTS boosta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  impact_real INTEGER NOT NULL DEFAULT 0,
  impact_ghost INTEGER NOT NULL DEFAULT 0,
  verdict TEXT NOT NULL DEFAULT 'neutral',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boosta_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  course TEXT NOT NULL,
  end_real INTEGER NOT NULL DEFAULT 80,
  end_ghost INTEGER NOT NULL DEFAULT 80,
  events_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Sprint 3 tables -----------------------------------------------

CREATE TABLE IF NOT EXISTS boosta_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  display_name TEXT NOT NULL DEFAULT '',
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  days_active INTEGER NOT NULL DEFAULT 0,
  ghost_proximity_avg INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boosta_bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES auth.users NOT NULL,
  partner_id UUID REFERENCES auth.users NOT NULL,
  bond_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  course_shared TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boosta_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_focus TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boosta_team_members (
  team_id UUID REFERENCES boosta_teams ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS boosta_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  story_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'friends',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles extensions (if the table already exists from onboarding) --

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS boosta_onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS boosta_initial_course TEXT,
  ADD COLUMN IF NOT EXISTS long_goal TEXT;

-- RLS ---------------------------------------------------------------

ALTER TABLE boosta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosta_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosta_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosta_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosta_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosta_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own events"       ON boosta_events        USING (auth.uid() = user_id);
CREATE POLICY "own summaries"    ON boosta_daily_summary USING (auth.uid() = user_id);

CREATE POLICY "public profiles"  ON boosta_users FOR SELECT
  USING (visibility != 'private' OR user_id = auth.uid());
CREATE POLICY "own profile edit" ON boosta_users FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "see own bonds"    ON boosta_bonds FOR SELECT
  USING (initiator_id = auth.uid() OR partner_id = auth.uid());
CREATE POLICY "create bonds"     ON boosta_bonds FOR INSERT
  WITH CHECK (initiator_id = auth.uid());
CREATE POLICY "update bonds"     ON boosta_bonds FOR UPDATE
  USING (initiator_id = auth.uid() OR partner_id = auth.uid());

CREATE POLICY "open teams readable" ON boosta_teams FOR SELECT
  USING (is_open = TRUE OR created_by = auth.uid());
CREATE POLICY "own team members"    ON boosta_team_members
  USING (user_id = auth.uid());

CREATE POLICY "own stories"      ON boosta_stories
  USING (user_id = auth.uid());
