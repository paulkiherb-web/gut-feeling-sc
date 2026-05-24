/**
 * STATE COMMUNICATION RULES — TypeScript Reference
 *
 * Personal State OS · Product Canonization Layer
 *
 * Machine-readable state communication rules.
 * Maps physiological states to canonical communication patterns.
 */

import type { StateColorKey } from '@/design/tokens';

// ─── State Communication Pattern ─────────────────────────────────────────────

export interface StateCommunicationPattern {
  readonly label: string;
  readonly colorToken: StateColorKey;
  readonly tone: 'neutral' | 'observational' | 'advising' | 'direct';
  readonly alarmLanguageAllowed: false;
  readonly celebrationAllowed: false;
  readonly gamificationAllowed: false;
}

// ─── Forbidden State Patterns ─────────────────────────────────────────────────

export const FORBIDDEN_STATE_PATTERNS = [
  'alarm-language-for-manageable-situations',
  'panic-visuals-for-low-state',
  'celebration-for-peak-state',
  'gamification-of-physiological-data',
  'streak-tracking-for-state',
  'percentage-comparison-to-others',
  'progress-bars-for-state-scores',
  'red-color-for-recoverable-situations',
] as const;

export type ForbiddenStatePattern = (typeof FORBIDDEN_STATE_PATTERNS)[number];

// ─── Risk Level Communication ─────────────────────────────────────────────────

export type RiskLevel = 'low' | 'moderate' | 'high';

export const RISK_COMMUNICATION: Record<RiskLevel, {
  readonly copyPattern: string;
  readonly colorToken: StateColorKey;
  readonly tone: string;
  readonly urgencyLanguageAllowed: false;
}> = {
  low: {
    copyPattern: 'At current trajectory, no action needed.',
    colorToken: 'neutral',
    tone: 'informational',
    urgencyLanguageAllowed: false,
  },
  moderate: {
    copyPattern: 'Consider [action] over the next [period].',
    colorToken: 'warning',
    tone: 'advising',
    urgencyLanguageAllowed: false,
  },
  high: {
    copyPattern: 'Elevated risk if current pattern continues.',
    colorToken: 'declining',
    tone: 'direct',
    urgencyLanguageAllowed: false,
  },
} as const;

// ─── Trajectory Communication ─────────────────────────────────────────────────

export type TrajectoryDirection = 'improving' | 'stable' | 'declining';

export const TRAJECTORY_COMMUNICATION: Record<TrajectoryDirection, {
  readonly label: string;
  readonly contextTemplate: string;
}> = {
  improving: {
    label: 'Improving',
    contextTemplate: 'Over the last {n} days',
  },
  stable: {
    label: 'Stable',
    contextTemplate: 'Within typical range',
  },
  declining: {
    label: 'Declining',
    contextTemplate: 'Below average for the past {n} days',
  },
} as const;

// ─── Empty / Error / Loading State Rules ─────────────────────────────────────

export const SYSTEM_STATE_RULES = {
  empty: {
    label: 'No data yet.',
    contextTemplate: 'Start logging to see your state.',
    ctaLabel: 'Log now',
    motivationalFramingAllowed: false,
    fakeEmpathyAllowed: false,
    decorativeIllustrationAllowed: false,
  },
  error: {
    label: 'Something went wrong.',
    contextTemplate: 'Could not load {dataType}.',
    ctaLabel: 'Try again',
    apologyLanguageAllowed: false,
  },
  loading: {
    useSkeletonScreens: true,
    skeletonThresholdMs: 1500,
    progressMessagesAllowed: false,
    spinnerOnPrimaryContentAllowed: false,
  },
} as const;

// ─── Invariants ───────────────────────────────────────────────────────────────

export const STATE_COMMUNICATION_INVARIANTS = [
  'warning-never-uses-alarm-language',
  'risk-never-uses-panic-visuals',
  'recovery-always-uses-calm-tone',
  'optimized-state-never-becomes-gamified',
  'declining-state-never-uses-alarm-red',
  'peak-state-never-triggers-celebration',
  'state-scores-never-shown-as-progress-bars',
] as const;
