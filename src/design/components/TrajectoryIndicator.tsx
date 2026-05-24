/**
 * TrajectoryIndicator — direction + momentum signal.
 *
 * Compact, editorial. Shows improving / flat / declining
 * with appropriate semantic coloring.
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Direction = 'improving' | 'flat' | 'declining';
type Momentum  = 'strong' | 'moderate' | 'weak';

interface TrajectoryConfig {
  Icon:      typeof TrendingUp;
  label:     string;
  labelRu:   string;
  iconColor: string;
  bg:        string;
  text:      string;
}

const config: Record<Direction, TrajectoryConfig> = {
  improving: {
    Icon:      TrendingUp,
    label:     'Improving',
    labelRu:   'Улучшается',
    iconColor: 'text-[hsl(158_50%_42%)] dark:text-[hsl(158_50%_60%)]',
    bg:        'bg-[hsl(158_50%_42%/0.08)]',
    text:      'text-[hsl(158_50%_32%)] dark:text-[hsl(158_50%_60%)]',
  },
  flat: {
    Icon:      Minus,
    label:     'Stable',
    labelRu:   'Стабильно',
    iconColor: 'text-muted-foreground/60',
    bg:        'bg-muted/50',
    text:      'text-muted-foreground',
  },
  declining: {
    Icon:      TrendingDown,
    label:     'Declining',
    labelRu:   'Снижается',
    iconColor: 'text-[hsl(348_45%_50%)] dark:text-[hsl(348_55%_65%)]',
    bg:        'bg-[hsl(348_45%_50%/0.08)]',
    text:      'text-[hsl(348_45%_38%)] dark:text-[hsl(348_55%_65%)]',
  },
};

const momentumLabel: Record<Momentum, { en: string; ru: string }> = {
  strong:   { en: 'strong',    ru: 'сильный' },
  moderate: { en: 'moderate',  ru: 'умеренный' },
  weak:     { en: 'weak',      ru: 'слабый' },
};

interface TrajectoryIndicatorProps {
  direction: Direction;
  momentum?: Momentum;
  confidence?: number;
  lang?: 'en' | 'ru';
  showMomentum?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function TrajectoryIndicator({
  direction,
  momentum,
  confidence,
  lang = 'ru',
  showMomentum = false,
  size = 'sm',
  className,
}: TrajectoryIndicatorProps) {
  const cfg = config[direction];
  const { Icon } = cfg;
  const label = lang === 'ru' ? cfg.labelRu : cfg.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5', cfg.iconColor)} />
      <span>{label}</span>
      {showMomentum && momentum && (
        <span className="opacity-60">
          · {lang === 'ru' ? momentumLabel[momentum].ru : momentumLabel[momentum].en}
          {confidence !== undefined ? ` ${Math.round(confidence * 100)}%` : ''}
        </span>
      )}
    </span>
  );
}

export type { Direction, Momentum };
