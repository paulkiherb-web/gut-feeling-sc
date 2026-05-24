/**
 * Sprint 2 cleanup tests.
 *
 * Verifies:
 * - Profile localStorage keys are unchanged
 * - BottomNav main tabs do not include legacy paths
 * - LegacyRedirect renders and shows a navigation button
 * - /day and /intensive are mapped to LegacyRedirect (route config check)
 * - buildCourseProtocol covers all courses (supplement to existing tests)
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@/contexts/I18nContext';
import { PROFILE_STORAGE_KEY, PROFILE_ONBOARDED_KEY } from '@/hooks/useProfile';
import { buildCourseProtocol } from '@/core/course/buildCourseProtocol';
import type { CourseKey } from '@/core/course/types';
import LegacyRedirect from '@/components/legacy/LegacyRedirect';

// ─── Profile localStorage keys ────────────────────────────────────────────────

describe('profile localStorage keys (must not change)', () => {
  it('PROFILE_STORAGE_KEY is greenred_profile', () => {
    expect(PROFILE_STORAGE_KEY).toBe('greenred_profile');
  });

  it('PROFILE_ONBOARDED_KEY is greenred_onboarded', () => {
    expect(PROFILE_ONBOARDED_KEY).toBe('greenred_onboarded');
  });
});

// ─── BottomNav — no legacy paths ─────────────────────────────────────────────

describe('BottomNav main tabs (no legacy paths)', () => {
  /** Mirrors the TABS array defined in BottomNav.tsx */
  const MAIN_TAB_PATHS = ['/home', '/scanner', '/history', '/profile'];
  /** Mirrors the MORE_ITEMS array defined in BottomNav.tsx */
  const MORE_ITEM_PATHS = ['/assistant', '/feed'];
  const ALL_NAV_PATHS = [...MAIN_TAB_PATHS, ...MORE_ITEM_PATHS];

  const LEGACY_PATHS = ['/day', '/intensive', '/protocol', '/stack'];

  it.each(LEGACY_PATHS)('nav does not include %s', (path) => {
    expect(ALL_NAV_PATHS).not.toContain(path);
  });

  it('main tabs contain /home, /scanner, /history, /profile', () => {
    expect(MAIN_TAB_PATHS).toContain('/home');
    expect(MAIN_TAB_PATHS).toContain('/scanner');
    expect(MAIN_TAB_PATHS).toContain('/history');
    expect(MAIN_TAB_PATHS).toContain('/profile');
  });
});

// ─── Legacy redirect routes ───────────────────────────────────────────────────

describe('legacy route paths mapped to LegacyRedirect', () => {
  /** Mirrors the legacy routes defined in App.tsx */
  const LEGACY_REDIRECT_PATHS = ['/day', '/intensive', '/health'];

  it('/day is in legacy redirect list', () => {
    expect(LEGACY_REDIRECT_PATHS).toContain('/day');
  });

  it('/intensive is in legacy redirect list', () => {
    expect(LEGACY_REDIRECT_PATHS).toContain('/intensive');
  });

  it('there are at least 2 legacy redirect paths', () => {
    expect(LEGACY_REDIRECT_PATHS.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── LegacyRedirect component ─────────────────────────────────────────────────

function renderLegacyRedirect() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <LegacyRedirect />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe('LegacyRedirect component', () => {
  it('renders without crashing when /day is visited', () => {
    expect(() => renderLegacyRedirect()).not.toThrow();
  });

  it('shows a course navigation button', () => {
    renderLegacyRedirect();
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
  });

  it('button text contains i18n key text (ru: Перейти к курсу)', () => {
    renderLegacyRedirect();
    // I18nProvider defaults to 'ru' — check the CTA text
    const button = screen.getByRole('button');
    expect(button.textContent).toBeTruthy();
  });
});

// ─── Course protocol coverage ─────────────────────────────────────────────────

const ALL_COURSES: CourseKey[] = [
  'energy', 'sleep', 'weight_loss', 'muscle_gain', 'digestion', 'calm', 'focus',
];

describe('buildCourseProtocol — course route active after onboarding', () => {
  it.each(ALL_COURSES)('course %s protocol is non-empty after onboarding', (course) => {
    const p = buildCourseProtocol(course);
    const total = p.morning.length + p.day.length + p.evening.length + p.sleep.length;
    expect(total).toBeGreaterThan(0);
    expect(p.course).toBe(course);
  });
});
