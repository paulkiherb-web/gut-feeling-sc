import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { eventDispatcher } from '../services/events/eventDispatcher';
import { newEvent } from '../store/types/events';
import type {
  RecommendationAcceptedEvent,
  RecommendationCompletedEvent,
  RecommendationIgnoredEvent,
  RecommendationSnoozedEvent,
  RecommendationViewedEvent,
} from '../store/types/events';
import type { Recommendation } from '../store/types/state';

const SNOOZE_DURATION_HOURS = 2;

export function useInterventionActions() {
  const scores = useAppStore((s) => s.scores);

  const markViewed = useCallback(
    (rec: Recommendation) => {
      eventDispatcher.dispatchEvent(
        newEvent<RecommendationViewedEvent>({
          type: 'recommendation.viewed',
          source: 'home',
          payload: { recommendationId: rec.id, category: rec.category },
        }),
      );
    },
    [],
  );

  const accept = useCallback(
    (rec: Recommendation) => {
      eventDispatcher.dispatchEvent(
        newEvent<RecommendationAcceptedEvent>({
          type: 'recommendation.accepted',
          source: 'home',
          payload: {
            recommendationId: rec.id,
            category: rec.category,
            interventionType: rec.interventionType,
            preStateScores: scores as unknown as Record<string, number>,
            expectedImpact: rec.expectedImpact as Record<string, number> | undefined,
            estimatedEffectWindowHours: rec.estimatedEffectWindowHours,
          },
        }),
      );
    },
    [scores],
  );

  const done = useCallback(
    (rec: Recommendation) => {
      eventDispatcher.dispatchEvent(
        newEvent<RecommendationCompletedEvent>({
          type: 'recommendation.completed',
          source: 'home',
          payload: {
            recommendationId: rec.id,
            outcome: 'done',
            category: rec.category,
            interventionType: rec.interventionType,
          },
        }),
      );
    },
    [],
  );

  const snooze = useCallback(
    (rec: Recommendation) => {
      const snoozedUntil = new Date(
        Date.now() + SNOOZE_DURATION_HOURS * 3_600_000,
      ).toISOString();

      // Update the recommendation in-place with snoozedUntil
      useAppStore.getState().setRecommendations(
        useAppStore.getState().recommendations.map((r) =>
          r.id === rec.id ? { ...r, snoozedUntil, lifecycleState: 'snoozed' as const } : r,
        ),
      );

      eventDispatcher.dispatchEvent(
        newEvent<RecommendationSnoozedEvent>({
          type: 'recommendation.snoozed',
          source: 'home',
          payload: { recommendationId: rec.id, category: rec.category, snoozedUntil },
        }),
      );
    },
    [],
  );

  const dismiss = useCallback(
    (rec: Recommendation) => {
      // Remove from visible list immediately
      useAppStore.getState().setRecommendations(
        useAppStore.getState().recommendations.filter((r) => r.id !== rec.id),
      );

      eventDispatcher.dispatchEvent(
        newEvent<RecommendationIgnoredEvent>({
          type: 'recommendation.ignored',
          source: 'home',
          payload: {
            recommendationId: rec.id,
            category: rec.category,
            interventionType: rec.interventionType,
          },
        }),
      );
    },
    [],
  );

  return { markViewed, accept, done, snooze, dismiss };
}
