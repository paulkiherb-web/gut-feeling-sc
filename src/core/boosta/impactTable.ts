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
};

export function lookupImpact(name: string) {
  return IMPACT_TABLE[name] ?? { real: 0, ghost: 0, verdict: 'neutral' as const };
}
