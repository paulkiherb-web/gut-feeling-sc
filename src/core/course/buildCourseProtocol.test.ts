import { describe, it, expect } from 'vitest';
import { buildCourseProtocol } from './buildCourseProtocol';
import type { CourseKey } from './types';

const ALL_COURSES: CourseKey[] = [
  'energy', 'sleep', 'weight_loss', 'muscle_gain', 'digestion', 'calm', 'focus',
];

describe('buildCourseProtocol', () => {
  it.each(ALL_COURSES)('returns protocol for course %s', (course) => {
    const proto = buildCourseProtocol(course);
    expect(proto.course).toBe(course);
    expect(proto.morning.length + proto.day.length + proto.evening.length + proto.sleep.length)
      .toBeGreaterThan(0);
  });

  it('each suggestion has text, domain, phase', () => {
    const proto = buildCourseProtocol('energy');
    for (const s of [...proto.morning, ...proto.day, ...proto.evening, ...proto.sleep]) {
      expect(s.text.length).toBeGreaterThan(0);
      expect(['food', 'sleep', 'movement', 'hydration', 'alcohol', 'caffeine', 'recovery']).toContain(s.domain);
      expect(['morning', 'day', 'evening', 'sleep']).toContain(s.phase);
    }
  });

  it('optional suggestions have low effort', () => {
    const proto = buildCourseProtocol('focus');
    const all = [...proto.morning, ...proto.day, ...proto.evening, ...proto.sleep];
    for (const s of all.filter(s => s.optional)) {
      expect(s.effort).toBe('low');
    }
  });

  it('sleep course has supplement hints', () => {
    const proto = buildCourseProtocol('sleep');
    expect(proto.supplementHints.length).toBeGreaterThan(0);
  });

  it('supplementHints contain no medical promises (spot check)', () => {
    for (const course of ALL_COURSES) {
      const proto = buildCourseProtocol(course);
      for (const hint of proto.supplementHints) {
        // Should not contain absolute health guarantees
        expect(hint).not.toMatch(/гарантирует|вылечит|обязательно|100%/i);
      }
    }
  });
});
