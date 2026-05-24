import type { DomainEvent, ScanVerdict } from './events';

// ---- User & Goals ----
export interface UserState {
  id?: string;
  displayName?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  diets?: string[];
  condition?: string;
  customCondition?: string;
}

export interface GoalState {
  longGoal?: string;            // free-text long term
  dayGoal?: string;             // free-text today
  primaryGoal?: string;         // profile.goal key (energy/weight_loss/recovery/sleep)
  currentFocusState?: string;   // selected on Home (energy/sleep/focus/...)
}

// ---- Domain sub-states ----
export interface NutritionState {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  meals: number;
  lastMealAt?: string;
  hoursSinceLastMeal?: number;
}

export interface HydrationState {
  ml: number;
  targetMl: number;
  lastDrinkAt?: string;
}

export interface RecoveryState {
  sleepHours?: number;
  sleepQuality?: number;
  lastSleepAt?: string;
}

export interface EnergyState {
  trend: 'rising' | 'flat' | 'declining';
  score: number; // 0..100
}

// ---- Derived scores ----
export interface Scorecard {
  energy: number;        // 0..100
  recovery: number;
  sleep: number;
  nutrition: number;
  readiness: number;     // composite
  goalAlignment: number; // 0..100
}

// ---- Snapshot ----
export interface StateSnapshot {
  generatedAt: string;
  date: string;          // YYYY-MM-DD
  nutrition: NutritionState;
  hydration: HydrationState;
  recovery: RecoveryState;
  energy: EnergyState;
  scores: Scorecard;
  // Derived narrative
  trajectory: {
    direction: 'improving' | 'flat' | 'declining';
    confidence: number;  // 0..1
    drivers: string[];
  };
}

// ---- Recommendations ----
export interface Recommendation {
  id: string;
  title: string;
  body: string;
  category: 'nutrition' | 'hydration' | 'recovery' | 'movement' | 'mindset' | 'avoid';
  priority: number;               // 0..1 — higher = more important
  expectedImpact?: Partial<Scorecard>;
  why?: string;
  cta?: string;
  createdAt: string;
}

// ---- Insights ----
export interface Insight {
  id: string;
  title: string;
  body: string;
  confidence: number; // 0..1
  signals: string[];
  createdAt: string;
  kind: 'pattern' | 'causal' | 'trend' | 'risk' | 'win';
}

// Re-exports for convenience
export type { DomainEvent, ScanVerdict };
