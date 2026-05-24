import type { Scorecard } from '../../store/types/state';
import { clamp } from '../../store/calculators/_helpers';
import {
  type InterventionMemory,
  type PendingOutcomeEvaluation,
  getRecord,
  memoryKey,
} from './interventionMemory';
import { evaluateOutcome } from '../outcomes/evaluateOutcome';

export type LifecycleAction =
  | 'shown'
  | 'viewed'
  | 'accepted'
  | 'ignored'
  | 'snoozed'
  | 'completed'
  | 'failed'
  | 'expired';

interface InteractionExtra {
  recommendationId?: string;
  preStateScores?: Partial<Scorecard>;
  estimatedEffectWindowHours?: number;
  expectedImpact?: Partial<Scorecard>;
  completedAt?: string;
}

/** Pure function: record a user interaction and return an updated memory object */
export const recordInteraction = (
  memory: InterventionMemory,
  category: string,
  interventionType: string,
  action: LifecycleAction,
  extra?: InteractionExtra,
): InterventionMemory => {
  const key = memoryKey(category, interventionType);
  const record = { ...getRecord(memory, category, interventionType) };
  const now = new Date().toISOString();

  switch (action) {
    case 'shown':
      record.sampleCount += 1;
      record.lastShownAt = now;
      break;
    case 'accepted':
      record.acceptanceCount += 1;
      record.adherenceRate = record.acceptanceCount / Math.max(1, record.sampleCount);
      record.resistanceLevel = clamp(record.resistanceLevel - 0.05, 0, 1);
      break;
    case 'ignored':
      record.ignoreCount += 1;
      record.resistanceLevel = clamp(record.resistanceLevel + 0.08, 0, 1);
      record.adherenceRate = record.acceptanceCount / Math.max(1, record.sampleCount);
      break;
    case 'snoozed':
      record.snoozeCount += 1;
      record.resistanceLevel = clamp(record.resistanceLevel + 0.02, 0, 1);
      break;
    case 'completed':
      record.successCount += 1;
      record.lastSuccessAt = now;
      break;
    case 'failed':
      record.failureCount += 1;
      break;
  }

  let { fatigueLevel, recentIgnoreStreak, totalShown, totalAccepted, totalCompleted } = memory;
  if (action === 'shown') { totalShown += 1; fatigueLevel = clamp(fatigueLevel + 0.03, 0, 1); }
  if (action === 'accepted') { totalAccepted += 1; recentIgnoreStreak = 0; fatigueLevel = clamp(fatigueLevel - 0.1, 0, 1); }
  if (action === 'completed') { totalCompleted += 1; fatigueLevel = clamp(fatigueLevel - 0.15, 0, 1); }
  if (action === 'ignored') { recentIgnoreStreak += 1; fatigueLevel = clamp(fatigueLevel + 0.05, 0, 1); }
  if (action === 'snoozed') { recentIgnoreStreak = 0; }

  // Queue outcome evaluation when user accepts with full context
  let { pendingEvaluations } = memory;
  if (
    action === 'accepted' &&
    extra?.recommendationId &&
    extra?.preStateScores &&
    extra?.estimatedEffectWindowHours &&
    extra?.expectedImpact
  ) {
    const evalTime = new Date(
      Date.now() + extra.estimatedEffectWindowHours * 3_600_000,
    ).toISOString();
    const pending: PendingOutcomeEvaluation = {
      recommendationId: extra.recommendationId,
      category,
      interventionType,
      expectedImpact: extra.expectedImpact,
      estimatedEffectWindowHours: extra.estimatedEffectWindowHours,
      preStateScores: extra.preStateScores,
      acceptedAt: now,
      evaluateAfter: evalTime,
    };
    pendingEvaluations = [...pendingEvaluations, pending];
  }

  // Mark completion time on pending evaluation
  if (action === 'completed' && extra?.recommendationId) {
    pendingEvaluations = pendingEvaluations.map((pe) =>
      pe.recommendationId === extra.recommendationId ? { ...pe, completedAt: now } : pe,
    );
  }

  return {
    ...memory,
    records: { ...memory.records, [key]: record },
    fatigueLevel,
    recentIgnoreStreak,
    totalShown,
    totalAccepted,
    totalCompleted,
    pendingEvaluations,
    lastUpdatedAt: now,
  };
};

/**
 * Evaluate pending outcomes against the current state snapshot.
 * Called on every state rebuild — lazy, non-blocking.
 */
export const processPendingOutcomes = (
  memory: InterventionMemory,
  currentScores: Partial<Scorecard>,
): InterventionMemory => {
  const now = Date.now();
  const due = memory.pendingEvaluations.filter(
    (pe) => new Date(pe.evaluateAfter).getTime() <= now,
  );
  if (!due.length) return memory;

  const processed = new Set(due.map((pe) => pe.recommendationId));
  let updatedMemory = { ...memory, records: { ...memory.records } };

  for (const pending of due) {
    const evaluation = evaluateOutcome(
      pending.recommendationId,
      pending.category,
      pending.interventionType,
      pending.expectedImpact,
      pending.preStateScores,
      currentScores,
      pending.completedAt ?? pending.acceptedAt,
      new Date().toISOString(),
      pending.estimatedEffectWindowHours,
    );

    const key = memoryKey(pending.category, pending.interventionType);
    const record = { ...getRecord(updatedMemory, pending.category, pending.interventionType) };

    // EMA update: weight = 1 / (sample + 1), converges as N grows
    const n = record.successCount + record.failureCount + 1;
    const alpha = 1 / Math.min(n, 10);
    record.avgEffectSize = record.avgEffectSize * (1 - alpha) + evaluation.effectSize * alpha;

    const isSuccess = evaluation.effectSize >= 0.2;
    if (isSuccess) {
      record.successCount += 1;
      record.lastSuccessAt = new Date().toISOString();
    } else {
      record.failureCount += 1;
    }
    record.successRate =
      record.successCount / Math.max(1, record.successCount + record.failureCount);

    updatedMemory = {
      ...updatedMemory,
      records: { ...updatedMemory.records, [key]: record },
    };
  }

  return {
    ...updatedMemory,
    pendingEvaluations: memory.pendingEvaluations.filter(
      (pe) => !processed.has(pe.recommendationId),
    ),
    lastUpdatedAt: new Date().toISOString(),
  };
};
