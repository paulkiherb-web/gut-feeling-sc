import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { EMPTY_SCORECARD } from '../store/slices';
import { buildScorecard } from '../domain/scoring/buildScorecard';
import type { DomainEvent } from '../store/types/events';
import { computeDualPath } from '../intensive/computeDualPath';

const ALCOHOL_RE = /алкогол|пиво|вино|водк|beer|wine|vodka|alcohol|whiskey|rum|gin|spirits/i;
const SUGAR_RE = /сахар|сладк|шоколад|конфет|торт|десерт|лимонад|кола|пепси|sugar|sweet|chocolate|candy|cake|dessert|soda|cola|lemonade/i;

function isNegativeEvent(event: DomainEvent): boolean {
  if (event.type === 'scan.completed' && event.payload.verdict === 'red') return true;
  if (event.type === 'meal.logged' && event.payload.verdict === 'red') return true;
  if (event.type === 'token.logged') {
    if (event.payload.signals?.hasAlcohol) return true;
    if (ALCOHOL_RE.test(event.payload.labelRu ?? '')) return true;
  }
  const title =
    event.type === 'scan.completed'
      ? `${event.payload.title ?? ''} ${event.payload.productName ?? ''}`
      : event.type === 'meal.logged'
        ? `${event.payload.title ?? ''} ${event.payload.name ?? ''}`
        : '';
  return ALCOHOL_RE.test(title) || SUGAR_RE.test(title);
}

export function useScores() {
  const scores = useAppStore((state) => state.scores) ?? EMPTY_SCORECARD;
  const eventLog = useAppStore((state) => state.eventLog);
  const profile = useAppStore((state) => state.profile);
  const goals = useAppStore((state) => state.goals);

  const activePlanId = useAppStore((state) => state.activeIntensivePlanId);
  const planOptions = useAppStore((state) => state.intensivePlanOptions);
  const intensiveStartedAt = useAppStore((state) => state.intensiveStartedAt);

  const activePlan = useMemo(
    () => planOptions.find((p) => p.id === activePlanId) ?? null,
    [activePlanId, planOptions],
  );

  const ghostReadinessScore = useMemo(() => {
    // When a plan is active, ghost = readiness if user followed plan perfectly.
    if (activePlan) {
      try {
        const dual = computeDualPath({
          events: eventLog,
          profile,
          goals,
          plan: activePlan,
          startedAtISO: intensiveStartedAt,
        });
        return dual.ghostCharge;
      } catch (e) {
        console.warn('computeDualPath failed, falling back to filter', e);
      }
    }
    // Fallback: filter out negative events, recompute scorecard.
    if (!eventLog.length) return scores.readiness;
    const filtered = eventLog.filter((e) => !isNegativeEvent(e));
    if (filtered.length === eventLog.length) return scores.readiness;
    try {
      return buildScorecard({ events: filtered, goals, profile }).readiness;
    } catch {
      return scores.readiness;
    }
  }, [activePlan, eventLog, goals, profile, scores.readiness, intensiveStartedAt]);

  return {
    ...scores,
    readinessScore: scores.readiness,
    ghostReadinessScore,
    activePlan,
    intensiveDayIndex: activePlan ? Math.max(1, Math.floor(((Date.now() - new Date(intensiveStartedAt || Date.now()).getTime()) / 86400000)) + 1) : null,
  };
}
