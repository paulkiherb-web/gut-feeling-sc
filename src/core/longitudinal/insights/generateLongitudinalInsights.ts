import type { RecurringPattern } from '../patterns/types';
import type { CausalChain } from '../causality/types';
import type { PersonalSignature } from '../signatures/types';
import type { DriftSignal } from '../drift/types';
import type { LongitudinalInsight } from './types';
import { buildId } from '../../store/calculators/_helpers';
import { confidencePhrase } from '../confidence/buildConfidenceLabel';

const MIN_CONFIDENCE = 0.2;
const MAX_INSIGHTS = 6;

const mkInsight = (
  kind: LongitudinalInsight['kind'],
  title: string,
  body: string,
  confidence: number,
  signals: string[],
): LongitudinalInsight => ({
  id: buildId('li'),
  kind,
  title,
  body,
  confidence,
  confidenceLevel:
    confidence < 0.2 ? 'uncertain' :
    confidence < 0.4 ? 'emerging' :
    confidence < 0.6 ? 'inferred' :
    confidence < 0.75 ? 'probable' :
    confidence < 0.88 ? 'measured' : 'strong',
  signals,
  createdAt: new Date().toISOString(),
});

/**
 * Generate restrained, confidence-aware longitudinal insights.
 * Language is hedged, non-medical, and proportional to evidence strength.
 * No diagnosis framing. No deterministic language. No overconfident prediction.
 */
export const generateLongitudinalInsights = (
  patterns: RecurringPattern[],
  chains: CausalChain[],
  signature: PersonalSignature,
  driftSignals: DriftSignal[],
): LongitudinalInsight[] => {
  const insights: LongitudinalInsight[] = [];

  // Pattern insights — at most 2, strongest first
  const topPatterns = [...patterns]
    .filter((p) => p.confidence >= MIN_CONFIDENCE && p.occurrences >= 3)
    .sort((a, b) => b.confidence * b.effectSize - a.confidence * a.effectSize)
    .slice(0, 2);

  for (const pattern of topPatterns) {
    const phrase = confidencePhrase(
      pattern.strength === 'strong' ? 'measured'
      : pattern.strength === 'moderate' ? 'inferred'
      : 'emerging',
    );
    insights.push(
      mkInsight(
        'pattern',
        pattern.description,
        `${phrase} that ${pattern.triggerLabel.toLowerCase()} is associated with ${pattern.outcomeLabel.toLowerCase()}. Observed in ${pattern.occurrences} instances.`,
        pattern.confidence,
        [pattern.triggerLabel, pattern.outcomeLabel],
      ),
    );
  }

  // Causal chain insights — at most 1
  const topChain = [...chains]
    .filter((c) => c.totalConfidence >= MIN_CONFIDENCE && c.occurrences >= 3)
    .sort((a, b) => b.totalConfidence - a.totalConfidence)[0];

  if (topChain) {
    insights.push(
      mkInsight(
        'causal',
        topChain.description,
        `${confidencePhrase('inferred')}: ${topChain.steps.join(' → ')}.`,
        topChain.totalConfidence,
        topChain.steps,
      ),
    );
  }

  // Signature insights — dominant factor
  const topFactor = signature.dominantFactors[0];
  if (topFactor && topFactor.confidence >= MIN_CONFIDENCE) {
    const phrase = confidencePhrase('probable');
    insights.push(
      mkInsight(
        'signature',
        `${capitalize(topFactor.domain)} consistency appears strongly associated with stable outcomes.`,
        `${phrase} ${topFactor.domain} changes are among the strongest predictors of daily state for this user's pattern.`,
        topFactor.confidence,
        [topFactor.domain],
      ),
    );
  }

  // Drift insights — at most 1
  const urgentDrift = driftSignals
    .filter((d) => d.confidence >= MIN_CONFIDENCE)
    .sort((a, b) => {
      const urgencyOrder = { high: 3, moderate: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    })[0];

  if (urgentDrift) {
    insights.push(
      mkInsight(
        'drift',
        urgentDrift.description,
        `${confidencePhrase('inferred')}: ${urgentDrift.direction.replace(/-/g, ' ')} trend detected over the past ${urgentDrift.trendWindowDays} days.`,
        urgentDrift.confidence,
        urgentDrift.signals,
      ),
    );
  }

  return insights
    .filter((i) => i.confidence >= MIN_CONFIDENCE)
    .slice(0, MAX_INSIGHTS);
};

const capitalize = (s: string): string =>
  s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
