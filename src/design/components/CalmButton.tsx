/**
 * CalmButton — premium button system.
 *
 * Primary: solid theme-accent fill, confident.
 * Secondary: outlined, restrained.
 * Ghost: text-only, minimal footprint.
 * Quiet: for utility actions, near-invisible.
 *
 * No gradient backgrounds on secondary/ghost.
 * Primary only uses accent — which comes from user theme.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface CalmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-primary-foreground',
    'hover:bg-primary/90',
    'active:bg-primary/95',
    'shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
    'disabled:opacity-40',
  ].join(' '),

  secondary: [
    'bg-transparent border border-border',
    'text-foreground',
    'hover:bg-secondary/60',
    'active:bg-secondary/80',
    'disabled:opacity-40',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'text-foreground/80',
    'hover:bg-secondary/50',
    'active:bg-secondary/70',
    'disabled:opacity-40',
  ].join(' '),

  quiet: [
    'bg-transparent',
    'text-muted-foreground',
    'hover:text-foreground hover:bg-secondary/40',
    'active:bg-secondary/60',
    'disabled:opacity-40',
  ].join(' '),

  danger: [
    'bg-destructive text-destructive-foreground',
    'hover:bg-destructive/90',
    'active:bg-destructive/95',
    'disabled:opacity-40',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12px] font-semibold rounded-[8px] gap-1.5',
  md: 'h-10 px-4 text-[13px] font-semibold rounded-[10px] gap-2',
  lg: 'h-12 px-5 text-[14px] font-semibold rounded-[12px] gap-2',
};

export const CalmButton = forwardRef<HTMLButtonElement, CalmButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center',
          'select-none cursor-pointer',
          'transition-all duration-150',
          'active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          (disabled || loading) && 'pointer-events-none',
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  },
);

CalmButton.displayName = 'CalmButton';
