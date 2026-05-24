/**
 * Intervention Recommendation Lifecycle Model
 *
 * Extends the base Recommendation with fields that power the closed-loop
 * learning system: lifecycle state, behavioral fit, friction, timing, etc.
 */

export type InterventionLifecycleState =
  | 'generated'
  | 'shown'
  | 'viewed'
  | 'accepted'
  | 'snoozed'
  | 'ignored'
  | 'completed'
  | 'failed'
  | 'expired';

export type InterventionType =
  | 'behavioral'
  | 'nutritional'
  | 'hydration'
  | 'sleep'
  | 'recovery'
  | 'supplement'
  | 'goal'
  | 'habit';

/** Maps recommendation category → default intervention type */
export const CATEGORY_TO_INTERVENTION_TYPE: Record<string, InterventionType> = {
  nutrition: 'nutritional',
  hydration: 'hydration',
  sleep: 'sleep',
  recovery: 'recovery',
  behavior: 'behavioral',
  goal: 'goal',
  supplement: 'supplement',
  habit: 'habit',
};

/** Default friction scores per category (0–100, lower = easier to execute) */
export const CATEGORY_FRICTION: Record<string, number> = {
  hydration: 12,
  behavior: 20,
  nutrition: 35,
  goal: 45,
  supplement: 30,
  habit: 25,
  sleep: 50,
  recovery: 55,
};

/** Estimated effect window in hours per category */
export const CATEGORY_EFFECT_WINDOW_HOURS: Record<string, number> = {
  hydration: 1.5,
  nutrition: 3,
  behavior: 0.75,
  supplement: 4,
  habit: 1,
  goal: 6,
  sleep: 10,
  recovery: 14,
};
