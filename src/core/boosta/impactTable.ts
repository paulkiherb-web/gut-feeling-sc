export const IMPACT_TABLE: Record<string, { real: number; ghost: number; verdict: 'aligned' | 'drift' | 'neutral' }> = {
  'coffee':      { real: +2,  ghost: +1,  verdict: 'neutral' },
  'coffee_3rd':  { real: -4,  ghost: 0,   verdict: 'drift' },
  'wine_glass':  { real: -6,  ghost: -2,  verdict: 'drift' },
  'wine_2nd':    { real: -12, ghost: -4,  verdict: 'drift' },
  'cigarette':   { real: -8,  ghost: -2,  verdict: 'drift' },
  'run_30m':     { real: +12, ghost: +14, verdict: 'aligned' },
  'meditation':  { real: +6,  ghost: +7,  verdict: 'aligned' },
  'late_screen': { real: -5,  ghost: -1,  verdict: 'drift' },
  'good_sleep':  { real: +14, ghost: +14, verdict: 'aligned' },
  'reading':     { real: +2,  ghost: +3,  verdict: 'neutral' },
  'sex':         { real: +4,  ghost: +4,  verdict: 'aligned' },
  // movement
  'Бег':         { real: +12, ghost: +14, verdict: 'aligned' },
  'Велик':       { real: +8,  ghost: +10, verdict: 'aligned' },
  'Лыжи':        { real: +10, ghost: +12, verdict: 'aligned' },
  'Йога':        { real: +6,  ghost: +8,  verdict: 'aligned' },
  // substances
  'Алкоголь':    { real: -8,  ghost: -3,  verdict: 'drift' },
  'Кофеин':      { real: +2,  ghost: +1,  verdict: 'neutral' },
  'Сигарета':    { real: -8,  ghost: -2,  verdict: 'drift' },
  // rest
  'Сон':         { real: +14, ghost: +14, verdict: 'aligned' },
  'Секс':        { real: +4,  ghost: +4,  verdict: 'aligned' },
  'Медитация':   { real: +6,  ghost: +7,  verdict: 'aligned' },
  // stimulation
  'Книга':       { real: +2,  ghost: +3,  verdict: 'neutral' },
  'Игры':        { real: -2,  ghost: -1,  verdict: 'neutral' },
  'Экран':       { real: -5,  ghost: -1,  verdict: 'drift' },
  'Работа':      { real: +1,  ghost: +2,  verdict: 'neutral' },
  // token gallery (boostaTokenMeta.labelRu)
  'Ходьба':      { real: +6,  ghost: +8,  verdict: 'aligned' },
  'Бассейн':     { real: +14, ghost: +16, verdict: 'aligned' },
  'Велосипед':   { real: +10, ghost: +12, verdict: 'aligned' },
  'Зарядка':     { real: +8,  ghost: +10, verdict: 'aligned' },
  'Кардио':      { real: +10, ghost: +12, verdict: 'aligned' },
  'HIIT':        { real: +14, ghost: +16, verdict: 'aligned' },
  'Силовая':     { real: +12, ghost: +14, verdict: 'aligned' },
  'Растяжка':    { real: +6,  ghost: +8,  verdict: 'aligned' },
  'Вода':        { real: +4,  ghost: +5,  verdict: 'aligned' },
  'Кофе':        { real: +3,  ghost: +2,  verdict: 'neutral' },
  'Курение':     { real: -8,  ghost: -2,  verdict: 'drift'   },
  'Лекарство':   { real: +2,  ghost: +2,  verdict: 'neutral' },
  'Близость':    { real: +6,  ghost: +6,  verdict: 'aligned' },
  'Отдых':       { real: +5,  ghost: +6,  verdict: 'aligned' },
  'Чтение':      { real: +3,  ghost: +4,  verdict: 'neutral' },
  'Компьютер':   { real: -3,  ghost: -1,  verdict: 'neutral' },
  'Физработа':   { real: +8,  ghost: +10, verdict: 'aligned' },
  'Медиа':       { real: -2,  ghost: -1,  verdict: 'neutral' },
  'Стресс':      { real: -6,  ghost: -1,  verdict: 'drift'   },
  // rare tokens — neutral defaults
  'Streak Runner': { real: 0, ghost: +2, verdict: 'aligned' },
  'Clear':         { real: 0, ghost: +2, verdict: 'aligned' },
  'Connected':     { real: 0, ghost: +2, verdict: 'aligned' },
  'Iron Will':     { real: 0, ghost: +2, verdict: 'aligned' },
  'Zen Master':    { real: 0, ghost: +2, verdict: 'aligned' },
};

export function lookupImpact(name: string) {
  return IMPACT_TABLE[name] ?? { real: 0, ghost: 0, verdict: 'neutral' as const };
}
