import { motion } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, TrendingUp, GitBranch } from 'lucide-react';
import { useInsights } from '@/core/hooks/useInsights';
import { useAppStore } from '@/core/store/appStore';
import { buildBehavioralFingerprint } from '@/core/capture/buildBehavioralFingerprint';
import { useMemo } from 'react';

type InsightKind = 'pattern' | 'causal' | 'trend' | 'risk' | 'win';

const ICON_MAP: Record<InsightKind, React.ReactNode> = {
  win:     <Sparkles className="w-3.5 h-3.5 text-safe" />,
  risk:    <AlertTriangle className="w-3.5 h-3.5 text-danger" />,
  trend:   <TrendingUp className="w-3.5 h-3.5 text-warning" />,
  causal:  <Brain className="w-3.5 h-3.5 text-primary" />,
  pattern: <GitBranch className="w-3.5 h-3.5 text-primary/70" />,
};

const KIND_LABEL: Record<InsightKind, string> = {
  win: 'Победа', risk: 'Риск', trend: 'Тренд', causal: 'Причина', pattern: 'Паттерн',
};

const KIND_COLOR: Record<InsightKind, string> = {
  win: 'hsl(var(--safe))', risk: 'hsl(var(--danger))',
  trend: 'hsl(var(--warning))', causal: 'hsl(var(--primary))', pattern: 'hsl(var(--primary) / 0.7)',
};

export default function BehavioralInsightFeed() {
  const insights = useInsights();
  const events = useAppStore(s => s.events);
  const goals = useAppStore(s => s.goals);

  const fingerprint = useMemo(
    () => buildBehavioralFingerprint(events, goals),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events.length, goals.primaryGoal],
  );

  const hasFingerprint = fingerprint.patterns.length > 0 ||
    fingerprint.strengths.length > 0 ||
    fingerprint.riskBehaviors.length > 0;

  if (!insights.length && !hasFingerprint) return null;

  const topInsights = insights.slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-premium rounded-2xl p-4 space-y-3">

      <div className="flex items-center gap-2">
        <Brain className="w-3.5 h-3.5 text-primary" />
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">Поведение и паттерны</p>
      </div>

      {/* Behavioral fingerprint summary */}
      {hasFingerprint && (
        <div className="rounded-xl bg-muted/30 px-3 py-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-foreground/80">{fingerprint.summary}</span>
            <span className="text-[9px] text-muted-foreground">{fingerprint.adherenceScore}% вовлечён.</span>
          </div>
          {fingerprint.positiveBehaviorLoops.length > 0 && (
            <p className="text-[10px] text-safe leading-snug">
              ✓ {fingerprint.positiveBehaviorLoops[0]}
            </p>
          )}
          {fingerprint.riskBehaviors.length > 0 && (
            <p className="text-[10px] text-warning leading-snug">
              ⚠ {fingerprint.riskBehaviors[0]}
            </p>
          )}
        </div>
      )}

      {/* Insights list */}
      {topInsights.length > 0 && (
        <div className="space-y-2">
          {topInsights.map((ins, i) => {
            const kind = ins.kind as InsightKind;
            const color = KIND_COLOR[kind] ?? KIND_COLOR.causal;
            return (
              <motion.div key={ins.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${color}15` }}>
                  {ICON_MAP[kind] ?? ICON_MAP.causal}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-[0.15em]"
                      style={{ color }}>{KIND_LABEL[kind]}</span>
                    <span className="text-[8px] text-muted-foreground/60">{Math.round(ins.confidence * 100)}%</span>
                  </div>
                  <p className="text-[11px] font-semibold leading-tight mt-0.5">{ins.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{ins.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
