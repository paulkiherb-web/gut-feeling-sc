import { describe, it, expect } from 'vitest';
import { buildIdealPath } from './buildIdealPath';
import type { CourseKey } from './types';

const ALL_COURSES: CourseKey[] = [
  'energy',
  'sleep',
  'weight_loss',
  'muscle_gain',
  'digestion',
  'calm',
  'focus',
];

describe('buildIdealPath', () => {
  it.each(ALL_COURSES)('builds a path for course %s', (course) => {
    const path = buildIdealPath(course);
    expect(path.course).toBe(course);
    expect(path.dayParts.morning.length + path.dayParts.day.length).toBeGreaterThan(0);
    expect(path.dayParts.evening.length).toBeGreaterThan(0);
    expect(path.dayParts.sleep.length).toBeGreaterThan(0);
    expect(path.bestPath.length).toBeGreaterThanOrEqual(path.normalPath.length);
    expect(path.normalPath.length).toBeGreaterThanOrEqual(path.minimumPath.length);
  });

  it('all anchors have a non-empty title and known domain', () => {
    const path = buildIdealPath('energy');
    for (const a of path.bestPath) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(['food', 'sleep', 'movement', 'hydration', 'alcohol', 'caffeine', 'recovery']).toContain(a.domain);
    }
  });
});
