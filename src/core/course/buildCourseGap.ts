import { COURSE_CATALOG } from './courseCatalog';
import type {
  CourseGap,
  CourseKey,
  CourseStrictness,
  IdealPath,
  RealPath,
} from './types';

interface BuildCourseGapInput {
  course: CourseKey;
  idealPath: IdealPath;
  realPath: RealPath;
  strictness?: CourseStrictness;
}

const STRICTNESS_MULT: Record<CourseStrictness, number> = {
  soft: 1.3,
  balanced: 1.0,
  focused: 0.85,
};

const DOMAIN_LABELS: Record<string, string> = {
  food: 'еда',
  sleep: 'сон',
  movement: 'движение',
  hydration: 'вода',
  alcohol: 'алкоголь',
  caffeine: 'кофе',
  recovery: 'восстановление',
};

interface ReturnTemplate {
  title: string;
  description: string;
  domain: import('./types').CourseAnchor['domain'];
  effort: 'low' | 'medium';
}

const RETURN_BY_SIGNAL: Record<string, ReturnTemplate> = {
  'food:late_eating': {
    title: 'Сделать ужин чуть раньше',
    description: 'Мягкий возврат: не добавлять поздних догонов вечером.',
    domain: 'food',
    effort: 'low',
  },
  'food:red_choice': {
    title: 'Один спокойный приём еды',
    description: 'Следующий приём — нейтральный, без тяжёлого.',
    domain: 'food',
    effort: 'low',
  },
  'food:red_scan': {
    title: 'Сбалансировать следующий приём',
    description: 'Можно вернуть курс одним спокойным приёмом еды.',
    domain: 'food',
    effort: 'low',
  },
  'caffeine:late': {
    title: 'Кофе не во второй половине',
    description: 'Лучше не усиливать кофе после обеда.',
    domain: 'caffeine',
    effort: 'low',
  },
  'alcohol:logged': {
    title: 'Без второй порции алкоголя',
    description: 'Мягкий возврат — не усиливать вечер алкоголем.',
    domain: 'alcohol',
    effort: 'low',
  },
  'sleep:short': {
    title: 'Лечь чуть раньше',
    description: 'Один спокойный вечер вернёт сон в коридор.',
    domain: 'sleep',
    effort: 'medium',
  },
};

export function buildCourseGap({
  course,
  idealPath,
  realPath,
  strictness = 'balanced',
}: BuildCourseGapInput): CourseGap {
  const meta = COURSE_CATALOG[course];
  const totalSignals =
    realPath.completedAnchors.length +
    realPath.missedAnchors.length +
    realPath.riskySignals.length +
    realPath.supportiveSignals.length +
    realPath.inferredSignals.length;

  const bestDays = meta.bestDays;
  const currentDays = meta.currentDays;
  const improvedDays = meta.improvedDays;

  if (totalSignals === 0) {
    return {
      status: 'unknown',
      gapScore: 0,
      headline: 'Курс готов, начнём с первых сигналов',
      explanation:
        'Пока мало данных. Отметь первый приём еды или сон, и маршрут станет точнее.',
      strongestDrift: null,
      easiestReturn: null,
      estimatedPace: { bestDays, currentDays, improvedDays },
      confidence: 'low',
    };
  }

  const supportive = realPath.supportiveSignals.length + realPath.completedAnchors.length;
  const risky = realPath.riskySignals.length + realPath.inferredSignals.length;
  const mult = STRICTNESS_MULT[strictness];

  // Higher = more drift
  const rawScore = risky * 12 * mult - supportive * 6;
  const gapScore = clamp(Math.round(rawScore + 30), 0, 100);

  let status: CourseGap['status'];
  if (gapScore < 30) status = 'inside_corridor';
  else if (gapScore < 60) status = 'slightly_out';
  else status = 'far_out';

  // Strongest drift by domain frequency
  const driftDomains: Record<string, number> = {};
  for (const sig of realPath.riskySignals) {
    const domain = sig.split(':')[0];
    driftDomains[domain] = (driftDomains[domain] ?? 0) + 1;
  }
  for (const sig of realPath.inferredSignals) {
    const domain = sig.split(':')[0];
    driftDomains[domain] = (driftDomains[domain] ?? 0) + 0.5;
  }
  const strongestDrift =
    Object.entries(driftDomains).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const strongestDriftLabel = strongestDrift ? DOMAIN_LABELS[strongestDrift] ?? strongestDrift : null;

  // Easiest return — pick highest-priority risky signal
  let easiestReturn: CourseGap['easiestReturn'] = null;
  for (const sig of realPath.riskySignals) {
    if (RETURN_BY_SIGNAL[sig]) {
      easiestReturn = { ...RETURN_BY_SIGNAL[sig] };
      break;
    }
  }
  if (!easiestReturn && status !== 'inside_corridor') {
    easiestReturn = {
      title: 'Сохранить коридор вечером',
      description: 'Лучше не усиливать вечер тяжёлой едой и поздним экраном.',
      domain: 'food',
      effort: 'low',
    };
  }

  let headline: string;
  let explanation: string;
  if (status === 'inside_corridor') {
    headline = 'Ты пока в коридоре курса';
    explanation = 'Сегодня лучше не усиливать вечер тяжёлой едой и поздним экраном.';
  } else if (status === 'slightly_out') {
    headline = 'День немного ушёл в сторону от курса';
    explanation = strongestDriftLabel
      ? `Самый мягкий возврат — внимательнее к области: ${strongestDriftLabel}.`
      : 'Самый мягкий возврат — не добавлять алкоголь вечером и сделать ужин легче.';
  } else {
    headline = 'Маршрут заметно ушёл в сторону';
    explanation = strongestDriftLabel
      ? `Можно мягко вернуться через ${strongestDriftLabel}, без давления.`
      : 'Можно мягко вернуться одним небольшим выбором.';
  }

  // Recompute pace estimate using strictness and gap
  const paceShift = Math.round((gapScore / 100) * (currentDays - bestDays));
  const adjCurrent = Math.max(bestDays, bestDays + paceShift);
  const adjImproved = Math.max(bestDays, Math.round((adjCurrent + bestDays) / 2));

  const confidence: CourseGap['confidence'] =
    totalSignals >= 6 ? 'high' : totalSignals >= 3 ? 'medium' : 'low';

  return {
    status,
    gapScore,
    headline,
    explanation,
    strongestDrift: strongestDriftLabel,
    easiestReturn,
    estimatedPace: {
      bestDays,
      currentDays: adjCurrent,
      improvedDays: adjImproved,
    },
    confidence,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

