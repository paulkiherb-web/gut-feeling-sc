import type { DomainEvent } from '../../store/types/events';
import { useAppStore } from '../../store/appStore';
import { syncEvent } from '../sync/syncEvents';
import { syncStateSnapshot } from '../sync/syncStateSnapshot';

type Listener = (e: DomainEvent) => void;
const listeners = new Set<Listener>();

export const eventDispatcher = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  async dispatchEvent(event: DomainEvent) {
    // 1) Local store append → auto recompute snapshot/scores/recommendations
    useAppStore.getState().appendEvent(event);

    // 2) Persist to backend (fire-and-forget)
    this.persistEvent(event).catch(() => {});

    // 3) Sync derived snapshot occasionally (fire-and-forget)
    this.updateStateSnapshot().catch(() => {});

    // 4) Notify listeners
    listeners.forEach(l => { try { l(event); } catch {} });
  },

  async persistEvent(event: DomainEvent) {
    return syncEvent(event);
  },

  async updateStateSnapshot() {
    const snap = useAppStore.getState().stateSnapshot;
    if (snap) return syncStateSnapshot(snap);
  },

  triggerRecommendations() {
    useAppStore.getState().recomputeDerived();
  },

  triggerInsights() {
    // hook left for the AI insight pipeline
  },
};
