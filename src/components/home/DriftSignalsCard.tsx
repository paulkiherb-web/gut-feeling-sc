import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { selectLongitudinal } from '@/core/store/selectors';
import { useAdaptiveExperience } from '@/design/adaptive';
import type { DriftDirection, DriftUrgency } from '@/core/longitudinal/drift/types';

const URGENCY_COLOR: Record<DriftUrgency, string> = {
  high:   'hsl(var(--danger))',
  medium: 'hsl(var(--warning))',
  low:    'hsl(var(--muted-foreground))',
};

const DIRECTION_ICON: Record<DriftDirection, React.ReactNode> = {
  deteriorating: <TrendingDown className="w-3.5 h-3.5" />,
  improving:     <TrendingUp className="w-3.5 h-3.5" />,
  stable:        <Minus className="w-3.5 h-3.5" />,
  volatile:      <AlertCircle className="w-3.5 h-3.5" />,
};

const DIRECTION_LABEL: Record<DriftDirection, string> = {
  deteriorating: 'Ухудшение',
  improving:     'Улучшение',
  stable:        'Стабильно',
  volatile:      'Нестабильно',
};

export default function DriftSignalsCard() {
  const model = useAppStore(selectLongitudinal);
  const { focusModeActive, showSection } = useAdaptiveExperience();

  if (!model?.isDataSufficient) return null;
  // Hide when the user is already in overload / max focus mode
  if (focusModeActive) return null;
  if (!showSection('trajectory')) return null;

  // Surface only actionable signals
  const signals = model.driftSignals
    .filter(s => s.urgency === 'high' || s.urgency === 'medium')
    .slice(0, 3);

  if (!signals.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="glass-premium rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <TrendingDown className="w-3.5 h-3.5 text-warning" />
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
          Направление изменений
        </p>
      </div>

      <div className="space-y-2">
        {signals.map((sig, i) => {
          const color = URGENCY_COLOR[sig.urgency];
          return (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.06 }}
              className="flex items-start gap-2.5"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}18`, color }}
              >
                {DIRECTION_ICON[sig.direction]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.14em]"
                    style={{ color }}
                  >
                    {DIRECTION_LABEL[sig.direction]}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60 capitalize">
                    {sig.domain}
                  </span>
                </div>
                <p className="text-[11px] font-semibold leading-tight mt-0.5">{sig.title}</p>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{sig.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
