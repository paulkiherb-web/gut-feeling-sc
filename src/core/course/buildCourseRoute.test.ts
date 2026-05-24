import { describe, it, expect } from 'vitest';
import { buildIdealPath } from './buildIdealPath';
import { buildCourseGap } from './buildCourseGap';
import { buildCourseRoute } from './buildCourseRoute';
import type { RealPath } from './types';

const EMPTY_REAL: RealPath = {
  completedAnchors: [],
  missedAnchors: [],
  riskySignals: [],
  supportiveSignals: [],
  inferredSignals: [],
};

describe('buildCourseRoute', () => {
  it('contains main nodes for morning/day/evening/sleep', () => {
    const ideal = buildIdealPath('focus');
    const gap = buildCourseGap({ course: 'focus', idealPath: ideal, realPath: EMPTY_REAL });
    const route = buildCourseRoute({ course: 'focus', idealPath: ideal, realPath: EMPTY_REAL, gap });
    const phases = route.nodes.filter((n) => n.type === 'main').map((n) => n.phase);
    expect(phases).toEqual(['morning', 'day', 'evening', 'sleep']);
  });

  it('does not throw with empty real path', () => {
    const ideal = buildIdealPath('calm');
    const gap = buildCourseGap({ course: 'calm', idealPath: ideal, realPath: EMPTY_REAL });
    expect(() =>
      buildCourseRoute({ course: 'calm', idealPath: ideal, realPath: EMPTY_REAL, gap }),
    ).not.toThrow();
  });

  it('adds branch and return nodes when there is drift', () => {
    const ideal = buildIdealPath('digestion');
    const gap = buildCourseGap({
      course: 'digestion',
      idealPath: ideal,
      realPath: { ...EMPTY_REAL, riskySignals: ['food:late_eating', 'alcohol:logged'] },
    });
    const route = buildCourseRoute({
      course: 'digestion',
      idealPath: ideal,
      realPath: { ...EMPTY_REAL, riskySignals: ['food:late_eating', 'alcohol:logged'] },
      gap,
    });
    const branchTypes = route.nodes.map((n) => n.type);
    expect(branchTypes).toContain('branch');
    expect(branchTypes).toContain('return');
  });
});
