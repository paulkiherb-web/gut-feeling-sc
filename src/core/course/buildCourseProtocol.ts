/**
 * buildCourseProtocol
 *
 * Returns structured daily suggestions per course.
 * This is an adapter layer: it translates course anchors into
 * human-readable suggestions for morning / day / evening / sleep.
 *
 * Supplements are optional hints, not the focus.
 * No medical promises. Soft tone throughout.
 */

import { buildIdealPath } from './buildIdealPath';
import type { CourseKey, CourseDomain } from './types';

export interface ProtocolSuggestion {
  id: string;
  text: string;
  domain: CourseDomain;
  phase: 'morning' | 'day' | 'evening' | 'sleep';
  optional: boolean;
  effort: 'low' | 'medium' | 'high';
}

export interface CourseProtocol {
  course: CourseKey;
  morning: ProtocolSuggestion[];
  day: ProtocolSuggestion[];
  evening: ProtocolSuggestion[];
  sleep: ProtocolSuggestion[];
  supplementHints: string[];
}

const SUPPLEMENT_HINTS: Partial<Record<CourseKey, string[]>> = {
  energy: [
    'Если пьёшь магний — лучше вечером.',
    'Омега-3 усваивается с жирной едой, не натощак.',
  ],
  sleep: [
    'Магний глицинат или треонат — мягкий вариант перед сном.',
    'Мелатонин в малой дозе (0.5–1 мг) может помочь при смещённом ритме.',
  ],
  muscle_gain: [
    'Белок из еды важнее любой добавки.',
    'Протеин как добавка — только если реально не добираешь из еды.',
  ],
  digestion: [
    'Пробиотики — можно пробовать, но не как главный инструмент.',
    'Ферменты перед едой — только по показаниям.',
  ],
};

function effort(weight: number, optional: boolean): ProtocolSuggestion['effort'] {
  if (optional) return 'low';
  return weight >= 2 ? 'medium' : 'low';
}

export function buildCourseProtocol(course: CourseKey): CourseProtocol {
  const ideal = buildIdealPath(course);

  const toSuggestion = (anchor: (typeof ideal.bestPath)[number]): ProtocolSuggestion => ({
    id: anchor.id,
    text: `${anchor.title}. ${anchor.description}`,
    domain: anchor.domain,
    phase: anchor.phase,
    optional: anchor.optional,
    effort: effort(anchor.weight, anchor.optional),
  });

  return {
    course,
    morning: ideal.dayParts.morning.map(toSuggestion),
    day: ideal.dayParts.day.map(toSuggestion),
    evening: ideal.dayParts.evening.map(toSuggestion),
    sleep: ideal.dayParts.sleep.map(toSuggestion),
    supplementHints: SUPPLEMENT_HINTS[course] ?? [],
  };
}
