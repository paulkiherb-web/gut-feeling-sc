export interface HabitProfile {
  name: string;
  aliases: string[];
  type: 'physical' | 'mental' | 'nutrition' | 'sleep' | 'social' | 'cognitive';
  stateModifiers: {
    energy?: number;
    recovery?: number;
    sleep?: number;
    focus?: number;
    stress?: number;
    goalAlignment?: number;
  };
  targetGoals: string[];
  optimalTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
  streakMultiplier: number;
}

export const HABIT_REGISTRY: HabitProfile[] = [
  {
    name: 'Утренняя зарядка', aliases: ['зарядка', 'утренняя зарядка', 'morning workout', 'morning exercise'],
    type: 'physical', stateModifiers: { energy: +12, recovery: +8, sleep: +6, stress: -10 },
    targetGoals: ['energy', 'recovery', 'weight_loss'], optimalTimeOfDay: 'morning', streakMultiplier: 1.08,
  },
  {
    name: 'Медитация', aliases: ['медитация', 'meditation', 'mindfulness', 'осознанность'],
    type: 'mental', stateModifiers: { stress: -18, sleep: +10, focus: +14, recovery: +6 },
    targetGoals: ['sleep', 'recovery'], optimalTimeOfDay: 'morning', streakMultiplier: 1.10,
  },
  {
    name: 'Прогулка', aliases: ['прогулка', 'walk', 'ходьба', 'шаги', 'пешком'],
    type: 'physical', stateModifiers: { energy: +8, recovery: +6, stress: -8, sleep: +5 },
    targetGoals: ['energy', 'weight_loss'], optimalTimeOfDay: 'any', streakMultiplier: 1.05,
  },
  {
    name: 'Холодный душ', aliases: ['холодный душ', 'cold shower', 'контрастный душ'],
    type: 'physical', stateModifiers: { energy: +15, recovery: +10, stress: -8, focus: +12 },
    targetGoals: ['energy', 'recovery'], optimalTimeOfDay: 'morning', streakMultiplier: 1.12,
  },
  {
    name: 'Растяжка', aliases: ['растяжка', 'stretching', 'йога', 'yoga'],
    type: 'physical', stateModifiers: { recovery: +12, stress: -10, sleep: +8 },
    targetGoals: ['recovery', 'sleep'], optimalTimeOfDay: 'evening', streakMultiplier: 1.06,
  },
  {
    name: 'Чтение', aliases: ['чтение', 'читал', 'читала', 'read', 'reading'],
    type: 'cognitive', stateModifiers: { focus: +10, stress: -6, sleep: +5 },
    targetGoals: ['sleep', 'energy'], optimalTimeOfDay: 'evening', streakMultiplier: 1.04,
  },
  {
    name: 'Дыхательные упражнения', aliases: ['дыхание', 'дыхательные', 'breathing', 'pranayama', 'box breathing'],
    type: 'mental', stateModifiers: { stress: -20, sleep: +12, recovery: +8, focus: +8 },
    targetGoals: ['sleep', 'recovery'], optimalTimeOfDay: 'any', streakMultiplier: 1.10,
  },
  {
    name: 'Тренировка', aliases: ['тренировка', 'workout', 'gym', 'зал', 'силовая', 'бег'],
    type: 'physical', stateModifiers: { energy: +10, recovery: -5, goalAlignment: +12 },
    targetGoals: ['energy', 'weight_loss', 'recovery'], optimalTimeOfDay: 'morning', streakMultiplier: 1.08,
  },
];

export const findHabit = (name: string): HabitProfile | undefined => {
  const n = name.toLowerCase().trim();
  return HABIT_REGISTRY.find(h => h.aliases.some(a => n.includes(a) || a.includes(n)));
};
