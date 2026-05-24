/**
 * PRODUCT CANONIZATION LAYER
 *
 * Personal State OS · Single Source of Product Truth
 *
 * This barrel export makes canon rules programmatically available
 * throughout the codebase. Import from '@/canon' for governance
 * checks, developer tooling, and onboarding flows.
 *
 * For human-readable documentation, read CANON.md first.
 *
 * @example
 *   import { PRODUCT_PRINCIPLES, CTA_RULES, DECISION_MATRIX } from '@/canon';
 */

// ─── Principles ───────────────────────────────────────────────────────────────
export * from './principles';

// ─── Rules ────────────────────────────────────────────────────────────────────
export * from './rules';

// ─── Patterns ─────────────────────────────────────────────────────────────────
export * from './patterns';

// ─── Layout ───────────────────────────────────────────────────────────────────
export * from './layout';

// ─── Content ──────────────────────────────────────────────────────────────────
export * from './content';

// ─── States ───────────────────────────────────────────────────────────────────
export * from './states';

// ─── Accessibility / Protected Experiences ────────────────────────────────────
export * from './accessibility';

// ─── Governance ───────────────────────────────────────────────────────────────
export * from './governance';
