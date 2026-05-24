import type { DomainEvent } from '../store/types/events';
import type { StateSnapshot, UserState, GoalState } from '../store/types/state';
import type { CourseKey, RealPath } from './types';

interface BuildRealPathInput {
  events: DomainEvent[];
  course: CourseKey;
  profile?: UserState;
  goals?: GoalState;
  stateSnapshot?: StateSnapshot | null;
}

const HOURS_TODAY = 24;

function withinHoursAgo(iso: string | undefined, hours: number, now: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return now - t <= hours * 60 * 60 * 1000;
}

function hourOf(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Date(t).getHours();
}

export function buildRealPath({
  events,
  course,
  stateSnapshot,
}: BuildRealPathInput): RealPath {
  const completedAnchors = new Set<string>();
  const missedAnchors: string[] = [];
  const riskySignals = new Set<string>();
  const supportiveSignals = new Set<string>();
  const inferredSignals = new Set<string>();

  if (!events || events.length === 0) {
    return {
      completedAnchors: [],
      missedAnchors: [],
      riskySignals: [],
      supportiveSignals: [],
      inferredSignals: [],
    };
  }

  const now = Date.now();
  const recent = events.filter((e) => withinHoursAgo(e.createdAt, HOURS_TODAY, now));

  for (const e of recent) {
    const hour = hourOf(e.createdAt);

    switch (e.type) {
      case 'meal.logged': {
        const payload = e.payload as { protein?: number; verdict?: string; kcal?: number };
        supportiveSignals.add('food:meal_logged');
        if ((payload.protein ?? 0) >= 20) {
          supportiveSignals.add('food:protein_ok');
          if (course === 'muscle_gain' || course === 'weight_loss' || course === 'energy') {
            completedAnchors.add(`${courseShort(course)}.morning.protein`);
            completedAnchors.add(`${courseShort(course)}.day.proteinLunch`);
          }
        }
        if (payload.verdict === 'red') {
          riskySignals.add('food:red_choice');
        }
        if (hour !== null && hour >= 22) {
          riskySignals.add('food:late_eating');
        }
        break;
      }
      case 'hydration.logged': {
        const payload = e.payload as { beverage?: string; ml?: number };
        if (payload.beverage === 'coffee') {
          if (hour !== null && hour >= 16) {
            riskySignals.add('caffeine:late');
          } else {
            supportiveSignals.add('caffeine:reasonable_timing');
          }
        } else if (payload.beverage === 'water' || !payload.beverage) {
          supportiveSignals.add('hydration:water');
        }
        break;
      }
      case 'sleep.recorded': {
        const payload = e.payload as { hours?: number; durationHours?: number; quality?: number };
        const hours = payload.durationHours ?? payload.hours ?? 0;
        if (hours >= 7) supportiveSignals.add('sleep:enough');
        if (hours > 0 && hours < 6) riskySignals.add('sleep:short');
        if ((payload.quality ?? 0) >= 6) supportiveSignals.add('sleep:quality_ok');
        break;
      }
      case 'habit.completed': {
        const payload = e.payload as { name?: string };
        const name = (payload.name ?? '').toLowerCase();
        if (/walk|move|gym|train|workout|run/.test(name)) {
          supportiveSignals.add('movement:logged');
        }
        if (/alcohol|drink/.test(name)) {
          riskySignals.add('alcohol:logged');
        }
        break;
      }
      case 'recovery.recorded': {
        supportiveSignals.add('recovery:logged');
        break;
      }
      case 'scan.completed': {
        const payload = e.payload as { verdict?: string };
        if (payload.verdict === 'red') riskySignals.add('food:red_scan');
        if (payload.verdict === 'green') supportiveSignals.add('food:green_scan');
        break;
      }
      // Sprint 3: scan-course correction actions improve the real path
      case 'scan.course.smoothed':
      case 'scan.course.replaced': {
        supportiveSignals.add('food:course_correction');
        break;
      }
      default:
        break;
    }
  }

  // Inferred signals from stateSnapshot
  if (stateSnapshot) {
    const scores = stateSnapshot.scores;
    if (scores) {
      if (typeof scores.energy === 'number' && scores.energy < 40) inferredSignals.add('energy:low');
      if (typeof scores.sleep === 'number' && scores.sleep < 40) inferredSignals.add('sleep:low');
      if (typeof scores.recovery === 'number' && scores.recovery < 40) inferredSignals.add('recovery:low');
      if (typeof scores.nutrition === 'number' && scores.nutrition < 40) inferredSignals.add('nutrition:low');
    }
  }

  return {
    completedAnchors: Array.from(completedAnchors),
    missedAnchors,
    riskySignals: Array.from(riskySignals),
    supportiveSignals: Array.from(supportiveSignals),
    inferredSignals: Array.from(inferredSignals),
  };
}

function courseShort(course: CourseKey): string {
  switch (course) {
    case 'weight_loss':
      return 'wl';
    case 'muscle_gain':
      return 'mg';
    case 'digestion':
      return 'dig';
    default:
      return course;
  }
}
