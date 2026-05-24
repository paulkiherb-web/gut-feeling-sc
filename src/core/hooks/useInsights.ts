import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { selectRecentInsights } from '../store/selectors';
import { deriveLocalInsights } from '../services/insights';

export function useInsights() {
  const insights = useAppStore(selectRecentInsights);
  const events   = useAppStore(s => s.events);
  const snapshot = useAppStore(s => s.stateSnapshot);
  const add      = useAppStore(s => s.addInsight);

  useEffect(() => {
    if (!snapshot) return;
    const next = deriveLocalInsights(events, snapshot);
    next.forEach(i => add(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, snapshot?.generatedAt]);

  return insights;
}
