/**
 * SurfaceCard — slightly elevated card for layered content.
 *
 * Use when you need visual separation without heavy shadows.
 * Ideal for nested content, metric groups, and info blocks.
 */

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
  interactive?: boolean;
}

export const SurfaceCard = forwardRef<HTMLDivElement, SurfaceCardProps>(
  (
    {
      children,
      className,
      padding = 'md',
      radius = 'lg',
      interactive = false,
      ...props
    },
    ref,
  ) => {
    const paddingClass = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' }[padding];
    const radiusClass  = { md: 'rounded-[10px]', lg: 'rounded-[14px]', xl: 'rounded-[18px]' }[radius];

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card border border-border/40',
          'shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
          paddingClass,
          radiusClass,
          interactive && 'cursor-pointer active:scale-[0.99] transition-transform duration-100 select-none',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SurfaceCard.displayName = 'SurfaceCard';
