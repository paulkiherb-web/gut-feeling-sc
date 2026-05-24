import type { ConfidenceScore, ConfidenceSummary, ConfidenceLevel } from './types';
import type { RecurringPattern } from '../patterns/types';
import type { CausalChain } from '../causality/types';
import type { PersonalSignature } from '../signatures/types';
import {
  classifyEvidence,
  evidenceToConfidenceFloor,
  evidenceToConfidenceCeiling,
  evidenceClassToLevel,
} from './classifyEvidence';
import { buildConfidenceLabel } from './buildConfidenceLabel';

/**
 * Calculate a bounded confidence score from raw evidence metrics.
 * Never inflates confidence beyond what evidence supports.
 */
export const calculateConfidence = (
  evidenceCount: number,
  consistency: number, // 0–1
  recency: number,     // 0–1
): ConfidenceScore => {
  const evidenceClass = classifyEvidence(evidenceCount);
  const floor = evidenceToConfidenceFloor(evidenceClass);
  const ceiling = evidenceToConfidenceCeiling(evidenceClass);
  const baseLevel = evidenceClassToLevel(evidenceClass);

  // Score within the allowed band
  const rawScore = floor + (ceiling - floor) * (consistency * 0.6 + recency * 0.4);
  const value = Math.max(floor, Math.min(ceiling, rawScore));

  // Upgrade to 'strong' only with high evidence + consistency + recency
  const level: ConfidenceLevel =
    baseLevel === 'measured' && consistency > 0.75 && recency > 0.6
      ? 'strong'
      : baseLevel;

  return {
    value,
    level,
    label: buildConfidenceLabel(level),
    evidenceCount,
    consistency,
    recency,
    explanation: `Based on ${evidenceCount} observations with ${Math.round(consistency * 100)}% consistency.`,
  };
};

const avgPatternConfidence = (patterns: RecurringPattern[]): number => {
  if (!patterns.length) return 0;
  return patterns.reduce((s, p) => s + p.confidence, 0) / patterns.length;
};

const avgChainConfidence = (chains: CausalChain[]): number => {
  if (!chains.length) return 0;
  return chains.reduce((s, c) => s + c.totalConfidence, 0) / chains.length;
};

const confidenceLevelFromValue = (value: number): ConfidenceLevel => {
  if (value < 0.15) return 'uncertain';
  if (value < 0.35) return 'emerging';
  if (value < 0.55) return 'inferred';
  if (value < 0.70) return 'probable';
  if (value < 0.85) return 'measured';
  return 'strong';
};

export const buildConfidenceSummary = (
  patterns: RecurringPattern[],
  chains: CausalChain[],
  signature: PersonalSignature,
  dataSpanDays: number,
): ConfidenceSummary => {
  const patternConfidence = avgPatternConfidence(patterns);
  const causalConfidence = avgChainConfidence(chains);
  const signatureConfidence = signature.confidence;

  const overall =
    (patternConfidence + causalConfidence + signatureConfidence) / 3;

  return {
    overall: confidenceLevelFromValue(overall),
    patternConfidence,
    causalConfidence,
    signatureConfidence,
    evidenceCount: signature.evidenceCount,
    dataSpanDays,
  };
};
