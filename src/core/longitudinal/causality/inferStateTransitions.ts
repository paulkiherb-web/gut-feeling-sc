import type { DayProxy } from '../timeline/types';

export type StateTransition =
  | 'overload-entry'
  | 'overload-exit'
  | 'recovery-entry'
  | 'recovery-exit'
  | 'stable';

export interface StateTransitionEvent {
  day: string;
  transition: StateTransition;
  readinessBefore: number;
  readinessAfter: number;
  delta: number;
}

const OVERLOAD_THRESHOLD = 45;
const RECOVERY_THRESHOLD = 65;

/**
 * Identify state transitions in the daily proxy series.
 * Useful for understanding how often and how quickly the user enters/exits states.
 */
export const inferStateTransitions = (proxies: DayProxy[]): StateTransitionEvent[] => {
  const transitions: StateTransitionEvent[] = [];
  if (proxies.length < 2) return transitions;

  for (let i = 1; i < proxies.length; i++) {
    const prev = proxies[i - 1];
    const curr = proxies[i];
    const delta = curr.readinessProxy - prev.readinessProxy;

    if (prev.readinessProxy >= OVERLOAD_THRESHOLD && curr.readinessProxy < OVERLOAD_THRESHOLD) {
      transitions.push({ day: curr.day, transition: 'overload-entry', readinessBefore: prev.readinessProxy, readinessAfter: curr.readinessProxy, delta });
    } else if (prev.readinessProxy < OVERLOAD_THRESHOLD && curr.readinessProxy >= OVERLOAD_THRESHOLD) {
      transitions.push({ day: curr.day, transition: 'overload-exit', readinessBefore: prev.readinessProxy, readinessAfter: curr.readinessProxy, delta });
    } else if (prev.readinessProxy < RECOVERY_THRESHOLD && curr.readinessProxy >= RECOVERY_THRESHOLD) {
      transitions.push({ day: curr.day, transition: 'recovery-entry', readinessBefore: prev.readinessProxy, readinessAfter: curr.readinessProxy, delta });
    } else if (prev.readinessProxy >= RECOVERY_THRESHOLD && curr.readinessProxy < RECOVERY_THRESHOLD) {
      transitions.push({ day: curr.day, transition: 'recovery-exit', readinessBefore: prev.readinessProxy, readinessAfter: curr.readinessProxy, delta });
    }
  }

  return transitions;
};
