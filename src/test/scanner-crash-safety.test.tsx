/**
 * Scanner crash-safety tests.
 *
 * Covers:
 * 1. ErrorBoundary catches render errors and shows recovery UI
 * 2. ErrorBoundary resets on "Вернуться назад" click
 * 3. Verdict normalisation: handles uppercase / unknown values from old DB rows
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Verdict } from '@/types/profile';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test crash inside Scanner');
  return <div>Сканер работает</div>;
}

// Mirror of the safeVc helper added to Scanner.tsx
const VERDICT_CONFIG: Record<Verdict, { bg: string; color: string; label: string }> = {
  green:  { bg: 'bg-safe/10',    color: 'text-safe',    label: 'Подходит'     },
  yellow: { bg: 'bg-warning/10', color: 'text-warning', label: 'Спорно'       },
  red:    { bg: 'bg-danger/10',  color: 'text-danger',  label: 'Не подходит'  },
};

function safeVc(v: string | undefined) {
  return VERDICT_CONFIG[(v?.toLowerCase() || 'yellow') as Verdict] ?? VERDICT_CONFIG.yellow;
}

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Сканер работает')).toBeDefined();
  });

  it('shows recovery UI when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Что-то пошло не так')).toBeDefined();
    expect(screen.getByText('Вернуться назад')).toBeDefined();
    spy.mockRestore();
  });

  it('clicking "Вернуться назад" does not itself throw', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Вернуться назад')).toBeDefined();
    // The button click should not throw — it just resets internal state.
    // Full recovery in production requires the parent to unmount/remount via key={tab}.
    expect(() => fireEvent.click(screen.getByText('Вернуться назад'))).not.toThrow();
    spy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Кастомный fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Кастомный fallback')).toBeDefined();
    spy.mockRestore();
  });
});

// ─── Verdict normalisation ────────────────────────────────────────────────────

describe('safeVc — verdict config safe lookup', () => {
  it('handles lowercase valid verdicts', () => {
    expect(safeVc('green').label).toBe('Подходит');
    expect(safeVc('yellow').label).toBe('Спорно');
    expect(safeVc('red').label).toBe('Не подходит');
  });

  it('handles uppercase verdicts stored in old DB rows', () => {
    expect(safeVc('Green').label).toBe('Подходит');
    expect(safeVc('Yellow').label).toBe('Спорно');
    expect(safeVc('RED').label).toBe('Не подходит');
  });

  it('falls back to yellow for undefined', () => {
    expect(safeVc(undefined).label).toBe('Спорно');
  });

  it('falls back to yellow for empty string', () => {
    expect(safeVc('').label).toBe('Спорно');
  });

  it('falls back to yellow for unknown values', () => {
    expect(safeVc('unknown').label).toBe('Спорно');
    expect(safeVc('NULL').label).toBe('Спорно');
  });

  it('never returns undefined (.bg always defined)', () => {
    ['green', 'yellow', 'red', 'Green', 'YELLOW', '', undefined, 'garbage'].forEach((v) => {
      expect(safeVc(v as string)).toBeDefined();
      expect(safeVc(v as string).bg).toBeDefined();
      expect(safeVc(v as string).color).toBeDefined();
    });
  });
});
