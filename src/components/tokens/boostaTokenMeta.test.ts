import { describe, expect, it } from 'vitest';
import { isSelectableBoostaToken } from './boostaTokenMeta';

describe('isSelectableBoostaToken', () => {
  it('hides water from token pickers and keeps other tokens available', () => {
    expect(isSelectableBoostaToken('water')).toBe(false);
    expect(isSelectableBoostaToken('coffee')).toBe(true);
  });
});
