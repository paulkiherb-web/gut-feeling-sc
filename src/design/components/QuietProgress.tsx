/**
 * QuietProgress — minimal, calm progress indicator.
 *
 * Used for scores, percentages, trajectory bars.
 * No animation overload. Smooth reveal on mount.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StateColorKey } from '@/design/tokens';

type ProgressVariant = StateColorKey | 'accent' | 'neutral';

const trackColorMap: Record<ProgressVariant, string> = {
  recovery:  'bg-[hsl(158_50%_42%/0.12)]',
  readiness: 'bg-[hsl(200_48%_45%/0.12)]',
  warning:   'bg-[hsl(36_60%_48%/0.12)]',
  improving: 'bg-[hsl(158_45%_44%/0.12)]',
  declining: 'bg-[hsl(348_45%_50%/0.12)]',
  neutral:   'bg-muted',
  accent:    'bg-primary/10',
};

const fillColorMap: Record<ProgressVariant, string> = {
  recovery:  'bg-[hsl(158_50%_42%)]',
  readiness: 'bg-[hsl(200_48%_45%)]',
  warning:   'bg-[hsl(36_60%_48%)]',
  improving: 'bg-[hsl(158_45%_44%)]',
  declining: 'bg-[hsl(348_45%_50%)]',
  neutral:   'bg-muted-foreground/40',
  accent:    'bg-primary',
};

interface QuietProgressProps {
  /** 0–100 */
  value: number;
  variant?: ProgressVariant;
  height?: 'xs' | 'sm' | 'md';
  animate?: boolean;
  delay?: number;
  className?: string;
}

const heightMap = { xs: 'h-[2px]', sm: 'h-[3px]', md: 'h-1' } as const;

export function QuietProgress({
  value,
  variant = 'accent',
  height = 'sm',
  animate = true,
  delay = 0,
  className,
}: QuietProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        'w-full rounded-full overflow-hidden',
        heightMap[height],
        trackColorMap[variant],
        className,
      )}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {animate ? (
        <motion.div
          className={cn('h-full rounded-full', fillColorMap[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
        />
      ) : (
        <div
          className={cn('h-full rounded-full', fillColorMap[variant])}
          style={{ width: `${clampedValue}%` }}
        />
      )}
    </div>
  );
}
