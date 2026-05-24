export type TimelineItemType =
  | 'state-change'
  | 'intervention'
  | 'recovery-window'
  | 'overload-window'
  | 'high-risk-window'
  | 'positive-shift'
  | 'instability-cluster';

export interface TimelineWindow {
  startAt: string;
  endAt: string;
  durationHours: number;
}

/** Lightweight proxy snapshot inferred purely from events */
export interface DayProxy {
  day: string;
  /** 0–100, estimated from sleep + hydration + habits */
  readinessProxy: number;
  /** 0–100, estimated from nutrition + hydration */
  energyProxy: number;
  /** 0–100, based on logged ml vs soft threshold */
  hydrationProxy: number;
  /** 0–1, from sleep.recorded event */
  sleepQuality: number;
  sleepHours: number;
  redMealCount: number;
  greenMealCount: number;
  supplementCount: number;
  habitCount: number;
  totalHydrationMl: number;
  hadLateCaffeine: boolean;
  hadNightEating: boolean;
  hadRecoveryIntervention: boolean;
}

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  at: string;
  window?: TimelineWindow;
  label: string;
  description?: string;
  before?: DayProxy;
  after?: DayProxy;
  eventIds: string[];
  significance: number; // 0–1
}

export interface NormalizedTimeline {
  items: TimelineItem[];
  dailyProxies: DayProxy[];
  generatedAt: string;
  spanDays: number;
  activeDays: number;
  eventCount: number;
}
