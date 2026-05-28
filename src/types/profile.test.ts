import { describe, expect, it } from 'vitest';
import { GOALS, normalizeGoal } from './profile';

describe('profile goals', () => {
  it('exposes the 9 supported user goals in the expected order', () => {
    expect(GOALS.map((goal) => goal.value)).toEqual([
      'weight_loss',
      'longevity',
      'sleep',
      'focus',
      'muscle_gain',
      'energy',
      'libido',
      'cardio',
      'calm',
    ]);
  });

  it('maps legacy recovery goal to calm', () => {
    expect(normalizeGoal('recovery')).toBe('calm');
  });
});
