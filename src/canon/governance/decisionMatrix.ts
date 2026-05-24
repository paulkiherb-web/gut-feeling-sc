/**
 * DESIGN DECISION MATRIX — TypeScript Reference
 *
 * Personal State OS · Product Canonization Layer
 *
 * Machine-readable decision rules for IF/THEN governance.
 * Each rule maps a condition set to a required response and
 * a set of forbidden responses.
 */

import type { AdaptiveExperienceState } from '@/design/adaptive';

// ─── Decision Rule Type ───────────────────────────────────────────────────────

export interface DecisionRule {
  readonly id: string;
  readonly category: DecisionCategory;
  readonly condition: string;
  readonly required: readonly string[];
  readonly forbidden: readonly string[];
}

export type DecisionCategory =
  | 'user-state'
  | 'content'
  | 'visual'
  | 'architecture';

// ─── Decision Matrix ──────────────────────────────────────────────────────────

export const DECISION_MATRIX: readonly DecisionRule[] = [
  {
    id: 'MATRIX-001',
    category: 'user-state',
    condition: 'User is depleted (readiness < 30 OR recovery < 30 AND sleep < 40)',
    required: [
      'Reduce recommendations to 1',
      'Reduce insights to 1',
      'Hide secondary cards',
      'Disable competing CTAs',
      'Use terse tone register',
      'Increase section spacing by 1.25x',
      'Use still/slow motion profile',
    ],
    forbidden: [
      'Show full recommendation feed',
      'Show congratulatory messages',
      'Use standard density',
      'Show competing actions',
    ],
  },
  {
    id: 'MATRIX-002',
    category: 'user-state',
    condition: 'User is overloaded (stress > 75 OR weighted risk ≥ 2.5)',
    required: [
      'Activate focus mode',
      'Reduce to single priority',
      'Suppress secondary actions',
      'Use terse register',
    ],
    forbidden: [
      'Show multiple competing priorities',
      'Add motivational content',
      'Show feature discovery banners',
    ],
  },
  {
    id: 'MATRIX-003',
    category: 'user-state',
    condition: 'User is fragile (readiness < 45 AND sleep < 55 OR stress > 60)',
    required: [
      'Quiet the interface',
      'Disable competing CTAs',
      'Use calm motion',
      'Use concise register',
    ],
    forbidden: [
      'Show full density',
      'Show impact chips or urgency framing',
      'Present multiple actions',
    ],
  },
  {
    id: 'MATRIX-004',
    category: 'user-state',
    condition: 'User is recovering (readiness < 60 AND trajectory improving)',
    required: [
      'Show supportive context (not motivational)',
      'Max 2 recommendations',
      'Max 2 insights',
      'Use concise register with rationale',
    ],
    forbidden: [
      'Motivational framing',
      'Dense interface that creates pressure',
      'Comparative statements to previous performance',
    ],
  },
  {
    id: 'MATRIX-005',
    category: 'user-state',
    condition: 'Prediction risk is critical (high risks ≥ 2, or high risk ≥ 1 AND readiness < 50)',
    required: [
      'Activate focus mode regardless of base state',
      'Simplify Home to one priority',
      'Elevate single most critical prediction',
      'Suppress all secondary actions',
      'Use terse/direct copy',
    ],
    forbidden: [
      'Alarm language (CRITICAL, DANGER)',
      'Red color for non-alarm situations',
      'Multiple competing risk messages simultaneously',
    ],
  },
  {
    id: 'MATRIX-006',
    category: 'user-state',
    condition: 'User is optimized (readiness ≥ 85 AND trajectory improving AND momentum not weak)',
    required: [
      'Enable rich density',
      'Enable directive action intensity',
      'Use standard register with rationale and impact',
    ],
    forbidden: [
      'Show badges/trophies/celebrations',
      'Use streak language',
      'Gamify the optimized state',
      'Present comparison to other users',
      'Use peak performance hype language',
    ],
  },
  {
    id: 'MATRIX-007',
    category: 'content',
    condition: 'New recommendation needs a CTA',
    required: [
      'Check CTA_BY_STATE for permitted count and intensity',
      'Use verb-first copy (max 3 words)',
      'Use canonical button variant for intensity level',
    ],
    forbidden: [
      'Add CTA if state forbids competing actions',
      'Use exclamation marks',
      'Show more than 1 CTA on the card',
    ],
  },
  {
    id: 'MATRIX-008',
    category: 'content',
    condition: 'Copy must communicate negative state',
    required: [
      'Use observational or direct tone',
      'Reference specific data',
      'Use muted state colors only',
      'Include practical calm next step',
    ],
    forbidden: [
      'Alarm language (CRITICAL, DANGER, WARNING:)',
      'Red color (#ef4444 or alarm red)',
      'Emotional language (unfortunately, we are concerned)',
    ],
  },
  {
    id: 'MATRIX-009',
    category: 'content',
    condition: 'New feature adds content to Home screen',
    required: [
      'Audit current density for each adaptive state',
      'Ensure max cards above fold not exceeded',
      'Apply adaptive suppression to new content',
      'Document which density level the content appears at',
    ],
    forbidden: [
      'Content that bypasses the adaptive density system',
      'Force content visibility regardless of user state',
      'Section header for a single item',
    ],
  },
  {
    id: 'MATRIX-010',
    category: 'visual',
    condition: 'New interaction requires animation',
    required: [
      'Select from canonical motion token set',
      'Apply state-appropriate durationScale',
      'Ensure animation communicates something (not decoration)',
      'Test in depleted state (durationScale 1.6x)',
    ],
    forbidden: [
      'Bounce or spring curves',
      'Looping animations',
      'Text animation',
      'More than 3 simultaneous animations',
    ],
  },
  {
    id: 'MATRIX-011',
    category: 'visual',
    condition: 'New component needs a color',
    required: [
      'Check if semantic state color applies',
      'Use only canonical stateColors or brand token',
      'Verify accessibility (color not sole differentiator)',
    ],
    forbidden: [
      'Introduce a new accent color',
      'Saturation above 70 for surfaces',
      'Decorative color gradients',
      'Red for non-destructive actions',
    ],
  },
  {
    id: 'MATRIX-012',
    category: 'architecture',
    condition: 'New UI need arises',
    required: [
      'Check existing components in src/design/components/',
      'Check existing product components in src/components/',
      'Evaluate variant extension',
      'Evaluate composition of existing components',
    ],
    forbidden: [
      'Create new component without checking existing patterns',
      'Duplicate components with minor modifications',
      'One-off components for a single feature',
    ],
  },
] as const;

/** Look up a decision rule by ID */
export function getDecisionRule(id: string): DecisionRule | undefined {
  return DECISION_MATRIX.find(r => r.id === id);
}

/** Get all rules for a given category */
export function getDecisionsByCategory(category: DecisionCategory): readonly DecisionRule[] {
  return DECISION_MATRIX.filter(r => r.category === category);
}

/** Get the adaptive response required for a given state */
export function getStateDecisionRule(state: AdaptiveExperienceState): DecisionRule | undefined {
  const stateMap: Partial<Record<AdaptiveExperienceState, string>> = {
    depleted:   'MATRIX-001',
    overloaded: 'MATRIX-002',
    fragile:    'MATRIX-003',
    recovering: 'MATRIX-004',
    optimized:  'MATRIX-006',
  };
  const ruleId = stateMap[state];
  return ruleId ? getDecisionRule(ruleId) : undefined;
}
