export type BoostaTokenType =
  | 'run' | 'walk' | 'swim' | 'bike' | 'ski'
  | 'morning_charge' | 'cardio' | 'hiit' | 'strength' | 'yoga' | 'stretch'
  | 'water' | 'coffee' | 'alcohol' | 'smoking' | 'medicine'
  | 'sleep' | 'sex' | 'meditation' | 'rest' | 'reading'
  | 'desk' | 'physical_work' | 'media' | 'stress'
  | 'streak_runner' | 'clear' | 'connected' | 'iron_will' | 'zen_master';

export type TokenRarity = 'base' | 'rare' | 'gold' | 'crystal' | 'pair' | 'legendary';
export type TokenGroup = 'movement' | 'sport' | 'substance' | 'life' | 'work' | 'rare';

export interface TokenMeta {
  labelRu: string;
  labelEn: string;
  rarity: TokenRarity;
  group: TokenGroup;
  color: string;
  conditionText: string | null;
}

const MOVEMENT = '#0D9488';
const SPORT = '#0891B2';
const SUBSTANCE = '#1D4ED8';
const LIFE = '#6D28D9';
const WORK = '#475569';

export const boostaTokenMeta: Record<BoostaTokenType, TokenMeta> = {
  run:   { labelRu: 'Бег',       labelEn: 'RUN',  rarity: 'base', group: 'movement', color: MOVEMENT, conditionText: null },
  walk:  { labelRu: 'Ходьба',    labelEn: 'WALK', rarity: 'base', group: 'movement', color: MOVEMENT, conditionText: null },
  swim:  { labelRu: 'Бассейн',   labelEn: 'SWIM', rarity: 'base', group: 'movement', color: MOVEMENT, conditionText: null },
  bike:  { labelRu: 'Велосипед', labelEn: 'BIKE', rarity: 'base', group: 'movement', color: MOVEMENT, conditionText: null },
  ski:   { labelRu: 'Лыжи',      labelEn: 'SKI',  rarity: 'base', group: 'movement', color: MOVEMENT, conditionText: null },

  morning_charge: { labelRu: 'Зарядка',  labelEn: 'CHARGE',  rarity: 'base', group: 'sport', color: SPORT, conditionText: null },
  cardio:         { labelRu: 'Кардио',   labelEn: 'CARDIO',  rarity: 'base', group: 'sport', color: SPORT, conditionText: null },
  hiit:           { labelRu: 'HIIT',     labelEn: 'HIIT',    rarity: 'base', group: 'sport', color: SPORT, conditionText: null },
  strength:       { labelRu: 'Силовая',  labelEn: 'LIFT',    rarity: 'base', group: 'sport', color: SPORT, conditionText: null },
  yoga:           { labelRu: 'Йога',     labelEn: 'YOGA',    rarity: 'base', group: 'sport', color: SPORT, conditionText: null },
  stretch:        { labelRu: 'Растяжка', labelEn: 'STRETCH', rarity: 'base', group: 'sport', color: SPORT, conditionText: null },

  water:    { labelRu: 'Вода',      labelEn: 'WATER',   rarity: 'base', group: 'substance', color: SUBSTANCE, conditionText: null },
  coffee:   { labelRu: 'Кофе',      labelEn: 'COFFEE',  rarity: 'base', group: 'substance', color: SUBSTANCE, conditionText: null },
  alcohol:  { labelRu: 'Алкоголь',  labelEn: 'ALCOHOL', rarity: 'base', group: 'substance', color: SUBSTANCE, conditionText: null },
  smoking:  { labelRu: 'Курение',   labelEn: 'SMOKE',   rarity: 'base', group: 'substance', color: SUBSTANCE, conditionText: null },
  medicine: { labelRu: 'Лекарство', labelEn: 'MED',     rarity: 'base', group: 'substance', color: SUBSTANCE, conditionText: null },

  sleep:      { labelRu: 'Сон',       labelEn: 'SLEEP', rarity: 'base', group: 'life', color: LIFE, conditionText: null },
  sex:        { labelRu: 'Близость',  labelEn: 'LOVE',  rarity: 'base', group: 'life', color: LIFE, conditionText: null },
  meditation: { labelRu: 'Медитация', labelEn: 'ZEN',   rarity: 'base', group: 'life', color: LIFE, conditionText: null },
  rest:       { labelRu: 'Отдых',     labelEn: 'REST',  rarity: 'base', group: 'life', color: LIFE, conditionText: null },
  reading:    { labelRu: 'Чтение',    labelEn: 'READ',  rarity: 'base', group: 'life', color: LIFE, conditionText: null },

  desk:          { labelRu: 'Компьютер', labelEn: 'DESK',   rarity: 'base', group: 'work', color: WORK, conditionText: null },
  physical_work: { labelRu: 'Физработа', labelEn: 'WORK',   rarity: 'base', group: 'work', color: WORK, conditionText: null },
  media:         { labelRu: 'Медиа',     labelEn: 'MEDIA',  rarity: 'base', group: 'work', color: WORK, conditionText: null },
  stress:        { labelRu: 'Стресс',    labelEn: 'STRESS', rarity: 'base', group: 'work', color: WORK, conditionText: null },

  streak_runner: { labelRu: 'Streak Runner', labelEn: 'STREAK', rarity: 'gold',    group: 'rare', color: '#B45309',                 conditionText: '7 дней бега подряд' },
  clear:         { labelRu: 'Clear',         labelEn: 'CLEAR',  rarity: 'crystal', group: 'rare', color: 'rgba(109,40,217,0.15)',   conditionText: '30 дней без алкоголя' },
  connected:     { labelRu: 'Connected',     labelEn: 'PAIR',   rarity: 'pair',    group: 'rare', color: '#BE185D',                 conditionText: '10 сканов близости, только у пары' },
  iron_will:     { labelRu: 'Iron Will',     labelEn: 'IRON',   rarity: 'rare',    group: 'rare', color: '#1E293B',                 conditionText: '30 силовых тренировок' },
  zen_master:    { labelRu: 'Zen Master',    labelEn: 'ZEN',    rarity: 'rare',    group: 'rare', color: '#134E4A',                 conditionText: '21 день медитации' },
};

export const TOKEN_GROUP_LABELS: Record<TokenGroup, string> = {
  movement: 'Движение и активность',
  sport: 'Спорт и тренировки',
  substance: 'Вещества и привычки',
  life: 'Жизнь и восстановление',
  work: 'Работа и поведение',
  rare: 'Редкие жетоны',
};

export const ALL_BOOSTA_TOKEN_TYPES: BoostaTokenType[] = [
  'run','walk','swim','bike','ski',
  'morning_charge','cardio','hiit','strength','yoga','stretch',
  'water','coffee','alcohol','smoking','medicine',
  'sleep','sex','meditation','rest','reading',
  'desk','physical_work','media','stress',
  'streak_runner','clear','connected','iron_will','zen_master',
];

const HIDDEN_FROM_TOKEN_PICKERS = new Set<BoostaTokenType>(['water']);

export function isSelectableBoostaToken(type: BoostaTokenType): boolean {
  return !HIDDEN_FROM_TOKEN_PICKERS.has(type);
}
