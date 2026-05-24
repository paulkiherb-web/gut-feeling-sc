import { motion } from 'framer-motion';
import { Apple, Beef, Wheat, Droplets, Check, X, AlertTriangle } from 'lucide-react';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';
import { buildDailyTimeline } from '@/core/domain/state/buildDailyTimeline';
import { useAppStore } from '@/core/store/appStore';

export default function DailyNutritionCard() {
  const { snapshot } = useUnifiedState();
  const events = useAppStore(s => s.events);
  if (!snapshot) return null;
  const n = snapshot.nutrition;
  const timeline = buildDailyTimeline(events).filter(t => t.kind === 'scan' || t.kind === 'meal');

  const vIcon = (v?: string) =>
    v === 'green' ? <Check className="w-3 h-3 text-safe" /> :
    v === 'red'   ? <X className="w-3 h-3 text-danger" /> :
                    <AlertTriangle className="w-3 h-3 text-warning" />;

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Apple className="w-4 h-4 text-safe" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Питание</p>
        </div>
        <div className="flex gap-1.5 text-[10px] font-bold">
          <span className="px-1.5 py-0.5 rounded-full bg-safe/15 text-safe">●{n.greenCount}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-warning/15 text-warning">●{n.yellowCount}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-danger/15 text-danger">●{n.redCount}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="glass rounded-xl p-2 text-center">
          <Beef className="w-3.5 h-3.5 text-safe mx-auto mb-1" />
          <p className="text-sm font-bold">{Math.round(n.protein)}г</p>
          <p className="text-[9px] text-muted-foreground">белок</p>
        </div>
        <div className="glass rounded-xl p-2 text-center">
          <Wheat className="w-3.5 h-3.5 text-warning mx-auto mb-1" />
          <p className="text-sm font-bold">{Math.round(n.carbs)}г</p>
          <p className="text-[9px] text-muted-foreground">углев.</p>
        </div>
        <div className="glass rounded-xl p-2 text-center">
          <Droplets className="w-3.5 h-3.5 text-glow-soft mx-auto mb-1" />
          <p className="text-sm font-bold">{Math.round(n.fat)}г</p>
          <p className="text-[9px] text-muted-foreground">жиры</p>
        </div>
      </div>
      {timeline.length === 0 ? (
        <p className="text-[11px] text-muted-foreground text-center py-3">Сегодня ещё нет сканов — отсканируйте приём пищи.</p>
      ) : (
        <div className="space-y-1.5">
          {timeline.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 glass rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-bold text-muted-foreground w-9">{t.time}</span>
              {vIcon(t.verdict)}
              <span className="flex-1 text-xs font-semibold truncate">{t.title}</span>
              {t.subtitle && <span className="text-[10px] text-muted-foreground truncate max-w-[40%]">{t.subtitle}</span>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
