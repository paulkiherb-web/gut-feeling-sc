/**
 * AdaptiveBadge — flexible badge for counts, labels, statuses.
 *
 * Adapts to context: accent-tinted for active, neutral for passive.
 * Smaller and quieter than standard badges.
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-muted/70 text-muted-foreground',
  accent:  'bg-primary/10 text-primary',
  success: 'bg-[hsl(158_50%_42%/0.10)] text-[hsl(158_50%_32%)] dark:text-[hsl(158_50%_60%)]',
  warning: 'bg-[hsl(36_60%_48%/0.10)] text-[hsl(36_60%_34%)] dark:text-[hsl(36_70%_60%)]',
  danger:  'bg-[hsl(348_45%_50%/0.10)] text-[hsl(348_45%_38%)] dark:text-[hsl(348_55%_65%)]',
  outline: 'bg-transparent border border-border text-muted-foreground',
};

interface AdaptiveBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export function AdaptiveBadge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: AdaptiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold tracking-tight',
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[11px]',
        variantMap[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
