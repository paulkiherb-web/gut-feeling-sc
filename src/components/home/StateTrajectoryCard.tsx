import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

export default function StateTrajectoryCard() {
  const { snapshot } = useUnifiedState();
  if (!snapshot) return null;
  const t = snapshot.trajectory;
  const Icon = t.direction === 'improving' ? TrendingUp : t.direction === 'declining' ? TrendingDown : Minus;
  const color = t.direction === 'improving' ? 'hsl(var(--safe))' : t.direction === 'declining' ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-premium rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Траектория</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase" style={{ color }}>
          <Icon className="w-3.5 h-3.5" />
          {t.direction === 'improving' ? 'растёт' : t.direction === 'declining' ? 'падает' : 'стабильно'}
          <span className="text-muted-foreground/70 ml-1">· {Math.round(t.confidence * 100)}%</span>
        </span>
      </div>
      {t.drivers.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">Нужно больше сигналов. Сделай скан или зафиксируй приём пищи.</p>
      ) : (
        <ul className="space-y-1">
          {t.drivers.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-snug">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
