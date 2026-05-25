import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

export interface AggregatedChoice {
  label: string;
  percent: number;
}

export interface AggregatedFeed {
  course: string;
  total: number;
  choices: AggregatedChoice[];
  timeWindow: string;
}

export async function fetchAggregatedFeed(course: string): Promise<AggregatedFeed | null> {
  try {
    const { data, error } = await sb.functions.invoke('boosta-aggregated-feed', {
      body: { course, hour: new Date().getHours() },
    });
    if (error) return null;
    return (data as AggregatedFeed) ?? null;
  } catch {
    return null;
  }
}

export interface WeeklyReflection {
  whisper: string;
}

export async function fetchWeeklyReflection(args: {
  course: string;
  ghostProximity: number;
  weekEvents: Array<{ name: string; category: string; impact_real: number; impact_ghost: number; timestamp: string }>;
}): Promise<WeeklyReflection | null> {
  try {
    const { data, error } = await sb.functions.invoke('analyze-food', {
      body: {
        boosta_weekly_reflection: true,
        course: args.course,
        ghostProximity: args.ghostProximity,
        weekEvents: args.weekEvents,
      },
    });
    if (error) return null;
    return (data as WeeklyReflection) ?? null;
  } catch {
    return null;
  }
}
