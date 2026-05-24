import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { buildStateSnapshot, buildTrajectoryPoint } from '../domain/state/buildStateSnapshot';
import { generateInsights } from '../domain/insights/generateInsights';
import { generateRecommendations } from '../domain/recommendations/generateRecommendations';
import { normalizeEvent, type DomainEvent } from './types/events';
import type { GoalState, Insight, Prediction, Recommendation, Scorecard, StateSnapshot, StateTrajectoryHistory, UserState } from './types/state';
import { buildLongitudinalModel, type LongitudinalModel } from '../longitudinal';
import {
  DEFAULT_GOALS,
  DEFAULT_HYDRATION,
  DEFAULT_PROFILE,
  DEFAULT_RECOVERY,
  DEFAULT_SLEEP,
  EMPTY_SCORECARD,
  deriveHabits,
  deriveMeals,
  deriveSupplements,
  mergeHydration,
  type LoggedHabit,
  type LoggedMeal,
  type LoggedSupplement,
} from './slices';
import { rankRecommendations } from '../interventions/recommendations/rankRecommendations';
import {
  type InterventionMemory,
  EMPTY_INTERVENTION_MEMORY,
} from '../interventions/learning/interventionMemory';
import { processPendingOutcomes } from '../interventions/learning/updateInterventionLearning';

interface AppendOptions {
  rebuild?: boolean;
}

export interface AppState {
  profile: UserState;
  goals: GoalState;
  eventLog: DomainEvent[];
  events: DomainEvent[];
  stateSnapshot: StateSnapshot | null;
  scores: Scorecard;
  recommendations: Recommendation[];
  insights: Insight[];
  trajectories: StateTrajectoryHistory;
  predictions: Prediction[];
  hydration: typeof DEFAULT_HYDRATION;
  meals: LoggedMeal[];
  recovery: typeof DEFAULT_RECOVERY;
  sleep: typeof DEFAULT_SLEEP;
  supplements: LoggedSupplement[];
  habits: LoggedHabit[];
  isHydrated: boolean;
  interventionMemory: InterventionMemory;
  longitudinal: LongitudinalModel | null;
  setHydrated: (value: boolean) => void;
  setProfile: (profile: Partial<UserState>) => void;
  setGoals: (goals: Partial<GoalState>) => void;
  appendEvent: (event: DomainEvent, options?: AppendOptions) => DomainEvent;
  appendEvents: (events: DomainEvent[], options?: AppendOptions) => DomainEvent[];
  rebuildState: () => StateSnapshot | null;
  setRecommendations: (recommendations: Recommendation[]) => void;
  setInsights: (insights: Insight[]) => void;
  setInterventionMemory: (memory: InterventionMemory) => void;
  updateInterventionMemory: (updater: (prev: InterventionMemory) => InterventionMemory) => void;
  reset: () => void;
}

const createInitialStoreState = (): Omit<
  AppState,
  'setHydrated' | 'setProfile' | 'setGoals' | 'appendEvent' | 'appendEvents' | 'rebuildState' | 'setRecommendations' | 'setInsights' | 'setInterventionMemory' | 'updateInterventionMemory' | 'reset'
> => ({
  profile: { ...DEFAULT_PROFILE },
  goals: { ...DEFAULT_GOALS },
  eventLog: [],
  events: [],
  stateSnapshot: null,
  scores: { ...EMPTY_SCORECARD },
  recommendations: [],
  insights: [],
  trajectories: [],
  predictions: [],
  hydration: { ...DEFAULT_HYDRATION },
  meals: [],
  recovery: { ...DEFAULT_RECOVERY },
  sleep: { ...DEFAULT_SLEEP },
  supplements: [],
  habits: [],
  isHydrated: false,
  interventionMemory: { ...EMPTY_INTERVENTION_MEMORY },
  longitudinal: null,
});

const deriveCollections = (events: DomainEvent[]) => ({
  eventLog: events,
  events,
  meals: deriveMeals(events),
  supplements: deriveSupplements(events),
  habits: deriveHabits(events),
});

