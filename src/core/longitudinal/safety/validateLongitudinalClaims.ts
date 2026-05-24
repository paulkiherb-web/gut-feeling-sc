import type { LongitudinalInsight } from '../insights/types';
import type { RecurringPattern } from '../patterns/types';
import type { CausalChain } from '../causality/types';

/**
 * Forbidden language patterns — must not appear in any longitudinal output.
 * Blocks: medical certainty, diagnosis framing, deterministic causal language,
 * overconfident predictions, and unsupported causal claims.
 */
const FORBIDDEN_PHRASES: RegExp[] = [
  /\bcauses?\b/i,
  /\bdiagnos/i,
  /\btreat(ment|s|ing)?\b/i,
  /\bcure[sd]?\b/i,
  /\bwill definitely\b/i,
  /\bguaranteed?\b/i,
  /\bproven\b/i,
  /\bmedically\b/i,
  /\bclinically\b/i,
  /\bclinical\b/i,
  /\bsymptom[s]?\b/i,
  /\bdisease[s]?\b/i,
  /\bdisorder[s]?\b/i,
  /\bcondition[s]?\b/i,
  /\bprescri[bp]/i,
  /\btherapy\b/i,
  /\btherapeutic\b/i,
  /\byou (will|must|should definitely)\b/i,
  /\bis causing\b/i,
  /\bis the cause\b/i,
  /\bdirectly causes?\b/i,
];

/** Check a string for forbidden language */
const containsForbiddenLanguage = (text: string): boolean =>
  FORBIDDEN_PHRASES.some((re) => re.test(text));

/** Validate and filter a longitudinal insight */
export const validateInsight = (
  insight: LongitudinalInsight,
): { valid: boolean; reason?: string } => {
  if (containsForbiddenLanguage(insight.title)) {
    return { valid: false, reason: `Title contains forbidden language: "${insight.title}"` };
  }
  if (containsForbiddenLanguage(insight.body)) {
    return { valid: false, reason: `Body contains forbidden language: "${insight.body}"` };
  }
  if (insight.confidence > 0.97) {
    return { valid: false, reason: 'Confidence exceeds safe ceiling (0.97)' };
  }
  return { valid: true };
};

/** Validate and filter a recurring pattern description */
export const validatePattern = (
  pattern: RecurringPattern,
): { valid: boolean; reason?: string } => {
  if (containsForbiddenLanguage(pattern.description)) {
    return { valid: false, reason: `Pattern description contains forbidden language` };
  }
  if (pattern.confidence > 0.95) {
    return { valid: false, reason: 'Pattern confidence exceeds safe ceiling (0.95)' };
  }
  return { valid: true };
};

/** Validate a causal chain description */
export const validateChain = (
  chain: CausalChain,
): { valid: boolean; reason?: string } => {
  if (containsForbiddenLanguage(chain.description)) {
    return { valid: false, reason: 'Chain description contains forbidden language' };
  }
  if (chain.totalConfidence > 0.90) {
    return { valid: false, reason: 'Chain confidence exceeds safe ceiling (0.90)' };
  }
  return { valid: true };
};

/**
 * Filter a list of insights to only those that pass safety validation.
 * Logs warnings for blocked items in development.
 */
export const validateLongitudinalClaims = <T extends LongitudinalInsight | RecurringPattern | CausalChain>(
  items: T[],
  validator: (item: T) => { valid: boolean; reason?: string },
): T[] => {
  return items.filter((item) => {
    const result = validator(item);
    if (!result.valid && process.env.NODE_ENV === 'development') {
      console.warn('[LongitudinalSafety] Blocked item:', result.reason, item);
    }
    return result.valid;
  });
};
