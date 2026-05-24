import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useScores } from '@/core/hooks/useScores';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

const Ring = ({ value, label }: { value: number; label: string }) => {
  const r = 22, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = value >= 70 ? 'hsl(var(--safe))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r={r} stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
          <motion.circle cx="28" cy="28" r={r} stroke={color} strokeWidth="4" fill="none"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }} transition={{ duration: 0.8 }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{value}</span>
      </div>
      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">{label}</span>
    </div>
  );
};

export default function StateHeroCard() {
  const s = useScores();
  const { snapshot } = useUnifiedState();
  const dir = snapshot?.trajectory.direction ?? 'flat';
  const DirIcon = dir === 'improving' ? TrendingUp : dir === 'declining' ? TrendingDown : Minus;
  const dirColor = dir === 'improving' ? 'hsl(var(--safe))' : dir === 'declining' ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[28px] overflow-hidden p-5"
      style={{
        background: 'linear-gradient(155deg, hsl(220 35% 12%) 0%, hsl(var(--primary) / 0.85) 60%, hsl(var(--ring)) 100%)',
        boxShadow: '0 20px 50px -12px hsl(var(--primary) / 0.45), inset 0 1px 0 hsl(0 0% 100% / 0.08)',
      }}>
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl" style={{ background: 'hsl(var(--glow) / 0.5)' }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white/80" />
            <span className="text-white/80 text-[10px] font-bold tracking-[0.25em] uppercase">State OS</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur">
            <DirIcon className="w-3 h-3" style={{ color: dirColor === 'hsl(var(--muted-foreground))' ? 'white' : dirColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white">
              {dir === 'improving' ? 'растёт' : dir === 'declining' ? 'падает' : 'стабильно'}
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3 mb-4">
          <p className="text-6xl font-display font-black text-white leading-none tracking-tight">{s.readiness}</p>
          <p className="text-white/70 text-[11px] mb-2 leading-snug">готовность<br/>сегодня</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Ring value={s.energy} label="Энер." />
          <Ring value={s.recovery} label="Восст." />
          <Ring value={s.nutrition} label="Пит." />
          <Ring value={s.goalAlignment} label="Цель" />
        </div>
      </div>
    </motion.div>
  );
}
