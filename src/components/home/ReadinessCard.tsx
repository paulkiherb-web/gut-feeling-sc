import { useScores } from '@/core/hooks/useScores';

export default function ReadinessCard() {
  const s = useScores();
  return (
    <div className="glass-premium rounded-2xl p-4 flex items-center gap-3">
      <div className="text-3xl font-display font-bold w-12 text-center">{s.readiness}</div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Готовность</p>
        <p className="text-[11px] text-muted-foreground leading-snug">Композит из энергии, восстановления, сна и питания.</p>
      </div>
    </div>
  );
}
