/**
 * SectionHeader — editorial section title with optional action.
 *
 * Typography-first. Clean, spacious. No heavy decorations.
 * Establishes clear hierarchy between sections.
 */

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Eyebrow label above the title (uppercase, muted) */
  eyebrow?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const titleSizeMap = {
  sm: 'text-[15px] font-semibold tracking-tight',
  md: 'text-[17px] font-semibold tracking-tight',
  lg: 'text-[20px] font-bold tracking-tight',
} as const;

const subtitleSizeMap = {
  sm: 'text-[11px]',
  md: 'text-[12px]',
  lg: 'text-[13px]',
} as const;

export function SectionHeader({
  title,
  subtitle,
  action,
  eyebrow,
  size = 'md',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1 space-y-0.5">
        {eyebrow && (
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
            {eyebrow}
          </p>
        )}
        <h2 className={cn(titleSizeMap[size], 'text-foreground leading-tight')}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(subtitleSizeMap[size], 'text-muted-foreground leading-snug')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 mt-0.5">
          {action}
        </div>
      )}
    </div>
  );
}