const computeDerivedState = (state: Pick<AppState, 'eventLog' | 'profile' | 'goals' | 'stateSnapshot' | 'trajectories' | 'interventionMemory'>) => {
  if (!state.eventLog.length) {
    return {
      stateSnapshot: null,
      scores: { ...EMPTY_SCORECARD },
      predictions: [] as Prediction[],
      recommendations: [] as Recommendation[],
      insights: [] as Insight[],
      trajectories: [] as StateTrajectoryHistory,
      hydration: { ...DEFAULT_HYDRATION },
      recovery: { ...DEFAULT_RECOVERY },
      sleep: { ...DEFAULT_SLEEP },
      interventionMemory: state.interventionMemory,
      longitudinal: null as LongitudinalModel | null,
    };
  }

  const snapshot = buildStateSnapshot({
    events: state.eventLog,
    profile: state.profile,
    goals: state.goals,
    previousSnapshot: state.stateSnapshot ?? undefined,
  });
  const recommendationOutput = generateRecommendations(snapshot, snapshot.predictions, state.goals, state.eventLog.slice(-40));
  const insights = generateInsights(snapshot, snapshot.predictions, state.eventLog.slice(-40));
  const trajectoryPoint = buildTrajectoryPoint(snapshot);
  const lastPoint = state.trajectories[state.trajectories.length - 1];
  const trajectories =
    lastPoint && lastPoint.readiness === trajectoryPoint.readiness && lastPoint.direction === trajectoryPoint.direction
      ? [...state.trajectories.slice(0, -1), trajectoryPoint]
      : [...state.trajectories, trajectoryPoint].slice(-60);

  // Process any pending outcome evaluations (lazy, non-blocking)
  const updatedMemory = processPendingOutcomes(state.interventionMemory, snapshot.scores);

  // Rank recommendations using the learned model
  const rankedRecommendations = rankRecommendations(recommendationOutput.recommendations, {
    currentScores: snapshot.scores,
    memory: updatedMemory,
    hourOfDay: new Date().getHours(),
  });

  // Longitudinal model — memoized, skips recomputation if events unchanged
  const longitudinal = buildLongitudinalModel(state.eventLog);

  return {
    stateSnapshot: snapshot,
    scores: snapshot.scores,
    predictions: snapshot.predictions,
    recommendations: rankedRecommendations,
    insights,
    trajectories,
    hydration: mergeHydration(snapshot.hydration),
    recovery: snapshot.recovery,
    sleep: snapshot.sleep,
    interventionMemory: updatedMemory,
    longitudinal,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createInitialStoreState(),
      setHydrated: (value) => set({ isHydrated: value }),
      setProfile: (profile) => {
        set((state) => ({ profile: { ...state.profile, ...profile } }));
        get().rebuildState();
      },
      setGoals: (goals) => {
        set((state) => ({ goals: { ...state.goals, ...goals } }));
        get().rebuildState();
      },
      appendEvent: (event, options = {}) => {
        const normalized = normalizeEvent(event);
        set((state) => {
          const nextEvents = [...state.eventLog, normalized].slice(-1500);
          return deriveCollections(nextEvents);
        });
        if (options.rebuild !== false) {
          get().rebuildState();
        }
        return normalized;
      },
      appendEvents: (events, options = {}) => {
        const normalizedEvents = events.map((event) => normalizeEvent(event));
        set((state) => {
          const nextEvents = [...state.eventLog, ...normalizedEvents].slice(-1500);
          return deriveCollections(nextEvents);
        });
        if (options.rebuild !== false) {
          get().rebuildState();
        }
        return normalizedEvents;
      },
      rebuildState: () => {
        const state = get();
        const derived = computeDerivedState(state);
        set(derived);
        return derived.stateSnapshot;
      },
      setRecommendations: (recommendations) => set({ recommendations }),
      setInsights: (insights) => set({ insights }),
      setInterventionMemory: (interventionMemory) => set({ interventionMemory }),
      updateInterventionMemory: (updater) =>
        set((state) => ({ interventionMemory: updater(state.interventionMemory) })),
      reset: () => set(createInitialStoreState()),
    }),
    {
      name: 'state-os-core-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        goals: state.goals,
        eventLog: state.eventLog,
        interventionMemory: state.interventionMemory,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate core store', error);
          return;
        }

        state?.setHydrated(true);
        state?.rebuildState();
      },
    },
  ),
);
