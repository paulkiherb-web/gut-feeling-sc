import type { Scorecard } from '../../store/types/state';

export interface OutcomeEvaluation {
  recommendationId: string;
  category: string;
  interventionType: string;
  expectedImpact: Partial<Scorecard>;
  actualImpact: Partial<Scorecard>;
  /** -1 to 1: how well actual matched expected (1 = perfect match or better) */
  effectSize: number;
  /** 0–1: how close to the target effect window the evaluation happened */
  timingScore: number;
  /** Metrics where actual diverged strongly from expected (potential confounders) */
  confounders: string[];
  outcomeQuality: 'strong' | 'moderate' | 'weak' | 'neutral' | 'negative';
}

export const evaluateOutcome = (
  recommendationId: string,
  category: string,
  interventionType: string,
  expectedImpact: Partial<Scorecard>,
  preStateScores: Partial<Scorecard>,
  postStateScores: Partial<Scorecard>,
  completedAt: string,
  evaluatedAt: string,
  estimatedEffectWindowHours: number,
): OutcomeEvaluation => {
  const metrics = Object.keys(expectedImpact) as (keyof Scorecard)[];

  // 1. Compute per-metric actual delta vs expected
  const actualImpact: Partial<Scorecard> = {};
  let totalExpected = 0;
  let totalActual = 0;

  for (const metric of metrics) {
    const exp = expectedImpact[metric] ?? 0;
    const pre = preStateScores[metric] ?? 50;
    const post = postStateScores[metric] ?? pre;
    const actual = post - pre;
    actualImpact[metric] = Math.round(actual * 10) / 10;
    totalExpected += Math.max(0, exp);
    totalActual += actual;
  }

  // 2. Effect size: actual / expected (clamped -1 to 1)
  const rawEffectSize = totalExpected > 0 ? totalActual / totalExpected : 0;
  const effectSize = Math.max(-1, Math.min(1, rawEffectSize));

  // 3. Timing score: closer to the effect window = higher score
  const elapsedHours =
    (new Date(evaluatedAt).getTime() - new Date(completedAt).getTime()) / 3_600_000;
  const timingScore = Math.max(
    0,
    1 - Math.abs(elapsedHours - estimatedEffectWindowHours) / Math.max(1, estimatedEffectWindowHours),
  );

  // 4. Confounders: metrics where actual deviated >5 pts from expected
  const confounders: string[] = [];
  for (const metric of metrics) {
    const exp = expectedImpact[metric] ?? 0;
    const act = actualImpact[metric] ?? 0;
    if (Math.abs(act - exp) > 5) confounders.push(metric);
  }

  // 5. Outcome quality label
  let outcomeQuality: OutcomeEvaluation['outcomeQuality'];
  if (effectSize >= 0.7) outcomeQuality = 'strong';
  else if (effectSize >= 0.3) outcomeQuality = 'moderate';
  else if (effectSize >= 0.05) outcomeQuality = 'weak';
  else if (effectSize >= -0.2) outcomeQuality = 'neutral';
  else outcomeQuality = 'negative';

  return {
    recommendationId,
    category,
    interventionType,
    expectedImpact,
    actualImpact,
    effectSize,
    timingScore,
    confounders,
    outcomeQuality,
  };
};
