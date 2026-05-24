import type { DomainEvent } from '../../store/types/events';
import type { LongitudinalModel } from './types';
import type { LongitudinalMemory } from '../memory/types';
import { buildTimeline } from '../timeline/buildTimeline';
import { buildDailyProxies } from '../_shared/dailyBuckets';
import { detectTimingPatterns } from '../patterns/detectTimingPatterns';
import { detectRecoveryPatterns } from '../patterns/detectRecoveryPatterns';
import { detectCrashPatterns } from '../patterns/detectCrashPatterns';
import { detectInterventionPatterns } from '../patterns/detectInterventionPatterns';
import { detectRecurringPatterns } from '../patterns/detectRecurringPatterns';
import { buildCausalChain } from '../causality/buildCausalChain';
import { buildPersonalSignature } from '../signatures/buildPersonalSignature';
import { detectStateDrift } from '../drift/detectStateDrift';
import { detectOverloadTrajectory } from '../drift/detectOverloadTrajectory';
import { detectRecoveryCollapse } from '../drift/detectRecoveryCollapse';
import { detectPositiveMomentum } from '../drift/detectPositiveMomentum';
import { generateLongitudinalInsights } from '../insights/generateLongitudinalInsights';
import { buildConfidenceSummary } from '../confidence/calculateConfidence';
import {
  validateLongitudinalClaims,
  validateInsight,
  validatePattern,
  validateChain,
} from '../safety/validateLongitudinalClaims';

/** Minimum events required for meaningful longitudinal inference */
const MIN_EVENTS = 10;
/** Minimum active days for pattern detection */
const MIN_ACTIVE_DAYS = 5;

const spanDays = (first: string, last: string): number => {
  const ms = new Date(last).getTime() - new Date(first).getTime();
  return Math.max(1, ms / 86_400_000 + 1);
};

const buildMemory = (events: DomainEvent[]): LongitudinalMemory => {
  if (events.length === 0) {
    return {
      firstEventAt: null,
      lastEventAt: null,
      totalEventCount: 0,
      activeDays: 0,
      spanDays: 0,
    };
  }
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const days = new Set(sorted.map((e) => e.createdAt.slice(0, 10)));
  return {
    firstEventAt: sorted[0].createdAt,
    lastEventAt: sorted[sorted.length - 1].createdAt,
    totalEventCount: sorted.length,
    activeDays: days.size,
    spanDays: spanDays(sorted[0].createdAt, sorted[sorted.length - 1].createdAt),
  };
};

// Module-level memoization cache
let _cache: { hash: string; model: LongitudinalModel } | null = null;

const hashEvents = (events: DomainEvent[]): string =>
  `${events.length}:${events.at(-1)?.id ?? ''}:${events.at(-1)?.createdAt ?? ''}`;

/**
 * Build the full longitudinal intelligence model from the event log.
 *
 * Memoized: returns cached result if the event log has not changed.
 * Safe to call on every rebuildState() — skips work when nothing changed.
 */
export const buildLongitudinalModel = (events: DomainEvent[]): LongitudinalModel => {
  const hash = hashEvents(events);
  if (_cache && _cache.hash === hash) return _cache.model;

  const memory = buildMemory(events);
  const isDataSufficient = events.length >= MIN_EVENTS && memory.activeDays >= MIN_ACTIVE_DAYS;

  if (!isDataSufficient) {
    const emptyModel = buildEmptyModel(events, memory);
    _cache = { hash, model: emptyModel };
    return emptyModel;
  }

  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const proxies = buildDailyProxies(sorted);
  const timeline = buildTimeline(sorted);

  // Pattern detection
  const rawPatterns = [
    ...detectTimingPatterns(proxies),
    ...detectRecoveryPatterns(proxies),
    ...detectCrashPatterns(proxies),
    ...detectInterventionPatterns(proxies),
    ...detectRecurringPatterns(proxies),
  ];
  const recurringPatterns = validateLongitudinalClaims(rawPatterns, validatePattern);

  // Causal chains
  const rawChains = buildCausalChain(proxies);
  const causalChains = validateLongitudinalClaims(rawChains, validateChain);

  // Personal signature
  const personalSignature = buildPersonalSignature(proxies);

  // Drift signals
  const driftSignals = [
    ...detectStateDrift(proxies),
    ...(detectOverloadTrajectory(proxies) ? [detectOverloadTrajectory(proxies)!] : []),
    ...(detectRecoveryCollapse(proxies) ? [detectRecoveryCollapse(proxies)!] : []),
    ...(detectPositiveMomentum(proxies) ? [detectPositiveMomentum(proxies)!] : []),
  ];

  // Insights
  const rawInsights = generateLongitudinalInsights(
    recurringPatterns,
    causalChains,
    personalSignature,
    driftSignals,
  );
  const longitudinalInsights = validateLongitudinalClaims(rawInsights, validateInsight);

  // Confidence summary
  const confidenceSummary = buildConfidenceSummary(
    recurringPatterns,
    causalChains,
    personalSignature,
    memory.spanDays,
  );

  const model: LongitudinalModel = {
    timeline,
    recurringPatterns,
    causalChains,
    personalSignature,
    driftSignals,
    longitudinalInsights,
    confidenceSummary,
    memory,
    generatedAt: new Date().toISOString(),
    eventCount: events.length,
    spanDays: memory.spanDays,
    isDataSufficient,
  };

  _cache = { hash, model };
  return model;
};

const buildEmptyModel = (events: DomainEvent[], memory: LongitudinalMemory): LongitudinalModel => ({
  timeline: {
    items: [],
    dailyProxies: [],
    generatedAt: new Date().toISOString(),
    spanDays: memory.spanDays,
    activeDays: memory.activeDays,
    eventCount: events.length,
  },
  recurringPatterns: [],
  causalChains: [],
  personalSignature: {
    hydrationSensitivity: 0,
    sleepSensitivity: 0,
    caffeineImpact: 0,
    nutritionSensitivity: 0,
    recoveryLagDays: 1,
    overloadResilience: 0.5,
    interventionResponsiveness: 0,
    dominantFactors: [],
    recoveryProfile: { avgRecoveryLagDays: 1, recoveryConsistency: 0.5, interventionEffectiveness: 0 },
    confidence: 0,
    evidenceCount: events.length,
  },
  driftSignals: [],
  longitudinalInsights: [],
  confidenceSummary: {
    overall: 'uncertain',
    patternConfidence: 0,
    causalConfidence: 0,
    signatureConfidence: 0,
    evidenceCount: events.length,
    dataSpanDays: memory.spanDays,
  },
  memory,
  generatedAt: new Date().toISOString(),
  eventCount: events.length,
  spanDays: memory.spanDays,
  isDataSufficient: false,
});
