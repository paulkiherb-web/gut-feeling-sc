export type PatternStrength = 'weak' | 'moderate' | 'strong';
export type PatternCategory =
  | 'timing'
  | 'recovery'
  | 'crash'
  | 'intervention'
  | 'recurring';

export interface RecurringPattern {
  id: string;
  category: PatternCategory;
  /** Canon-compliant plain-language description */
  description: string;
  triggerLabel: string;
  outcomeLabel: string;
  /** Typical delay between trigger and outcome in days */
  delayDays: number;
  occurrences: number;
  totalOpportunities: number;
  strength: PatternStrength;
  /** 0–1 */
  confidence: number;
  /** Normalized effect size 0–1 */
  effectSize: number;
  lastSeenAt: string;
  firstSeenAt: string;
  /** 0–1; decays toward 0 if pattern not observed recently */
  decayFactor: number;
}

export interface PatternMemoryStore {
  patterns: RecurringPattern[];
  lastComputedAt: string;
  dataSpanDays: number;
  activeDayCount: number;
}
