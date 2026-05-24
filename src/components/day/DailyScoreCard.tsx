import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useScores } from '@/core/hooks/useScores';

const Bar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 70 ? 'hsl(var(--safe))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
};

export default function DailyScoreCard() {
  const s = useScores();
  return (
    <div className="glass-premium rounded-2xl p-4 space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Дневная карта баллов</p>
      </div>
      <Bar label="Энергия" value={s.energy} />
      <Bar label="Восстановление" value={s.recovery} />
      <Bar label="Сон" value={s.sleep} />
      <Bar label="Питание" value={s.nutrition} />
      <Bar label="Согласованность с целью" value={s.goalAlignment} />
    </div>
  );
}
