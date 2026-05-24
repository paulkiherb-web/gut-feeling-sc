import type { CourseKey, CourseDomain, CourseGap, CourseRoute } from './types';
import type { UserState } from '../store/types/state';
import type {
  ScanCourseImpact,
  ScanImpactStatus,
  ScanRouteEffect,
} from './scanCourseImpactTypes';

// ─── Input types ──────────────────────────────────────────────────────────────

/** Subset of ScanResult fields used for impact analysis (all optional for safety) */
export interface ScanResultInput {
  id?: string;
  foodName?: string;
  verdict?: 'green' | 'yellow' | 'red';
  reason?: string;
  suggestion?: string;
  createdAt?: string;
  score?: number;
  category?: string;
  calories?: number;
  protein?: number;
}

export interface BuildScanCourseImpactInput {
  scanResult: ScanResultInput;
  activeCourse: CourseKey;
  profile?: Partial<UserState>;
  stateSnapshot?: unknown;
  courseGap?: CourseGap | null;
  courseRoute?: CourseRoute | null;
  lang?: 'ru' | 'en';
}

// ─── Internal signal extraction ───────────────────────────────────────────────

interface ScanSignals {
  hasAlcohol: boolean;
  hasCaffeine: boolean;
  hasSugar: boolean;
  hasHeavyMeal: boolean;
  hasProtein: boolean;
  hasVeggies: boolean;
  isEvening: boolean; // hour >= 18
  isLate: boolean;    // hour >= 20
  hour: number;
}

function extractSignals(scanResult: ScanResultInput): ScanSignals {
  const text = `${scanResult.foodName ?? ''} ${scanResult.reason ?? ''}`.toLowerCase();
  let hour: number;
  try {
    hour = scanResult.createdAt ? new Date(scanResult.createdAt).getHours() : new Date().getHours();
    if (!Number.isFinite(hour)) hour = new Date().getHours();
  } catch {
    hour = new Date().getHours();
  }

  return {
    hasAlcohol:
      /алкогол|пиво\b|вино\b|водк|пив[оа]\b|beer|wine|vodka|alcohol|whiskey|rum\b|gin\b|spirits?/.test(text),
    hasCaffeine:
      /кофе|кофеин|энерготик|эспрессо|латте|капучино|coffee|caffeine|latte|espresso|cappuccino|energy.?drink/.test(
        text,
      ),
    hasSugar:
      /сахар|сладк|шоколад|конфет|торт|десерт|лимонад|кола|пепси|sugar|sweet|chocolate|candy|cake|dessert|soda\b|cola\b|lemonade/.test(
        text,
      ),
    hasHeavyMeal:
      /тяжёл|тяжел|жирн|жарен|бургер|пицца|бекон|сосиск|колбас|heavy|fried|burger|pizza|bacon|sausage|fatty|greasy|fast.?food/.test(
        text,
      ),
    hasProtein:
      /белок|белк|протеин|кури[нц]|индейк|яйц|рыб[аую]?|говядин|свинин|тофу|protein|chicken|turkey|egg|fish|beef|pork|tofu/.test(
        text,
      ),
    hasVeggies:
      /овощ|зелень|салат|брокк|шпинат|огурец|помидор|vegetable|salad|broccoli|spinach|greens|cucumber|tomato/.test(
        text,
      ),
    isEvening: hour >= 18,
    isLate: hour >= 20,
    hour,
  };
}

// ─── Course-specific scoring ──────────────────────────────────────────────────

interface CourseAssessment {
  riskScore: number;
  supportScore: number;
  affectedDomains: CourseDomain[];
}

