/**
 * CANONICAL COMPONENT RULES — TypeScript Reference
 *
 * Personal State OS · Product Canonization Layer
 *
 * Machine-readable component constraints. Use for governance checks,
 * developer reference, and automated rule validation.
 */

// ─── Component Types ──────────────────────────────────────────────────────────

export type ComponentType =
  | 'card-hero'
  | 'card-feature'
  | 'card-list'
  | 'card-compact'
  | 'pill'
  | 'state-indicator'
  | 'button-primary'
  | 'button-secondary'
  | 'button-tertiary'
  | 'list'
  | 'section'
  | 'adaptive-surface';

// ─── Shared Constraint Type ───────────────────────────────────────────────────

export interface ComponentConstraints {
  readonly description: string;
  readonly useWhen: readonly string[];
  readonly doNotUseWhen: readonly string[];
  readonly maxDensity: Record<string, number | boolean | string>;
  readonly maxTextLength?: Record<string, number>;
  readonly maxCtaCount: number;
  readonly forbidden: readonly string[];
}

// ─── Card Constraints ─────────────────────────────────────────────────────────

const cardBase = {
  maxCtaCount: 1,
  maxDensity: {
    primaryMetrics: 1,
    supportingMetrics: 2,
    statusIndicators: 1,
    nestedCards: 0,
  },
  maxTextLength: {
    titleLines: 1,
    bodyLines: 3,
  },
  forbidden: [
    'nested-card',
    'multiple-ctas',
    'decorative-image',
    'auto-expand',
  ],
} as const;

export const COMPONENT_RULES: Record<ComponentType, ComponentConstraints> = {
  'card-hero': {
    description: 'Full-width primary signal card. One per view.',
    useWhen: [
      'Communicating the primary state signal for the current session',
      'Showing the most important single insight above the fold',
    ],
    doNotUseWhen: [
      'More than one hero card would appear simultaneously',
      'Content is secondary or supporting context',
    ],
    ...cardBase,
    maxDensity: { ...cardBase.maxDensity, perView: 1 },
  },

  'card-feature': {
    description: 'Full-width feature card for feed items and insights.',
    useWhen: [
      'Displaying an insight, recommendation, or state-derived content',
      'Providing a navigable entry point to a detail view',
    ],
    doNotUseWhen: [
      'Content belongs in a simple list',
      'Content is decorative',
    ],
    ...cardBase,
  },

  'card-list': {
    description: 'Compact full-width card for dense feed contexts.',
    useWhen: [
      'Repeated items in a list where each item has similar weight',
      'Dense informational feeds',
    ],
    doNotUseWhen: [
      'Items have different priority levels (use card-feature with hierarchy)',
      'There is only one item',
    ],
    ...cardBase,
  },

  'card-compact': {
    description: 'Partial-width or pill-style card for inline summaries.',
    useWhen: [
      'Inline summary highlights',
      'Supplementary context within a larger layout',
    ],
    doNotUseWhen: [
      'Primary content',
      'Navigation',
    ],
    ...cardBase,
  },

  'pill': {
    description: 'Read-only semantic label for state, category, or context.',
    useWhen: [
      'State labels (recovery, readiness, etc.)',
      'Category tags on cards',
      'Time context labels',
    ],
    doNotUseWhen: [
      'Navigation tabs',
      'Primary CTAs',
      'Long descriptive text',
    ],
    maxCtaCount: 0,
    maxDensity: { perCard: 2 },
    maxTextLength: { words: 3 },
    forbidden: [
      'more-than-3-words',
      'interactive-by-default',
      'multiple-per-hero-card',
    ],
  },

  'state-indicator': {
    description: 'Visual physiological or performance state communication.',
    useWhen: [
      'Hero card state signal',
      'List items requiring state contrast',
    ],
    doNotUseWhen: [
      'Decoration',
      'Multiple indicators on same component',
    ],
    maxCtaCount: 0,
    maxDensity: { perComponent: 1 },
    forbidden: [
      'decoration-only',
      'non-canonical-state-colors',
      'missing-text-label',
    ],
  },

  'button-primary': {
    description: 'Primary user action trigger. One per screen.',
    useWhen: ['Single most important next action for the user'],
    doNotUseWhen: [
      'Navigation that feels like a link',
      'Inside cards unless sole card CTA',
    ],
    maxCtaCount: 1,
    maxDensity: { perScreen: 1 },
    maxTextLength: { words: 3 },
    forbidden: [
      'non-verb-first-label',
      'exclamation-mark',
      'generic-label',
      'multiple-per-screen',
    ],
  },

  'button-secondary': {
    description: 'Secondary or alternative action. Max 2 per screen.',
    useWhen: ['Alternative or supporting action'],
    doNotUseWhen: ['If competing with primary CTA at same weight'],
    maxCtaCount: 2,
    maxDensity: { perScreen: 2 },
    maxTextLength: { words: 4 },
    forbidden: [
      'same-visual-weight-as-primary',
    ],
  },

  'button-tertiary': {
    description: 'Text-only or icon button for low-stakes actions.',
    useWhen: ['Navigation', 'Reference links', 'Low-priority secondary actions'],
    doNotUseWhen: ['Primary or important actions'],
    maxCtaCount: 999,
    maxDensity: {},
    maxTextLength: { words: 5 },
    forbidden: [],
  },

  'list': {
    description: 'Ordered or unordered collection of equal-weight items.',
    useWhen: [
      'Multiple recommendations at the same priority level',
      'Options for selection',
    ],
    doNotUseWhen: [
      'Items have different priority (use cards)',
      'Only 1 item exists',
      'Items require individual CTAs',
    ],
    maxCtaCount: 0,
    maxDensity: { itemsAboveFold: 3 },
    maxTextLength: { primaryLines: 2, secondaryLines: 1 },
    forbidden: [
      'individual-ctas-per-item',
      'mixed-priority-without-visual-hierarchy',
    ],
  },

  'section': {
    description: 'Named grouping of related content with a single semantic purpose.',
    useWhen: [
      'Grouping 2+ related cards or items',
      'Separating distinct purposes on a scrollable screen',
    ],
    doNotUseWhen: [
      'Single item (orphan section)',
      'Purely decorative grouping',
    ],
    maxCtaCount: 1,
    maxDensity: { perScreen: 5, minimumItems: 2 },
    maxTextLength: { headerWords: 4 },
    forbidden: [
      'empty-section',
      'section-inside-section',
      'decorative-header',
    ],
  },

  'adaptive-surface': {
    description: 'Background container that receives adaptive state tinting.',
    useWhen: [
      'Home screen background',
      'State-sensitive content containers',
    ],
    doNotUseWhen: [
      'Inside cards',
      'Decorative purposes',
      'High-opacity tinting',
    ],
    maxCtaCount: 0,
    maxDensity: { maxTintOpacity: 0.08, nesting: 0 },
    forbidden: [
      'nested-adaptive-surface',
      'tint-opacity-above-8-percent',
      'jarring-state-transition',
    ],
  },
};
