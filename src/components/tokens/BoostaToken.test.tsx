import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BoostaToken } from './BoostaToken';
import { BoostaTokenType, boostaTokenMeta } from './boostaTokenMeta';

const ALL_TYPES: BoostaTokenType[] = [
  'run','walk','swim','bike','ski',
  'morning_charge','cardio','hiit','strength','yoga','stretch',
  'water','coffee','alcohol','smoking','medicine',
  'sleep','sex','meditation','rest','reading',
  'desk','physical_work','media','stress',
  'streak_runner','clear','connected','iron_will','zen_master',
];

describe('BoostaToken', () => {
  it('renders all 30 token types without error', () => {
    ALL_TYPES.forEach(type => {
      const { container } = render(<BoostaToken type={type} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  it('renders locked state', () => {
    const { container } = render(<BoostaToken type="streak_runner" locked />);
    expect(container.querySelector('[data-locked]')).toBeTruthy();
  });

  it('rare tokens have correct rarity', () => {
    const rareTypes: BoostaTokenType[] = ['streak_runner','clear','connected','iron_will','zen_master'];
    rareTypes.forEach(type => {
      expect(['gold','crystal','pair','rare','legendary'])
        .toContain(boostaTokenMeta[type].rarity);
    });
  });

  it('all tokens have labelRu and labelEn', () => {
    ALL_TYPES.forEach(type => {
      const meta = boostaTokenMeta[type];
      expect(meta.labelRu).toBeTruthy();
      expect(meta.labelEn).toBeTruthy();
    });
  });
});
