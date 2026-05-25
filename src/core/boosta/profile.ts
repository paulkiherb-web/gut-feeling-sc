import { supabase } from '@/integrations/supabase/client';

export type Visibility = 'private' | 'friends' | 'public';

export interface BoostaProfile {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url?: string | null;
  reputation: number;
  days_active: number;
  ghost_proximity_avg: number;
  bio?: string | null;
  visibility: Visibility;
  created_at?: string;
}

const sb = supabase as any;

export async function getMyProfile(): Promise<BoostaProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await sb
    .from('boosta_users')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return (data as BoostaProfile) ?? null;
}

export async function getProfileByHandle(handle: string): Promise<BoostaProfile | null> {
  const { data } = await sb
    .from('boosta_users')
    .select('*')
    .eq('handle', handle.replace(/^@/, ''))
    .maybeSingle();
  return (data as BoostaProfile) ?? null;
}

export async function upsertMyProfile(input: Partial<BoostaProfile>): Promise<BoostaProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const payload = {
    user_id: user.id,
    display_name: input.display_name ?? 'Без имени',
    handle: (input.handle ?? `user_${user.id.slice(0, 6)}`).replace(/^@/, '').toLowerCase(),
    avatar_url: input.avatar_url ?? null,
    bio: input.bio ?? null,
    visibility: input.visibility ?? 'private',
  };
  const { data, error } = await sb
    .from('boosta_users')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return (data as BoostaProfile) ?? null;
}

export async function recomputeProfileStats(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: summaries } = await sb
    .from('boosta_daily_summary')
    .select('date, end_real, end_ghost')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30);

  const rows = (summaries ?? []) as Array<{ date: string; end_real: number; end_ghost: number }>;
  const daysActive = rows.length;
  const proximityAvg = rows.length
    ? Math.round(
        rows.reduce((acc, r) => acc + (100 - Math.abs((r.end_ghost ?? 0) - (r.end_real ?? 0))), 0) /
          rows.length,
      )
    : 0;

  await sb
    .from('boosta_users')
    .update({ days_active: daysActive, ghost_proximity_avg: proximityAvg })
    .eq('user_id', user.id);
}
