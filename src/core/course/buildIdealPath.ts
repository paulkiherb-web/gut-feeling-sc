import type { CourseAnchor, CourseKey, IdealPath } from './types';

type AnchorMap = IdealPath['dayParts'];

const A = (
  id: string,
  phase: CourseAnchor['phase'],
  domain: CourseAnchor['domain'],
  title: string,
  description: string,
  weight = 1,
  optional = false,
): CourseAnchor => ({ id, title, description, domain, weight, phase, optional });

const TEMPLATES: Record<CourseKey, AnchorMap> = {
  energy: {
    morning: [
      A('energy.morning.water', 'morning', 'hydration', 'Вода с утра', 'Стакан воды перед кофе.'),
      A('energy.morning.notEmptyCoffee', 'morning', 'caffeine', 'Не пустой кофе', 'Кофе после еды, а не на пустой желудок.', 2),
      A('energy.morning.protein', 'morning', 'food', 'Белковый завтрак', 'Завтрак с белком, чтобы энергия держалась.', 2),
    ],
    day: [
      A('energy.day.lightLunch', 'day', 'food', 'Не перегружать обед', 'Сбалансированный обед без тяжёлого после.', 2),
      A('energy.day.moveAfterMeal', 'day', 'movement', 'Короткое движение', '5–10 минут после еды.', 1, true),
    ],
    evening: [
      A('energy.evening.lightDinner', 'evening', 'food', 'Лёгкий ужин', 'Не усиливать усталость тяжёлой едой.', 2),
      A('energy.evening.noAlcohol', 'evening', 'alcohol', 'Меньше алкоголя', 'Алкоголь забирает завтрашнюю энергию.', 1, true),
    ],
    sleep: [
      A('energy.sleep.noLateScreen', 'sleep', 'sleep', 'Меньше позднего экрана', 'Не уходить в поздний экран.', 1),
    ],
  },
  sleep: {
    morning: [
      A('sleep.morning.light', 'morning', 'recovery', 'Дневной свет утром', 'Свет утром помогает ритму.', 1, true),
    ],
    day: [
      A('sleep.day.coffeeCutoff', 'day', 'caffeine', 'Кофе не поздно', 'Последний кофе до середины дня.', 2),
    ],
    evening: [
      A('sleep.evening.lightDinner', 'evening', 'food', 'Лёгкий ужин', 'Ужин не перегружен и не поздний.', 2),
      A('sleep.evening.lessAlcohol', 'evening', 'alcohol', 'Меньше алкоголя', 'Алкоголь портит структуру сна.', 2),
    ],
    sleep: [
      A('sleep.sleep.windDown', 'sleep', 'sleep', 'Подготовка ко сну', 'Спокойные 30 минут перед сном.', 2),
      A('sleep.sleep.earlyScreenOff', 'sleep', 'sleep', 'Экран раньше', 'Убрать экран чуть раньше.', 1),
    ],
  },
  weight_loss: {
    morning: [
      A('wl.morning.protein', 'morning', 'food', 'Белок утром', 'Белок утром снижает тягу днём.', 2),
    ],
    day: [
      A('wl.day.noSweetDrinks', 'day', 'food', 'Меньше сладких напитков', 'Сладкие напитки добирают калории незаметно.', 2),
      A('wl.day.proteinLunch', 'day', 'food', 'Сытный обед с белком', 'Чтобы не добирать вечером.', 2),
      A('wl.day.move', 'day', 'movement', 'Короткая активность', '20–30 минут движения.', 1, true),
    ],
    evening: [
      A('wl.evening.noLateAdd', 'evening', 'food', 'Не добирать ночью', 'Меньше поздних догонов.', 2),
      A('wl.evening.lessAlcohol', 'evening', 'alcohol', 'Меньше алкоголя', 'Алкоголь повышает аппетит.', 1, true),
    ],
    sleep: [
      A('wl.sleep.enough', 'sleep', 'sleep', 'Достаточный сон', 'Сон помогает контролю веса.', 1),
    ],
  },
  muscle_gain: {
    morning: [
      A('mg.morning.protein', 'morning', 'food', 'Белок утром', 'Белок в первый приём.', 2),
    ],
    day: [
      A('mg.day.enoughFood', 'day', 'food', 'Достаточно еды', 'Не недоедать в течение дня.', 2),
      A('mg.day.strength', 'day', 'movement', 'Силовая активность', 'Силовая работа в график.', 2, true),
    ],
    evening: [
      A('mg.evening.proteinDinner', 'evening', 'food', 'Белок вечером', 'Белок в ужине поддерживает восстановление.', 2),
    ],
    sleep: [
      A('mg.sleep.recovery', 'sleep', 'sleep', 'Сон для восстановления', 'Сон — главный анаболик.', 2),
    ],
  },
  digestion: {
    morning: [
      A('dig.morning.gentleStart', 'morning', 'food', 'Мягкий старт', 'Не перегружать утро.', 1),
    ],
    day: [
      A('dig.day.smallerVolume', 'day', 'food', 'Не перегружать объёмом', 'Порции комфортного объёма.', 2),
      A('dig.day.lessFat', 'day', 'food', 'Меньше жирного', 'Меньше жирной и жареной еды.', 1, true),
    ],
    evening: [
      A('dig.evening.earlyDinner', 'evening', 'food', 'Не поздний ужин', 'Ужин не у самой ночи.', 2),
      A('dig.evening.lessAlcohol', 'evening', 'alcohol', 'Меньше алкоголя', 'Алкоголь раздражает ЖКТ.', 1),
    ],
    sleep: [
      A('dig.sleep.calmNight', 'sleep', 'sleep', 'Спокойная ночь', 'Лечь без переполненного желудка.', 1),
    ],
  },
  calm: {
    morning: [
      A('calm.morning.softStart', 'morning', 'recovery', 'Мягкий старт', 'Без резкого включения и тяжёлого кофе.', 1),
    ],
    day: [
      A('calm.day.noOverload', 'day', 'recovery', 'Снизить перегруз', 'Меньше срочного на один раз.', 2),
      A('calm.day.softMove', 'day', 'movement', 'Мягкое движение', 'Прогулка или растяжка.', 1, true),
    ],
    evening: [
      A('calm.evening.windDown', 'evening', 'recovery', 'Спокойный вечер', 'Снизить стимуляцию вечером.', 2),
      A('calm.evening.coffeeNotCrutch', 'evening', 'caffeine', 'Кофе не как костыль', 'Не закрывать усталость кофе вечером.', 1),
    ],
    sleep: [
      A('calm.sleep.enough', 'sleep', 'sleep', 'Достаточный сон', 'Сон возвращает спокойствие.', 2),
    ],
  },
  focus: {
    morning: [
      A('focus.morning.breakfast', 'morning', 'food', 'Стабильный завтрак', 'Завтрак без сахарных качелей.', 2),
    ],
    day: [
      A('focus.day.coffeeTiming', 'day', 'caffeine', 'Кофе в разумное время', 'Кофе не слишком рано и не слишком поздно.', 2),
      A('focus.day.lessSugar', 'day', 'food', 'Меньше сахарных качелей', 'Без резких всплесков сахара.', 1),
      A('focus.day.shortBreaks', 'day', 'recovery', 'Короткие паузы', 'Паузы помогают держать фокус.', 1, true),
    ],
    evening: [
      A('focus.evening.unload', 'evening', 'recovery', 'Разгрузить вечер', 'Не доводить вечер до перегруза.', 1),
    ],
    sleep: [
      A('focus.sleep.consistency', 'sleep', 'sleep', 'Стабильный сон', 'Похожие часы сна.', 2),
    ],
  },
};

export function buildIdealPath(course: CourseKey): IdealPath {
  const parts = TEMPLATES[course];
  const all = [
    ...parts.morning,
    ...parts.day,
    ...parts.evening,
    ...parts.sleep,
  ];

  const minimumPath = all.filter((a) => !a.optional && a.weight >= 2);
  const normalPath = all.filter((a) => !a.optional);
  const bestPath = all;

  return {
    course,
    dayParts: parts,
    minimumPath,
    normalPath,
    bestPath,
  };
}
