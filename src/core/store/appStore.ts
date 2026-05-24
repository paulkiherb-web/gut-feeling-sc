import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DomainEvent } from './types/events';
import type { GoalState, Insight, Recommendation, Scorecard, StateSnapshot, UserState } from './types/state';
import { buildStateSnapshot } from './calculators/buildStateSnapshot';
import { generateRecommendations } from '../domain/recommendations/generateRecommendations';

interface MealSlice {
  id: string; title: string; at: string; verdict?: 'green' | 'yellow' | 'red';
}
interface SupplementSlice { id: string; name: string; at: string; }
interface HabitSlice { id: string; name: string; at: string; streak?: number; }

export interface AppState {
  // Core data
  profile: UserState;
  goals: GoalState;
  events: DomainEvent[];

  // Derived
  stateSnapshot: StateSnapshot | null;
  scores: Scorecard | null;
  recommendations: Recommendation[];
  insights: Insight[];

  // Convenience aggregations
  hydration: { ml: number; lastAt?: string };
  meals: MealSlice[];
  supplements: SupplementSlice[];
  habits: HabitSlice[];

  hydrationReady: boolean;  // alias to hydration tracker readiness

  // Mutators
  setProfile: (p: Partial<UserState>) => void;
  setGoals: (g: Partial<GoalState>) => void;
  appendEvent: (e: DomainEvent) => void;
  recomputeDerived: () => void;
  addRecommendation: (r: Recommendation) => void;
  addInsight: (i: Insight) => void;
  reset: () => void;
}

const initial = {
  profile: {} as UserState,
  goals: {} as GoalState,
  events: [] as DomainEvent[],
  stateSnapshot: null,
  scores: null,
  recommendations: [] as Recommendation[],
  insights: [] as Insight[],
  hydration: { ml: 0 },
  meals: [] as MealSlice[],
  supplements: [] as SupplementSlice[],
  habits: [] as HabitSlice[],
  hydrationReady: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      setProfile: (p) => {
        set({ profile: { ...get().profile, ...p } });
        get().recomputeDerived();
      },
      setGoals: (g) => {
        set({ goals: { ...get().goals, ...g } });
        get().recomputeDerived();
      },

      appendEvent: (e) => {
        const events = [...get().events, e].slice(-1000); // bound size
        // Update convenience slices
        const patch: Partial<AppState> = { events };
        if (e.type === 'hydration.logged') {
          patch.hydration = { ml: get().hydration.ml + (e.payload.ml || 0), lastAt: e.timestamp };
        }
        if (e.type === 'meal.logged') {
          patch.meals = [...get().meals, { id: e.payload.mealId, title: e.payload.title, at: e.timestamp, verdict: e.payload.verdict }].slice(-200);
        }
        if (e.type === 'supplement.taken') {
          patch.supplements = [...get().supplements, { id: e.payload.supplementId, name: e.payload.name, at: e.timestamp }].slice(-200);
        }
        if (e.type === 'habit.completed') {
          patch.habits = [...get().habits, { id: e.payload.habitId, name: e.payload.name, at: e.timestamp, streak: e.payload.streak }].slice(-200);
        }
        set(patch);
        get().recomputeDerived();
      },

      recomputeDerived: () => {
        const { events, profile, goals, stateSnapshot: prev } = get();
        const snapshot = buildStateSnapshot(events, profile, goals, prev ?? undefined);
        const { recommendations } = generateRecommendations(snapshot, goals, events.slice(-50));
        set({ stateSnapshot: snapshot, scores: snapshot.scores, recommendations });
      },

      addRecommendation: (r) =>
        set({ recommendations: [r, ...get().recommendations.filter(x => x.id !== r.id)].slice(0, 30) }),

      addInsight: (i) =>
        set({ insights: [i, ...get().insights.filter(x => x.id !== i.id)].slice(0, 50) }),

      reset: () => set(initial),
    }),
    {
      name: 'nutrisee_core_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        profile: s.profile,
        goals: s.goals,
        events: s.events,
        insights: s.insights,
        hydration: s.hydration,
        meals: s.meals,
        supplements: s.supplements,
        habits: s.habits,
      }),
      onRehydrateStorage: () => (state) => {
        // Recompute on hydration so snapshot/scores/recommendations always exist
        setTimeout(() => state?.recomputeDerived(), 0);
      },
    },
  ),
);
