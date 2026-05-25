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