function assessForCourse(
  course: CourseKey,
  signals: ScanSignals,
  verdict: 'green' | 'yellow' | 'red',
): CourseAssessment {
  let riskScore = 0;
  let supportScore = 0;
  const domains = new Set<CourseDomain>();

  // Base contribution from scan verdict
  if (verdict === 'red') riskScore += 2;
  else if (verdict === 'yellow') riskScore += 0.5;
  else if (verdict === 'green') supportScore += 2;

  switch (course) {
    case 'energy': {
      // Risks: heavy meal, sweet drink, overeating, alcohol, low protein
      if (signals.hasHeavyMeal) { riskScore += 2; domains.add('food'); }
      if (signals.hasSugar)     { riskScore += 1; domains.add('food'); }
      if (signals.hasAlcohol)   { riskScore += 3; domains.add('alcohol'); }
      // Support: protein, water, balanced meal
      if (signals.hasProtein)   { supportScore += 2; domains.add('food'); }
      if (signals.hasVeggies)   { supportScore += 1; domains.add('food'); }
      break;
    }
    case 'sleep': {
      // Risks: late heavy meal, late caffeine, evening alcohol, evening sugar
      if (signals.isEvening && signals.hasHeavyMeal) { riskScore += 3; domains.add('food'); }
      else if (signals.hasHeavyMeal)                 { riskScore += 1; domains.add('food'); }

      if (signals.isEvening && signals.hasCaffeine) { riskScore += 3; domains.add('caffeine'); }
      else if (signals.hasCaffeine)                  { riskScore += 1; domains.add('caffeine'); }

      if (signals.isEvening && signals.hasAlcohol)  { riskScore += 3; domains.add('alcohol'); }
      else if (signals.hasAlcohol)                   { riskScore += 1.5; domains.add('alcohol'); }

      if (signals.isEvening && signals.hasSugar)    { riskScore += 2; domains.add('food'); }
      // Support: no stimulants, light meal
      if (!signals.hasHeavyMeal && !signals.hasCaffeine && !signals.hasAlcohol) { supportScore += 1; }
      break;
    }
    case 'weight_loss': {
      // Risks: sweet drinks, high calories, frequent snacks, low satiety
      if (signals.hasSugar)     { riskScore += 2; domains.add('food'); }
      if (signals.hasHeavyMeal) { riskScore += 2; domains.add('food'); }
      if (signals.hasAlcohol)   { riskScore += 2; domains.add('alcohol'); }
      // Support: protein, fiber, normal satiety, water
      if (signals.hasProtein)   { supportScore += 2; domains.add('food'); }
      if (signals.hasVeggies)   { supportScore += 2; domains.add('food'); }
      break;
    }
    case 'muscle_gain': {
      // Support: protein, enough food, recovery
      if (signals.hasProtein) { supportScore += 3; domains.add('food'); }
      if (signals.hasVeggies) { supportScore += 1; domains.add('food'); }
      // Risks: too little protein (red verdict without protein signal), alcohol
      if (verdict === 'red' && !signals.hasProtein) { riskScore += 1; domains.add('food'); }
      if (signals.hasAlcohol)                        { riskScore += 2; domains.add('alcohol'); }
      break;
    }
    case 'digestion': {
      // Risks: fatty, very spicy, late, alcohol, large volume
      if (signals.hasHeavyMeal) { riskScore += 2; domains.add('food'); }
      if (signals.hasAlcohol)   { riskScore += 3; domains.add('alcohol'); }
      if (signals.isLate)       { riskScore += 2; domains.add('food'); }
      // Support: mild food, water, moderate volume
      if (signals.hasVeggies && !signals.isLate) { supportScore += 2; domains.add('food'); }
      break;
    }
    case 'calm': {
      // Risks: coffee as crutch, sugar swings, alcohol, evening overload
      if (signals.hasCaffeine)                       { riskScore += 2; domains.add('caffeine'); }
      if (signals.hasSugar)                          { riskScore += 2; domains.add('food'); }
      if (signals.hasAlcohol)                        { riskScore += 3; domains.add('alcohol'); }
      if (signals.isEvening && signals.hasHeavyMeal) { riskScore += 2; domains.add('food'); }
      // Support: stable food, water, mild regime
      if (!signals.hasCaffeine && !signals.hasSugar && !signals.hasAlcohol) { supportScore += 1; }
      break;
    }
    case 'focus': {
      // Risks: sugar swings, heavy lunch, late caffeine, skipping meals
      if (signals.hasSugar)                          { riskScore += 2; domains.add('food'); }
      if (signals.hasHeavyMeal)                      { riskScore += 1.5; domains.add('food'); }
      if (signals.isEvening && signals.hasCaffeine)  { riskScore += 2; domains.add('caffeine'); }
      // Support: stable breakfast/lunch, protein, moderate coffee
      if (signals.hasProtein)  { supportScore += 2; domains.add('food'); }
      if (signals.hasVeggies)  { supportScore += 1; domains.add('food'); }
      break;
    }
  }

  return { riskScore, supportScore, affectedDomains: Array.from(domains) };
}

