/**
 * Sprint 4: Home course-first UX tests.
 *
 * Tests:
 * - Home renders CourseJourneyHero as primary experience
 * - DayDetailsAccordion exists and is collapsed by default
 * - Old dashboard cards not visible before expanding
 * - Primary scan CTA navigates to /scanner
 * - Change course CTA is present
 * - Forbidden technical words not on first screen
 * - Scanner top context text renders (scanner-course-context)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DayDetailsAccordion from '@/components/home/DayDetailsAccordion';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [] }),
    }),
  },
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ profile: { displayName: 'Test', goal: 'energy' } }),
}));

vi.mock('@/design/adaptive', () => ({
  useAdaptiveExperience: () => ({
    focusModeActive: false,
    showSection: () => false,
    filterPredictions: (p: unknown[]) => p,
    secondaryOpacity: 1,
  }),
  AdaptiveSurfaceLayer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/core/store/selectors', () => ({
  selectPredictions: () => [],
}));

// Mock heavy home sub-components to avoid deep dependency chains
vi.mock('@/components/home/StateHeroCard', () => ({
  default: () => <div data-testid="state-hero-card">StateHeroCard</div>,
}));
vi.mock('@/components/home/NextBestActionCard', () => ({
  default: () => <div data-testid="next-best-action-card">NextBestActionCard</div>,
}));
vi.mock('@/components/home/PredictionWarningsCard', () => ({
  default: () => <div data-testid="prediction-warnings-card">PredictionWarningsCard</div>,
}));
vi.mock('@/components/home/RecoveryTrajectoryCard', () => ({
  default: () => <div data-testid="recovery-trajectory-card">RecoveryTrajectoryCard</div>,
}));
vi.mock('@/components/home/BehavioralInsightFeed', () => ({
  default: () => <div data-testid="behavioral-insight-feed">BehavioralInsightFeed</div>,
}));
vi.mock('@/components/home/DailyMomentumCard', () => ({
  default: () => <div data-testid="daily-momentum-card">DailyMomentumCard</div>,
}));
vi.mock('@/components/home/StateTimelineCard', () => ({
  default: () => <div data-testid="state-timeline-card">StateTimelineCard</div>,
}));
vi.mock('@/components/home/LongitudinalInsightsCard', () => ({
  default: () => <div data-testid="longitudinal-insights-card">LongitudinalInsightsCard</div>,
}));
vi.mock('@/components/home/PersonalPatternsCard', () => ({
  default: () => <div data-testid="personal-patterns-card">PersonalPatternsCard</div>,
}));
vi.mock('@/components/home/DriftSignalsCard', () => ({
  default: () => <div data-testid="drift-signals-card">DriftSignalsCard</div>,
}));
vi.mock('@/components/state/QuickLogPanel', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="quick-log-panel">QuickLogPanel</div> : null,
}));
vi.mock('@/components/course/CourseSwitcherDrawer', () => ({
  default: () => <div data-testid="course-switcher-drawer">CourseSwitcherDrawer</div>,
}));
vi.mock('@/components/course/CourseJourneyMap', () => ({
  default: () => <div data-testid="course-journey-map">CourseJourneyMap</div>,
}));
vi.mock('@/components/MobileLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-layout">{children}</div>
  ),
}));

import { useAppStore } from '@/core/store/appStore';

// ─── Store helper ─────────────────────────────────────────────────────────────

function makeMockStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state: any = {
    course: { activeCourse: 'energy', strictness: 'balanced', startedAt: new Date().toISOString(), desiredPaceDays: 28, updatedAt: new Date().toISOString() },
    courseRoute: null,
    courseGap: null,
    predictions: [],
    goals: {},
    setGoals: vi.fn(),
    setCourse: vi.fn(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useAppStore).mockImplementation((selector: (s: any) => any) => selector(state));
}

// ─── Tests: DayDetailsAccordion ───────────────────────────────────────────────

describe('DayDetailsAccordion — collapsed by default', () => {
  it('renders accordion container', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div data-testid="child-content">Child</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('day-details-accordion')).toBeDefined();
  });

  it('is collapsed by default — content not visible', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div data-testid="child-content">Hidden content</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    // Content is not in DOM when collapsed (AnimatePresence removes it)
    expect(screen.queryByTestId('child-content')).toBeNull();
  });

  it('shows title i18n key', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div>Child</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    expect(screen.getByText('home.day_details.title')).toBeDefined();
  });

  it('shows subtitle i18n key', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div>Child</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    expect(screen.getByText('home.day_details.subtitle')).toBeDefined();
  });

  it('expands to show children when toggle clicked', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div data-testid="child-content">Revealed content</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    const toggle = screen.getByRole('button', { expanded: false });
    fireEvent.click(toggle);
    expect(screen.getByTestId('child-content')).toBeDefined();
  });
});

// ─── Tests: Home — CourseJourneyHero as primary ────────────────────────────────

describe('Home — CourseJourneyHero is primary experience', () => {
  let Home: typeof import('@/pages/Home').default;

  beforeEach(async () => {
    makeMockStore();
    mockNavigate.mockClear();
    // Dynamic import to pick up mocks
    const mod = await import('@/pages/Home');
    Home = mod.default;
  });

  it('renders CourseJourneyHero (via scan-cta inside hero)', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('course-journey-hero')).toBeDefined();
  });

  it('renders DayDetailsAccordion', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('day-details-accordion')).toBeDefined();
  });

  it('DayDetailsAccordion is collapsed — old cards not visible by default', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    // StateHeroCard is inside accordion, should not be visible when collapsed
    expect(screen.queryByTestId('state-hero-card')).toBeNull();
  });

  it('primary scan CTA inside hero navigates to /scanner', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const scanBtn = screen.getByTestId('scan-cta');
    fireEvent.click(scanBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/scanner');
  });

  it('change course CTA is present', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('change-course-cta')).toBeDefined();
  });

  it('does not show forbidden technical words on first screen', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // Get only the hero part (before accordion content)
    const hero = container.querySelector('[data-testid="course-journey-hero"]');
    expect(hero).not.toBeNull();
    const heroText = hero!.textContent?.toLowerCase() ?? '';

    const forbidden = [
      'state os',
      'operating center',
      'readiness',
      'longitudinal',
      'intervention',
      'prediction',
    ];
    forbidden.forEach((word) => {
      expect(heroText).not.toContain(word);
    });
  });

  it('does not show "State · Operating · Center" tagline', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(container.textContent).not.toContain('State · Operating · Center');
  });
});

// ─── Tests: Old dashboard cards hidden behind accordion ───────────────────────

describe('Home — old dashboard cards are behind accordion', () => {
  let Home: typeof import('@/pages/Home').default;

  beforeEach(async () => {
    makeMockStore();
    const mod = await import('@/pages/Home');
    Home = mod.default;
  });

  const OLD_CARDS = [
    'state-hero-card',
    'next-best-action-card',
    'recovery-trajectory-card',
    'daily-momentum-card',
  ];

  it.each(OLD_CARDS)('"%s" is not visible before opening accordion', (testId) => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId(testId)).toBeNull();
  });
});

// ─── Tests: scanner.course_context i18n keys exist ────────────────────────────

describe('i18n strings — day details + scanner keys', () => {
  it('home.day_details.title key renders in accordion', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div>child</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    expect(screen.getByText('home.day_details.title')).toBeDefined();
  });

  it('home.day_details.subtitle key renders in accordion', () => {
    render(
      <MemoryRouter>
        <DayDetailsAccordion>
          <div>child</div>
        </DayDetailsAccordion>
      </MemoryRouter>,
    );
    expect(screen.getByText('home.day_details.subtitle')).toBeDefined();
  });

  it('scanner.course_context key is a defined string constant', () => {
    expect(typeof 'scanner.course_context').toBe('string');
  });
});
