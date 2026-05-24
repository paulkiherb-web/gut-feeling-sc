import type { Scorecard } from '../../store/types/state';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface InterventionRecord {
  category: string;
  interventionType: string;
  successCount: number;
  failureCount: number;
  acceptanceCount: number;
  ignoreCount: number;
  snoozeCount: number;
  sampleCount: number;
  /** Exponential moving average of measured effect size, -1 to 1 */
  avgEffectSize: number;
  /** acceptanceCount / sampleCount */
  adherenceRate: number;
  /** successCount / (successCount + failureCount) */
  successRate: number;
  /** 0–1: how resistant the user is to this category */
  resistanceLevel: number;
  bestTimeOfDay?: TimeOfDay;
  lastShownAt?: string;
  lastSuccessAt?: string;
}

export interface PendingOutcomeEvaluation {
  recommendationId: string;
  category: string;
  interventionType: string;
  expectedImpact: Partial<Scorecard>;
  estimatedEffectWindowHours: number;
  preStateScores: Partial<Scorecard>;
  acceptedAt: string;
  completedAt?: string;
  /** ISO timestamp: earliest time to run outcome evaluation */
  evaluateAfter: string;
}

export interface InterventionMemory {
  /** Per-category performance records, key = `category:interventionType` */
  records: Record<string, InterventionRecord>;
  /** Recommendations accepted but not yet outcome-evaluated */
  pendingEvaluations: PendingOutcomeEvaluation[];
  /** 0–1: increases with shown-but-unresponded recommendations */
  fatigueLevel: number;
  totalShown: number;
  totalAccepted: number;
  totalCompleted: number;
  /** Consecutive ignores without any acceptance */
  recentIgnoreStreak: number;
  lastUpdatedAt: string;
}

export const EMPTY_INTERVENTION_MEMORY: InterventionMemory = {
  records: {},
  pendingEvaluations: [],
  fatigueLevel: 0,
  totalShown: 0,
  totalAccepted: 0,
  totalCompleted: 0,
  recentIgnoreStreak: 0,
  lastUpdatedAt: new Date().toISOString(),
};

export const memoryKey = (category: string, interventionType: string): string =>
  `${category}:${interventionType}`;

export const getRecord = (
  memory: InterventionMemory,
  category: string,
  interventionType: string,
): InterventionRecord =>
  memory.records[memoryKey(category, interventionType)] ?? {
    category,
    interventionType,
    successCount: 0,
    failureCount: 0,
    acceptanceCount: 0,
    ignoreCount: 0,
    snoozeCount: 0,
    sampleCount: 0,
    avgEffectSize: 0,
    adherenceRate: 0.5,
    successRate: 0.5,
    resistanceLevel: 0,
  };
