/**
 * StateIndicator — compact value + label block for metrics.
 *
 * Renders a numeric score with semantic coloring and a label.
 * Not alarming — editorial and calm.
 */

import { cn } from '@/lib/utils';
import { QuietProgress } from './QuietProgress';
import type { StateColorKey } from '@/design/tokens';

type StateVariant = StateColorKey | 'accent';

function scoreToVariant(value: number): StateColorKey {
  if (value >= 70) return 'recovery';
  if (value >= 50) return 'readiness';
  if (value >= 35) return 'warning';
  return 'declining';
}

const valueColorMap: Record<StateVariant, string> = {
  recovery:  'text-[hsl(158_50%_35%)] dark:text-[hsl(158_50%_60%)]',
  readiness: 'text-[hsl(200_48%_38%)] dark:text-[hsl(200_55%_62%)]',
  warning:   'text-[hsl(36_60%_34%)] dark:text-[hsl(36_70%_60%)]',
  improving: 'text-[hsl(158_45%_35%)] dark:text-[hsl(158_55%_60%)]',
  declining: 'text-[hsl(348_45%_38%)] dark:text-[hsl(348_55%_65%)]',
  neutral:   'text-muted-foreground',
  accent:    'text-primary',
};

interface StateIndicatorProps {
  label: string;
  value: number;
  /** Explicit variant — if omitted, derived from value */
  variant?: StateVariant;
  showBar?: boolean;
  /** Animate bar on mount */
  animate?: boolean;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const valueSize = { sm: 'text-lg font-bold', md: 'text-2xl font-bold', lg: 'text-4xl font-bold' };
const labelSize = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-[11px]' };

export function StateIndicator({
  label,
  value,
  variant,
  showBar = true,
  animate = true,
  delay = 0,
  size = 'md',
  className,
}: StateIndicatorProps) {
  const resolvedVariant = variant ?? scoreToVariant(value);
  const colorClass = valueColorMap[resolvedVariant];

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className={cn(labelSize[size], 'font-semibold uppercase tracking-[0.12em] text-muted-foreground/70')}>
          {label}
        </span>
        <span className={cn(valueSize[size], 'leading-none tabular-nums', colorClass)}>
          {Math.round(value)}
        </span>
      </div>
      {showBar && (
        <QuietProgress
          value={value}
          variant={resolvedVariant}
          height={size === 'lg' ? 'sm' : 'xs'}
          animate={animate}
          delay={delay}
        />
      )}
    </div>
  );
}
