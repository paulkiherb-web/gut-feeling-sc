import type { CourseKey } from './types';

export interface CourseMeta {
  key: CourseKey;
  title: string;
  shortTitle: string;
  description: string;
  bestDays: number;
  currentDays: number;
  improvedDays: number;
}

export const COURSE_CATALOG: Record<CourseKey, CourseMeta> = {
  energy: {
    key: 'energy',
    title: 'Больше энергии',
    shortTitle: 'Энергия',
    description: 'Мягкий курс на стабильную энергию без перегруза кофе и сахарных качелей.',
    bestDays: 28,
    currentDays: 42,
    improvedDays: 34,
  },
  sleep: {
    key: 'sleep',
    title: 'Лучше сон',
    shortTitle: 'Сон',
    description: 'Курс на спокойное засыпание и стабильное восстановление.',
    bestDays: 21,
    currentDays: 35,
    improvedDays: 28,
  },
  weight_loss: {
    key: 'weight_loss',
    title: 'Легче тело',
    shortTitle: 'Снижение веса',
    description: 'Мягкое снижение веса через белок, контроль напитков и вечерней еды.',
    bestDays: 60,
    currentDays: 90,
    improvedDays: 75,
  },
  muscle_gain: {
    key: 'muscle_gain',
    title: 'Набор массы',
    shortTitle: 'Масса',
    description: 'Достаточная еда, белок, силовая активность и восстановление.',
    bestDays: 56,
    currentDays: 84,
    improvedDays: 70,
  },
  digestion: {
    key: 'digestion',
    title: 'Спокойный живот',
    shortTitle: 'ЖКТ',
    description: 'Поддержка ЖКТ: режим, объём, меньше нагрузки на вечер.',
    bestDays: 21,
    currentDays: 35,
    improvedDays: 28,
  },
  calm: {
    key: 'calm',
    title: 'Спокойнее день',
    shortTitle: 'Спокойствие',
    description: 'Меньше перегруза, мягкое движение, сон и кофе не как костыль.',
    bestDays: 21,
    currentDays: 35,
    improvedDays: 28,
  },
  focus: {
    key: 'focus',
    title: 'Больше фокуса',
    shortTitle: 'Фокус',
    description: 'Стабильный завтрак, кофе в разумное время, паузы.',
    bestDays: 21,
    currentDays: 35,
    improvedDays: 28,
  },
};

export const COURSE_LIST: CourseMeta[] = [
  COURSE_CATALOG.energy,
  COURSE_CATALOG.sleep,
  COURSE_CATALOG.weight_loss,
  COURSE_CATALOG.muscle_gain,
  COURSE_CATALOG.digestion,
  COURSE_CATALOG.calm,
  COURSE_CATALOG.focus,
];