// ─── Status determination ─────────────────────────────────────────────────────

function determineStatus(riskScore: number, supportScore: number): ScanImpactStatus {
  const net = supportScore - riskScore;
  if (net >= 3) return 'supports_course';
  if (net >= 0 && riskScore < 2) return 'neutral';
  if (net >= -3) return 'slightly_drifts';
  return 'strongly_drifts';
}

function routeEffectForStatus(status: ScanImpactStatus): ScanRouteEffect {
  switch (status) {
    case 'supports_course': return 'stay_in_corridor';
    case 'neutral':         return 'stay_in_corridor';
    case 'slightly_drifts': return 'open_drift_branch';
    case 'strongly_drifts': return 'open_return_path';
    case 'unknown':         return 'needs_more_context';
  }
}

// ─── String generation (bilingual) ───────────────────────────────────────────

const COURSE_TITLE: Record<CourseKey, { ru: string; en: string }> = {
  energy:      { ru: 'Энергия',         en: 'Energy' },
  sleep:       { ru: 'Сон',             en: 'Sleep' },
  weight_loss: { ru: 'Снижение веса',   en: 'Weight Loss' },
  muscle_gain: { ru: 'Рост мышц',       en: 'Muscle Gain' },
  digestion:   { ru: 'Пищеварение',     en: 'Digestion' },
  calm:        { ru: 'Спокойствие',     en: 'Calm' },
  focus:       { ru: 'Фокус',           en: 'Focus' },
};

type Bilingual = { ru: string; en: string };
type EasiestReturnTemplate = {
  title: Bilingual;
  description: Bilingual;
  effort: 'low' | 'medium';
};

const EASIEST_RETURNS: Record<CourseKey, EasiestReturnTemplate[]> = {
  energy: [
    {
      title:       { ru: 'Белок в следующий приём', en: 'Protein in your next meal' },
      description: { ru: 'Стабилизирует энергию на несколько часов.', en: 'Keeps energy stable for hours.' },
      effort: 'low',
    },
  ],
  sleep: [
    {
      title:       { ru: 'Лёгкий вечер без стимуляторов', en: 'Light evening without stimulants' },
      description: { ru: 'Избежать кофе, тяжёлой еды и алкоголя вечером.', en: 'Avoid coffee, heavy food and alcohol in the evening.' },
      effort: 'low',
    },
  ],
  weight_loss: [
    {
      title:       { ru: 'Лёгкий следующий приём', en: 'Light next meal' },
      description: { ru: 'Белок и овощи — мягкий противовес.', en: 'Protein and vegetables — a gentle counterbalance.' },
      effort: 'low',
    },
  ],
  muscle_gain: [
    {
      title:       { ru: 'Белок в течение 2 часов', en: 'Protein within 2 hours' },
      description: { ru: 'Курица, яйца или рыба — возврат в курс.', en: 'Chicken, eggs, or fish — return to course.' },
      effort: 'low',
    },
  ],
  digestion: [
    {
      title:       { ru: 'Вода и лёгкий выбор', en: 'Water and something light' },
      description: { ru: 'Дать пищеварению передышку мягким выбором.', en: 'Give digestion a break with something gentle.' },
      effort: 'low',
    },
  ],
  calm: [
    {
      title:       { ru: 'Пауза и стакан воды', en: 'A pause and a glass of water' },
      description: { ru: 'Момент замедления помогает вернуть ритм.', en: 'A moment of stillness helps restore rhythm.' },
      effort: 'low',
    },
  ],
  focus: [
    {
      title:       { ru: 'Умеренный кофе + белок', en: 'Moderate coffee + protein' },
      description: { ru: 'Белок и кофе в нужное время поддержат концентрацию.', en: 'Protein and timely coffee support focus.' },
      effort: 'low',
    },
  ],
};

interface GeneratedStrings {
  headline: string;
  explanation: string;
  easiestReturn: { title: string; description: string; effort: 'low' | 'medium' } | null;
}

