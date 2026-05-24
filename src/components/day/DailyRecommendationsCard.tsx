/**
 * @legacy — kept on disk for potential course integration.
 * Not rendered in the main Home path as of Sprint 2.
 * See src/core/legacy/LEGACY_CLEANUP_NOTES.md
 */
import { motion } from 'framer-motion';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type RecommendationCompletedEvent } from '@/core/store/types/events';

export default function DailyRecommendationsCard() {
  const { recommendations } = useRecommendations();
  if (!recommendations.length) return null;

  const complete = (id: string) =>
    eventDispatcher.dispatchEvent(newEvent<RecommendationCompletedEvent>({
      type: 'recommendation.completed', source: 'day',
      payload: { recommendationId: id, outcome: 'done' },
    }));

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Рекомендации</p>
      </div>
      <div className="space-y-2">
        {recommendations.slice(0, 4).map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-bold leading-tight flex-1">{r.title}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase shrink-0">{r.category}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mb-2">{r.body}</p>
            <button onClick={() => complete(r.id)}
              className="text-[10px] font-bold text-primary inline-flex items-center gap-1 active:opacity-70">
              {r.cta || 'Отметить'} <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
