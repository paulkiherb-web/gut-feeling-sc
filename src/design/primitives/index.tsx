/**
 * INVISIBLE PREMIUM — Primitive Surfaces
 *
 * Low-level surface building blocks.
 * These are not full components — they are foundational pieces
 * used to compose higher-level UI.
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ─── Surface ──────────────────────────────────────────────────────────────────

type SurfaceVariant = 'base' | 'raised' | 'overlay' | 'subtle' | 'inverse';

const surfaceVariantMap: Record<SurfaceVariant, string> = {
  base:    'bg-background',
  raised:  'bg-card border border-border/40',
  overlay: 'bg-card/90 backdrop-blur-sm border border-border/30',
  subtle:  'bg-secondary/50',
  inverse: 'bg-foreground text-background',
};

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: SurfaceVariant;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'pill';
}

const surfaceRadiusMap = {
  none: '',
  sm:   'rounded',
  md:   'rounded-lg',
  lg:   'rounded-xl',
  xl:   'rounded-2xl',
  pill: 'rounded-full',
} as const;

export function Surface({
  children,
  variant = 'base',
  radius = 'lg',
  className,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(surfaceVariantMap[variant], surfaceRadiusMap[radius], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Text ─────────────────────────────────────────────────────────────────────

type TextLevel = 'display' | 'hero' | 'title' | 'section' | 'body' | 'secondary' | 'caption' | 'micro';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'inverse';

const textLevelMap: Record<TextLevel, string> = {
  display:   'ds-text-display',
  hero:      'ds-text-hero',
  title:     'ds-text-title',
  section:   'ds-text-section',
  body:      'ds-text-body',
  secondary: 'ds-text-secondary',
  caption:   'ds-text-caption',
  micro:     'ds-text-micro',
};

const textColorMap: Record<TextColor, string> = {
  primary:   'text-foreground',
  secondary: 'text-foreground/65',
  tertiary:  'text-foreground/40',
  disabled:  'text-foreground/25',
  accent:    'text-primary',
  inverse:   'text-primary-foreground',
};

interface TextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label';
  level?: TextLevel;
  color?: TextColor;
}

export function Text({
  children,
  as: Tag = 'p',
  level = 'body',
  color = 'primary',
  className,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(textLevelMap[level], textColorMap[color], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
