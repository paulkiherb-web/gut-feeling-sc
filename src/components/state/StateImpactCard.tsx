import { motion } from 'framer-motion';
import { Zap, Heart, Apple, Target } from 'lucide-react';
import { useScores } from '@/core/hooks/useScores';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';

interface StateImpactCardProps {
  className?: string;
}

const Row = ({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint?: string }) => {
  const color = value >= 70 ? 'hsl(var(--safe))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-tight">{label}</span>
          <span className="text-[11px] font-bold" style={{ color }}>{value}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.6 }}
            style={{ background: color }}
          />
        </div>
        {hint && <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  );
};

export default function StateImpactCard({ className = '' }: StateImpactCardProps) {
  const scores = useScores();
  const { snapshot } = useUnifiedState();

  const drivers = snapshot?.trajectory.drivers ?? [];
  const energyHint   = drivers.find(d => /энерг/i.test(d));
  const recoveryHint = drivers.find(d => /сон|восст/i.test(d));
  const nutritionHint = drivers.find(d => /белок|вод|приём/i.test(d));
  const goalHint     = drivers.find(d => /цел|зелён|красн/i.test(d));

  return (
    <div className={`glass-premium rounded-2xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Влияние на состояние</p>
        {snapshot && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
            style={{
              background: snapshot.trajectory.direction === 'improving' ? 'hsl(var(--safe) / 0.15)' :
                          snapshot.trajectory.direction === 'declining' ? 'hsl(var(--danger) / 0.15)' : 'hsl(var(--muted))',
              color: snapshot.trajectory.direction === 'improving' ? 'hsl(var(--safe))' :
                     snapshot.trajectory.direction === 'declining' ? 'hsl(var(--danger))' : 'hsl(var(--muted-foreground))',
            }}>
            {snapshot.trajectory.direction === 'improving' ? '↑ растёт' :
             snapshot.trajectory.direction === 'declining' ? '↓ падает' : '→ стабильно'}
          </span>
        )}
      </div>
      <Row icon={<Zap className="w-3.5 h-3.5 text-warning" />} label="Энергия" value={scores.energy} hint={energyHint} />
      <Row icon={<Heart className="w-3.5 h-3.5 text-danger" />} label="Восстановление" value={scores.recovery} hint={recoveryHint} />
      <Row icon={<Apple className="w-3.5 h-3.5 text-safe" />} label="Питание" value={scores.nutrition} hint={nutritionHint} />
      <Row icon={<Target className="w-3.5 h-3.5 text-primary" />} label="Цель" value={scores.goalAlignment} hint={goalHint} />
    </div>
  );
}
