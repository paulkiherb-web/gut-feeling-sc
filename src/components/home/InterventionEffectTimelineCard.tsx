import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { buildEffectTimeline } from '@/core/interventions/effects/interventionEffectTimeline';

const STRENGTH_STYLE = {
  strong:    { color: 'text-safe',    bg: 'bg-safe/10',    bar: 'bg-safe' },
  moderate:  { color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary/60' },
  weak:      { color: 'text-warning', bg: 'bg-warning/10', bar: 'bg-warning/50' },
  resistant: { color: 'text-danger',  bg: 'bg-danger/10',  bar: 'bg-danger/50' },
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'improving') return <TrendingUp className="w-3 h-3 text-safe" />;
  if (trend === 'declining') return <TrendingDown className="w-3 h-3 text-danger" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export default function InterventionEffectTimelineCard() {
  const memory = useAppStore((s) => s.interventionMemory);
  const timeline = buildEffectTimeline(memory);

  if (!timeline.hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium rounded-2xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Что работает
        </p>
      </div>

      {/* Effect bars */}
      <div className="space-y-2">
        {timeline.entries.slice(0, 4).map((entry) => {
          const style = STRENGTH_STYLE[entry.strength];
          const barWidth = Math.max(4, Math.round(((entry.avgEffectSize + 1) / 2) * 100));
          const adherencePct = Math.round(entry.adherenceRate * 100);

          return (
            <div key={entry.category} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <TrendIcon trend={entry.trend} />
                  <span className={`text-[11px] font-semibold truncate ${style.color}`}>
                    {entry.title}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {adherencePct}% выполн.
                </span>
              </div>
              {/* Effect size bar */}
              <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${style.bar}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      {timeline.insights.length > 0 && (
        <div className="pt-1 border-t border-border/20 space-y-0.5">
          {timeline.insights.slice(0, 2).map((insight) => (
            <p key={insight} className="text-[10px] text-muted-foreground leading-snug">
              {insight}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
