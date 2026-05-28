import { supabase } from '@/integrations/supabase/client';
import type { Correction, IntensivePlan } from './types';

type UnsafeSupabase = {
  from: (table: string) => {
    upsert: (values: unknown, options?: { onConflict?: string }) => Promise<unknown>;
  };
};

const db = supabase as unknown as UnsafeSupabase;

export async function syncSelectedIntensivePlan(plan: IntensivePlan): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await db.from('intensive_plans').upsert(
      {
        user_id: user.id,
        plan_id: plan.id,
        course: plan.course,
        effort: plan.effort,
        title: plan.title,
        duration_days: plan.durationDays,
        payload: plan,
        status: 'active',
        started_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,plan_id' },
    );
  } catch (error) {
    console.warn('syncSelectedIntensivePlan failed', error);
  }
}

export async function syncCorrection(correction: Correction, activePlanId: string | null): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await db.from('intensive_corrections').upsert(
      {
        user_id: user.id,
        correction_id: correction.id,
        plan_id: activePlanId,
        effort: correction.effort,
        title: correction.title,
        description: correction.description,
        scheduled_for: correction.scheduledFor,
        status: correction.status,
        payload: correction,
      },
      { onConflict: 'user_id,correction_id' },
    );
  } catch (error) {
    console.warn('syncCorrection failed', error);
  }
}
