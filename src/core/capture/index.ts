export { buildScanImpact, toImpactHints } from './scanner/buildScanImpact';
export type { ScanImpact } from './scanner/buildScanImpact';

export { buildMealContext } from './meals/buildMealContext';
export type { MealContext } from './meals/buildMealContext';

export { SUPPLEMENT_REGISTRY, findSupplement } from './supplements/supplementRegistry';
export type { SupplementProfile } from './supplements/supplementRegistry';
export { buildSupplementIntervention } from './supplements/buildSupplementIntervention';
export type { SupplementIntervention } from './supplements/buildSupplementIntervention';

export { HABIT_REGISTRY, findHabit } from './habits/habitRegistry';
export type { HabitProfile } from './habits/habitRegistry';
export { buildHabitSignal } from './habits/buildHabitSignal';
export type { HabitSignal } from './habits/buildHabitSignal';

export { buildSleepImpact } from './sleep/buildSleepImpact';
export type { SleepImpact } from './sleep/buildSleepImpact';

export { buildRecoveryImpact } from './recovery/buildRecoveryImpact';
export type { RecoveryImpact } from './recovery/buildRecoveryImpact';

export { buildHydrationImpact } from './hydration/buildHydrationImpact';
export type { HydrationImpact } from './hydration/buildHydrationImpact';

export { buildEventContext } from './buildEventContext';
export type { EventContext } from './buildEventContext';

export { buildBehavioralFingerprint } from './buildBehavioralFingerprint';
export type { BehavioralFingerprint, BehavioralPattern } from './buildBehavioralFingerprint';

export { capturePipeline } from './capturePipeline';
export type {
  ScanCaptureInput, MealCaptureInput, HydrationCaptureInput,
  SupplementCaptureInput, HabitCaptureInput, SleepCaptureInput, RecoveryCaptureInput,
} from './capturePipeline';
