import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type RecommendationCompletedEvent } from '@/core/store/types/events';

export default function RecommendationFeed() {
  const { recommendations } = useRecommendations();
  // Skip first one — that's shown by NextBestActionCard
  const rest = recommendations.slice(1, 4);
  if (!rest.length) return null;

  const done = (id: string) => eventDispatcher.dispatchEvent(newEvent<RecommendationCompletedEvent>({
    type: 'recommendation.completed', source: 'home', payload: { recommendationId: id, outcome: 'done' },
  }));

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Ещё рекомендации</p>
      </div>
      <div className="space-y-1.5">
        {rest.map((r, i) => (
          <motion.button key={r.id} onClick={() => done(r.id)} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="w-full glass rounded-xl p-2.5 text-left">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold leading-tight flex-1 truncate">{r.title}</p>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{r.body}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
