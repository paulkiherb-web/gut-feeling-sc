/**
 * StatePill — semantic state indicator pill.
 *
 * Colors are muted, non-alarming. Editorial.
 * Not flashy, not neon. Just clear and readable.
 */

import { cn } from '@/lib/utils';
import type { StateColorKey } from '@/design/tokens';

export type StateType = StateColorKey | 'accent';

interface StatePillConfig {
  bg:   string;
  text: string;
  dot:  string;
}

const stateConfig: Record<StateType, StatePillConfig> = {
  recovery:  {
    bg:   'bg-[hsl(158_50%_42%/0.10)] dark:bg-[hsl(158_50%_42%/0.15)]',
    text: 'text-[hsl(158_50%_32%)] dark:text-[hsl(158_50%_60%)]',
    dot:  'bg-[hsl(158_50%_42%)]',
  },
  readiness: {
    bg:   'bg-[hsl(200_48%_45%/0.10)] dark:bg-[hsl(200_48%_45%/0.15)]',
    text: 'text-[hsl(200_48%_32%)] dark:text-[hsl(200_55%_62%)]',
    dot:  'bg-[hsl(200_48%_45%)]',
  },
  warning:   {
    bg:   'bg-[hsl(36_60%_48%/0.10)] dark:bg-[hsl(36_60%_48%/0.15)]',
    text: 'text-[hsl(36_60%_34%)] dark:text-[hsl(36_70%_60%)]',
    dot:  'bg-[hsl(36_60%_48%)]',
  },
  improving: {
    bg:   'bg-[hsl(158_45%_44%/0.10)] dark:bg-[hsl(158_45%_44%/0.15)]',
    text: 'text-[hsl(158_45%_32%)] dark:text-[hsl(158_55%_60%)]',
    dot:  'bg-[hsl(158_45%_44%)]',
  },
  declining: {
    bg:   'bg-[hsl(348_45%_50%/0.10)] dark:bg-[hsl(348_45%_50%/0.15)]',
    text: 'text-[hsl(348_45%_38%)] dark:text-[hsl(348_55%_65%)]',
    dot:  'bg-[hsl(348_45%_50%)]',
  },
  neutral:   {
    bg:   'bg-muted/60',
    text: 'text-muted-foreground',
    dot:  'bg-muted-foreground/40',
  },
  accent: {
    bg:   'bg-primary/10',
    text: 'text-primary',
    dot:  'bg-primary',
  },
};

interface StatePillProps {
  state: StateType;
  label: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatePill({
  state,
  label,
  showDot = true,
  size = 'sm',
  className,
}: StatePillProps) {
  const cfg = stateConfig[state];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full shrink-0', cfg.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}
        />
      )}
      {label}
    </span>
  );
}
