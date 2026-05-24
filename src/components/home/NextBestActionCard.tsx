import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type RecommendationCompletedEvent } from '@/core/store/types/events';
import { useNavigate } from 'react-router-dom';

const URGENCY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: 'hsl(var(--danger) / 0.12)',  color: 'hsl(var(--danger))',  label: 'Срочно' },
  medium: { bg: 'hsl(var(--warning) / 0.12)', color: 'hsl(var(--warning))', label: 'Рекомендуется' },
  low:    { bg: 'hsl(var(--primary) / 0.10)', color: 'hsl(var(--primary))', label: 'Следующий шаг' },
};

export default function NextBestActionCard() {
  const { nextBestAction } = useRecommendations();
  const navigate = useNavigate();

  if (!nextBestAction) {
    return (
      <motion.button onClick={() => navigate('/scanner')} whileTap={{ scale: 0.98 }}
        className="w-full glass-premium rounded-2xl p-4 text-left space-y-1">
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Следующий шаг</p>
        <p className="text-sm font-display font-bold">Отсканируй первый приём</p>
        <p className="text-[11px] text-muted-foreground">Система начнёт читать состояние и выдаст первые рекомендации.</p>
      </motion.button>
    );
  }

  const r = nextBestAction;
  const urgency = (r as { urgency?: string }).urgency ?? 'medium';
  const style = URGENCY_STYLE[urgency] ?? URGENCY_STYLE.medium;

  // impact chips: filter non-zero
  const impactChips = r.expectedImpact
    ? Object.entries(r.expectedImpact)
        .filter(([, v]) => v && v !== 0)
        .slice(0, 3)
        .map(([k, v]) => ({
          label: { energy: 'Энергия', recovery: 'Восстановл.', sleep: 'Сон', nutrition: 'Питание', hydration: 'Вода', readiness: 'Готовность', goalAlignment: 'Цель' }[k] ?? k,
          value: v!,
        }))
    : [];

  const done = () => eventDispatcher.dispatchEvent(newEvent<RecommendationCompletedEvent>({
    type: 'recommendation.completed', source: 'home',
    payload: { recommendationId: r.id, outcome: 'done' },
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-premium rounded-2xl p-4 space-y-3">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
          style={{ background: style.bg }}>
          <Zap className="w-2.5 h-2.5" style={{ color: style.color }} />
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: style.color }}>
            {style.label}
          </span>
        </div>
        {r.category && (
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{r.category}</span>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="font-display font-bold text-[17px] leading-tight tracking-tight">{r.title}</h3>
        {r.body && <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{r.body}</p>}
      </div>

      {/* Why now */}
      {r.why && (
        <div className="flex items-start gap-2">
          <Clock className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground/80 italic leading-snug">{r.why}</p>
        </div>
      )}

      {/* Impact chips */}
      {impactChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {impactChips.map(({ label, value }) => (
            <div key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-safe/8 border border-safe/15">
              <TrendingUp className="w-2.5 h-2.5 text-safe" />
              <span className="text-[9px] font-bold text-safe">
                {label} {value > 0 ? `+${value}` : value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button onClick={done}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-organic text-primary-foreground text-xs font-bold active:scale-[0.98] transition-transform shadow-sm shadow-primary/20">
        {r.cta ?? 'Выполнено'} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
