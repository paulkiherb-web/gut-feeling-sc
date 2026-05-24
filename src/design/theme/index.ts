/**
 * INVISIBLE PREMIUM — Theme Scope
 *
 * Limits user theme influence to accent states only.
 * Theme changes should NOT affect all surfaces — only:
 * - accent states
 * - pills
 * - highlights
 * - focus states
 * - CTA emphasis
 * - subtle indicators
 *
 * The neutral surface system (backgrounds, text, borders)
 * remains consistent regardless of theme selection.
 */

/**
 * CSS classes that are safe to use with theme accent.
 * These will respond to theme changes.
 */
export const accentClasses = {
  bg:        'bg-primary',
  bgSubtle:  'bg-primary/10',
  bgMuted:   'bg-primary/6',
  text:      'text-primary',
  textMuted: 'text-primary/70',
  border:    'border-primary',
  borderSubtle: 'border-primary/30',
  ring:      'ring-primary',
  shadow:    'shadow-primary/20',
} as const;

/**
 * CSS classes for neutral surfaces — NOT theme-tinted.
 * These must remain consistent across all themes.
 */
export const neutralClasses = {
  surface:    'bg-background',
  card:       'bg-card',
  muted:      'bg-muted',
  border:     'border-border',
  text:       'text-foreground',
  textMuted:  'text-muted-foreground',
} as const;

/**
 * Theme-aware gradient — only for primary actions (CTA, FAB).
 * Restrained. Not for backgrounds or decorative use.
 */
export const accentGradient = 'gradient-organic';

export type AccentClass = keyof typeof accentClasses;
export type NeutralClass = keyof typeof neutralClasses;
