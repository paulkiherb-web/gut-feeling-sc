import { supabase } from '@/integrations/supabase/client';
import { getProfileByHandle } from './profile';

export type BondType = 'married' | 'parole' | 'sponsor' | 'team_mate';
export type BondStatus = 'pending' | 'active' | 'ended' | 'declined';

export interface BoostaBond {
  id: string;
  initiator_id: string;
  partner_id: string;
  bond_type: BondType;
  status: BondStatus;
  course_shared: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

const sb = supabase as any;

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function proposeBond(
  partnerHandle: string,
  bondType: BondType,
  course: string,
): Promise<BoostaBond | null> {
  const userId = await uid();
  if (!userId) throw new Error('Не авторизован');
  const partner = await getProfileByHandle(partnerHandle);
  if (!partner) throw new Error('Пользователь не найден');
  if (partner.user_id === userId) throw new Error('Нельзя связаться с самим собой');

  const { data, error } = await sb
    .from('boosta_bonds')
    .insert({
      initiator_id: userId,
      partner_id: partner.user_id,
      bond_type: bondType,
      status: 'pending',
      course_shared: course,
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as BoostaBond;
}

export async function proposeMarriage(partnerHandle: string, course: string) {
  return proposeBond(partnerHandle, 'married', course);
}

export async function proposeParole(partnerHandle: string, course: string) {
  return proposeBond(partnerHandle, 'parole', course);
}

export async function proposeSponsor(partnerHandle: string, course: string) {
  return proposeBond(partnerHandle, 'sponsor', course);
}

export async function acceptBond(bondId: string): Promise<void> {
  const userId = await uid();
  if (!userId) throw new Error('Не авторизован');
  const { error } = await sb
    .from('boosta_bonds')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', bondId)
    .eq('partner_id', userId);
  if (error) throw error;
}

export async function declineBond(bondId: string): Promise<void> {
  const userId = await uid();
  if (!userId) throw new Error('Не авторизован');
  await sb
    .from('boosta_bonds')
    .update({ status: 'declined', ended_at: new Date().toISOString() })
    .eq('id', bondId)
    .eq('partner_id', userId);
}

export async function endBond(bondId: string, _reason?: string): Promise<void> {
  await sb
    .from('boosta_bonds')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', bondId);
}

export async function listMyBonds(): Promise<BoostaBond[]> {
  const userId = await uid();
  if (!userId) return [];
  const { data } = await sb
    .from('boosta_bonds')
    .select('*')
    .or(`initiator_id.eq.${userId},partner_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  return (data ?? []) as BoostaBond[];
}

export async function listIncomingPending(): Promise<BoostaBond[]> {
  const userId = await uid();
  if (!userId) return [];
  const { data } = await sb
    .from('boosta_bonds')
    .select('*')
    .eq('partner_id', userId)
    .eq('status', 'pending');
  return (data ?? []) as BoostaBond[];
}
