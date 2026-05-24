import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';
import { useAppStore } from '@/core/store/appStore';
import { filterToday } from '@/core/store/calculators/_helpers';
import { useMemo } from 'react';

const computeMomentum = (
  direction: string,
  momentum: string,
  todayCount: number,
  positiveCount: number,
): { score: number; label: string; sub: string; positive: boolean } => {
  const base = direction === 'improving' ? 62 : direction === 'declining' ? 32 : 50;
  const mult = momentum === 'strong' ? 1.2 : momentum === 'weak' ? 0.8 : 1.0;
  const eventBonus = Math.min(18, positiveCount * 5);
  const score = Math.min(100, Math.round(base * mult + eventBonus));
  const positive = score >= 50;

  const label = score >= 72 ? 'Сильная динамика дня' :
    score >= 55 ? 'Положительный импульс' :
    score >= 42 ? 'Нейтральный ритм' :
    score >= 28 ? 'Динамика снижается' : 'Нужна коррекция';

  const sub = todayCount === 0
    ? 'Нет данных за сегодня — первый сигнал запустит систему'
    : positive
      ? `${todayCount} событий сегодня · система набирает данные`
      : `${todayCount} событий · проверь рекомендации`;

  return { score, label, sub, positive };
};

export default function DailyMomentumCard() {
  const { snapshot } = useUnifiedState();
  const events = useAppStore(s => s.events);

  const { score, label, sub, positive } = useMemo(() => {
    const today = filterToday(events);
    const positiveCount = today.filter(e =>
      e.type === 'habit.completed' ||
      e.type === 'supplement.taken' ||
      (e.type === 'scan.completed' && e.payload.verdict === 'green') ||
      (e.type === 'hydration.logged' && e.payload.ml >= 200)
    ).length;
    const dir = snapshot?.trajectory.direction ?? 'flat';
    const mom = snapshot?.trajectory.momentum ?? 'moderate';
    return computeMomentum(dir, mom, today.length, positiveCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, snapshot?.trajectory.direction, snapshot?.trajectory.momentum]);

  const color = positive ? 'hsl(var(--safe))' : 'hsl(var(--warning))';
  const bgColor = positive ? 'hsl(var(--safe) / 0.07)' : 'hsl(var(--warning) / 0.07)';
  const borderColor = positive ? 'hsl(var(--safe) / 0.18)' : 'hsl(var(--warning) / 0.18)';
  const Icon = score >= 55 ? TrendingUp : score >= 42 ? Minus : TrendingDown;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-bold leading-tight" style={{ color }}>{label}</p>
          <span className="text-[10px] font-bold shrink-0" style={{ color }}>{score}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>
      </div>
    </motion.div>
  );
}
