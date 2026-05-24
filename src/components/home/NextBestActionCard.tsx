import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecommendations } from '@/core/hooks/useRecommendations';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type RecommendationCompletedEvent } from '@/core/store/types/events';

export default function NextBestActionCard() {
  const { nextBestAction } = useRecommendations();
  const navigate = useNavigate();

  if (!nextBestAction) {
    return (
      <motion.button onClick={() => navigate('/scanner')}
        whileTap={{ scale: 0.98 }}
        className="w-full glass-premium rounded-2xl p-4 text-left">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">Следующее действие</p>
        <p className="text-sm font-display font-bold">Отсканируй первый приём — система начнёт читать состояние.</p>
      </motion.button>
    );
  }

  const r = nextBestAction;
  const impact = r.expectedImpact ?
    Object.entries(r.expectedImpact).filter(([, v]) => v).map(([k, v]) => `${k} ${v! > 0 ? '+' : ''}${v}`).join(' · ') : null;

  const done = () => eventDispatcher.dispatchEvent(newEvent<RecommendationCompletedEvent>({
    type: 'recommendation.completed', source: 'home',
    payload: { recommendationId: r.id, outcome: 'done' },
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-premium rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Следующее действие</p>
        <Zap className="w-3.5 h-3.5 text-glow-warm" />
      </div>
      <h3 className="font-display font-bold text-lg leading-tight tracking-tight mb-1.5">{r.title}</h3>
      <p className="text-xs text-muted-foreground leading-snug mb-3">{r.body}</p>
      {r.why && <p className="text-[10px] text-muted-foreground/80 italic mb-3">Почему: {r.why}</p>}
      {impact && (
        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-safe/10 text-safe text-[10px] font-bold uppercase tracking-wide mb-3">
          ожидаемо: {impact}
        </div>
      )}
      <button onClick={done}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl gradient-organic text-primary-foreground text-xs font-bold active:scale-[0.98] transition-transform shadow-sm">
        {r.cta || 'Выполнено'} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
