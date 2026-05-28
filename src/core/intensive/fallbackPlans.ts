// Offline fallback plan generator — used when AI/Supabase is unavailable.
// 3-tier plans (gentle/balanced/intense) for all 10 courses.
// Gentle: real foods + approx portions, walks only.
// Balanced: precise grams+macros, basic supplements, 20-30 min cardio.
// Intense: biohacker stacks, HIIT/strength with duration, advanced protocols.
// Pass wakeHour to shift schedule relative to default 07:00 wake time.

import type { IntensivePlan, BlueprintItem, DailyBlueprint, IntensiveEffort } from './types';

type CourseItemTemplate = Omit<BlueprintItem, 'id'>;

const COURSE_NAMES: Record<string, string> = {
  energy: 'Энергия',
  sleep: 'Сон',
  focus: 'Когнитивное здоровье',
  weight_loss: 'Снижение веса',
  muscle_gain: 'Набор мышц',
  calm: 'Спокойствие',
  longevity: 'Долголетие',
  libido: 'Либидо',
  flexibility: 'Гибкость',
  immunity: 'Иммунитет',
  recovery: 'Восстановление',
  performance: 'Производительность',
};

// COURSE_TIERS[course][effort] → array of blueprint item templates
const COURSE_TIERS: Record<string, Record<IntensiveEffort, CourseItemTemplate[]>> = {

  // ─── WEIGHT LOSS ─────────────────────────────────────────────
  weight_loss: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода натощак 400 мл', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '07:30', category: 'movement', title: 'Прогулка 20 мин (лёгкий темп)', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 5, recovery: 3 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: 2 яйца + овсянка 60 г + огурец', description: '~350 ккал · белок 22 г · углеводы 38 г · жиры 10 г', expectedImpact: { nutrition: 7, energy: 5 } },
      { time: '12:30', category: 'meal', title: 'Обед: куриная грудка 150 г + зелёный салат 200 г', description: '~320 ккал · белок 38 г · углеводы 12 г · жиры 8 г', expectedImpact: { nutrition: 8 } },
      { time: '15:00', category: 'hydration', title: 'Вода 300 мл', tokenIds: ['water'] },
      { time: '15:30', category: 'movement', title: 'Прогулка 15 мин после обеда', tokenIds: ['walk'], durationMin: 15, expectedImpact: { energy: 4 } },
      { time: '18:30', category: 'meal', title: 'Ужин: рыба 130 г + тушёные овощи 200 г', description: '~280 ккал · белок 28 г · углеводы 15 г · жиры 9 г', expectedImpact: { nutrition: 7 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 10, energy: 8 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода натощак 500 мл + лимон', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '07:30', category: 'movement', title: 'Кардио 25 мин умеренной интенсивности (ЧСС 120–135)', tokenIds: ['cardio'], durationMin: 25, expectedImpact: { energy: 8, recovery: 5 } },
      { time: '08:30', category: 'supplement', title: 'Omega-3 2 г + Vit D3 5000 МЕ', description: 'Принять с едой', expectedImpact: { recovery: 3 } },
      { time: '09:00', category: 'meal', title: 'Завтрак: куриное филе 120 г + яйца 2 шт + руккола 80 г', description: '~390 ккал · белок 48 г · углеводы 6 г · жиры 18 г', expectedImpact: { nutrition: 9, energy: 6 } },
      { time: '12:30', category: 'meal', title: 'Обед: говядина 150 г + гречка 80 г + брокколи 150 г', description: '~450 ккал · белок 42 г · углеводы 40 г · жиры 10 г', expectedImpact: { nutrition: 9 } },
      { time: '15:00', category: 'hydration', title: 'Вода 350 мл', tokenIds: ['water'] },
      { time: '15:30', category: 'movement', title: 'Быстрая прогулка 20 мин', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 4 } },
      { time: '18:30', category: 'supplement', title: 'Mg глицинат 400 мг', description: 'За 1 час до ужина', expectedImpact: { sleep: 3 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 150 г + стручковая фасоль 200 г', description: '~380 ккал · белок 35 г · углеводы 14 г · жиры 20 г', expectedImpact: { nutrition: 9 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 11, energy: 9 } },
    ],
    intense: [
      { time: '06:30', category: 'hydration', title: 'Вода натощак 600 мл', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '06:45', category: 'supplement', title: 'Берберин 500 мг + L-карнитин 2 г', description: 'Натощак за 30 мин до тренировки — активация AMPK', expectedImpact: { energy: 5 } },
      { time: '07:00', category: 'movement', title: 'HIIT 20 мин (20 с работа / 10 с отдых × 8) + заминка 5 мин', tokenIds: ['hiit'], durationMin: 25, expectedImpact: { energy: 12, recovery: 6 } },
      { time: '08:00', category: 'supplement', title: 'Whey изолят 35 г + Omega-3 3 г + Vit D3 10000 МЕ', description: 'Белковый коктейль сразу после тренировки', expectedImpact: { nutrition: 8, recovery: 6 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: куриное филе 160 г + яйца 3 шт + шпинат 100 г', description: '~480 ккал · белок 62 г · углеводы 8 г · жиры 22 г', expectedImpact: { nutrition: 10, energy: 7 } },
      { time: '10:30', category: 'supplement', title: 'Берберин 500 мг (2-я доза)', description: 'Контроль глюкозы', expectedImpact: { nutrition: 2 } },
      { time: '10:30', category: 'hydration', title: 'Вода 350 мл', tokenIds: ['water'] },
      { time: '12:30', category: 'meal', title: 'Обед: говядина нежирная 180 г + чечевица 120 г + овощи 200 г', description: '~520 ккал · белок 52 г · углеводы 42 г', expectedImpact: { nutrition: 10 } },
      { time: '14:30', category: 'habit', title: 'Холодный душ 2 мин', description: 'Активация бурого жира, ускорение метаболизма', tokenIds: ['cold_shower'], expectedImpact: { energy: 6, recovery: 5 } },
      { time: '15:30', category: 'movement', title: 'Прогулка 20 мин + 5 мин растяжка', tokenIds: ['walk'], durationMin: 25, expectedImpact: { energy: 5 } },
      { time: '18:30', category: 'supplement', title: 'Mg глицинат 400 мг + Omega-3 2 г', expectedImpact: { sleep: 4, recovery: 3 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 170 г + цветная капуста 250 г + авокадо 70 г', description: '~460 ккал · белок 40 г · жиры 26 г', expectedImpact: { nutrition: 10 } },
      { time: '21:30', category: 'habit', title: 'Голодание с 21:30 (16/8 протокол)', description: 'Следующий приём пищи не ранее 08:00', expectedImpact: { nutrition: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 12, energy: 10 } },
    ],
  },

  // ─── MUSCLE GAIN ─────────────────────────────────────────────
  muscle_gain: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'meal', title: 'Завтрак: 3 яйца + овсянка 80 г + банан', description: '~490 ккал · белок 28 г · углеводы 62 г · жиры 14 г', expectedImpact: { nutrition: 8, energy: 7 } },
      { time: '10:00', category: 'movement', title: 'Силовая тренировка 40 мин (базовые движения)', tokenIds: ['strength'], durationMin: 40, expectedImpact: { energy: 7, recovery: 4 } },
      { time: '10:45', category: 'meal', title: 'Перекус: творог 150 г + 1 банан', description: '~270 ккал · белок 22 г · углеводы 32 г', expectedImpact: { nutrition: 6, recovery: 3 } },
      { time: '13:00', category: 'meal', title: 'Обед: куриная грудка 200 г + рис 100 г + брокколи', description: '~500 ккал · белок 48 г · углеводы 55 г · жиры 8 г', expectedImpact: { nutrition: 9, energy: 6 } },
      { time: '16:00', category: 'hydration', title: 'Вода 350 мл', tokenIds: ['water'] },
      { time: '19:00', category: 'meal', title: 'Ужин: говядина 170 г + гречка 90 г + салат', description: '~510 ккал · белок 45 г · углеводы 48 г', expectedImpact: { nutrition: 8, recovery: 4 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов (восстановление мышц)', tokenIds: ['sleep'], expectedImpact: { recovery: 14, energy: 10 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '07:15', category: 'supplement', title: 'Креатин моногидрат 5 г', description: 'Принять с водой ежедневно', expectedImpact: { energy: 4, recovery: 3 } },
      { time: '07:30', category: 'meal', title: 'Завтрак: яйца 3 шт + куриное филе 100 г + рис 80 г', description: '~540 ккал · белок 52 г · углеводы 44 г · жиры 16 г', expectedImpact: { nutrition: 9, energy: 7 } },
      { time: '09:30', category: 'movement', title: 'Силовая тренировка 50 мин (сплит или фулбоди)', tokenIds: ['strength'], durationMin: 50, expectedImpact: { energy: 8, recovery: 5 } },
      { time: '10:30', category: 'supplement', title: 'Whey изолят 35 г + Vit D3 5000 МЕ + Omega-3 2 г', description: 'Коктейль сразу после тренировки', expectedImpact: { nutrition: 8, recovery: 6 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина 180 г + картофель 150 г + зелёный горошек', description: '~600 ккал · белок 48 г · углеводы 62 г', expectedImpact: { nutrition: 9 } },
      { time: '16:30', category: 'meal', title: 'Перекус: греческий йогурт 200 г + орехи 30 г', description: '~310 ккал · белок 24 г · жиры 16 г', expectedImpact: { nutrition: 6 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 180 г + гречка 100 г + брокколи 150 г', description: '~580 ккал · белок 48 г · углеводы 52 г', expectedImpact: { nutrition: 9, recovery: 5 } },
      { time: '21:30', category: 'supplement', title: 'ZMA: Zn 30 мг + Mg 450 мг + B6 10.5 мг', description: 'Натощак за 30–60 мин до сна', expectedImpact: { sleep: 5, recovery: 4 } },
      { time: '22:30', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, energy: 10 } },
    ],
    intense: [
      { time: '06:30', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '06:45', category: 'supplement', title: 'Креатин 5 г + Цитруллин малат 6 г + Бета-аланин 3 г', description: 'Предтреник за 30 мин — накачка, выносливость, буфер лактата', expectedImpact: { energy: 8 } },
      { time: '07:15', category: 'meal', title: 'Предтреник: рис 60 г + банан', description: 'Быстрые углеводы для энергии на тренировке', expectedImpact: { energy: 6 } },
      { time: '07:30', category: 'movement', title: 'Силовая тренировка 60–70 мин (тяжёлые базовые + изоляция)', tokenIds: ['strength'], durationMin: 65, expectedImpact: { energy: 10, recovery: 6 } },
      { time: '09:00', category: 'supplement', title: 'Whey изолят 40 г + HMB 3 г + Vit D3 10000 МЕ', description: 'Анаболическое окно — стимуляция mTOR', expectedImpact: { nutrition: 10, recovery: 8 } },
      { time: '09:30', category: 'meal', title: 'Завтрак: куриное филе 200 г + яйца 3 шт + рис 100 г + брокколи', description: '~680 ккал · белок 72 г · углеводы 56 г', expectedImpact: { nutrition: 10, energy: 8 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина нежирная 200 г + картофель 180 г + шпинат 100 г', description: '~650 ккал · белок 52 г · углеводы 68 г', expectedImpact: { nutrition: 10 } },
      { time: '16:00', category: 'movement', title: 'Кардио низкой интенсивности 20 мин (ходьба/велосипед)', tokenIds: ['cardio'], durationMin: 20, expectedImpact: { recovery: 5 } },
      { time: '16:30', category: 'meal', title: 'Перекус: яйца 3 шт + авокадо 100 г', description: '~360 ккал · белок 20 г · жиры 28 г', expectedImpact: { nutrition: 7 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 200 г + гречка 120 г + стручковая фасоль 150 г', description: '~650 ккал · белок 55 г · углеводы 62 г', expectedImpact: { nutrition: 10, recovery: 6 } },
      { time: '21:00', category: 'supplement', title: 'Казеин 40 г + ZMA (Zn 30 мг + Mg 450 мг) + Mg L-треонат 1000 мг', description: 'Медленный протеин на ночь + глубокое восстановление', expectedImpact: { recovery: 9, sleep: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8–9 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 16, energy: 10 } },
    ],
  },

  // ─── LONGEVITY ───────────────────────────────────────────────
  longevity: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода с лимоном 400 мл', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '07:30', category: 'movement', title: 'Прогулка на свежем воздухе 25 мин', tokenIds: ['walk'], durationMin: 25, expectedImpact: { energy: 6, recovery: 4 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: лосось 100 г + черника 150 г + грецкие орехи 30 г', description: '~400 ккал · Omega-3 3 г · антиоксиданты', expectedImpact: { nutrition: 9, energy: 5 } },
      { time: '12:30', category: 'meal', title: 'Обед: бобовые 150 г + листовая зелень 200 г + оливковое масло 1 ст.л.', description: '~380 ккал · полифенолы + клетчатка', expectedImpact: { nutrition: 8 } },
      { time: '15:00', category: 'hydration', title: 'Зелёный чай или вода', tokenIds: ['water'] },
      { time: '15:30', category: 'movement', title: 'Растяжка 15 мин или йога', tokenIds: ['stretch'], durationMin: 15, expectedImpact: { recovery: 6 } },
      { time: '18:30', category: 'meal', title: 'Ужин: тофу/рыба 130 г + тушёные овощи 250 г', description: '~320 ккал · без обработанных углеводов', expectedImpact: { nutrition: 8 } },
      { time: '21:00', category: 'habit', title: 'Без экранов 1 час до сна', expectedImpact: { sleep: 5, recovery: 3 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 500 мл + ACV 1 ч.л.', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '07:30', category: 'movement', title: 'Зона 2 кардио 30 мин (ЧСС 110–130, разговорный темп)', tokenIds: ['cardio'], durationMin: 30, expectedImpact: { energy: 7, recovery: 6 } },
      { time: '08:30', category: 'supplement', title: 'NMN 500 мг + Ресвератрол 1000 мг + Vit D3 5000 МЕ + Omega-3 3 г', description: 'Принять с жирной едой для лучшей абсорбции', expectedImpact: { energy: 5, recovery: 4 } },
      { time: '09:00', category: 'meal', title: 'Завтрак: лосось 150 г + авокадо 100 г + яйца 2 шт + шпинат', description: '~560 ккал · белок 46 г · жиры 38 г', expectedImpact: { nutrition: 10, energy: 7 } },
      { time: '13:00', category: 'meal', title: 'Обед: сардины/скумбрия 150 г + чечевица 120 г + зелень 200 г', description: '~480 ккал · CoQ10 + Omega-3 + фолаты', expectedImpact: { nutrition: 9 } },
      { time: '15:00', category: 'hydration', title: 'Зелёный чай матча 200 мл', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '16:00', category: 'movement', title: 'Силовая тренировка 30 мин или интенсивная прогулка', tokenIds: ['strength', 'walk'], durationMin: 30, expectedImpact: { energy: 6, recovery: 5 } },
      { time: '18:30', category: 'supplement', title: 'CoQ10 (убихинол) 200 мг + Берберин 500 мг', expectedImpact: { energy: 4, recovery: 3 } },
      { time: '19:00', category: 'meal', title: 'Ужин: тёмная рыба/птица 150 г + ферментированные продукты 100 г', description: 'Ужин до 19:30 — циркадный протокол', expectedImpact: { nutrition: 9 } },
      { time: '21:00', category: 'habit', title: 'Без экранов (синий свет заблокирован)', expectedImpact: { sleep: 5, recovery: 4 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    intense: [
      { time: '06:00', category: 'habit', title: 'Холодный душ 3 мин + контрастный 2 мин', tokenIds: ['cold_shower'], expectedImpact: { energy: 7, recovery: 5 } },
      { time: '06:30', category: 'supplement', title: 'NMN 500 мг + NR 500 мг + Ресвератрол 1000 мг + Птеростильбен 100 мг', description: 'Натощак — максимальная биодоступность НАД+ предшественников', expectedImpact: { energy: 7, recovery: 5 } },
      { time: '07:00', category: 'movement', title: 'Зона 2 кардио 45 мин голодный (ЧСС 60–70% макс)', tokenIds: ['cardio'], durationMin: 45, expectedImpact: { energy: 9, recovery: 7 } },
      { time: '08:00', category: 'supplement', title: 'Берберин 500 мг + Астаксантин 12 мг + CoQ10 400 мг (убихинол)', description: 'Принять с жирным завтраком', expectedImpact: { recovery: 5 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: лосось 170 г + яйца 3 шт + авокадо 120 г + микрозелень 50 г', description: '~620 ккал · белок 52 г · жиры 44 г · антиоксиданты', expectedImpact: { nutrition: 10, energy: 8 } },
      { time: '11:00', category: 'habit', title: 'Красный свет 10 мин (Red Light Therapy)', description: 'Фотобиомодуляция — стимуляция митохондрий', expectedImpact: { energy: 5, recovery: 4 } },
      { time: '13:00', category: 'supplement', title: 'Берберин 500 мг (2-я доза) + Omega-3 3 г', expectedImpact: { recovery: 4 } },
      { time: '13:30', category: 'meal', title: 'Обед: скумбрия 160 г + чечевица 130 г + листовая зелень 200 г + оливковое масло', description: '~540 ккал · CoQ10 + Omega-3 + полифенолы', expectedImpact: { nutrition: 10 } },
      { time: '16:00', category: 'movement', title: 'Силовая тренировка 40 мин (функциональная сила)', tokenIds: ['strength'], durationMin: 40, expectedImpact: { energy: 7, recovery: 6 } },
      { time: '17:30', category: 'supplement', title: 'Mg L-треонат 2000 мг + Глицин 3 г', description: 'После тренировки — нейропластичность и восстановление', expectedImpact: { recovery: 6, sleep: 4 } },
      { time: '18:30', category: 'meal', title: 'Ужин: сардины 160 г + ферм. овощи 150 г + тыква 150 г', description: 'Ужин до 19:00 — 12ч голодание до завтра', expectedImpact: { nutrition: 10 } },
      { time: '21:00', category: 'habit', title: 'Без экранов + янтарное освещение', expectedImpact: { sleep: 6, recovery: 4 } },
      { time: '21:30', category: 'supplement', title: 'NMN 250 мг + Транс-ресвератрол 500 мг (ночная доза)', expectedImpact: { recovery: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов (температура 18°C)', tokenIds: ['sleep'], expectedImpact: { recovery: 16, sleep: 14 } },
    ],
  },

  // ─── SLEEP ───────────────────────────────────────────────────
  sleep: {
    gentle: [
      { time: '07:30', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '08:00', category: 'meal', title: 'Завтрак: овсянка 80 г + банан + молоко', description: 'Триптофан → серотонин → мелатонин', expectedImpact: { energy: 5, sleep: 2 } },
      { time: '14:00', category: 'habit', title: 'Последний кофе не позже 14:00', expectedImpact: { sleep: 5 } },
      { time: '14:30', category: 'movement', title: 'Прогулка 20 мин (дневной свет)', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 5, sleep: 3 } },
      { time: '18:00', category: 'meal', title: 'Ужин: индейка 150 г + рис 80 г + зелень', description: '~380 ккал · высокий триптофан для серотонина', expectedImpact: { nutrition: 7, sleep: 4 } },
      { time: '20:00', category: 'habit', title: 'Без алкоголя и тяжёлой еды', expectedImpact: { sleep: 5 } },
      { time: '21:30', category: 'rest', title: 'Чтение или медитация 20 мин', tokenIds: ['meditation'], expectedImpact: { sleep: 6, recovery: 3 } },
      { time: '22:30', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { sleep: 14, recovery: 10 } },
    ],
    balanced: [
      { time: '07:30', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '07:45', category: 'habit', title: 'Яркий свет 10 мин (выйти на улицу или лампа 10000 лк)', description: 'Синхронизация циркадного ритма', expectedImpact: { energy: 5, sleep: 4 } },
      { time: '08:00', category: 'supplement', title: 'Vit D3 5000 МЕ + Omega-3 2 г', description: 'Утром — регуляция циркадного ритма', expectedImpact: { sleep: 3, recovery: 2 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: яйца 3 шт + авокадо 80 г + цельнозерновой тост', description: '~450 ккал · холин для ацетилхолина', expectedImpact: { nutrition: 8, energy: 6 } },
      { time: '13:00', category: 'meal', title: 'Обед: индейка 160 г + гречка 90 г + овощи', description: '~450 ккал · высокий триптофан → серотонин', expectedImpact: { nutrition: 8, sleep: 3 } },
      { time: '14:00', category: 'habit', title: 'Последний кофе (полувыведение 6ч)', expectedImpact: { sleep: 6 } },
      { time: '16:00', category: 'movement', title: 'Умеренная прогулка 25 мин', tokenIds: ['walk'], durationMin: 25, expectedImpact: { energy: 5, sleep: 4 } },
      { time: '18:30', category: 'meal', title: 'Ужин: лосось 150 г + батат 120 г + листовые овощи', description: '~420 ккал · Omega-3 + сложные углеводы', expectedImpact: { nutrition: 9, sleep: 5 } },
      { time: '20:30', category: 'supplement', title: 'Mg глицинат 400 мг + L-теанин 200 мг', description: 'За 2 часа до сна', expectedImpact: { sleep: 7, recovery: 4 } },
      { time: '21:30', category: 'rest', title: 'Медитация или растяжка 15 мин', tokenIds: ['meditation', 'stretch'], expectedImpact: { sleep: 7, recovery: 5 } },
      { time: '22:30', category: 'sleep', title: 'Сон 8 часов (t° 18–19°C)', tokenIds: ['sleep'], expectedImpact: { sleep: 16, recovery: 12 } },
    ],
    intense: [
      { time: '07:30', category: 'habit', title: 'Утренний свет немедленно: 10 мин на улице без очков', description: 'Запуск кортизолового пика — якорь циркадного ритма', expectedImpact: { energy: 6, sleep: 5 } },
      { time: '07:45', category: 'supplement', title: 'Vit D3 10000 МЕ + Omega-3 3 г + Vit C 1000 мг', expectedImpact: { recovery: 3, sleep: 3 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: индейка 160 г + яйца 2 шт + авокадо 100 г', description: '~520 ккал · максимум триптофана', expectedImpact: { nutrition: 9, energy: 7 } },
      { time: '10:00', category: 'movement', title: 'Кардио 30 мин зона 2 (не позднее обеда)', tokenIds: ['cardio'], durationMin: 30, expectedImpact: { energy: 7, sleep: 5 } },
      { time: '13:00', category: 'meal', title: 'Обед: лосось 170 г + гречка 100 г + шпинат 150 г', description: '~500 ккал · Omega-3 + триптофан', expectedImpact: { nutrition: 10, sleep: 4 } },
      { time: '14:00', category: 'habit', title: 'Последний кофе (обязательно!)', expectedImpact: { sleep: 7 } },
      { time: '15:30', category: 'rest', title: 'NSDR 20 мин или йога нидра', description: 'Нейро-протокол восстановления — заменяет сон', tokenIds: ['rest'], expectedImpact: { sleep: 8, recovery: 7 } },
      { time: '18:30', category: 'meal', title: 'Ужин: индейка 160 г + батат 150 г + зелёный горошек', description: 'Углеводы вечером → всасывание триптофана в мозг', expectedImpact: { nutrition: 10, sleep: 6 } },
      { time: '20:00', category: 'supplement', title: 'Mg L-треонат 2000 мг + Глицин 3 г + L-теанин 400 мг + ГАМК 750 мг', description: 'Нейроуспокоение, снижение температуры тела', expectedImpact: { sleep: 10, recovery: 6 } },
      { time: '21:00', category: 'supplement', title: 'Ашваганда KSM-66 600 мг + Триптофан 500 мг', description: 'Финальный анксиолитический стек', expectedImpact: { sleep: 7, recovery: 5 } },
      { time: '21:45', category: 'supplement', title: 'Мелатонин 0.3 мг (НЕ 10 мг!)', description: 'Физиологическая доза — не передозировка', expectedImpact: { sleep: 6 } },
      { time: '22:30', category: 'sleep', title: 'Сон 8–9 часов', tokenIds: ['sleep'], expectedImpact: { sleep: 18, recovery: 14 } },
    ],
  },

  // ─── ENERGY ──────────────────────────────────────────────────
  energy: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода натощак 400 мл', tokenIds: ['water'], expectedImpact: { energy: 4 } },
      { time: '07:30', category: 'movement', title: 'Зарядка 10 мин (суставная гимнастика)', tokenIds: ['morning_charge'], durationMin: 10, expectedImpact: { energy: 6 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: яйца 3 шт + цельнозерновой хлеб 2 куска + помидор', description: '~400 ккал · белок 24 г · сложные углеводы', expectedImpact: { energy: 8, nutrition: 7 } },
      { time: '09:00', category: 'habit', title: 'Кофе только после еды', expectedImpact: { energy: 3 } },
      { time: '10:30', category: 'hydration', title: 'Вода 300 мл', tokenIds: ['water'] },
      { time: '12:30', category: 'meal', title: 'Обед: куриная грудка 160 г + бурый рис 90 г + овощи', description: '~480 ккал · устойчивая энергия без пиков глюкозы', expectedImpact: { energy: 9, nutrition: 8 } },
      { time: '15:30', category: 'movement', title: 'Прогулка 15 мин', tokenIds: ['walk'], durationMin: 15, expectedImpact: { energy: 5 } },
      { time: '19:00', category: 'meal', title: 'Ужин: рыба 140 г + тушёные овощи 200 г', description: '~320 ккал · лёгкий для восстановления', expectedImpact: { nutrition: 7, energy: 4 } },
      { time: '22:30', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { energy: 12, recovery: 10 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'], expectedImpact: { energy: 4 } },
      { time: '07:15', category: 'supplement', title: 'CoQ10 (убихинол) 200 мг + B-комплекс', description: 'Натощак — митохондриальная поддержка', expectedImpact: { energy: 6 } },
      { time: '07:30', category: 'movement', title: 'Кардио 25 мин (бег/вело ЧСС 120–140)', tokenIds: ['cardio'], durationMin: 25, expectedImpact: { energy: 9, recovery: 5 } },
      { time: '08:30', category: 'supplement', title: 'Vit D3 5000 МЕ + Omega-3 2 г + Mg малат 400 мг', description: 'С завтраком', expectedImpact: { energy: 5, recovery: 3 } },
      { time: '09:00', category: 'meal', title: 'Завтрак: куриное филе 130 г + яйца 2 шт + гречка 80 г + зелень', description: '~510 ккал · белок 50 г · сложные углеводы', expectedImpact: { energy: 10, nutrition: 9 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина 160 г + киноа 100 г + брокколи 150 г', description: '~520 ккал · железо + B12 + белок для митохондрий', expectedImpact: { energy: 9, nutrition: 9 } },
      { time: '15:30', category: 'movement', title: 'Быстрая прогулка 20 мин', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 5 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 150 г + батат 120 г + листовые овощи', description: '~450 ккал · Omega-3 + сложные углеводы', expectedImpact: { nutrition: 9, energy: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5–8 часов', tokenIds: ['sleep'], expectedImpact: { energy: 14, recovery: 11 } },
    ],
    intense: [
      { time: '06:30', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '06:45', category: 'supplement', title: 'NMN 500 мг + CoQ10 400 мг (убихинол) + Mg малат 400 мг', description: 'Натощак — NAD+ прекурсор + митохондриальная цепь', expectedImpact: { energy: 8 } },
      { time: '07:00', category: 'movement', title: 'HIIT 20 мин или бег 30 мин + зарядка', tokenIds: ['hiit', 'run'], durationMin: 30, expectedImpact: { energy: 12, recovery: 6 } },
      { time: '08:00', category: 'supplement', title: 'L-карнитин 2 г + Родиола 400 мг + Ginseng 200 мг', description: 'Транспорт жирных кислот + адаптогены', expectedImpact: { energy: 8 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: говядина 150 г + яйца 3 шт + батат 120 г + шпинат', description: '~580 ккал · белок 56 г · железо + B12 — ключевые для митохондрий', expectedImpact: { nutrition: 10, energy: 9 } },
      { time: '10:30', category: 'supplement', title: 'CoQ10 200 мг (2-я доза) + B-комплекс', expectedImpact: { energy: 5 } },
      { time: '13:00', category: 'meal', title: 'Обед: тунец 170 г + гречка 110 г + руккола 100 г + оливковое масло', description: '~520 ккал · Omega-3 + CoQ10 природный + железо', expectedImpact: { energy: 10, nutrition: 10 } },
      { time: '14:30', category: 'habit', title: 'Холодный душ 2 мин', tokenIds: ['cold_shower'], expectedImpact: { energy: 7, recovery: 4 } },
      { time: '15:30', category: 'movement', title: 'Прогулка 20 мин или растяжка', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 5 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 170 г + киноа 100 г + ферм. овощи 100 г', description: '~540 ккал · Omega-3 + CoQ10 природный', expectedImpact: { nutrition: 10, energy: 6 } },
      { time: '21:30', category: 'supplement', title: 'Mg L-треонат 1000 мг + L-теанин 200 мг', description: 'Снизить кортизол для восстановительного сна', expectedImpact: { sleep: 5, recovery: 4 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5–8 часов (митохондриальный ремонт)', tokenIds: ['sleep'], expectedImpact: { energy: 16, recovery: 12 } },
    ],
  },

  // ─── FOCUS ───────────────────────────────────────────────────
  focus: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода натощак 400 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'movement', title: 'Зарядка 10 мин', tokenIds: ['morning_charge'], durationMin: 10, expectedImpact: { energy: 6 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: яйца 3 шт + авокадо 80 г + цельнозерновой хлеб', description: '~450 ккал · холин → ацетилхолин', expectedImpact: { energy: 8, nutrition: 7 } },
      { time: '09:00', category: 'habit', title: 'Блок глубокой работы 90 мин (без уведомлений)', expectedImpact: { readiness: 8 } },
      { time: '10:30', category: 'hydration', title: 'Вода 300 мл', tokenIds: ['water'] },
      { time: '12:30', category: 'meal', title: 'Обед: лосось 150 г + гречка 90 г + зелёный салат', description: '~480 ккал · Omega-3 DHA для нейронов', expectedImpact: { nutrition: 8 } },
      { time: '15:30', category: 'movement', title: 'Прогулка 15 мин', tokenIds: ['walk'], durationMin: 15, expectedImpact: { energy: 5 } },
      { time: '19:00', category: 'meal', title: 'Ужин: индейка 150 г + овощи 200 г', description: '~350 ккал · лёгкий для мозга', expectedImpact: { nutrition: 7 } },
      { time: '22:30', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { energy: 10, recovery: 10 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '07:15', category: 'supplement', title: 'Omega-3 3 г (DHA/EPA) + Vit D3 5000 МЕ', description: 'DHA — основной строительный материал нейронов', expectedImpact: { energy: 4 } },
      { time: '07:30', category: 'movement', title: 'Кардио 20 мин (BDNF-нейрогенез)', tokenIds: ['cardio'], durationMin: 20, expectedImpact: { energy: 8 } },
      { time: '08:30', category: 'supplement', title: 'Alpha GPC 300 мг + Бакопа 300 мг', description: 'Alpha GPC → ацетилхолин; Бакопа — долгосрочная память', expectedImpact: { energy: 5 } },
      { time: '09:00', category: 'meal', title: 'Завтрак: яйца 3 шт + лосось 100 г + авокадо 80 г', description: '~520 ккал · холин + DHA + омега-9', expectedImpact: { nutrition: 9, energy: 7 } },
      { time: '13:00', category: 'meal', title: 'Обед: скумбрия 160 г + чечевица 120 г + шпинат', description: '~500 ккал · DHA + фолаты + B12', expectedImpact: { nutrition: 9 } },
      { time: '15:00', category: 'supplement', title: 'Mg L-треонат 500 мг + L-теанин 200 мг', description: 'Дневной стек для спокойного фокуса', expectedImpact: { energy: 5 } },
      { time: '16:00', category: 'movement', title: 'Прогулка 20 мин', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 5 } },
      { time: '19:00', category: 'meal', title: 'Ужин: индейка 150 г + гречка 90 г + зелень', description: '~430 ккал · триптофан для ночного восстановления мозга', expectedImpact: { nutrition: 8, sleep: 3 } },
      { time: '22:30', category: 'sleep', title: 'Сон 7.5 часов (консолидация памяти)', tokenIds: ['sleep'], expectedImpact: { energy: 12, recovery: 11 } },
    ],
    intense: [
      { time: '06:30', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '06:45', category: 'supplement', title: "Alpha GPC 600 мг + Omega-3 3 г (DHA)", description: 'Натощак — пик ацетилхолина через 60 мин', expectedImpact: { energy: 7 } },
      { time: '07:00', category: 'movement', title: 'Кардио 25 мин (BDNF-протокол: ЧСС 130–150)', tokenIds: ['cardio'], durationMin: 25, expectedImpact: { energy: 10 } },
      { time: '08:00', category: 'supplement', title: "Lion's Mane 1000 мг + Бакопа 300 мг + Фосфатидилсерин 400 мг", description: 'NGF-нейророст + долгосрочная память + контроль кортизола', expectedImpact: { energy: 6, recovery: 4 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: яйца 4 шт + лосось 120 г + авокадо 100 г + шпинат', description: '~600 ккал · максимум холина + DHA + лютеин', expectedImpact: { nutrition: 10, energy: 8 } },
      { time: '09:30', category: 'habit', title: 'Блок глубокой работы 2 часа (нет телефона)', expectedImpact: { readiness: 10 } },
      { time: '11:30', category: 'supplement', title: 'Mg L-треонат 1000 мг + L-теанин 400 мг + Родиола 400 мг', description: 'Пик концентрации без тревоги', expectedImpact: { energy: 7 } },
      { time: '13:00', category: 'meal', title: 'Обед: тунец 170 г + чечевица 120 г + листовые 200 г + льняное масло', description: '~550 ккал · Omega-3 + фолаты + B9/B12', expectedImpact: { nutrition: 10 } },
      { time: '14:00', category: 'rest', title: 'NSDR 20 мин (консолидация)', tokenIds: ['rest'], expectedImpact: { recovery: 8, energy: 6 } },
      { time: '16:00', category: 'movement', title: 'Прогулка 25 мин', tokenIds: ['walk'], durationMin: 25, expectedImpact: { energy: 5 } },
      { time: '17:00', category: 'supplement', title: "Lion's Mane 500 мг (вторая доза)", expectedImpact: { energy: 3 } },
      { time: '19:00', category: 'meal', title: 'Обед: скумбрия 160 г + гречка 100 г + ферм. капуста 100 г', description: '~490 ккал · DHA + B12 + пробиотики (ось кишечник–мозг)', expectedImpact: { nutrition: 10, sleep: 3 } },
      { time: '20:30', category: 'supplement', title: 'Mg L-треонат 1000 мг + Глицин 3 г + Ashwagandha KSM-66 300 мг', expectedImpact: { sleep: 7, recovery: 5 } },
      { time: '22:30', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { energy: 14, recovery: 12 } },
    ],
  },

  // ─── CALM ────────────────────────────────────────────────────
  calm: {
    gentle: [
      { time: '07:30', category: 'rest', title: 'Медитация 10 мин (дыхание 4–7–8)', tokenIds: ['meditation'], durationMin: 10, expectedImpact: { recovery: 7 } },
      { time: '08:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '08:30', category: 'meal', title: 'Завтрак: овсянка 80 г + банан + миндальное масло 1 ст.л.', description: '~380 ккал · магний + комплекс B', expectedImpact: { energy: 6, recovery: 4 } },
      { time: '12:30', category: 'meal', title: 'Обед: индейка 150 г + рис 90 г + тушёные овощи', description: 'Триптофан — предшественник серотонина', expectedImpact: { nutrition: 7, recovery: 3 } },
      { time: '15:00', category: 'movement', title: 'Прогулка без телефона 20 мин', tokenIds: ['walk'], durationMin: 20, expectedImpact: { recovery: 8 } },
      { time: '17:00', category: 'hydration', title: 'Травяной чай (ромашка, мелисса)', tokenIds: ['water'] },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 140 г + батат 100 г + шпинат', expectedImpact: { nutrition: 7, sleep: 3 } },
      { time: '21:00', category: 'habit', title: 'Без новостей, тихая музыка или природа', expectedImpact: { sleep: 5, recovery: 4 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { sleep: 12, recovery: 10 } },
    ],
    balanced: [
      { time: '07:30', category: 'rest', title: 'Медитация 15 мин (body scan)', tokenIds: ['meditation'], durationMin: 15, expectedImpact: { recovery: 9 } },
      { time: '08:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '08:15', category: 'supplement', title: 'Mg глицинат 400 мг + Omega-3 2 г', description: 'Основа нейрохимии спокойствия', expectedImpact: { recovery: 5, sleep: 3 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: индейка 140 г + яйца 2 шт + авокадо 80 г', description: '~470 ккал · триптофан + холин', expectedImpact: { nutrition: 8, energy: 6 } },
      { time: '12:30', category: 'meal', title: 'Обед: лосось 160 г + гречка 90 г + зелёный салат', expectedImpact: { nutrition: 8 } },
      { time: '14:30', category: 'supplement', title: 'L-теанин 200 мг + Родиола 400 мг', description: 'Спокойная концентрация без тревоги', expectedImpact: { energy: 5, recovery: 4 } },
      { time: '15:30', category: 'movement', title: 'Прогулка 25 мин в тишине', tokenIds: ['walk'], durationMin: 25, expectedImpact: { recovery: 9 } },
      { time: '18:30', category: 'meal', title: 'Ужин: индейка 150 г + батат 120 г + брокколи', expectedImpact: { nutrition: 8, sleep: 4 } },
      { time: '20:30', category: 'supplement', title: 'Mg L-треонат 1000 мг + L-теанин 400 мг + ГАМК 500 мг', description: 'Вечерний антистрессовый стек', expectedImpact: { sleep: 8, recovery: 6 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { sleep: 14, recovery: 11 } },
    ],
    intense: [
      { time: '07:00', category: 'rest', title: 'Медитация 20 мин Vipassana или дыхание Вима Хофа', tokenIds: ['meditation'], durationMin: 20, expectedImpact: { recovery: 12 } },
      { time: '07:30', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '07:45', category: 'supplement', title: 'Ашваганда KSM-66 600 мг + L-теанин 400 мг', description: 'Адаптогенный стек снижения кортизола', expectedImpact: { recovery: 8, sleep: 4 } },
      { time: '08:00', category: 'movement', title: 'Йога 30 мин (Хатха или Инь)', tokenIds: ['yoga'], durationMin: 30, expectedImpact: { recovery: 10, sleep: 5 } },
      { time: '09:00', category: 'supplement', title: 'Mg L-треонат 2000 мг + Фосфатидилсерин 300 мг + Omega-3 3 г', expectedImpact: { recovery: 7 } },
      { time: '09:30', category: 'meal', title: 'Завтрак: индейка 150 г + яйца 2 шт + авокадо 100 г', description: '~500 ккал · максимум триптофана', expectedImpact: { nutrition: 9, energy: 6 } },
      { time: '13:00', category: 'meal', title: 'Обед: лосось 170 г + гречка 100 г + шпинат 200 г', expectedImpact: { nutrition: 9 } },
      { time: '14:30', category: 'supplement', title: 'Родиола 400 мг + Таурин 1000 мг', description: 'Адаптация к стрессу + нейромодуляция', expectedImpact: { energy: 5, recovery: 5 } },
      { time: '16:00', category: 'movement', title: 'Прогулка в природе 30 мин (shinrin-yoku)', tokenIds: ['walk'], durationMin: 30, expectedImpact: { recovery: 12 } },
      { time: '17:00', category: 'rest', title: 'Дыхательная практика 10 мин (coherent breathing 5–5)', tokenIds: ['meditation'], durationMin: 10, expectedImpact: { recovery: 8 } },
      { time: '18:30', category: 'meal', title: 'Ужин: индейка 160 г + батат 130 г + ферм. овощи', expectedImpact: { nutrition: 9, sleep: 5 } },
      { time: '20:30', category: 'supplement', title: 'ГАМК 750 мг + Mg L-треонат 1000 мг + Ашваганда 300 мг', expectedImpact: { sleep: 9, recovery: 7 } },
      { time: '21:00', category: 'habit', title: 'Цифровой детокс до утра', expectedImpact: { sleep: 7, recovery: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { sleep: 16, recovery: 14 } },
    ],
  },

  // ─── LIBIDO ──────────────────────────────────────────────────
  libido: {
    gentle: [
      { time: '07:30', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '08:00', category: 'meal', title: 'Завтрак: яйца 3 шт + тыквенные семена 30 г', description: '~380 ккал · цинк, холин, насыщенные жиры для тестостерона', expectedImpact: { nutrition: 8 } },
      { time: '10:00', category: 'movement', title: 'Силовая тренировка 35 мин', tokenIds: ['strength'], durationMin: 35, expectedImpact: { energy: 7, recovery: 4 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина 170 г + авокадо + брокколи 150 г', description: '~510 ккал · цинк + насыщенные жиры + индол-3-карбинол', expectedImpact: { nutrition: 8 } },
      { time: '17:00', category: 'rest', title: 'Снижение стресса (прогулка или дыхание)', tokenIds: ['walk', 'meditation'], expectedImpact: { recovery: 7 } },
      { time: '19:00', category: 'meal', title: 'Ужин: рыба 150 г + орехи 40 г + зелень', expectedImpact: { nutrition: 7 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов (ключ к тестостерону)', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'movement', title: 'Силовая тренировка 45 мин', tokenIds: ['strength'], durationMin: 45, expectedImpact: { energy: 8, recovery: 5 } },
      { time: '08:30', category: 'supplement', title: 'Цинк 50 мг + Бор 10 мг + Vit D3 5000 МЕ', description: 'Главные нутриенты для синтеза тестостерона', expectedImpact: { energy: 5 } },
      { time: '09:00', category: 'meal', title: 'Завтрак: яйца 4 шт + авокадо 100 г + говядина 100 г', description: '~580 ккал · максимум нутриентов для гормонов', expectedImpact: { nutrition: 9, energy: 7 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина 180 г + батат 130 г + брокколи + семена кунжута', description: '~560 ккал · цинк + B6 + индол-3-карбинол', expectedImpact: { nutrition: 9 } },
      { time: '16:00', category: 'supplement', title: 'Maca 4000 мг + L-аргинин 5 г + L-цитруллин 3 г', description: 'Оксид азота + адаптогенная поддержка', expectedImpact: { energy: 6 } },
      { time: '16:30', category: 'movement', title: 'Прогулка 20 мин', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 4 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 160 г + орехи 40 г + зелёный салат', expectedImpact: { nutrition: 8 } },
      { time: '21:30', category: 'supplement', title: 'ZMA (Zn 30 мг + Mg 450 мг + B6) + Omega-3 2 г', expectedImpact: { sleep: 5, recovery: 4 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    intense: [
      { time: '06:30', category: 'supplement', title: 'DAA (D-аспарагиновая к-та) 3 г + Цинк 50 мг + Бор 10 мг', description: 'Натощак — стимуляция ЛГ и синтеза тестостерона', expectedImpact: { energy: 6 } },
      { time: '07:00', category: 'movement', title: 'Тяжёлая силовая 55 мин (приседания/становая/жим)', tokenIds: ['strength'], durationMin: 55, expectedImpact: { energy: 10, recovery: 6 } },
      { time: '08:00', category: 'supplement', title: 'Shilajit 500 мг + Maca 4000 мг + Vit D3 10000 МЕ', description: 'Фулвовая кислота + фитоадаптогены → стероидогенез', expectedImpact: { energy: 7, recovery: 5 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: яйца 4 шт + говядина 150 г + авокадо 120 г', description: '~640 ккал · холестерол → тестостерон + цинк + B12', expectedImpact: { nutrition: 10, energy: 8 } },
      { time: '11:00', category: 'supplement', title: 'Трибулус 750 мг + L-аргинин 5 г + L-цитруллин 3 г', description: 'Сапонины LH-стимуляция + NO для сосудов', expectedImpact: { energy: 6 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина 200 г + батат 150 г + брокколи + кунжут', description: '~620 ккал · цинк + индол-3-карбинол (детокс эстрогенов)', expectedImpact: { nutrition: 10 } },
      { time: '15:00', category: 'supplement', title: 'Maca 2000 мг (2-я доза) + Ашваганда KSM-66 600 мг', description: 'Кортизол вниз → тестостерон вверх', expectedImpact: { recovery: 6 } },
      { time: '16:00', category: 'movement', title: 'Прогулка 20 мин + растяжка', tokenIds: ['walk'], durationMin: 25, expectedImpact: { energy: 4 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 180 г + грецкие орехи 50 г + шпинат + тыквенные семена', description: '~560 ккал · Omega-3 + цинк природный', expectedImpact: { nutrition: 10 } },
      { time: '21:00', category: 'supplement', title: 'ZMA полный стек + Mg L-треонат 1000 мг', expectedImpact: { sleep: 7, recovery: 6 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8–9 часов (90% тестостерона вырабатывается ночью)', tokenIds: ['sleep'], expectedImpact: { recovery: 16, sleep: 14 } },
    ],
  },

  // ─── FLEXIBILITY ─────────────────────────────────────────────
  flexibility: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'movement', title: 'Утренняя растяжка 15 мин (суставы + позвоночник)', tokenIds: ['stretch'], durationMin: 15, expectedImpact: { recovery: 8 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: творог 150 г + ягоды 100 г + льняное масло 1 ч.л.', description: '~300 ккал · коллаген-поддерживающий рацион', expectedImpact: { nutrition: 7 } },
      { time: '12:30', category: 'meal', title: 'Обед: лосось 150 г + зелёные овощи 200 г + оливковое масло', description: '~420 ккал · Omega-3 антивоспалительный', expectedImpact: { nutrition: 8 } },
      { time: '15:00', category: 'movement', title: 'Йога 20 мин или подвижность суставов', tokenIds: ['yoga', 'stretch'], durationMin: 20, expectedImpact: { recovery: 9 } },
      { time: '18:00', category: 'meal', title: 'Ужин: рыба 130 г + батат 100 г + зелень', expectedImpact: { nutrition: 7 } },
      { time: '21:00', category: 'movement', title: 'Вечерняя растяжка 10 мин', tokenIds: ['stretch'], durationMin: 10, expectedImpact: { recovery: 5, sleep: 3 } },
      { time: '22:30', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 12 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'movement', title: 'Динамическая растяжка 20 мин', tokenIds: ['stretch'], durationMin: 20, expectedImpact: { recovery: 9 } },
      { time: '08:00', category: 'supplement', title: 'Коллаген 20 г + Vit C 1000 мг', description: 'За 20–30 мин до тренировки — стимуляция синтеза коллагена', expectedImpact: { recovery: 6 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: яйца 3 шт + авокадо 80 г + костный бульон 200 мл', description: '~420 ккал · пролин + глицин — аминокислоты коллагена', expectedImpact: { nutrition: 8, recovery: 4 } },
      { time: '10:00', category: 'movement', title: 'Хатха-йога или стретчинг 40 мин', tokenIds: ['yoga', 'stretch'], durationMin: 40, expectedImpact: { recovery: 12 } },
      { time: '12:30', category: 'supplement', title: 'MSM 3 г + Omega-3 3 г + Vit D3 5000 МЕ', description: 'Антивоспалительный стек для суставов', expectedImpact: { recovery: 7 } },
      { time: '13:00', category: 'meal', title: 'Обед: лосось 170 г + гречка 90 г + брокколи 150 г', description: '~510 ккал · Omega-3 + антиоксиданты', expectedImpact: { nutrition: 9 } },
      { time: '16:00', category: 'movement', title: 'Растяжка 15 мин или суставная гимнастика', tokenIds: ['stretch'], durationMin: 15, expectedImpact: { recovery: 6 } },
      { time: '19:00', category: 'meal', title: 'Ужин: индейка 150 г + желатиновый бульон + зелень', description: 'Желатин → глицин+пролин → ночной синтез коллагена', expectedImpact: { nutrition: 8, recovery: 5 } },
      { time: '21:30', category: 'movement', title: 'Вечерняя Инь-йога 15 мин', tokenIds: ['yoga', 'stretch'], durationMin: 15, expectedImpact: { recovery: 7, sleep: 4 } },
      { time: '22:30', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14 } },
    ],
    intense: [
      { time: '06:30', category: 'supplement', title: 'Коллаген 20 г + Vit C 1000 мг (натощак)', description: 'Максимальная биодоступность за 30 мин до нагрузки', expectedImpact: { recovery: 7 } },
      { time: '07:00', category: 'movement', title: 'Йога 45 мин (Аштанга или глубокий стретчинг)', tokenIds: ['yoga', 'stretch'], durationMin: 45, expectedImpact: { recovery: 14 } },
      { time: '08:00', category: 'supplement', title: 'Глюкозамин 1500 мг + Хондроитин 1200 мг + MSM 3 г + Гиалуроновая к-та 200 мг', description: 'Полный суставной стек для регенерации хряща', expectedImpact: { recovery: 8 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: яйца 3 шт + костный бульон 250 мл + авокадо 100 г', description: '~460 ккал · пролин + глицин + коллаген', expectedImpact: { nutrition: 9, recovery: 5 } },
      { time: '10:30', category: 'supplement', title: 'Omega-3 3 г + Босвеллия 400 мг', description: 'Антивоспалительный дуэт — ключ к гибкости', expectedImpact: { recovery: 7 } },
      { time: '11:00', category: 'movement', title: 'Функциональная подвижность 30 мин (FRC, CARS)', tokenIds: ['stretch'], durationMin: 30, expectedImpact: { recovery: 11 } },
      { time: '13:00', category: 'meal', title: 'Обед: лосось 170 г + чечевица 120 г + листовые 200 г + куркума 1 ч.л.', description: '~540 ккал · Omega-3 + куркумин — антивоспаление', expectedImpact: { nutrition: 10 } },
      { time: '15:00', category: 'supplement', title: 'Коллаген 10 г (2-я доза) + Vit C 500 мг', expectedImpact: { recovery: 5 } },
      { time: '16:00', category: 'movement', title: 'Пилатес или растяжка 30 мин', tokenIds: ['stretch', 'yoga'], durationMin: 30, expectedImpact: { recovery: 9 } },
      { time: '19:00', category: 'meal', title: 'Ужин: индейка 160 г + желатиновый суп + батат 100 г', description: '~450 ккал · ночной синтез коллагена', expectedImpact: { nutrition: 9, recovery: 6 } },
      { time: '21:30', category: 'movement', title: 'Инь-йога 20 мин перед сном', tokenIds: ['yoga', 'stretch'], durationMin: 20, expectedImpact: { recovery: 8, sleep: 5 } },
      { time: '21:30', category: 'supplement', title: 'Mg глицинат 400 мг + Глицин 3 г', expectedImpact: { sleep: 5, recovery: 6 } },
      { time: '22:30', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 16 } },
    ],
  },

  // ─── IMMUNITY ────────────────────────────────────────────────
  immunity: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода с имбирём и лимоном 400 мл', tokenIds: ['water'], expectedImpact: { energy: 3 } },
      { time: '07:30', category: 'movement', title: 'Прогулка на свежем воздухе 25 мин', tokenIds: ['walk'], durationMin: 25, expectedImpact: { energy: 6, recovery: 5 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: ягоды 150 г + натуральный йогурт 150 г + грецкие орехи 30 г', description: '~340 ккал · Vit C + пробиотики + цинк', expectedImpact: { nutrition: 9 } },
      { time: '12:30', category: 'meal', title: 'Обед: куриный суп с овощами и зеленью 400 мл', description: 'Противовоспалительный + коллаген + цинк', expectedImpact: { nutrition: 8 } },
      { time: '15:00', category: 'hydration', title: 'Травяной чай (эхинацея или бузина)', tokenIds: ['water'] },
      { time: '16:00', category: 'rest', title: 'Снижение стресса — дыхание 5 мин', tokenIds: ['meditation'], expectedImpact: { recovery: 5 } },
      { time: '19:00', category: 'meal', title: 'Ужин: рыба 140 г + тушёные овощи с куркумой 200 г', expectedImpact: { nutrition: 8 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    balanced: [
      { time: '07:00', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'supplement', title: 'Vit C 2000 мг + Vit D3 5000 МЕ + Omega-3 2 г', description: 'Базовый иммунный стек утром', expectedImpact: { recovery: 6 } },
      { time: '07:45', category: 'movement', title: 'Умеренная прогулка 30 мин', tokenIds: ['walk'], durationMin: 30, expectedImpact: { energy: 6, recovery: 5 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: ягоды 200 г + яйца 2 шт + натуральный йогурт 200 г', description: '~380 ккал · антиоксиданты + пробиотики', expectedImpact: { nutrition: 9 } },
      { time: '12:30', category: 'meal', title: 'Обед: куриная грудка 160 г + чечевица 120 г + листовые 200 г', description: '~470 ккал · цинк + белок + фолаты', expectedImpact: { nutrition: 9 } },
      { time: '15:00', category: 'supplement', title: 'Цинк 30 мг + Quercetin 500 мг', description: 'Дневной иммунный контроль', expectedImpact: { recovery: 5 } },
      { time: '16:00', category: 'rest', title: 'Дыхательная практика 10 мин', tokenIds: ['meditation'], expectedImpact: { recovery: 6 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 150 г + ферм. капуста 100 г + батат 100 г', description: 'Ферментированные продукты = микробиом = иммунитет', expectedImpact: { nutrition: 9 } },
      { time: '21:30', category: 'supplement', title: 'Mg глицинат 400 мг + Elderberry 600 мг', expectedImpact: { sleep: 4, recovery: 4 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    intense: [
      { time: '06:30', category: 'habit', title: 'Холодный душ 3 мин + контрастный', tokenIds: ['cold_shower'], expectedImpact: { energy: 6, recovery: 5 } },
      { time: '07:00', category: 'supplement', title: 'Глутатион 500 мг + Vit C 2000 мг (натощак)', description: 'Мастер-антиоксидант + регенерация аскорбата', expectedImpact: { recovery: 8 } },
      { time: '07:30', category: 'supplement', title: 'Vit D3 10000 МЕ + Vit K2 200 мкг + Omega-3 3 г', description: 'С жиром после завтрака', expectedImpact: { recovery: 7 } },
      { time: '07:45', category: 'movement', title: 'Умеренное кардио 30 мин (зона 2)', tokenIds: ['cardio'], durationMin: 30, expectedImpact: { energy: 7, recovery: 6 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: ягоды 200 г + кефир 200 мл + яйца 2 шт + грецкие орехи 30 г', description: '~420 ккал · антиоксиданты + пробиотики + цинк', expectedImpact: { nutrition: 10 } },
      { time: '10:30', category: 'supplement', title: "Lion's Mane 600 мг + Reishi 600 мг + Astragalus 500 мг", description: 'Иммуномодулирующие грибы + астрагал (NK-клетки)', expectedImpact: { recovery: 8 } },
      { time: '13:00', category: 'meal', title: 'Обед: куриный бульон 300 мл + скумбрия 160 г + зелёные овощи 200 г', expectedImpact: { nutrition: 10 } },
      { time: '14:30', category: 'supplement', title: 'Quercetin 500 мг + Цинк 30 мг + Медь 2 мг', description: 'Цинк+медь в балансе — иммунные клетки', expectedImpact: { recovery: 6 } },
      { time: '16:00', category: 'rest', title: 'Медитация 15 мин (иммунный эффект)', tokenIds: ['meditation'], expectedImpact: { recovery: 8 } },
      { time: '19:00', category: 'meal', title: 'Ужин: лосось 170 г + ферм. капуста 150 г + тыква 150 г', description: 'Пробиотики + антиоксиданты + каротиноиды', expectedImpact: { nutrition: 10 } },
      { time: '19:30', category: 'supplement', title: 'Elderberry 600 мг + Пробиотики 50 млрд КОЕ', description: 'Ось кишечник–иммунитет', expectedImpact: { recovery: 6 } },
      { time: '21:30', category: 'supplement', title: 'Mg L-треонат 2000 мг + Глутатион 250 мг', expectedImpact: { sleep: 6, recovery: 7 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 16, sleep: 14 } },
    ],
  },

  // ─── RECOVERY / fallback ─────────────────────────────────────
  recovery: {
    gentle: [
      { time: '07:30', category: 'hydration', title: 'Вода с лимоном 400 мл', tokenIds: ['water'], expectedImpact: { recovery: 4 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: творог 150 г + банан + мёд 1 ч.л.', expectedImpact: { recovery: 5, energy: 5 } },
      { time: '10:00', category: 'movement', title: 'Лёгкая растяжка 15 мин', tokenIds: ['stretch'], durationMin: 15, expectedImpact: { recovery: 7 } },
      { time: '12:30', category: 'meal', title: 'Обед: куриный суп 350 мл + гречка 80 г', expectedImpact: { recovery: 7, nutrition: 6 } },
      { time: '15:30', category: 'rest', title: 'Отдых 20 мин', tokenIds: ['rest'], expectedImpact: { recovery: 7 } },
      { time: '19:00', category: 'meal', title: 'Лёгкий ужин: рыба 130 г + тушёные овощи', expectedImpact: { nutrition: 6 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8+ часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 10 } },
    ],
    balanced: [
      { time: '07:30', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '07:45', category: 'supplement', title: 'Omega-3 3 г + Vit D3 5000 МЕ + Vit C 1000 мг', expectedImpact: { recovery: 6 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: яйца 3 шт + авокадо 80 г + овсянка 60 г', expectedImpact: { nutrition: 8, recovery: 5 } },
      { time: '10:00', category: 'movement', title: 'Плавание или йога 30 мин', tokenIds: ['yoga', 'stretch'], durationMin: 30, expectedImpact: { recovery: 10 } },
      { time: '13:00', category: 'meal', title: 'Обед: лосось 160 г + гречка 90 г + листовые овощи', expectedImpact: { nutrition: 9 } },
      { time: '15:00', category: 'supplement', title: 'Mg глицинат 400 мг + L-теанин 200 мг', expectedImpact: { recovery: 6, sleep: 3 } },
      { time: '16:00', category: 'rest', title: 'Отдых 20 мин или медитация', tokenIds: ['meditation'], expectedImpact: { recovery: 8 } },
      { time: '19:00', category: 'meal', title: 'Ужин: индейка 150 г + батат 100 г', expectedImpact: { nutrition: 8, recovery: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8+ часов', tokenIds: ['sleep'], expectedImpact: { recovery: 14, sleep: 12 } },
    ],
    intense: [
      { time: '07:00', category: 'hydration', title: 'Вода 500 мл + электролиты', tokenIds: ['water'] },
      { time: '07:15', category: 'supplement', title: 'NMN 500 мг + CoQ10 400 мг + Omega-3 3 г', expectedImpact: { energy: 5, recovery: 6 } },
      { time: '07:30', category: 'movement', title: 'Мягкое кардио 20 мин зона 1 (ЧСС < 120)', tokenIds: ['cardio'], durationMin: 20, expectedImpact: { recovery: 7 } },
      { time: '08:30', category: 'meal', title: 'Завтрак: лосось 160 г + яйца 3 шт + авокадо 100 г', expectedImpact: { nutrition: 10, recovery: 7 } },
      { time: '10:00', category: 'habit', title: 'Красный свет 10 мин (фотобиомодуляция)', expectedImpact: { energy: 5, recovery: 6 } },
      { time: '13:00', category: 'meal', title: 'Обед: говядина 170 г + батат 130 г + брокколи 150 г', expectedImpact: { nutrition: 10 } },
      { time: '14:30', category: 'rest', title: 'NSDR 20 мин', tokenIds: ['rest'], expectedImpact: { recovery: 9 } },
      { time: '19:00', category: 'meal', title: 'Ужин: индейка 160 г + желатиновый бульон + зелень', expectedImpact: { nutrition: 9, recovery: 7 } },
      { time: '20:30', category: 'supplement', title: 'Mg L-треонат 2000 мг + Ашваганда 600 мг + Глицин 3 г', expectedImpact: { sleep: 9, recovery: 8 } },
      { time: '22:00', category: 'sleep', title: 'Сон 9 часов', tokenIds: ['sleep'], expectedImpact: { recovery: 18, sleep: 14 } },
    ],
  },

  // ─── PERFORMANCE (legacy) ────────────────────────────────────
  performance: {
    gentle: [
      { time: '07:00', category: 'hydration', title: 'Вода 400 мл', tokenIds: ['water'] },
      { time: '07:30', category: 'movement', title: 'Зарядка 15 мин', tokenIds: ['morning_charge'], durationMin: 15, expectedImpact: { energy: 7 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: яйца 3 шт + рис 80 г + помидор', expectedImpact: { energy: 8, nutrition: 7 } },
      { time: '12:00', category: 'meal', title: 'Обед: курица 170 г + гречка 100 г + овощи', expectedImpact: { energy: 8, nutrition: 8 } },
      { time: '15:30', category: 'movement', title: 'Прогулка 20 мин', tokenIds: ['walk'], durationMin: 20, expectedImpact: { energy: 5 } },
      { time: '18:30', category: 'meal', title: 'Ужин: рыба 150 г + батат 100 г', expectedImpact: { nutrition: 7 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { energy: 10, recovery: 10 } },
    ],
    balanced: [
      { time: '06:30', category: 'movement', title: 'Кардио 25 мин', tokenIds: ['cardio'], durationMin: 25, expectedImpact: { energy: 9 } },
      { time: '07:30', category: 'hydration', title: 'Вода 500 мл', tokenIds: ['water'] },
      { time: '07:45', category: 'supplement', title: 'CoQ10 200 мг + Vit D3 5000 МЕ + Omega-3 2 г', expectedImpact: { energy: 5, recovery: 3 } },
      { time: '08:00', category: 'meal', title: 'Завтрак: говядина 150 г + яйца 2 шт + гречка 80 г', expectedImpact: { energy: 9, nutrition: 8 } },
      { time: '12:00', category: 'meal', title: 'Обед: курица 180 г + рис 100 г + брокколи', expectedImpact: { energy: 8, nutrition: 8 } },
      { time: '16:00', category: 'movement', title: 'Силовая тренировка 45 мин', tokenIds: ['strength'], durationMin: 45, expectedImpact: { energy: 7, recovery: 5 } },
      { time: '18:30', category: 'meal', title: 'Ужин: лосось 160 г + батат 120 г', expectedImpact: { nutrition: 8, recovery: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 7.5 часов', tokenIds: ['sleep'], expectedImpact: { energy: 12, recovery: 10 } },
    ],
    intense: [
      { time: '06:00', category: 'movement', title: 'HIIT 25 мин + зарядка', tokenIds: ['hiit'], durationMin: 25, expectedImpact: { energy: 12 } },
      { time: '07:00', category: 'supplement', title: 'Креатин 5 г + CoQ10 400 мг + NMN 500 мг', expectedImpact: { energy: 8 } },
      { time: '07:30', category: 'meal', title: 'Завтрак: говядина 160 г + яйца 3 шт + рис 100 г', expectedImpact: { energy: 10, nutrition: 9 } },
      { time: '12:00', category: 'meal', title: 'Обед: тунец 180 г + гречка 110 г + зелень', expectedImpact: { energy: 9, nutrition: 10 } },
      { time: '15:30', category: 'movement', title: 'Силовая тренировка 60 мин', tokenIds: ['strength'], durationMin: 60, expectedImpact: { energy: 9, recovery: 6 } },
      { time: '17:00', category: 'supplement', title: 'Whey 35 г + Родиола 400 мг', expectedImpact: { recovery: 6, energy: 5 } },
      { time: '18:30', category: 'meal', title: 'Ужин: лосось 180 г + картофель 130 г + брокколи', expectedImpact: { nutrition: 10, recovery: 6 } },
      { time: '21:00', category: 'supplement', title: 'Казеин 40 г + ZMA', expectedImpact: { recovery: 8, sleep: 5 } },
      { time: '22:00', category: 'sleep', title: 'Сон 8 часов', tokenIds: ['sleep'], expectedImpact: { energy: 14, recovery: 12 } },
    ],
  },
};

// ─── Time-shift helpers ───────────────────────────────────────
function shiftTime(time: string, offsetHours: number): string {
  if (offsetHours === 0) return time;
  const [h, m] = time.split(':').map(Number);
  const shifted = Math.min(Math.max(h + offsetHours, 0), 23);
  return `${String(shifted).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function applyTimeShift(items: CourseItemTemplate[], wakeHour: number): CourseItemTemplate[] {
  const offset = wakeHour - 7;
  if (offset === 0) return items;
  return items.map((item) => ({ ...item, time: shiftTime(item.time, offset) }));
}

// ─── Build DailyBlueprint list from template ─────────────────
function makeDays(items: CourseItemTemplate[], count: number): DailyBlueprint[] {
  return Array.from({ length: count }, (_, i) => ({
    dayIndex: i + 1,
    items: items.map((item, j) => ({ ...item, id: `fb-d${i + 1}-${j}` })),
  }));
}

// ─── Public API ──────────────────────────────────────────────
export function generateFallbackPlans(
  course: string,
  durationDays = 14,
  wakeHour = 7,
): IntensivePlan[] {
  const name = COURSE_NAMES[course] ?? course;
  const tiers = COURSE_TIERS[course] ?? COURSE_TIERS['recovery'];
  const now = new Date().toISOString();

  const build = (effort: IntensiveEffort): DailyBlueprint[] =>
    makeDays(applyTimeShift(tiers[effort], wakeHour), durationDays);

  return [
    {
      id: crypto.randomUUID(),
      effort: 'gentle',
      title: `Мягкий старт · ${name}`,
      oneLineWhy: 'Минимальные изменения — максимальная вероятность соблюдать каждый день',
      badge: '🌱',
      tags: ['мягко', `${durationDays} дней`, 'без стресса', 'стабильность'],
      course,
      durationDays,
      expectedDelta: { energy: 6, sleep: 4, readiness: 9 },
      daily: build('gentle'),
      generatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      effort: 'balanced',
      title: `Баланс · ${name}`,
      oneLineWhy: 'Оптимальное соотношение усилий и результата',
      badge: '⚡',
      tags: ['баланс', `${durationDays} дней`, 'рост', 'устойчиво'],
      course,
      durationDays,
      expectedDelta: { energy: 13, sleep: 9, readiness: 19 },
      daily: build('balanced'),
      generatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      effort: 'intense',
      title: `Биохакер · ${name}`,
      oneLineWhy: 'Продвинутые стеки и протоколы для максимального результата',
      badge: '🔥',
      tags: ['биохакинг', `${durationDays} дней`, 'трансформация', 'максимум'],
      course,
      durationDays,
      expectedDelta: { energy: 24, sleep: 16, readiness: 32 },
      daily: build('intense'),
      generatedAt: now,
    },
  ];
}
