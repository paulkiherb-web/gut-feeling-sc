export type GoalMetric = 'energy' | 'recovery' | 'sleep' | 'nutrition' | 'hydration' | 'goalAlignment';

export interface GoalWeights {
  energy: number;
  recovery: number;
  sleep: number;
  nutrition: number;
  hydration: number;
  goalAlignment: number;
}

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
  timezone?: string;
  locale?: string;
  hydrationTargetMl?: number;
  sleepTargetHours?: number;
  // Medical profile (onboarding step 8-10)
  conditions?: string[];
  dietType?: string;
  ifWindow?: string;
  badHabits?: string[];
  activityLevel?: string;
  sleepHours?: string;
  wakeTime?: string;
  sleepTime?: string;
}

export interface GoalState {
  primaryGoal?: string;
  currentFocusState?: string;
  dayGoal?: string;
  longGoal?: string;
  weights?: Partial<GoalWeights>;
}

export interface EnergyState {
  score: number;
  trend: 'rising' | 'flat' | 'declining';
  stability: number;
  crashRisk: number;
  contributors: string[];
}

export interface RecoveryState {
  score: number;
  strain: number;
  recoveryDebtHours: number;
  soreness?: number;
  stressLoad?: number;
  lastRecordedAt?: string;
}

export interface SleepState {
  durationHours: number;
  quality: number;
  sleepDebtHours: number;
  consistencyScore: number;
  bedtime?: string;
  wakeTime?: string;
  lastRecordedAt?: string;
}

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
  cadenceScore: number;
}

export interface HydrationState {
  ml: number;
  targetMl: number;
  progress: number;
  risk: number;
  lastDrinkAt?: string;
  hoursSinceLastDrink?: number;
}

export interface BehavioralState {
  habitsCompleted: number;
  activeStreaks: number;
  supplementCount: number;
  recommendationCompletionRate: number;
  adherenceScore: number;
}

export interface DerivedState {
  energy: EnergyState;
  recovery: RecoveryState;
  sleep: SleepState;
  nutrition: NutritionState;
  hydration: HydrationState;
  behavioral: BehavioralState;
}

export interface Scorecard {
  energy: number;
  recovery: number;
  sleep: number;
  nutrition: number;
  readiness: number;
  goalAlignment: number;
}

export type PredictionType =
  | 'energy-crash-risk'
  | 'recovery-decline'
  | 'sleep-instability'
  | 'hydration-risk'
  | 'goal-deviation';

export interface Prediction {
  id: string;
  type: PredictionType;
  title: string;
  description: string;
  score: number;
  confidence: number;
  horizonHours: number;
  riskLevel: 'low' | 'moderate' | 'high';
  drivers: string[];
  createdAt: string;
}

export interface StateTrajectory {
  direction: 'improving' | 'flat' | 'declining';
  momentum: 'strong' | 'moderate' | 'weak';
  confidence: number;
  delta: number;
  windowHours: number;
  causes: string[];
  drivers: string[];
}

export type InterventionLifecycleState =
  | 'generated'
  | 'shown'
  | 'viewed'
  | 'accepted'
  | 'snoozed'
  | 'ignored'
  | 'completed'
  | 'failed'
  | 'expired';

export type InterventionType =
  | 'behavioral'
  | 'nutritional'
  | 'hydration'
  | 'sleep'
  | 'recovery'
  | 'supplement'
  | 'goal'
  | 'habit';

export interface Recommendation {
  id: string;
  kind: 'next-best' | 'highest-leverage' | 'compensation' | 'prevention';
  title: string;
  body: string;
  category: 'nutrition' | 'hydration' | 'recovery' | 'sleep' | 'behavior' | 'goal';
  priority: number;
  leverage: number;
  expectedImpact?: Partial<Scorecard>;
  why?: string;
  cta?: string;
  createdAt: string;
  status: 'active' | 'completed' | 'dismissed';
  sourcePredictionTypes?: PredictionType[];
  // Intervention system fields (populated by enrichRecommendations)
  lifecycleState?: InterventionLifecycleState;
  interventionType?: InterventionType;
  urgency?: 'high' | 'medium' | 'low';
  confidence?: number;
  targetState?: Partial<Scorecard>;
  estimatedEffectWindowHours?: number;
  learningWeight?: number;
  behavioralFit?: number;
  frictionScore?: number;
  compositeScore?: number;
  snoozedUntil?: string;
  preStateScores?: Partial<Scorecard>;
}

export interface Insight {
  id: string;
  kind: 'pattern' | 'causal' | 'trend' | 'risk' | 'win';
  title: string;
  body: string;
  confidence: number;
  signals: string[];
  createdAt: string;
}

export interface StateSnapshot {
  id: string;
  generatedAt: string;
  date: string;
  windowStartedAt: string;
  windowEndedAt: string;
  derived: DerivedState;
  energy: EnergyState;
  recovery: RecoveryState;
  sleep: SleepState;
  nutrition: NutritionState;
  hydration: HydrationState;
  behavioral: BehavioralState;
  scores: Scorecard;
  trajectory: StateTrajectory;
  predictions: Prediction[];
}

export interface StateTrajectoryPoint {
  id: string;
  generatedAt: string;
  readiness: number;
  energy: number;
  direction: StateTrajectory['direction'];
}

export type StateTrajectoryHistory = StateTrajectoryPoint[];
