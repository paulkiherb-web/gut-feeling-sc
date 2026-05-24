/**
 * SystemCard — the primary neutral surface container.
 *
 * Flat, minimal border, soft surface. No heavy shadows.
 * No floating-glass effect. Restrained radius.
 */

import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SystemCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Visual weight */
  variant?: 'flat' | 'raised' | 'subtle';
  /** Inner padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Corner radius preset */
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  /** Render as interactive element with tap feedback */
  interactive?: boolean;
  asChild?: boolean;
}

const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
  xl:   'p-6',
} as const;

const radiusMap = {
  md:  'rounded-[10px]',
  lg:  'rounded-[14px]',
  xl:  'rounded-[18px]',
  '2xl': 'rounded-[22px]',
} as const;

const variantMap = {
  flat:   'ds-surface-flat',
  raised: 'ds-surface-raised',
  subtle: 'ds-surface-subtle',
} as const;

export const SystemCard = forwardRef<HTMLDivElement, SystemCardProps>(
  (
    {
      children,
      className,
      variant = 'flat',
      padding = 'md',
      radius = 'xl',
      interactive = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantMap[variant],
          paddingMap[padding],
          radiusMap[radius],
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

SystemCard.displayName = 'SystemCard';
