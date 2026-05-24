import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useScores } from '@/core/hooks/useScores';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

interface ScoreBarProps { label: string; value: number; delay: number; }
const ScoreBar = ({ label, value, delay }: ScoreBarProps) => {
  const color = value >= 70 ? 'hsl(var(--safe))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">{label}</span>
        <span className="text-[11px] font-bold text-white/90">{value}</span>
      </div>
      <div className="h-[3px] rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }} />
      </div>
    </div>
  );
};

const STATUS_LABELS: Record<string, string> = {
  improving: 'Состояние улучшается',
  flat: 'Система в норме',
  declining: 'Требует внимания',
};

const STATUS_SYSTEM: (r: number) => string = (r) =>
  r >= 75 ? 'оптимально' : r >= 55 ? 'рабочая норма' : r >= 35 ? 'сниженная готовность' : 'критически снижено';

export default function StateHeroCard() {
  const s = useScores();
  const { snapshot } = useUnifiedState();
  const dir = snapshot?.trajectory.direction ?? 'flat';
  const momentum = snapshot?.trajectory.momentum ?? 'moderate';
  const confidence = snapshot?.trajectory.confidence ?? 0;
  const DirIcon = dir === 'improving' ? TrendingUp : dir === 'declining' ? TrendingDown : Minus;
  const dirColor = dir === 'improving' ? 'hsl(var(--safe))' : dir === 'declining' ? 'hsl(var(--danger))' : 'rgba(255,255,255,0.5)';
  const systemStatus = STATUS_SYSTEM(s.readiness);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[28px] overflow-hidden p-5"
      style={{
        background: 'linear-gradient(155deg, hsl(220 35% 11%) 0%, hsl(var(--primary) / 0.80) 55%, hsl(var(--ring)) 100%)',
        boxShadow: '0 20px 50px -12px hsl(var(--primary) / 0.40), inset 0 1px 0 hsl(0 0% 100% / 0.07)',
      }}>
      {/* ambient glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: dir === 'declining' ? 'hsl(var(--danger) / 0.25)' : 'hsl(var(--glow) / 0.4)' }} />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-white/60" />
            <span className="text-white/60 text-[9px] font-bold tracking-[0.3em] uppercase">State OS</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
            <DirIcon className="w-2.5 h-2.5" style={{ color: dirColor }} />
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/90">
              {STATUS_LABELS[dir]}
            </span>
          </div>
        </div>

        {/* Readiness hero number */}
        <div className="flex items-end gap-3 mb-1">
          <motion.p className="text-[68px] font-display font-black text-white leading-none tracking-tight"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {s.readiness}
          </motion.p>
          <div className="mb-2.5 space-y-0.5">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">готовность</p>
            <p className="text-white/70 text-[11px] font-semibold">{systemStatus}</p>
          </div>
        </div>

        {/* Confidence + momentum */}
        {snapshot && (
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] flex-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-white/30"
                initial={{ width: 0 }} animate={{ width: `${Math.round(confidence * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }} />
            </div>
            <span className="text-[9px] text-white/40 shrink-0">
              {Math.round(confidence * 100)}% · {momentum === 'strong' ? 'сильный' : momentum === 'weak' ? 'слабый' : 'умеренный'} импульс
            </span>
          </div>
        )}

        {/* 4-score bars */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <ScoreBar label="Энергия" value={s.energy} delay={0.1} />
          <ScoreBar label="Восстановл." value={s.recovery} delay={0.15} />
          <ScoreBar label="Питание" value={s.nutrition} delay={0.2} />
          <ScoreBar label="Цель" value={s.goalAlignment} delay={0.25} />
        </div>
      </div>
    </motion.div>
  );
}
