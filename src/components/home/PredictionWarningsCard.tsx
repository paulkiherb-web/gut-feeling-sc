import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Droplets, Moon, Activity, Target } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { selectPredictions } from '@/core/store/selectors';
import type { Prediction, PredictionType } from '@/core/store/types/state';

const ICON_MAP: Record<PredictionType, React.ElementType> = {
  'energy-crash-risk': Zap,
  'hydration-risk': Droplets,
  'sleep-instability': Moon,
  'recovery-decline': Activity,
  'goal-deviation': Target,
};

const COLOR_MAP: Record<Prediction['riskLevel'], string> = {
  high: 'hsl(var(--danger))',
  moderate: 'hsl(var(--warning))',
  low: 'hsl(var(--muted-foreground))',
};

const BG_MAP: Record<Prediction['riskLevel'], string> = {
  high: 'hsl(var(--danger) / 0.08)',
  moderate: 'hsl(var(--warning) / 0.08)',
  low: 'hsl(var(--muted) / 0.4)',
};

const BORDER_MAP: Record<Prediction['riskLevel'], string> = {
  high: 'hsl(var(--danger) / 0.2)',
  moderate: 'hsl(var(--warning) / 0.2)',
  low: 'hsl(var(--border) / 0.3)',
};

export default function PredictionWarningsCard() {
  const predictions = useAppStore(selectPredictions);
  const active = predictions
    .filter(p => p.riskLevel === 'high' || p.riskLevel === 'moderate')
    .slice(0, 2);

  if (!active.length) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}
        className="space-y-2">
        {active.map((p, i) => {
          const Icon = ICON_MAP[p.type] ?? AlertTriangle;
          const color = COLOR_MAP[p.riskLevel];
          const bg = BG_MAP[p.riskLevel];
          const border = BORDER_MAP[p.riskLevel];
          const topCause = p.drivers[0] ?? null;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-2xl px-3.5 py-3"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}18` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold leading-tight">{p.title}</p>
                  <span className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-lg"
                    style={{ color, background: `${color}15` }}>
                    {Math.round(p.score)}%
                  </span>
                </div>
                {topCause && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{topCause}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
