/**
 * PRODUCT PRINCIPLES — Machine-Readable Manifest
 *
 * Personal State OS · Product Canonization Layer
 *
 * These are the 8 core principles that govern all design and product decisions.
 * They are exported as typed constants for use in documentation tools,
 * onboarding flows, and governance audits.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductPrinciple {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly inPractice: readonly string[];
  readonly antiPatterns: readonly string[];
}

// ─── Principle Definitions ────────────────────────────────────────────────────

export const PRODUCT_PRINCIPLES = [
  {
    id: 'invisible-premium',
    name: 'Invisible Premium',
    tagline: 'Quality is felt, not displayed.',
    description:
      'The premium nature of this product is communicated through restraint, ' +
      'precision, and craft — not through badge labels, Pro tags, or visual loudness. ' +
      'The interface itself is the premium signal.',
    inPractice: [
      'No "Premium", "Pro", or "Unlock" language inside the core experience',
      'Typography, spacing, and motion are calibrated to feel considered, not generated',
      'Elevation and color are used sparingly — each appearance is meaningful',
      'The user should feel that someone thought carefully about every pixel',
    ],
    antiPatterns: [
      'Gradient-heavy premium UI that looks expensive but reads as noise',
      'Animated loading states that substitute for actual speed',
      'Feature density used as a proxy for value',
      'Lock icons and paywalled hints cluttering the primary experience',
    ],
  },
  {
    id: 'calm-intelligence',
    name: 'Calm Intelligence',
    tagline: 'Smart without being verbose. Inference without announcement.',
    description:
      'The product\'s intelligence surfaces in outcomes, not UI elements. ' +
      'AI features are not labeled "AI-powered" — they simply work.',
    inPractice: [
      'Predictions are presented as observations, not warnings',
      'Recommendations are contextual, not algorithmic-looking',
      'The interface never announces its reasoning unprompted',
      'Complex inference is compressed into calm, direct sentences',
    ],
    antiPatterns: [
      '"AI-powered insights" labels',
      'Pulsing indicators on intelligent features',
      'Verbose rationale that explains the system\'s reasoning unprompted',
      'Dashboard-style data dumps framed as intelligence',
    ],
  },
  {
    id: 'low-cognitive-load',
    name: 'Low Cognitive Load',
    tagline: 'One primary decision per screen. Always.',
    description:
      'The user should never feel overwhelmed. The interface does the cognitive ' +
      'work so the user doesn\'t have to.',
    inPractice: [
      'Maximum one primary CTA above the fold',
      'Information hierarchy is enforced: one hero, then supporting context',
      'Progressive disclosure — complexity hides until the user explicitly requests it',
      'State adaptation reduces density when the user\'s cognitive capacity is lower',
    ],
    antiPatterns: [
      'Multiple competing CTAs at the same visual weight',
      'Cards that each claim equal priority',
      'Notifications that interrupt the primary flow',
      'Dashboards that show everything simultaneously',
    ],
  },
  {
    id: 'emotional-restraint',
    name: 'Emotional Restraint',
    tagline: 'The interface is a tool, not a companion. It does not perform emotions.',
    description:
      'No fake empathy. No motivational framing. The product respects the user\'s ' +
      'intelligence and does not attempt to manage their emotional state through copy.',
    inPractice: [
      'Positive states are acknowledged briefly, not celebrated',
      'Negative states are addressed practically, not dramatized',
      'Recovery is framed as progress, never as struggle',
      'Risk is communicated as information, not as urgency',
    ],
    antiPatterns: [
      '"Great job!" for logging a meal',
      '"You\'re crushing it!" for reaching a readiness score',
      '"Don\'t give up!" for declining state',
      'Heart icons, sparkles, or confetti in response to data',
      'Fake empathy ("We know this is hard...")',
    ],
  },
  {
    id: 'state-aware-ux',
    name: 'State-Aware UX',
    tagline: 'The interface adapts to the user\'s current physiological state.',
    description:
      'Not "the app reacts to your feelings." ' +
      'Yes "the interface becomes appropriate for your current biological state." ' +
      'This adaptation is silent — the user should not notice the mechanism, only feel the fit.',
    inPractice: [
      'Depleted state: minimal density, one recommendation, slow motion',
      'Fragile state: quiet interface, suppressed secondary content',
      'Overloaded state: focus mode, single priority, no competing actions',
      'Optimized state: maximum contextual richness, slightly more responsive',
    ],
    antiPatterns: [
      'Showing the same dense interface regardless of user state',
      'Adding more content when the user is recovering',
      'Using gamification to motivate depleted users',
      'Making adaptation visible through jarring transitions',
    ],
  },
  {
    id: 'human-designed-feel',
    name: 'Human-Designed Feel',
    tagline: 'Every decision feels like a human made it — not an algorithm.',
    description:
      'The product should feel like an extremely well-made publication, ' +
      'not a generated interface. Rhythm, hierarchy, and proportion are ' +
      'calibrated by judgment, not by default framework values.',
    inPractice: [
      'Spacing uses the design token scale — not arbitrary values',
      'Typography follows the editorial hierarchy strictly',
      'Motion is purposeful — every animation communicates something',
      'Interaction patterns are consistent across the entire product',
    ],
    antiPatterns: [
      'Default Tailwind spacing without intentionality',
      'Generic component library appearance without customization',
      'Inconsistent motion timing across features',
      'Visual inconsistency between pages',
    ],
  },
  {
    id: 'adaptive-simplicity',
    name: 'Adaptive Simplicity',
    tagline: 'Simplicity is not less functionality — it is better prioritization.',
    description:
      'Features do not disappear when the user is in a low state. ' +
      'They become appropriately quiet. Progressive disclosure ensures ' +
      'that full capability is always available to those who seek it.',
    inPractice: [
      'The scanner is always accessible, regardless of state',
      'Secondary features retreat but are not removed',
      'Information architecture supports both scanning (3s) and deep reading',
      'The most useful action for this moment is always visually primary',
    ],
    antiPatterns: [
      'Removing features from low-state users entirely',
      'Forcing simplicity through fewer screens rather than progressive disclosure',
      'Making advanced features feel hidden or punishing to access',
    ],
  },
  {
    id: 'editorial-hierarchy',
    name: 'Editorial Hierarchy',
    tagline: 'Not everything can be important. Hierarchy is enforced, not suggested.',
    description:
      'The product has a clear editorial voice — one that decides what matters ' +
      'most right now and presents it accordingly. Supporting context exists at ' +
      'lower visual weight. Background context exists but does not intrude.',
    inPractice: [
      'Every screen has exactly one primary element',
      'Supporting elements are visually secondary by design tokens, not overrides',
      'Background information lives in drawers, sheets, or collapsed sections',
      'Section headers are navigational, not decorative',
    ],
    antiPatterns: [
      'Multiple cards claiming hero status simultaneously',
      'Section headers that compete with content titles',
      'Information presented at equal weight when priority differs',
      'Lists without visual hierarchy between items',
    ],
  },
] as const satisfies readonly ProductPrinciple[];

export type PrincipleId = (typeof PRODUCT_PRINCIPLES)[number]['id'];

/** Returns a principle by ID */
export function getPrinciple(id: PrincipleId): ProductPrinciple {
  return PRODUCT_PRINCIPLES.find(p => p.id === id)!;
}
