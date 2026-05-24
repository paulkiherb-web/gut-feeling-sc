/**
 * INVISIBLE PREMIUM — Typography System
 *
 * Typography is the primary premium signal.
 * Hierarchy must be immediately readable on any device.
 */

import { cn } from '@/lib/utils';

export type TypographyLevel =
  | 'display'
  | 'hero'
  | 'title'
  | 'section'
  | 'body'
  | 'secondary'
  | 'caption'
  | 'micro';

/**
 * Maps typography levels to Tailwind utility classes.
 * All sizes use clamp() for responsive scaling.
 */
export const typographyClasses: Record<TypographyLevel, string> = {
  display:   'ds-text-display',
  hero:      'ds-text-hero',
  title:     'ds-text-title',
  section:   'ds-text-section',
  body:      'ds-text-body',
  secondary: 'ds-text-secondary',
  caption:   'ds-text-caption',
  micro:     'ds-text-micro',
};

/** Semantic text color classes */
export const textColorClasses = {
  primary:   'text-foreground',
  secondary: 'text-foreground/65',
  tertiary:  'text-foreground/40',
  disabled:  'text-foreground/25',
  accent:    'text-primary',
  inverse:   'text-primary-foreground',
} as const;

export type TextColor = keyof typeof textColorClasses;

/** Build combined typography + color className */
export function t(
  level: TypographyLevel,
  color: TextColor = 'primary',
  extra?: string,
): string {
  return cn(typographyClasses[level], textColorClasses[color], extra);
}
