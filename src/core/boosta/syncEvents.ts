import { supabase } from '@/integrations/supabase/client';
import type { BoostaEvent } from '@/core/store/slices/boostaSlice';

export async function persistEvent(event: BoostaEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('boosta_events').insert({
      id: event.id,
      user_id: user.id,
      category: event.category,
      name: event.name,
      timestamp: new Date(event.timestamp).toISOString(),
      impact_real: event.impactReal,
      impact_ghost: event.impactGhost,
      verdict: event.verdict,
      note: event.note ?? null,
    });
  } catch {
    // silent — local store is source of truth during session
  }
}

export async function closeDailySummary(
  date: string,
  course: string,
  endReal: number,
  endGhost: number,
  eventsCount: number,
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('boosta_daily_summary').upsert({
      user_id: user.id,
      date,
      course,
      end_real: endReal,
      end_ghost: endGhost,
      events_count: eventsCount,
    }, { onConflict: 'user_id,date' });
  } catch {
    // silent
  }
}

export interface DailySummary {
  date: string;
  course: string;
  end_real: number;
  end_ghost: number;
  events_count: number;
}

export async function fetchLast30Days(): Promise<DailySummary[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('boosta_daily_summary')
      .select('date, course, end_real, end_ghost, events_count')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    return (data ?? []) as DailySummary[];
  } catch {
    return [];
  }
}
