import { newEvent, type DomainEvent, type InsightGeneratedEvent, type RecommendationGeneratedEvent, type StateSnapshotGeneratedEvent } from '../../store/types/events';
import { useAppStore } from '../../store/appStore';
import { syncEvent } from '../sync/syncEvents';
import { syncInsights } from '../sync/syncInsights';
import { syncRecommendations } from '../sync/syncRecommendations';
import { syncStateSnapshot } from '../sync/syncStateSnapshot';

type Listener = (e: DomainEvent) => void;
const listeners = new Set<Listener>();

const swallow = (label: string) => (error: unknown) => {
  console.warn(label, error);
};

export const eventDispatcher = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  async dispatchEvent(event: DomainEvent) {
    const store = useAppStore.getState();
    const previousSnapshot = store.stateSnapshot;
    const normalized = store.appendEvent(event);
    const snapshot = this.rebuildSnapshot();
    const predictions = this.rebuildPredictions();
    const recommendations = this.rebuildRecommendations();
    const insights = this.rebuildInsights();

    this.persistEvent(normalized).catch(swallow('Failed to persist event'));
    if (snapshot) {
      syncStateSnapshot(snapshot).catch(swallow('Failed to sync snapshot'));
    }
    syncRecommendations(recommendations).catch(swallow('Failed to sync recommendations'));
    syncInsights(insights).catch(swallow('Failed to sync insights'));

    const generatedEvents: DomainEvent[] = [];
    if (snapshot && Math.abs((previousSnapshot?.scores.readiness ?? snapshot.scores.readiness) - snapshot.scores.readiness) >= 2) {
      generatedEvents.push(
        newEvent<StateSnapshotGeneratedEvent>({
          type: 'state.snapshot.generated',
          source: 'system',
          confidence: 0.95,
          payload: { snapshot },
        }),
      );
    }
    const existingTitles = new Set(store.eventLog.map((item) => {
      if (item.type === 'recommendation.generated') return item.payload.recommendation.title;
      if (item.type === 'insight.generated') return item.payload.insight.title;
      return '';
    }));
    recommendations.slice(0, 2).forEach((recommendation) => {
      if (!existingTitles.has(recommendation.title)) {
        generatedEvents.push(
          newEvent<RecommendationGeneratedEvent>({
            type: 'recommendation.generated',
            source: 'system',
            confidence: 0.9,
            payload: { recommendation },
          }),
        );
      }
    });
    insights.slice(0, 2).forEach((insight) => {
      if (!existingTitles.has(insight.title)) {
        generatedEvents.push(
          newEvent<InsightGeneratedEvent>({
            type: 'insight.generated',
            source: 'system',
            confidence: insight.confidence,
            payload: { insight },
          }),
        );
      }
    });
    if (generatedEvents.length) {
      useAppStore.getState().appendEvents(generatedEvents, { rebuild: false });
    }

    listeners.forEach((listener) => {
      try {
        listener(normalized);
      } catch (error) {
        console.warn('Event listener failed', error);
      }
    });

    return normalized;
  },

  async persistEvent(event: DomainEvent) {
    return syncEvent(event);
  },

  rebuildSnapshot() {
    return useAppStore.getState().rebuildState();
  },

  rebuildPredictions() {
    return useAppStore.getState().predictions;
  },

  rebuildRecommendations() {
    return useAppStore.getState().recommendations;
  },

  rebuildInsights() {
    return useAppStore.getState().insights;
  },
};
