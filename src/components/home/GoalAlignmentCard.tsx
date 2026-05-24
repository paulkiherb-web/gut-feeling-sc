import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { useScores } from '@/core/hooks/useScores';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

export default function GoalAlignmentCard() {
  const s = useScores();
  const { goals } = useUnifiedState();
  const v = s.goalAlignment;
  const color = v >= 70 ? 'hsl(var(--safe))' : v >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Согласованность с целью</p>
        </div>
        <span className="text-sm font-bold" style={{ color }}>{v}</span>
      </div>
      {goals.dayGoal && <p className="text-[11px] text-foreground/80 italic mb-2">«{goals.dayGoal}»</p>}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}
