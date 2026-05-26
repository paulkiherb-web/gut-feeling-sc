// Compute the "dual path": user's real scorecard vs the ghost scorecard
// (what the scorecard would be if user followed the active plan perfectly).
//
// Implementation: re-run buildScorecard with (actualEvents ∪ materialisedPlanEvents)
// minus duplicates, then expose both readiness values.

import { buildScorecard } from '@/core/domain/scoring/buildScorecard';
import { buildStateSnapshot } from '@/core/domain/state/buildStateSnapshot';
import type { DomainEvent } from '@/core/store/types/events';
import type { UserState, GoalState, Scorecard } from '@/core/store/types/state';
import type { IntensivePlan } from './types';
import { materializePlanEvents } from './materializePlanEvents';

export interface DualPathResult {
  realScores: Scorecard;
  ghostScores: Scorecard;
  realCharge: number;
  ghostCharge: number;
  delta: number; // ghost - real
  dayIndex: number;
}

export function computeDayIndex(startedAtISO: string | null): number {
  if (!startedAtISO) return 1;
  const start = new Date(startedAtISO);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1);
}

export interface ComputeDualPathInput {
  events: DomainEvent[];
  profile: UserState;
  goals: GoalState;
  plan: IntensivePlan;
  startedAtISO: string | null;
}

export function computeDualPath(input: ComputeDualPathInput): DualPathResult {
  const dayIndex = computeDayIndex(input.startedAtISO);

  const realScores = buildScorecard({
    events: input.events,
    profile: input.profile,
    goals: input.goals,
  });

  const planEvents = materializePlanEvents(input.plan, dayIndex);
  const ghostEvents = [...input.events, ...planEvents];

  const ghostScores = buildScorecard({
    events: ghostEvents,
    profile: input.profile,
    goals: input.goals,
  });

  const realCharge = realScores.readiness ?? 50;
  const ghostCharge = ghostScores.readiness ?? 50;

  return {
    realScores,
    ghostScores,
    realCharge,
    ghostCharge,
    delta: ghostCharge - realCharge,
    dayIndex,
  };
}

// Re-export for convenience
export { buildStateSnapshot };
