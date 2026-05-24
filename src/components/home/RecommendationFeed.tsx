import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, X } from 'lucide-react';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { useInterventionActions } from '@/core/hooks/useInterventionActions';

export default function RecommendationFeed() {
  const { recommendations } = useRecommendations();
  const { done, dismiss } = useInterventionActions();
  // Skip first one — that's shown by NextBestActionCard
  const rest = recommendations.slice(1, 4);
  if (!rest.length) return null;

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Ещё рекомендации</p>
      </div>
      <div className="space-y-1.5">
        {rest.map((r, i) => (
          <motion.div key={r.id}
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => done(r)} className="flex-1 text-left min-w-0 active:scale-[0.98] transition-transform">
                <p className="text-xs font-bold leading-tight truncate">{r.title}</p>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">{r.body}</p>
              </button>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => done(r)}
                  aria-label="Выполнено"
                  className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-safe active:scale-90 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => dismiss(r)}
                  aria-label="Не актуально"
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground active:scale-90 transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
