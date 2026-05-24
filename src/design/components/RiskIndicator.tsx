/**
 * RiskIndicator — compact risk level signal.
 *
 * Shows a risk level with appropriate semantic color.
 * Low visual noise — not alarm-like.
 */

import { cn } from '@/lib/utils';

type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

const riskConfig: Record<
  RiskLevel,
  { label: string; labelRu: string; bg: string; text: string; dotColor: string }
> = {
  low: {
    label: 'Low',
    labelRu: 'Низкий',
    bg: 'bg-[hsl(158_50%_42%/0.08)]',
    text: 'text-[hsl(158_50%_32%)] dark:text-[hsl(158_50%_60%)]',
    dotColor: 'bg-[hsl(158_50%_42%)]',
  },
  moderate: {
    label: 'Moderate',
    labelRu: 'Умеренный',
    bg: 'bg-[hsl(36_60%_48%/0.08)]',
    text: 'text-[hsl(36_60%_34%)] dark:text-[hsl(36_70%_60%)]',
    dotColor: 'bg-[hsl(36_60%_48%)]',
  },
  high: {
    label: 'High',
    labelRu: 'Высокий',
    bg: 'bg-[hsl(348_45%_50%/0.10)]',
    text: 'text-[hsl(348_45%_38%)] dark:text-[hsl(348_55%_65%)]',
    dotColor: 'bg-[hsl(348_45%_50%)]',
  },
  critical: {
    label: 'Critical',
    labelRu: 'Критический',
    bg: 'bg-[hsl(348_55%_45%/0.14)]',
    text: 'text-[hsl(348_55%_35%)] dark:text-[hsl(348_60%_68%)]',
    dotColor: 'bg-[hsl(348_55%_45%)]',
  },
};

interface RiskIndicatorProps {
  level: RiskLevel;
  /** Override displayed label */
  label?: string;
  lang?: 'en' | 'ru';
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function RiskIndicator({
  level,
  label,
  lang = 'ru',
  showDot = true,
  size = 'sm',
  className,
}: RiskIndicatorProps) {
  const cfg = riskConfig[level];
  const displayLabel = label ?? (lang === 'ru' ? cfg.labelRu : cfg.label);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      {showDot && (
        <span className={cn('rounded-full shrink-0', cfg.dotColor, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      )}
      {displayLabel}
    </span>
  );
}

export type { RiskLevel };
