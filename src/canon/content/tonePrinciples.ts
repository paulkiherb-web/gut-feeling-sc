/**
 * CONTENT TONE PRINCIPLES — TypeScript Reference
 *
 * Personal State OS · Product Canonization Layer
 *
 * Machine-readable tone rules for governance checks and
 * contributor reference.
 */

// ─── Tone Qualities ───────────────────────────────────────────────────────────

export const TONE_QUALITIES = [
  'composed',
  'concise',
  'intelligent',
  'calm',
  'precise',
] as const;

export type ToneQuality = (typeof TONE_QUALITIES)[number];

// ─── Copy Length Limits ───────────────────────────────────────────────────────

export const COPY_LIMITS = {
  cardTitle:        { chars: 50,  words: 7  },
  cardBodyOneLine:  { chars: 80,  words: 14 },
  cardBodyTwoLines: { chars: 160, words: undefined },
  recommendation:   { chars: 120, words: 20 },
  insight:          { chars: 200, words: undefined },
  ctaPrimary:       { chars: 24,  words: 3  },
  ctaSecondary:     { chars: 32,  words: 4  },
  sectionHeader:    { chars: 32,  words: 4  },
  navigationLabel:  { chars: 12,  words: 1  },
} as const;

// ─── Forbidden Language Patterns ─────────────────────────────────────────────

export const FORBIDDEN_COPY_PATTERNS = {
  wellnessLanguage: [
    "you're doing amazing",
    "keep up the great work",
    "your body is your temple",
    "listen to your body",
    "you deserve to feel good",
    "self-care",
    "honor your health journey",
  ],
  motivationalCliches: [
    "don't give up",
    "every step counts",
    "you're crushing it",
    "push through",
    "believe in yourself",
    "small habits",
    "big results",
  ],
  aiHype: [
    "ai-powered",
    "machine learning",
    "intelligent algorithm",
    "personal ai coach",
    "backed by advanced ai",
    "deep analysis",
  ],
  fakeEmpathy: [
    "we understand this is hard",
    "we know how challenging",
    "you're not alone",
    "we're here for you",
    "it's okay to have off days",
  ],
  alarmLanguage: [
    "critical:",
    "warning:",
    "alert:",
    "danger:",
    "urgent:",
  ],
  forbiddenCtaWords: [
    "click here",
    "get started",
    "amazing",
    "great",
    "incredible",
    "submit",
  ],
} as const;

// ─── Permitted Copy Examples ──────────────────────────────────────────────────

export const COPY_EXAMPLES = {
  improving: [
    'Recovery improving over the last 3 days.',
    'Readiness is high — full context available.',
    'Sleep quality supports today\'s targets.',
    'Trajectory: improving.',
  ],
  stable: [
    'Readiness: 72. Within your typical range.',
    'Sleep: adequate. No adjustments indicated.',
    'No significant deviations from baseline.',
  ],
  declining: [
    'Recovery lower than average. Reduced activity recommended.',
    'Sleep quality below threshold. Prioritize rest today.',
    'Readiness is lower than your typical range.',
    'One recommendation for today.',
  ],
  risk: [
    'Risk: elevated if current pattern continues.',
    'At current trajectory, recovery may decline by Thursday.',
    'Consider reducing training load this week.',
  ],
} as const;

// ─── Number Formatting Rules ──────────────────────────────────────────────────

export const NUMBER_FORMAT_RULES = {
  readinessScore: 'integer',
  recoveryScore: 'integer',
  sleepDuration: '7h 20m format',
  percentages: 'integer with %',
  dates: 'relative when possible (Today, Yesterday, N days ago)',
  noApproximation: true,
} as const;
