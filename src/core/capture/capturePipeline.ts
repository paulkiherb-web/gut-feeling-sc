import { useAppStore } from '../store/appStore';
import type { DomainEvent, ScanVerdict } from '../store/types/events';
import { newEvent } from '../store/types/events';
import { eventDispatcher } from '../services/events/eventDispatcher';
import { buildScanImpact, toImpactHints } from './scanner/buildScanImpact';
import { buildMealContext } from './meals/buildMealContext';
import { buildSupplementIntervention } from './supplements/buildSupplementIntervention';
import { buildHabitSignal } from './habits/buildHabitSignal';
import { buildSleepImpact } from './sleep/buildSleepImpact';
import { buildRecoveryImpact } from './recovery/buildRecoveryImpact';
import { buildHydrationImpact } from './hydration/buildHydrationImpact';

export interface ScanCaptureInput {
  verdict: ScanVerdict;
  productName?: string;
  calories?: number;
  macros?: { protein?: number; carbs?: number; fat?: number };
  imageUrl?: string;
  details?: string;
}

export interface MealCaptureInput {
  name?: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

export interface HydrationCaptureInput {
  ml: number;
  source?: string;
}

export interface SupplementCaptureInput {
  name: string;
  doseMg?: number;
  notes?: string;
}

export interface HabitCaptureInput {
  name: string;
  duration?: number;
  notes?: string;
}

export interface SleepCaptureInput {
  durationHours: number;
  quality: number;
  bedTime?: string;
  wakeTime?: string;
}

export interface RecoveryCaptureInput {
  stressLoad: number;
  soreness: number;
  subjectiveScore?: number;
  notes?: string;
}

const getState = () => useAppStore.getState();

export const capturePipeline = {
  scan: async (input: ScanCaptureInput): Promise<void> => {
    const { goals, stateSnapshot, eventLog } = getState();
    const todayScans = eventLog.filter(e => e.type === 'scan.completed' &&
      new Date(e.createdAt).toDateString() === new Date().toDateString());
    const impact = buildScanImpact(input.verdict, goals, stateSnapshot, todayScans.length);
    const impactHints = toImpactHints(impact);

    const event = newEvent('scan.completed', {
      verdict: input.verdict,
      productName: input.productName,
      calories: input.calories,
      macros: input.macros,
      imageUrl: input.imageUrl,
      details: input.details,
      impactHints,
      stateLabel: impact.stateLabel,
      contextualRecommendations: impact.contextualRecommendations,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },

  meal: async (input: MealCaptureInput): Promise<void> => {
    const { goals, stateSnapshot, eventLog } = getState();
    const context = buildMealContext(eventLog, goals, stateSnapshot);
    const event = newEvent('meal.logged', {
      name: input.name, kcal: input.kcal,
      protein: input.protein, carbs: input.carbs, fat: input.fat,
      notes: input.notes, mealContext: context,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },

  hydration: async (input: HydrationCaptureInput): Promise<void> => {
    const { goals, stateSnapshot, eventLog } = getState();
    const impact = buildHydrationImpact(input.ml, eventLog, goals, stateSnapshot);
    const event = newEvent('hydration.logged', {
      ml: input.ml, source: input.source ?? 'water',
      hydrationImpact: impact,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },

  supplement: async (input: SupplementCaptureInput): Promise<void> => {
    const { goals, stateSnapshot } = getState();
    const intervention = buildSupplementIntervention(input.name, input.doseMg, goals, stateSnapshot);
    const event = newEvent('supplement.taken', {
      name: input.name, doseMg: input.doseMg, notes: input.notes,
      intervention,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },

  habit: async (input: HabitCaptureInput): Promise<void> => {
    const { goals, stateSnapshot, eventLog } = getState();
    const signal = buildHabitSignal(input.name, eventLog, goals, stateSnapshot);
    const event = newEvent('habit.completed', {
      name: input.name, duration: input.duration, notes: input.notes,
      habitSignal: signal,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },

  sleep: async (input: SleepCaptureInput): Promise<void> => {
    const { goals, eventLog } = getState();
    const impact = buildSleepImpact(input.durationHours, input.quality, input.bedTime, eventLog, goals);
    const event = newEvent('sleep.recorded', {
      durationHours: input.durationHours, hours: input.durationHours,
      quality: input.quality, bedTime: input.bedTime, wakeTime: input.wakeTime,
      sleepImpact: impact,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },

  recovery: async (input: RecoveryCaptureInput): Promise<void> => {
    const { goals, stateSnapshot, eventLog } = getState();
    const impact = buildRecoveryImpact(
      input.stressLoad, input.soreness, input.subjectiveScore,
      eventLog, goals, stateSnapshot,
    );
    const event = newEvent('recovery.recorded', {
      stressLoad: input.stressLoad, soreness: input.soreness,
      subjectiveScore: input.subjectiveScore, notes: input.notes,
      recoveryImpact: impact,
    });
    await eventDispatcher.dispatchEvent(event as DomainEvent);
  },
};
