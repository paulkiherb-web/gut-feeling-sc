/**
 * SCANNER PROTECTION RULES — TypeScript Reference
 *
 * Personal State OS · Product Canonization Layer
 *
 * Machine-readable scanner UX constitution.
 * The scanner is a protected, canonical surface with one purpose.
 */

// ─── Scanner Invariants ───────────────────────────────────────────────────────

export const SCANNER_INVARIANTS = [
  'scanner-has-one-purpose-only',
  'verdict-must-be-dominant-visual',
  'max-two-ctas-primary-plus-secondary',
  'no-recommendation-feed-on-scanner',
  'no-analytics-display-on-scanner',
  'no-gamification-on-scanner',
  'no-promotional-content-on-scanner',
  'no-in-screen-notifications-during-scan',
  'no-auto-play-content-on-scanner',
  'scanner-layout-must-not-be-a-b-tested-without-canon-review',
] as const;

export type ScannerInvariant = (typeof SCANNER_INVARIANTS)[number];

// ─── Scanner Forbidden Elements ───────────────────────────────────────────────

export const SCANNER_FORBIDDEN_ELEMENTS = [
  'analytics-dashboard-overlay',
  'recommendation-feed',
  'progress-bars',
  'streak-indicators',
  'ai-ml-feature-labels',
  'in-screen-notifications',
  'promotional-banners',
  'state-adaptation-content-injections',
  'educational-auto-play',
  'scanner-history-on-verdict-screen',
  'nutritional-deep-dive-on-primary-surface',
  'social-proof-copy',
  'comparative-language',
  'more-than-two-ctas',
] as const;

export type ScannerForbiddenElement = (typeof SCANNER_FORBIDDEN_ELEMENTS)[number];

// ─── Scanner Performance Standards ───────────────────────────────────────────

export const SCANNER_PERFORMANCE = {
  cameraActivationMaxMs: 300,
  scanResultDisplayMaxMs: 400,
  verdictColorRenderMs: 0,   // immediate with result
  navigationBackMaxMs: 150,
  fileUploadAlternativeRequired: true,
} as const;

// ─── Scanner CTA Rules ────────────────────────────────────────────────────────

export const SCANNER_CTA_RULES = {
  maxPrimary: 1,
  maxSecondary: 1,
  secondaryMustBeTextOnly: true,
  competingActionsAllowed: false,
  upsellAllowed: false,
} as const;

// ─── Pre-Ship Checklist ───────────────────────────────────────────────────────

export const SCANNER_SHIP_CHECKLIST = [
  { id: 'single-purpose',       question: 'Does this change preserve single-purpose focus?' },
  { id: 'no-competing-elements',question: 'Does this avoid adding competing visual elements?' },
  { id: 'no-analytics',         question: 'Does this avoid any form of analytics display?' },
  { id: 'no-gamification',      question: 'Does this avoid gamification patterns?' },
  { id: 'no-motivational',      question: 'Does this avoid motivational language?' },
  { id: 'cta-count',            question: 'Does the CTA count remain ≤ 2 (primary + secondary)?' },
  { id: 'verdict-dominant',     question: 'Does the verdict remain the visually dominant element?' },
  { id: 'verdict-timing',       question: 'Is the verdict visible within 400ms of result arrival?' },
] as const satisfies readonly { id: string; question: string }[];

/** All checklist items must pass — any failure blocks the change */
export function validateScannerChecklist(
  answers: Partial<Record<(typeof SCANNER_SHIP_CHECKLIST)[number]['id'], boolean>>
): { passed: boolean; failures: string[] } {
  const failures = SCANNER_SHIP_CHECKLIST
    .filter(item => answers[item.id] !== true)
    .map(item => item.id);
  return { passed: failures.length === 0, failures };
}
