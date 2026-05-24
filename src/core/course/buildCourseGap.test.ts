import { describe, it, expect } from 'vitest';
import { buildIdealPath } from './buildIdealPath';
import { buildCourseGap } from './buildCourseGap';
import type { RealPath } from './types';

const EMPTY_REAL: RealPath = {
  completedAnchors: [],
  missedAnchors: [],
  riskySignals: [],
  supportiveSignals: [],
  inferredSignals: [],
};

describe('buildCourseGap', () => {
  const ideal = buildIdealPath('energy');

  it('returns unknown status on empty realPath', () => {
    const gap = buildCourseGap({ course: 'energy', idealPath: ideal, realPath: EMPTY_REAL });
    expect(gap.status).toBe('unknown');
    expect(gap.gapScore).toBe(0);
    expect(gap.confidence).toBe('low');
    expect(gap.easiestReturn).toBeNull();
    expect(gap.estimatedPace.currentDays).toBeGreaterThanOrEqual(gap.estimatedPace.bestDays);
  });

  it('produces slightly_out or far_out with risky signals', () => {
    const gap = buildCourseGap({
      course: 'energy',
      idealPath: ideal,
      realPath: {
        ...EMPTY_REAL,
        riskySignals: ['food:late_eating', 'alcohol:logged', 'caffeine:late'],
      },
    });
    expect(['slightly_out', 'far_out']).toContain(gap.status);
    expect(gap.easiestReturn).not.toBeNull();
  });

  it('estimatedPace.currentDays >= bestDays', () => {
    const gap = buildCourseGap({
      course: 'sleep',
      idealPath: buildIdealPath('sleep'),
      realPath: { ...EMPTY_REAL, riskySignals: ['sleep:short'] },
    });
    expect(gap.estimatedPace.currentDays).toBeGreaterThanOrEqual(gap.estimatedPace.bestDays);
  });

  it('inside corridor when only supportive signals exist', () => {
    const gap = buildCourseGap({
      course: 'energy',
      idealPath: ideal,
      realPath: {
        ...EMPTY_REAL,
        supportiveSignals: ['food:protein_ok', 'hydration:water', 'sleep:enough'],
      },
    });
    expect(['inside_corridor', 'slightly_out']).toContain(gap.status);
  });
});
