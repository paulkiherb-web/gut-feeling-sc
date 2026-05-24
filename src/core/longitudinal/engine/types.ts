import type { LongitudinalMemory } from '../memory/types';
import type { NormalizedTimeline } from '../timeline/types';
import type { RecurringPattern } from '../patterns/types';
import type { CausalChain } from '../causality/types';
import type { PersonalSignature } from '../signatures/types';
import type { DriftSignal } from '../drift/types';
import type { LongitudinalInsight } from '../insights/types';
import type { ConfidenceSummary } from '../confidence/types';

export interface LongitudinalModel {
  timeline: NormalizedTimeline;
  recurringPatterns: RecurringPattern[];
  causalChains: CausalChain[];
  personalSignature: PersonalSignature;
  driftSignals: DriftSignal[];
  longitudinalInsights: LongitudinalInsight[];
  confidenceSummary: ConfidenceSummary;
  memory: LongitudinalMemory;
  generatedAt: string;
  eventCount: number;
  spanDays: number;
  /** True when minimum data threshold is reached for useful inference */
  isDataSufficient: boolean;
}
