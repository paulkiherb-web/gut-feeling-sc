import { motion } from 'framer-motion';
import { GitBranch, Activity } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { selectLongitudinal } from '@/core/store/selectors';
import { useAdaptiveExperience } from '@/design/adaptive';
import type { PatternStrength } from '@/core/longitudinal/patterns/types';

const STRENGTH_COLOR: Record<PatternStrength, string> = {
  weak:     'hsl(var(--muted-foreground))',
  moderate: 'hsl(var(--warning))',
  strong:   'hsl(var(--primary))',
};

const STRENGTH_LABEL: Record<PatternStrength, string> = {
  weak:     'Слабый',
  moderate: 'Умерен.',
  strong:   'Устойч.',
};

export default function PersonalPatternsCard() {
  const model = useAppStore(selectLongitudinal);
  const { focusModeActive, showSection, secondaryOpacity } = useAdaptiveExperience();

  if (!model?.isDataSufficient) return null;
  if (focusModeActive) return null;
  if (!showSection('insights')) return null;

  const patterns = model.recurringPatterns
    .filter(p => p.strength !== 'weak')
    .slice(0, 3);

  if (!patterns.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="glass-premium rounded-2xl p-4 space-y-3"
      style={{ opacity: secondaryOpacity }}
    >
      <div className="flex items-center gap-2">
        <GitBranch className="w-3.5 h-3.5 text-primary/80" />
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
          Личные паттерны
        </p>
        <span className="ml-auto text-[8px] text-muted-foreground/50">
          {model.personalSignature.activeDays} дн.
        </span>
      </div>

      <div className="space-y-2">
        {patterns.map((p, i) => {
          const color = STRENGTH_COLOR[p.strength];
          const pct = Math.round(p.confidence * 100);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.20 + i * 0.06 }}
              className="rounded-xl bg-muted/25 px-3 py-2.5 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 shrink-0" style={{ color }} />
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.14em]"
                    style={{ color }}
                  >
                    {STRENGTH_LABEL[p.strength]}
                  </span>
                </div>
                <span className="text-[8px] text-muted-foreground/60">{pct}%</span>
              </div>

              <p className="text-[11px] font-semibold leading-tight">{p.title}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{p.description}</p>

              {/* occurrence bar */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (p.occurrences / 12) * 100)}%`,
                      background: color,
                    }}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground/50 shrink-0">
                  {p.occurrences}×
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
