import { supabase } from '@/integrations/supabase/client';
import { mySupabase } from '@/integrations/supabase/mySupabase';
import { dualInsert, dualDelete } from './dualWrite';

export interface BoostaTeam {
  id: string;
  name: string;
  course_focus: string | null;
  created_by: string;
  is_open: boolean;
  created_at: string;
}

export interface BoostaTeamMember {
  team_id: string;
  user_id: string;
  joined_at: string;
  role: string;
}

const sb = supabase as any;

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createTeam(name: string, course?: string, isOpen = true): Promise<BoostaTeam | null> {
  const userId = await uid();
  if (!userId) throw new Error('Не авторизован');
  const teamPayload = { name, course_focus: course ?? null, is_open: isOpen, created_by: userId };
  const { data, error } = await sb
    .from('boosta_teams')
    .insert(teamPayload)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (mySupabase) {
    (mySupabase as any).from('boosta_teams').insert(teamPayload)
      .then()
      .catch((e: unknown) => console.warn('[dual] insert boosta_teams:', e));
  }
  if (data) {
    await dualInsert('boosta_team_members', {
      team_id: (data as BoostaTeam).id,
      user_id: userId,
      role: 'captain',
    });
  }
  return data as BoostaTeam;
}

export async function listOpenTeams(): Promise<BoostaTeam[]> {
  const { data } = await sb
    .from('boosta_teams')
    .select('*')
    .eq('is_open', true)
    .order('created_at', { ascending: false })
    .limit(50);
  return (data ?? []) as BoostaTeam[];
}

export async function listMyTeams(): Promise<BoostaTeam[]> {
  const userId = await uid();
  if (!userId) return [];
  const { data: mems } = await sb
    .from('boosta_team_members')
    .select('team_id')
    .eq('user_id', userId);
  const ids = ((mems ?? []) as Array<{ team_id: string }>).map((m) => m.team_id);
  if (!ids.length) return [];
  const { data } = await sb.from('boosta_teams').select('*').in('id', ids);
  return (data ?? []) as BoostaTeam[];
}

export async function joinTeam(teamId: string): Promise<void> {
  const userId = await uid();
  if (!userId) throw new Error('Не авторизован');
  const { error } = await dualInsert('boosta_team_members', { team_id: teamId, user_id: userId, role: 'member' });
  if (error) throw error;
}

export async function leaveTeam(teamId: string): Promise<void> {
  const userId = await uid();
  if (!userId) return;
  await (supabase as any).from('boosta_team_members').delete().eq('team_id', teamId).eq('user_id', userId);
  if (mySupabase) {
    (mySupabase as any).from('boosta_team_members').delete().eq('team_id', teamId).eq('user_id', userId)
      .then()
      .catch((e: unknown) => console.warn('[dual] delete boosta_team_members:', e));
  }
}

export async function getTeamMembers(teamId: string): Promise<BoostaTeamMember[]> {
  const { data } = await sb
    .from('boosta_team_members')
    .select('*')
    .eq('team_id', teamId);
  return (data ?? []) as BoostaTeamMember[];
}

export async function getTeamAvgProximity(teamId: string): Promise<number> {
  const members = await getTeamMembers(teamId);
  if (!members.length) return 0;
  const ids = members.map((m) => m.user_id);
  const { data } = await sb
    .from('boosta_users')
    .select('ghost_proximity_avg')
    .in('user_id', ids);
  const rows = (data ?? []) as Array<{ ghost_proximity_avg: number }>;
  if (!rows.length) return 0;
  return Math.round(rows.reduce((a, r) => a + (r.ghost_proximity_avg ?? 0), 0) / rows.length);
}
