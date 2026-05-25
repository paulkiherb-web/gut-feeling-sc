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
