// computeTokenDelta — realistic signed readiness delta for a token event.
// Returns the expected change in readiness score (e.g. -12, +8, +4).
// Used exclusively for UI display in timeline / feed.

import type { CourseKey } from '@/core/course/types';

export interface TokenDeltaContext {
  tokenId: string;
  isEvening: boolean;   // hour >= 18
  isLate: boolean;      // hour >= 21
  activeCourse: CourseKey | null;
}

// Base deltas: how much each token shifts readiness
const BASE_DELTA: Record<string, number> = {
  water: 4,
  coffee: 2,
  alcohol: -10,
  smoking: -8,
  stress: -9,
  sleep: 12,
  medicine: 3,
  run: 10,
  walk: 7,
  swim: 10,
  bike: 9,
  ski: 9,
  morning_charge: 10,
  cardio: 10,
  hiit: 9,
  strength: 9,
  yoga: 7,
  stretch: 6,
  meditation: 8,
  rest: 6,
  reading: 5,
  sex: 4,
  desk: -2,
  media: -2,
  physical_work: 3,
};

// Course-specific modifiers: how much the base shifts when on a given course
const COURSE_MOD: Partial<Record<CourseKey, Record<string, number>>> = {
  sleep: {
    alcohol: -5,  // extra penalty on sleep course
    smoking: -3,
    coffee: -3,   // base becomes -1 (2-3)
    sleep: +3,
    meditation: +3,
    reading: +3,
    run: -2,      // intense cardio pre-bed hurts sleep course
    hiit: -3,
  },
  energy: {
    alcohol: -3,
    run: +2,
    water: +2,
    stress: -3,
  },
  calm: {
    stress: -4,
    alcohol: -3,
    meditation: +4,
    yoga: +4,
    hiit: -2,
  },
  focus: {
    coffee: +1,   // coffee is a tool in focus mode
    desk: +2,
    stress: -3,
    alcohol: -3,
    media: -3,
  },
  weight_loss: {
    alcohol: -3,
    run: +2,
    walk: +2,
    hiit: +3,
    strength: +3,
    desk: -3,
    media: -3,
  },
  muscle_gain: {
    strength: +4,
    hiit: +3,
    run: +2,
    protein: +3,
  },
};

// Contextual adjustments for time of day
function contextualModifier(tokenId: string, isEvening: boolean, isLate: boolean): number {
  if (isLate) {
    if (tokenId === 'alcohol') return -4;   // late alcohol is worse
    if (tokenId === 'coffee') return -7;    // late coffee wrecks sleep
    if (tokenId === 'media') return -3;     // screen late is bad
    if (tokenId === 'desk') return -2;
    if (tokenId === 'run' || tokenId === 'hiit') return -3; // intense exercise late
  }
  if (isEvening) {
    if (tokenId === 'alcohol') return -2;
    if (tokenId === 'coffee') return -4;
    if (tokenId === 'media') return -1;
    if (tokenId === 'meditation' || tokenId === 'reading') return +2;
    if (tokenId === 'yoga' || tokenId === 'stretch') return +2;
  }
  return 0;
}

export function computeTokenDelta(ctx: TokenDeltaContext): number {
  const base = BASE_DELTA[ctx.tokenId] ?? 2;
  const courseMod = ctx.activeCourse ? (COURSE_MOD[ctx.activeCourse]?.[ctx.tokenId] ?? 0) : 0;
  const timeMod = contextualModifier(ctx.tokenId, ctx.isEvening, ctx.isLate);
  return Math.round(base + courseMod + timeMod);
}

export function formatDelta(delta: number | null | undefined): string {
  if (delta == null) return '→';
  if (delta === 0) return '→';
  return delta > 0 ? `+${delta}` : `${delta}`;
}
