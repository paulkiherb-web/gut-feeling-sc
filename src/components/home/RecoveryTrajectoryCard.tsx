import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

const URGENCY_LABELS: Record<string, string> = {
  improving: 'Восстановление растёт',
  flat: 'Восстановление стабильно',
  declining: 'Восстановление снижается',
};

const MOMENTUM_LABELS: Record<string, string> = {
  strong: 'сильный',
  moderate: 'умеренный',
  weak: 'слабый',
};

export default function RecoveryTrajectoryCard() {
  const { snapshot } = useUnifiedState();
  if (!snapshot) return null;

  const t = snapshot.trajectory;
  const recovery = snapshot.recovery;
  const Icon = t.direction === 'improving' ? TrendingUp : t.direction === 'declining' ? TrendingDown : Minus;
  const color = t.direction === 'improving' ? 'hsl(var(--safe))' : t.direction === 'declining' ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))';
  const causes = t.causes?.length ? t.causes : t.drivers ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-premium rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-primary/80" />
          <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Траектория</p>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[10px] font-bold" style={{ color }}>
            {URGENCY_LABELS[t.direction]}
          </span>
        </div>
      </div>

      {/* Confidence + momentum row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between">
            <span className="text-[9px] text-muted-foreground">Уверенность</span>
            <span className="text-[9px] font-bold text-foreground/70">{Math.round(t.confidence * 100)}%</span>
          </div>
          <div className="h-[3px] rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: color }}
              initial={{ width: 0 }} animate={{ width: `${Math.round(t.confidence * 100)}%` }}
              transition={{ duration: 0.6 }} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-muted-foreground">Импульс</p>
          <p className="text-[10px] font-bold text-foreground/80">{MOMENTUM_LABELS[t.momentum]}</p>
        </div>
      </div>

      {/* Recovery debt hint */}
      {recovery.recoveryDebtHours > 0 && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-warning/8 border border-warning/15">
          <span className="text-[10px] text-warning font-semibold">
            ↓ Дефицит восстановления ~{recovery.recoveryDebtHours.toFixed(1)}ч
          </span>
        </div>
      )}

      {/* Causes */}
      {causes.length > 0 ? (
        <ul className="space-y-1.5">
          {causes.slice(0, 3).map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/70 leading-snug">
              <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
              {d}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Нужно больше сигналов — сделай скан или зафиксируй состояние.
        </p>
      )}
    </motion.div>
  );
}
