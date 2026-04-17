export type Gender = 'male' | 'female' | 'other';
export type Condition = 'healthy' | 'pregnancy' | 'post_surgery' | 'chronic' | 'athlete';
export type Goal = 'weight_loss' | 'energy' | 'recovery' | 'sleep';
export type Verdict = 'green' | 'yellow' | 'red';

export type Diet = 'none' | 'keto' | 'low_carb' | 'intermittent_fasting' | 'lactose_free' | 'gluten_free' | 'vegan' | 'vegetarian' | 'paleo' | 'mediterranean';

export interface UserProfile {
  age: number;
  gender: Gender;
  condition: Condition;
  customCondition?: string; // free-text up to 3 words, used when user types their own
  goal: Goal;
  surgeryDays?: number;
  isPremium: boolean;
  dailyScansUsed: number;
  heightCm?: number;
  weightKg?: number;
  location?: string;
  diets: Diet[];
  displayName?: string;
}

export interface ScanResult {
  id: string;
  foodName: string;
  verdict: Verdict;
  reason: string;
  suggestion?: string;
  imageUrl?: string;
  createdAt: string;
  isPublic?: boolean;
}

export const CONDITIONS: { value: Condition; label: string; icon: string; description: string }[] = [
  { value: 'healthy', label: 'Healthy', icon: '💚', description: 'No specific conditions' },
  { value: 'pregnancy', label: 'Pregnancy', icon: '🤰', description: 'Expecting a baby' },
  { value: 'post_surgery', label: 'Post-Surgery', icon: '🏥', description: 'Recovery mode' },
  { value: 'chronic', label: 'Chronic Issues', icon: '⚕️', description: 'Ongoing conditions' },
  { value: 'athlete', label: 'Athlete', icon: '🏋️', description: 'Peak performance' },
];

export const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
  { value: 'energy', label: 'Max Energy', icon: '⚡' },
  { value: 'recovery', label: 'Recovery', icon: '🩹' },
  { value: 'sleep', label: 'Better Sleep', icon: '😴' },
];

export const DIETS: { value: Diet; label: string; icon: string }[] = [
  { value: 'none', label: 'No Diet', icon: '🍽️' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
  { value: 'low_carb', label: 'Low Carb', icon: '🥩' },
  { value: 'intermittent_fasting', label: 'Fasting', icon: '⏰' },
  { value: 'lactose_free', label: 'Lactose Free', icon: '🥛' },
  { value: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'paleo', label: 'Paleo', icon: '🦴' },
  { value: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
];

export const SITUATION_TAGS = [
  { label: 'Завтрак', icon: '🌅' },
  { label: 'Обед', icon: '☀️' },
  { label: 'Ужин', icon: '🌙' },
  { label: 'Перекус', icon: '🍿' },
  { label: 'Перед тренировкой', icon: '💪' },
  { label: 'После тренировки', icon: '🏃' },
  { label: 'На ночь', icon: '😴' },
  { label: 'С утра натощак', icon: '🌿' },
  { label: 'В поездке', icon: '✈️' },
  { label: 'Для ребёнка', icon: '👶' },
];
