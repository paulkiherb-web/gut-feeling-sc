import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MirrorDualSelf from './MirrorDualSelf';

describe('MirrorDualSelf', () => {
  it('renders', () => {
    const { container } = render(<MirrorDualSelf />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows "Ты сейчас"', () => {
    const { getByText } = render(<MirrorDualSelf />);
    expect(getByText('Ты сейчас')).toBeTruthy();
  });

  it('shows "Лучший сценарий"', () => {
    const { getByText } = render(<MirrorDualSelf />);
    expect(getByText('Лучший сценарий')).toBeTruthy();
  });

  it('shows "Разрыв"', () => {
    const { getByText } = render(<MirrorDualSelf />);
    expect(getByText('Разрыв')).toBeTruthy();
  });

  it('does not contain "идеальный ты"', () => {
    const { container } = render(<MirrorDualSelf />);
    expect(container.textContent?.toLowerCase()).not.toContain('идеальный ты');
  });

  it('does not contain "призрак"', () => {
    const { container } = render(<MirrorDualSelf />);
    expect(container.textContent?.toLowerCase()).not.toContain('призрак');
  });
});
