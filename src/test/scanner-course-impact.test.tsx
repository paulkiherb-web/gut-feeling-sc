/**
 * Sprint 3: scanner-course impact integration tests.
 *
 * Tests:
 * - ScanCourseImpactCard renders after scan result when course exists
 * - Fallback appears when no active course
 * - Clicking "Просто учесть" (noted) creates scan.course.noted event
 * - Clicking "Сгладить" (smoothed) creates scan.course.smoothed event + calls rebuildCourse
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScanCourseImpactCard from '@/components/course/ScanCourseImpactCard';
import type { ScanResultInput } from '@/core/course/buildScanCourseImpact';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAppendEvent = vi.fn().mockReturnValue({});
const mockRebuildCourse = vi.fn().mockReturnValue(null);
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    lang: 'ru',
    t: (key: string) => key,
    setLang: vi.fn(),
  }),
}));

vi.mock('@/core/store/appStore', () => ({
  useAppStore: vi.fn(),
}));

// Import after mocks
import { useAppStore } from '@/core/store/appStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMockStore(activeCourse: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state: any = {
    course: activeCourse ? { activeCourse } : null,
    courseGap: null,
    courseRoute: null,
    appendEvent: mockAppendEvent,
    rebuildCourse: mockRebuildCourse,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useAppStore).mockImplementation((selector: (s: any) => any) => selector(state));
}

const SCAN_RESULT: ScanResultInput = {
  id: 'scan-123',
  foodName: 'Бургер с беконом',
  verdict: 'red',
  reason: 'Тяжёлое жирное блюдо',
  createdAt: new Date().toISOString(),
};

function renderCard(result: ScanResultInput | null) {
  return render(
    <MemoryRouter>
      <ScanCourseImpactCard result={result} />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockAppendEvent.mockClear();
  mockRebuildCourse.mockClear();
  mockNavigate.mockClear();
});

describe('ScanCourseImpactCard — with active course', () => {
  beforeEach(() => {
    makeMockStore('energy');
  });

  it('renders course impact section when result + course are present', () => {
    renderCard(SCAN_RESULT);
    expect(screen.getByText('scan.impact.section.title')).toBeDefined();
  });

  it('renders status badge', () => {
    renderCard(SCAN_RESULT);
    // Status key is rendered since t() returns the key
    const statusKeys = [
      'scan.impact.status.supports_course',
      'scan.impact.status.neutral',
      'scan.impact.status.slightly_drifts',
      'scan.impact.status.strongly_drifts',
      'scan.impact.status.unknown',
    ];
    const hasStatus = statusKeys.some((k) => screen.queryByText(k) !== null);
    expect(hasStatus).toBe(true);
  });

  it('renders all 5 action buttons', () => {
    renderCard(SCAN_RESULT);
    expect(screen.getByText('scan.impact.action.accepted')).toBeDefined();
    expect(screen.getByText('scan.impact.action.already_consumed')).toBeDefined();
    expect(screen.getByText('scan.impact.action.smoothed')).toBeDefined();
    expect(screen.getByText('scan.impact.action.replaced')).toBeDefined();
    expect(screen.getByText('scan.impact.action.noted')).toBeDefined();
  });

  it('renders disclaimer', () => {
    renderCard(SCAN_RESULT);
    expect(screen.getByText('scan.impact.disclaimer')).toBeDefined();
  });
});

describe('ScanCourseImpactCard — fallback when no active course', () => {
  beforeEach(() => {
    makeMockStore(null);
  });

  it('shows no-course fallback text', () => {
    renderCard(SCAN_RESULT);
    expect(screen.getByText('scan.impact.no_course.text')).toBeDefined();
  });

  it('shows Choose course CTA button', () => {
    renderCard(SCAN_RESULT);
    expect(screen.getByText('scan.impact.no_course.cta')).toBeDefined();
  });

  it('does NOT render action buttons', () => {
    renderCard(SCAN_RESULT);
    expect(screen.queryByText('scan.impact.action.noted')).toBeNull();
  });

  it('clicking CTA navigates to /course', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.no_course.cta');
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith('/course');
  });
});

describe('ScanCourseImpactCard — null result', () => {
  beforeEach(() => {
    makeMockStore('energy');
  });

  it('renders nothing when result is null', () => {
    const { container } = renderCard(null);
    // No section title — component returns null for null result with active course
    expect(container.firstChild).toBeNull();
  });
});

describe('ScanCourseImpactCard — action: Просто учесть (noted)', () => {
  beforeEach(() => {
    makeMockStore('energy');
  });

  it('clicking "noted" dispatches scan.course.noted event', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.action.noted');
    fireEvent.click(btn);
    expect(mockAppendEvent).toHaveBeenCalledTimes(1);
    const call = mockAppendEvent.mock.calls[0][0];
    expect(call.type).toBe('scan.course.noted');
    expect(call.source).toBe('scanner');
    expect(call.payload.selectedAction).toBe('noted');
    expect(call.payload.activeCourse).toBe('energy');
  });

  it('clicking "noted" does NOT call rebuildCourse', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.action.noted');
    fireEvent.click(btn);
    expect(mockRebuildCourse).not.toHaveBeenCalled();
  });

  it('shows confirmation after action', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.action.noted');
    fireEvent.click(btn);
    expect(screen.getByText('scan.impact.action.done')).toBeDefined();
  });
});

describe('ScanCourseImpactCard — action: Сгладить (smoothed)', () => {
  beforeEach(() => {
    makeMockStore('sleep');
  });

  it('clicking "smoothed" dispatches scan.course.smoothed event', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.action.smoothed');
    fireEvent.click(btn);
    expect(mockAppendEvent).toHaveBeenCalledTimes(1);
    const call = mockAppendEvent.mock.calls[0][0];
    expect(call.type).toBe('scan.course.smoothed');
    expect(call.payload.selectedAction).toBe('smoothed');
  });

  it('clicking "smoothed" calls rebuildCourse', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.action.smoothed');
    fireEvent.click(btn);
    expect(mockRebuildCourse).toHaveBeenCalledTimes(1);
  });
});

describe('ScanCourseImpactCard — action: Заменить (replaced)', () => {
  beforeEach(() => {
    makeMockStore('weight_loss');
  });

  it('clicking "replaced" dispatches scan.course.replaced event + rebuildCourse', () => {
    renderCard(SCAN_RESULT);
    const btn = screen.getByText('scan.impact.action.replaced');
    fireEvent.click(btn);
    expect(mockAppendEvent).toHaveBeenCalledTimes(1);
    expect(mockAppendEvent.mock.calls[0][0].type).toBe('scan.course.replaced');
    expect(mockRebuildCourse).toHaveBeenCalledTimes(1);
  });
});

describe('ScanCourseImpactCard — event payload completeness', () => {
  beforeEach(() => {
    makeMockStore('muscle_gain');
  });

  it('event payload includes scanId, activeCourse, impactStatus, affectedDomains, selectedAction, timestamp', () => {
    renderCard(SCAN_RESULT);
    fireEvent.click(screen.getByText('scan.impact.action.accepted'));
    const payload = mockAppendEvent.mock.calls[0][0].payload;
    expect(payload.scanId).toBe('scan-123');
    expect(payload.activeCourse).toBe('muscle_gain');
    expect(typeof payload.impactStatus).toBe('string');
    expect(Array.isArray(payload.affectedDomains)).toBe(true);
    expect(payload.selectedAction).toBe('accepted');
    expect(typeof payload.timestamp).toBe('string');
  });
});
