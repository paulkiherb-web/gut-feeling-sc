/**
 * INVISIBLE PREMIUM — Design Token System
 *
 * Philosophy: High intelligence. Low cognitive load.
 * Tokens are consumed by CSS variables in index.css and
 * by TypeScript components for programmatic access.
 */

// ─── Spacing Scale ────────────────────────────────────────────────────────────
export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ─── Radius Scale ─────────────────────────────────────────────────────────────
export const radius = {
  none: '0px',
  xs:   '4px',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '18px',
  '2xl':'24px',
  pill: '999px',
} as const;

// ─── Typography Scale ─────────────────────────────────────────────────────────
export const typographyScale = {
  display: {
    size: 'clamp(32px, 8vw, 40px)',
    lineHeight: '1.1',
    letterSpacing: '-0.04em',
    weight: 700,
    family: 'display',
  },
  hero: {
    size: 'clamp(26px, 6.5vw, 32px)',
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
    weight: 700,
    family: 'display',
  },
  title: {
    size: 'clamp(20px, 5vw, 24px)',
    lineHeight: '1.2',
    letterSpacing: '-0.025em',
    weight: 600,
    family: 'display',
  },
  section: {
    size: 'clamp(16px, 4vw, 18px)',
    lineHeight: '1.3',
    letterSpacing: '-0.02em',
    weight: 600,
    family: 'sans',
  },
  body: {
    size: '15px',
    lineHeight: '1.6',
    letterSpacing: '-0.01em',
    weight: 400,
    family: 'sans',
  },
  secondary: {
    size: '13px',
    lineHeight: '1.5',
    letterSpacing: '0em',
    weight: 400,
    family: 'sans',
  },
  caption: {
    size: '11px',
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    weight: 500,
    family: 'sans',
  },
  micro: {
    size: '9px',
    lineHeight: '1.3',
    letterSpacing: '0.07em',
    weight: 600,
    family: 'sans',
  },
} as const;

// ─── Elevation Scale ──────────────────────────────────────────────────────────
export const elevation = {
  0: 'none',
  1: '0 1px 2px rgba(0,0,0,0.04)',
  2: '0 2px 8px rgba(0,0,0,0.06)',
  3: '0 4px 16px rgba(0,0,0,0.08)',
  4: '0 8px 32px rgba(0,0,0,0.10)',
} as const;

// ─── Opacity Scale ────────────────────────────────────────────────────────────
export const opacity = {
  disabled: 0.38,
  muted:    0.55,
  subtle:   0.70,
  soft:     0.85,
  full:     1.0,
} as const;

// ─── Motion Scale ─────────────────────────────────────────────────────────────
export const motionDuration = {
  instant: 80,
  fast:    150,
  base:    250,
  slow:    400,
  calm:    600,
} as const;

export const motionEasing = {
  /** Standard ease — general UI */
  default:  [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  /** Material smooth — enters/exits */
  smooth:   [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Decelerate — elements entering screen */
  decel:    [0, 0, 0.2, 1] as [number, number, number, number],
  /** Accelerate — elements leaving screen */
  accel:    [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

// ─── Semantic State Colors ────────────────────────────────────────────────────
// Muted, non-alarming, editorial — NOT neon/alarm
export const stateColors = {
  recovery:  { h: 158, s: 50, l: 42, label: 'Recovery'  },
  readiness: { h: 200, s: 48, l: 45, label: 'Readiness' },
  warning:   { h:  36, s: 60, l: 48, label: 'Warning'   },
  improving: { h: 158, s: 45, l: 44, label: 'Improving' },
  declining: { h: 348, s: 45, l: 50, label: 'Declining' },
  neutral:   { h: 220, s:  8, l: 52, label: 'Neutral'   },
} as const;

export type SpacingKey       = keyof typeof spacing;
export type RadiusKey        = keyof typeof radius;
export type TypographyLevel  = keyof typeof typographyScale;
export type ElevationLevel   = keyof typeof elevation;
export type StateColorKey    = keyof typeof stateColors;
