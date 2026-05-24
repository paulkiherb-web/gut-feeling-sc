import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, TrendingUp, BellOff, X } from 'lucide-react';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { useInterventionActions } from '@/core/hooks/useInterventionActions';
import { useNavigate } from 'react-router-dom';
import { useAdaptiveExperience } from '@/design/adaptive';

const URGENCY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: 'hsl(var(--danger) / 0.12)',  color: 'hsl(var(--danger))',  label: 'Срочно' },
  medium: { bg: 'hsl(var(--warning) / 0.12)', color: 'hsl(var(--warning))', label: 'Рекомендуется' },
  low:    { bg: 'hsl(var(--primary) / 0.10)', color: 'hsl(var(--primary))', label: 'Следующий шаг' },
};

export default function NextBestActionCard() {
  const { nextBestAction } = useRecommendations();
  const { done, snooze, dismiss } = useInterventionActions();
  const navigate = useNavigate();
  const { action, tone } = useAdaptiveExperience();

  if (!nextBestAction) {
    return (
      <motion.button onClick={() => navigate('/scanner')} whileTap={{ scale: 0.98 }}
        className="w-full glass-premium rounded-2xl p-4 text-left space-y-1">
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">{tone.nextActionLabel}</p>
        <p className="text-sm font-display font-bold">Отсканируй первый приём</p>
        <p className="text-[11px] text-muted-foreground">Система начнёт читать состояние и выдаст первые рекомендации.</p>
      </motion.button>
    );
  }

  const r = nextBestAction;
  const urgency = r.urgency ?? 'medium';
  const style = URGENCY_STYLE[urgency] ?? URGENCY_STYLE.medium;

  const impactChips = action.showImpactChips && r.expectedImpact
    ? Object.entries(r.expectedImpact)
        .filter(([, v]) => v && v !== 0)
        .slice(0, 3)
        .map(([k, v]) => ({
          label: { energy: 'Энергия', recovery: 'Восстановл.', sleep: 'Сон', nutrition: 'Питание', hydration: 'Вода', readiness: 'Готовность', goalAlignment: 'Цель' }[k] ?? k,
          value: v!,
        }))
    : [];

  // CTA style adapts to action intensity — quieter states use softer gradient opacity
  const ctaOpacity =
    action.intensity === 'passive'   ? 0.70 :
    action.intensity === 'quiet'     ? 0.82 :
    action.intensity === 'directive' ? 1.0  : 0.92;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-premium rounded-2xl p-4 space-y-3">

      {/* Header row */}
      <div className="flex items-center justify-between">
        {action.showUrgencyBadge ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
            style={{ background: style.bg }}>
            <Zap className="w-2.5 h-2.5" style={{ color: style.color }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: style.color }}>
              {style.label}
            </span>
          </div>
        ) : (
          <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
            {tone.nextActionLabel}
          </span>
        )}
        <div className="flex items-center gap-1">
          {r.category && (
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{r.category}</span>
          )}
          {/* Dismiss — lightweight × button */}
          <button
            onClick={() => dismiss(r)}
            aria-label="Не актуально"
            className="ml-1 p-1 rounded-lg text-muted-foreground/50 hover:text-muted-foreground active:scale-90 transition-all">
            <X className="w-3 h-3" />
          </button>
        </div>
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

      {/* Primary CTA — intensity adapts to adaptive action profile */}
      <button onClick={() => done(r)}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-organic text-primary-foreground text-xs font-bold active:scale-[0.98] transition-transform shadow-sm shadow-primary/20"
        style={{ opacity: ctaOpacity }}>
        {r.cta ?? 'Выполнено'} <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Secondary actions — only shown when competing actions are permitted */}
      {action.allowCompetingActions && (
        <div className="flex items-center justify-center gap-4 pt-0.5">
          <button
            onClick={() => snooze(r)}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground active:scale-95 transition-all">
            <BellOff className="w-3 h-3" />
            Отложить на 2ч
          </button>
        </div>
      )}
    </motion.div>
  );
}
