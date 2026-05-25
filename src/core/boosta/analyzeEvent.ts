import { supabase } from '@/integrations/supabase/client';

export interface EventAnalysis {
  impactReal: number;
  impactGhost: number;
  verdict: 'aligned' | 'drift' | 'neutral';
  whisper: string | null;
}

export async function analyzeBoostaEvent(
  eventDescription: string,
  course: string,
  todayEvents: { name: string }[],
): Promise<EventAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-food', {
    body: {
      boosta_event_mode: true,
      eventDescription,
      course,
      todayEvents,
    },
  });

  if (error) throw error;
  return data as EventAnalysis;
}
