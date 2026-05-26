// Intensive plan: AI-generated 7-day behavioural blueprint with 3 effort levels.
// User picks one; events are materialised from the daily blueprint and used to compute
// the ghost path (what would have happened if user followed plan perfectly).

export type IntensiveEffort = 'gentle' | 'balanced' | 'intense';

export type BlueprintCategory =
  | 'hydration'
  | 'meal'
  | 'movement'
  | 'rest'
  | 'sleep'
  | 'supplement'
  | 'habit';

export interface BlueprintItem {
  id: string;
  time: string; // "HH:MM"
  category: BlueprintCategory;
  title: string;
  description?: string;
  durationMin?: number;
  easyAlt?: string;
  tokenIds?: string[]; // tokens the user is expected to log to confirm
  // expected scorecard nudge if completed (used by computeDualPath)
  expectedImpact?: {
    energy?: number;
    recovery?: number;
    sleep?: number;
    nutrition?: number;
    readiness?: number;
  };
}

export interface DailyBlueprint {
  dayIndex: number; // 1..N
  items: BlueprintItem[];
}

export interface IntensivePlan {
  id: string;
  effort: IntensiveEffort;
  title: string;
  oneLineWhy: string;
  badge: string; // emoji
  tags: string[];
  course: string;
  durationDays: number;
  expectedDelta: {
    energy?: number;
    sleep?: number;
    readiness?: number;
  };
  daily: DailyBlueprint[];
  generatedAt: string;
}

export type CorrectionEffort = 'fast' | 'reliable' | 'full';

export interface Correction {
  id: string;
  triggerEventId?: string;
  effort: CorrectionEffort;
  title: string;
  description?: string;
  scheduledFor?: string; // ISO
  tokenIds?: string[];
  expectedImpact?: BlueprintItem['expectedImpact'];
  status: 'suggested' | 'accepted' | 'dismissed' | 'completed';
  createdAt: string;
}
