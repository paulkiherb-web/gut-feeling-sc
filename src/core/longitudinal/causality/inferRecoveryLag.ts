import type { DayProxy } from '../timeline/types';

export interface RecoveryLagResult {
  /** Typical days between intervention and readiness recovery */
  lagDays: number;
  confidence: number;
  evidenceCount: number;
}

/**
 * Estimate how many days after a recovery intervention readiness peaks.
 * Checks lag 1–3 days to find peak correlation.
 */
export const inferRecoveryLag = (proxies: DayProxy[]): RecoveryLagResult => {
  if (proxies.length < 5) {
    return { lagDays: 1, confidence: 0, evidenceCount: 0 };
  }

  const interventionIndices = proxies
    .map((p, i) => (p.hadRecoveryIntervention ? i : -1))
    .filter((i) => i >= 0);

  if (interventionIndices.length < 3) {
    return { lagDays: 1, confidence: 0, evidenceCount: interventionIndices.length };
  }

  const lagScores: Record<number, number[]> = { 1: [], 2: [], 3: [] };

  for (const idx of interventionIndices) {
    for (const lag of [1, 2, 3] as const) {
      const after = proxies[idx + lag];
      const before = proxies[idx];
      if (after && before) {
        lagScores[lag].push(after.readinessProxy - before.readinessProxy);
      }
    }
  }

  let bestLag = 1;
  let bestAvgGain = -Infinity;
  for (const [lagStr, gains] of Object.entries(lagScores)) {
    if (gains.length === 0) continue;
    const avg = gains.reduce((a, b) => a + b, 0) / gains.length;
    if (avg > bestAvgGain) {
      bestAvgGain = avg;
      bestLag = Number(lagStr);
    }
  }

  const gains = lagScores[bestLag];
  const confidence = gains.length > 0 && bestAvgGain > 0
    ? Math.min((bestAvgGain / 20) * (gains.length / 10), 0.85)
    : 0;

  return {
    lagDays: bestLag,
    confidence,
    evidenceCount: interventionIndices.length,
  };
};
