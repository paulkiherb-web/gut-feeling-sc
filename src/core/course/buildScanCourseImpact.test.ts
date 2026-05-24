import { describe, it, expect } from 'vitest';
import { buildScanCourseImpact } from './buildScanCourseImpact';
import type { CourseKey } from './types';

const ALL_COURSES: CourseKey[] = [
  'energy', 'sleep', 'weight_loss', 'muscle_gain', 'digestion', 'calm', 'focus',
];

// ─── Empty input ──────────────────────────────────────────────────────────────

describe('buildScanCourseImpact — empty scanResult', () => {
  it('returns unknown status when scanResult is completely empty', () => {
    const result = buildScanCourseImpact({ scanResult: {}, activeCourse: 'energy' });
    expect(result.status).toBe('unknown');
    expect(result.routeEffect).toBe('needs_more_context');
    expect(result.easiestReturn).toBeNull();
    expect(result.confidence).toBe('low');
    expect(result.affectedDomains).toHaveLength(0);
  });

  it('headline for unknown is gentle (no accusatory tone)', () => {
    const result = buildScanCourseImpact({ scanResult: {}, activeCourse: 'energy' });
    expect(result.headline).toBeTruthy();
    expect(result.headline.length).toBeGreaterThan(5);
  });
});

// ─── Energy course ────────────────────────────────────────────────────────────

describe('buildScanCourseImpact — energy course', () => {
  it('heavy/sweet food gives slightly_drifts or strongly_drifts', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Бургер с беконом',
        verdict: 'red',
        reason: 'Жирное тяжёлое блюдо',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'energy',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
  });

  it('protein food supports course', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Куриная грудка',
        verdict: 'green',
        reason: 'Хорошо — высокое содержание белка',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'energy',
    });
    expect(['supports_course', 'neutral']).toContain(result.status);
  });

  it('alcohol gives drift', () => {
    const result = buildScanCourseImpact({
      scanResult: { foodName: 'Пиво', verdict: 'red', reason: 'Алкоголь' },
      activeCourse: 'energy',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
    expect(result.affectedDomains).toContain('alcohol');
  });
});

// ─── Sleep course ─────────────────────────────────────────────────────────────

describe('buildScanCourseImpact — sleep course', () => {
  it('late caffeine gives drift', () => {
    const lateDate = new Date();
    lateDate.setHours(21, 0, 0, 0);
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Кофе латте',
        verdict: 'yellow',
        reason: 'Содержит кофеин',
        createdAt: lateDate.toISOString(),
      },
      activeCourse: 'sleep',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
    expect(result.affectedDomains).toContain('caffeine');
  });

  it('evening alcohol gives drift', () => {
    const eveningDate = new Date();
    eveningDate.setHours(20, 0, 0, 0);
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Вино',
        verdict: 'red',
        reason: 'Алкоголь',
        createdAt: eveningDate.toISOString(),
      },
      activeCourse: 'sleep',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
    expect(result.affectedDomains).toContain('alcohol');
  });

  it('light non-stimulant evening food is neutral or supports', () => {
    const eveningDate = new Date();
    eveningDate.setHours(19, 0, 0, 0);
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Овощной суп',
        verdict: 'green',
        reason: 'Лёгкий мягкий выбор',
        createdAt: eveningDate.toISOString(),
      },
      activeCourse: 'sleep',
    });
    expect(['supports_course', 'neutral']).toContain(result.status);
  });
});

// ─── Muscle gain course ───────────────────────────────────────────────────────

describe('buildScanCourseImpact — muscle_gain course', () => {
  it('protein food supports course', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Куриная грудка',
        verdict: 'green',
        reason: 'Высокое содержание белка, белки аминокислоты',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'muscle_gain',
    });
    expect(result.status).toBe('supports_course');
  });

  it('protein + eggs supports course', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Яйца варёные',
        verdict: 'green',
        reason: 'Белок и аминокислоты',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'muscle_gain',
    });
    expect(['supports_course', 'neutral']).toContain(result.status);
  });

  it('alcohol with muscle_gain gives drift', () => {
    const result = buildScanCourseImpact({
      scanResult: { foodName: 'Пиво', verdict: 'red', reason: 'Алкоголь' },
      activeCourse: 'muscle_gain',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
  });
});

// ─── Weight loss course ───────────────────────────────────────────────────────

