/**
 * INVISIBLE PREMIUM — Layout Primitives
 *
 * Vertical rhythm and content density system.
 * Spacing = primary premium signal.
 */

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ─── ContentBlock ─────────────────────────────────────────────────────────────
// Standard horizontal padding + vertical rhythm for page content

interface ContentBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Horizontal padding preset */
  px?: 'none' | 'sm' | 'md' | 'lg';
  /** Top padding */
  pt?: 'none' | 'sm' | 'md' | 'lg';
}

const pxMap = { none: '', sm: 'px-3', md: 'px-4', lg: 'px-5' } as const;
const ptMap = { none: '', sm: 'pt-2', md: 'pt-4', lg: 'pt-6' } as const;

export function ContentBlock({
  children,
  px = 'md',
  pt = 'none',
  className,
  ...props
}: ContentBlockProps) {
  return (
    <div className={cn(pxMap[px], ptMap[pt], className)} {...props}>
      {children}
    </div>
  );
}

// ─── SectionSpacing ───────────────────────────────────────────────────────────
// Consistent vertical gap between page sections

interface SectionSpacingProps {
  children: ReactNode;
  /** Gap between direct children */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapMap = { sm: 'space-y-2', md: 'space-y-3', lg: 'space-y-4', xl: 'space-y-5' } as const;

export function SectionSpacing({ children, gap = 'md', className }: SectionSpacingProps) {
  return (
    <div className={cn(gapMap[gap], className)}>
      {children}
    </div>
  );
}

// ─── GroupBlock ───────────────────────────────────────────────────────────────
// Groups related cards with a label and consistent spacing

interface GroupBlockProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function GroupBlock({ children, label, className }: GroupBlockProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/55 px-1">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
// Quiet separator — very subtle, used sparingly

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({ className, orientation = 'horizontal' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px self-stretch bg-border/40', className)} />;
  }
  return <div className={cn('w-full h-px bg-border/40', className)} />;
}
