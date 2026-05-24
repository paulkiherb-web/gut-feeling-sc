import { motion } from 'framer-motion';
import { Layers, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { selectLongitudinal } from '@/core/store/selectors';
import { useAdaptiveExperience } from '@/design/adaptive';
import type { LongitudinalInsight } from '@/core/longitudinal/insights/types';

type InsightCategory = LongitudinalInsight['category'];

const ICON: Record<InsightCategory, React.ReactNode> = {
  pattern:    <Layers className="w-3.5 h-3.5 text-primary/80" />,
  drift:      <TrendingUp className="w-3.5 h-3.5 text-warning" />,
  signature:  <Info className="w-3.5 h-3.5 text-primary" />,
  risk:       <AlertCircle className="w-3.5 h-3.5 text-danger" />,
};

const CAT_COLOR: Record<InsightCategory, string> = {
  pattern:   'hsl(var(--primary) / 0.8)',
  drift:     'hsl(var(--warning))',
  signature: 'hsl(var(--primary))',
  risk:      'hsl(var(--danger))',
};

const CAT_LABEL: Record<InsightCategory, string> = {
  pattern:   'Паттерн',
  drift:     'Траектория',
  signature: 'Профиль',
  risk:      'Сигнал',
};

export default function LongitudinalInsightsCard() {
  const model = useAppStore(selectLongitudinal);
  const { focusModeActive, showSection } = useAdaptiveExperience();

  if (!model?.isDataSufficient) return null;
  if (focusModeActive) return null;
  if (!showSection('insights')) return null;

  const insights = model.longitudinalInsights.slice(0, 3);
  if (!insights.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="glass-premium rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-primary" />
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
          Долгосрочные наблюдения
        </p>
        <span className="ml-auto text-[8px] text-muted-foreground/50 uppercase tracking-[0.15em]">
          {model.timeline.items.length} событ.
        </span>
      </div>

      <div className="space-y-2">
        {insights.map((ins, i) => {
          const cat = ins.category;
          const color = CAT_COLOR[cat];
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 + i * 0.06 }}
              className="flex items-start gap-2.5"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}18` }}
              >
                {ICON[cat]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.14em]"
                    style={{ color }}
                  >
                    {CAT_LABEL[cat]}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60">
                    {ins.confidenceLabel}
                  </span>
                </div>
                <p className="text-[11px] font-semibold leading-tight mt-0.5">{ins.title}</p>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{ins.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