function buildStrings(
  status: ScanImpactStatus,
  course: CourseKey,
  lang: 'ru' | 'en',
): GeneratedStrings {
  const name = COURSE_TITLE[course][lang];
  const isDrift = status === 'slightly_drifts' || status === 'strongly_drifts';
  const returnTemplate = EASIEST_RETURNS[course][0];
  const easiestReturn: GeneratedStrings['easiestReturn'] = isDrift
    ? {
        title:       returnTemplate.title[lang],
        description: returnTemplate.description[lang],
        effort:      returnTemplate.effort,
      }
    : null;

  switch (status) {
    case 'unknown':
      return {
        headline: lang === 'ru'
          ? 'Можно привязать этот выбор к курсу после пары сигналов'
          : 'Connect this choice to your course after a few more signals',
        explanation: lang === 'ru'
          ? 'Пока данных немного — всё в порядке.'
          : 'Still gathering context — that\'s fine.',
        easiestReturn: null,
      };
    case 'supports_course':
      return {
        headline: lang === 'ru'
          ? `Этот выбор поддерживает курс «${name}»`
          : `This choice supports your «${name}» course`,
        explanation: lang === 'ru'
          ? 'Хорошо вписывается в сегодняшний маршрут.'
          : 'Fits well into today\'s route.',
        easiestReturn: null,
      };
    case 'neutral':
      return {
        headline: lang === 'ru'
          ? `Нейтральный выбор для курса «${name}»`
          : `Neutral choice for «${name}» course`,
        explanation: lang === 'ru'
          ? 'Не меняет маршрут дня заметно.'
          : 'Doesn\'t noticeably change today\'s route.',
        easiestReturn: null,
      };
    case 'slightly_drifts':
      return {
        headline: lang === 'ru'
          ? `Небольшое отклонение от курса «${name}»`
          : `Slight drift from «${name}» course`,
        explanation: lang === 'ru'
          ? 'Легко выровнять следующим выбором.'
          : 'Easy to balance with your next choice.',
        easiestReturn,
      };
    case 'strongly_drifts':
      return {
        headline: lang === 'ru'
          ? `Заметный отход от курса «${name}»`
          : `Notable drift from «${name}» course`,
        explanation: lang === 'ru'
          ? 'Один спокойный выбор вернёт вас в маршрут.'
          : 'One calm choice brings you back on track.',
        easiestReturn,
      };
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildScanCourseImpact(input: BuildScanCourseImpactInput): ScanCourseImpact {
  const { scanResult, activeCourse, lang = 'ru' } = input;

  // Require at least foodName or verdict to produce a meaningful result
  const hasMinData = !!(scanResult.foodName || scanResult.verdict);

  if (!hasMinData) {
    return {
      course: activeCourse,
      status: 'unknown',
      headline:
        lang === 'ru'
          ? 'Можно привязать этот выбор к курсу после пары сигналов'
          : 'Connect this choice to your course after a few more signals',
      explanation:
        lang === 'ru' ? 'Пока данных немного — всё в порядке.' : 'Still gathering context — that\'s fine.',
      affectedDomains: [],
      routeEffect: 'needs_more_context',
      easiestReturn: null,
      confidence: 'low',
    };
  }

  const signals  = extractSignals(scanResult);
  const verdict  = scanResult.verdict ?? 'yellow';
  const { riskScore, supportScore, affectedDomains } = assessForCourse(activeCourse, signals, verdict);

  const status      = determineStatus(riskScore, supportScore);
  const routeEffect = routeEffectForStatus(status);
  const { headline, explanation, easiestReturn } = buildStrings(status, activeCourse, lang);

  // Confidence: medium if we have keyword matches, else low
  const keywordHits = [
    signals.hasAlcohol, signals.hasCaffeine, signals.hasSugar,
    signals.hasHeavyMeal, signals.hasProtein, signals.hasVeggies,
  ].filter(Boolean).length;
  const confidence: 'low' | 'medium' | 'high' = keywordHits >= 2 ? 'medium' : 'low';

  return {
    course: activeCourse,
    status,
    headline,
    explanation,
    affectedDomains,
    routeEffect,
    easiestReturn,
    confidence,
  };
}
