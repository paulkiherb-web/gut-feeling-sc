/**
 * @legacy — kept on disk for potential course integration.
 * Not rendered in the main Home path as of Sprint 2.
 * See src/core/legacy/LEGACY_CLEANUP_NOTES.md
 */
import { motion } from 'framer-motion';
import { useUnifiedState } from '@/core/hooks/useUnifiedState';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type HydrationLoggedEvent } from '@/core/store/types/events';

export default function DailyHydrationCard() {
  const { snapshot } = useUnifiedState();
  const hydration = snapshot?.hydration ?? { ml: 0, targetMl: 2000 };
  const pct = Math.min(100, Math.round((hydration.ml / hydration.targetMl) * 100));

  const log = (ml: number) => {
    eventDispatcher.dispatchEvent(newEvent<HydrationLoggedEvent>({
      type: 'hydration.logged', source: 'day', payload: { ml, beverage: 'water' },
    }));
  };

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-glow-cool" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Вода</p>
        </div>
        <p className="text-xs font-bold">{hydration.ml} / {hydration.targetMl} мл</p>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          className="h-full rounded-full" style={{ background: 'hsl(var(--glow-cool))' }} />
      </div>
      <div className="flex gap-2">
        {[200, 300, 500].map(ml => (
          <button key={ml} onClick={() => log(ml)}
            className="flex-1 glass rounded-xl py-2 text-[11px] font-bold active:scale-95 transition-transform flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> {ml}мл
          </button>
        ))}
      </div>
    </div>
  );
}
