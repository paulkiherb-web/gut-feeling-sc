export type Gender = 'male' | 'female' | 'other';
export type Condition = 'healthy' | 'pregnancy' | 'post_surgery' | 'chronic' | 'athlete';
export type Goal = 'weight_loss' | 'energy' | 'recovery' | 'sleep';
export type Verdict = 'green' | 'yellow' | 'red';

export interface UserProfile {
  age: number;
  gender: Gender;
  condition: Condition;
  goal: Goal;
  surgeryDays?: number;
  isPremium: boolean;
  dailyScansUsed: number;
}

export interface ScanResult {
  id: string;
  foodName: string;
  verdict: Verdict;
  reason: string;
  suggestion?: string;
  imageUrl?: string;
  createdAt: string;
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
