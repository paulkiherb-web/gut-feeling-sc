
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
