import type { Recommendation, Scorecard } from '../../store/types/state';
import { type InterventionMemory, getRecord } from '../learning/interventionMemory';
import { clamp } from '../../store/calculators/_helpers';

const URGENCY_MULTIPLIER: Record<string, number> = {
  high: 1.6,
  medium: 1.2,
  low: 1.0,
};

export interface ScoringContext {
  currentScores: Scorecard;
  memory: InterventionMemory;
  /** Current hour of day (0–23) for time-of-day fit */
  hourOfDay: number;
}

/**
 * Compute a composite 0–100 score for a recommendation.
 *
 * Formula:
 *   compositeScore = (
 *     leverageScore   × 0.35   // weighted expected impact × state gap
 *     + execProbability × 0.30  // adherence × friction × fatigue
 *     + contextFit      × 0.20  // avg effect size + success rate from memory
 *     + rawPriority     × 0.15  // original generation priority
 *   ) × urgencyMultiplier × behavioralFitBonus
 */
export const scoreRecommendation = (
  rec: Recommendation,
  ctx: ScoringContext,
): number => {
  const urgency = (rec as { urgency?: string }).urgency ?? 'medium';
  const category = rec.category ?? 'behavior';
  const interventionType =
    (rec as { interventionType?: string }).interventionType ?? category;
  const frictionScore = (rec as { frictionScore?: number }).frictionScore ?? 40;
  const behavioralFit = (rec as { behavioralFit?: number }).behavioralFit ?? 60;

  const record = getRecord(ctx.memory, category, interventionType);

  // 1. Leverage: expected impact weighted by how far below target each metric is
  const impact = rec.expectedImpact ?? {};
  const metrics = Object.keys(impact) as (keyof Scorecard)[];
  let leverageScore: number;

  if (metrics.length > 0) {
    const totalImpact = metrics.reduce((s, m) => s + Math.max(0, impact[m] ?? 0), 0);
    const avgGap =
      metrics.reduce((s, m) => s + Math.max(0, 100 - (ctx.currentScores[m] ?? 50)), 0) /
      metrics.length;
    leverageScore = clamp((totalImpact * (avgGap / 100)) * 2, 0, 100);
  } else {
    leverageScore = rec.leverage ?? 50;
  }

  // 2. Execution probability from memory
  const adherenceBoost = record.adherenceRate ?? 0.5;
  const resistancePenalty = 1 - (record.resistanceLevel ?? 0);
  const frictionPenalty = 1 - (frictionScore / 100) * 0.5;
  const fatiguePenalty = 1 - ctx.memory.fatigueLevel * 0.4;
  const executionProb = clamp(
    adherenceBoost * resistancePenalty * frictionPenalty * fatiguePenalty * 100,
    10,
    100,
  );

  // 3. Contextual fit from learned memory
  const effectSizeNorm = (record.avgEffectSize + 1) / 2; // -1..1 → 0..1
  const contextFit = clamp(
    (effectSizeNorm * 0.6 + (record.successRate ?? 0.5) * 0.4) * 100,
    0,
    100,
  );

  // 4. Urgency multiplier
  const urgencyMul =
    URGENCY_MULTIPLIER[urgency as keyof typeof URGENCY_MULTIPLIER] ?? 1.2;

  // 5. Behavioral fit bonus (0.8–1.0 range)
  const fitBonus = 0.8 + (behavioralFit / 100) * 0.2;

  const raw =
    (leverageScore * 0.35 +
      executionProb * 0.3 +
      contextFit * 0.2 +
      (rec.priority ?? 50) * 0.15) *
    urgencyMul *
    fitBonus;

  return clamp(Math.round(raw), 0, 100);
};