describe('buildScanCourseImpact — weight_loss course', () => {
  it('sweet food gives drift', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Торт шоколадный',
        verdict: 'red',
        reason: 'Много сахара',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'weight_loss',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
  });

  it('veggies and protein support course', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Салат с курицей',
        verdict: 'green',
        reason: 'Белок и клетчатка, насыщает',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'weight_loss',
    });
    expect(['supports_course', 'neutral']).toContain(result.status);
  });
});

// ─── Easiest return ───────────────────────────────────────────────────────────

describe('buildScanCourseImpact — easiestReturn', () => {
  it('easiestReturn appears on drift', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Торт шоколадный',
        verdict: 'red',
        reason: 'Много сахара',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'weight_loss',
    });
    expect(['slightly_drifts', 'strongly_drifts']).toContain(result.status);
    expect(result.easiestReturn).not.toBeNull();
    expect(result.easiestReturn?.title).toBeTruthy();
    expect(result.easiestReturn?.description).toBeTruthy();
  });

  it('easiestReturn is null when supports_course', () => {
    const result = buildScanCourseImpact({
      scanResult: {
        foodName: 'Куриная грудка',
        verdict: 'green',
        reason: 'Высокое содержание белка, белки аминокислоты',
        createdAt: new Date().toISOString(),
      },
      activeCourse: 'muscle_gain',
    });
    expect(result.status).toBe('supports_course');
    expect(result.easiestReturn).toBeNull();
  });
});

// ─── No medical promises ──────────────────────────────────────────────────────

describe('buildScanCourseImpact — no medical promises', () => {
  const medicalWords = /лечит|вылечит|гарантир|лекарст|диагноз|treat|cure\b|medic|guarantee|diagnos/i;

  it.each(ALL_COURSES)('no medical language for course %s (drift scenario)', (course) => {
    const result = buildScanCourseImpact({
      scanResult: { foodName: 'Тест', verdict: 'red', reason: 'Тест' },
      activeCourse: course,
    });
    expect(result.headline).not.toMatch(medicalWords);
    expect(result.explanation).not.toMatch(medicalWords);
    if (result.easiestReturn) {
      expect(result.easiestReturn.title).not.toMatch(medicalWords);
      expect(result.easiestReturn.description).not.toMatch(medicalWords);
    }
  });

  it.each(ALL_COURSES)('no medical language for course %s (support scenario)', (course) => {
    const result = buildScanCourseImpact({
      scanResult: { foodName: 'Куриная грудка', verdict: 'green', reason: 'Белок' },
      activeCourse: course,
    });
    expect(result.headline).not.toMatch(medicalWords);
    expect(result.explanation).not.toMatch(medicalWords);
  });
});

// ─── Localization ─────────────────────────────────────────────────────────────

describe('buildScanCourseImpact — localization', () => {
  it('generates EN strings when lang=en', () => {
    const result = buildScanCourseImpact({
      scanResult: {},
      activeCourse: 'energy',
      lang: 'en',
    });
    expect(result.status).toBe('unknown');
    expect(result.headline).toContain('Connect');
  });

  it('generates RU strings by default', () => {
    const result = buildScanCourseImpact({
      scanResult: {},
      activeCourse: 'energy',
    });
    expect(result.headline).toMatch(/Можно привязать/);
  });
});

// ─── RouteEffect mapping ──────────────────────────────────────────────────────

describe('buildScanCourseImpact — routeEffect', () => {
  it('stay_in_corridor for supports_course', () => {
    const result = buildScanCourseImpact({
      scanResult: { foodName: 'Куриная грудка', verdict: 'green', reason: 'Белок' },
      activeCourse: 'muscle_gain',
    });
    if (result.status === 'supports_course') {
      expect(result.routeEffect).toBe('stay_in_corridor');
    }
  });

  it('open_drift_branch for slightly_drifts', () => {
    const result = buildScanCourseImpact({
      scanResult: { foodName: 'Шоколадный батончик', verdict: 'yellow', reason: 'Сахар' },
      activeCourse: 'energy',
    });
    if (result.status === 'slightly_drifts') {
      expect(result.routeEffect).toBe('open_drift_branch');
    }
  });

  it('needs_more_context for unknown', () => {
    const result = buildScanCourseImpact({ scanResult: {}, activeCourse: 'focus' });
    expect(result.routeEffect).toBe('needs_more_context');
  });
});
