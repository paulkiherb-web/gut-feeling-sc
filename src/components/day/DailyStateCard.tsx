import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useScores } from '@/core/hooks/useScores';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

export default function DailyStateCard() {
  const scores = useScores();
  const { snapshot } = useUnifiedState();
  const dir = snapshot?.trajectory.direction ?? 'flat';

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Состояние сегодня</p>
        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
          style={{
            background: dir === 'improving' ? 'hsl(var(--safe) / 0.15)' : dir === 'declining' ? 'hsl(var(--danger) / 0.15)' : 'hsl(var(--muted))',
            color: dir === 'improving' ? 'hsl(var(--safe))' : dir === 'declining' ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))',
          }}>
          {dir === 'improving' ? '↑ растёт' : dir === 'declining' ? '↓ падает' : '→ стабильно'}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <div className="w-16 h-16 rounded-2xl gradient-organic flex items-center justify-center shadow-lg glow-primary">
          <Sparkles className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-4xl font-display font-bold tracking-tight leading-none">{scores.readiness}</p>
          <p className="text-[10px] text-muted-foreground mt-1">общая готовность · 0–100</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          { label: 'Энер.', v: scores.energy },
          { label: 'Восст.', v: scores.recovery },
          { label: 'Сон',   v: scores.sleep },
          { label: 'Пит.',  v: scores.nutrition },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-2 text-center">
            <p className="text-sm font-bold">{s.v}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
