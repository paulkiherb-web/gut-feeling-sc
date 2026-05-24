import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useInsights } from '@/core/hooks/useInsights';

const iconFor = (kind: string) =>
  kind === 'win' ? <Sparkles className="w-3.5 h-3.5 text-safe" /> :
  kind === 'risk' ? <AlertTriangle className="w-3.5 h-3.5 text-danger" /> :
  kind === 'trend' ? <TrendingUp className="w-3.5 h-3.5 text-warning" /> :
  <Brain className="w-3.5 h-3.5 text-primary" />;

export default function InsightFeed() {
  const insights = useInsights();
  if (!insights.length) return null;

  return (
    <div className="glass-premium rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Инсайты</p>
      </div>
      <div className="space-y-2">
        {insights.slice(0, 4).map((i, idx) => (
          <motion.div key={i.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-2.5 glass rounded-xl p-2.5">
            <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">{iconFor(i.kind)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-bold leading-tight">{i.title}</p>
                <span className="text-[9px] text-muted-foreground shrink-0">{Math.round(i.confidence * 100)}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{i.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
