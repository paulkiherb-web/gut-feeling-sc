export interface SupplementProfile {
  name: string;
  aliases: string[];
  stateModifiers: {
    energy?: number;
    recovery?: number;
    sleep?: number;
    focus?: number;
    stress?: number;
    inflammation?: number;
  };
  onsetMinutes: number;
  durationHours: number;
  warnings: string[];
  category: 'energy' | 'recovery' | 'sleep' | 'cognitive' | 'immune' | 'general';
}

export const SUPPLEMENT_REGISTRY: SupplementProfile[] = [
  {
    name: 'Магний',
    aliases: ['магний', 'magnesium', 'mag', 'магний b6', 'магний глицинат', 'магний цитрат'],
    stateModifiers: { sleep: +18, recovery: +10, stress: -12, energy: +4 },
    onsetMinutes: 45, durationHours: 9, warnings: [], category: 'sleep',
  },
  {
    name: 'Витамин D',
    aliases: ['витамин д', 'vitamin d', 'vit d', 'd3', 'витамин d3', 'холекальциферол'],
    stateModifiers: { energy: +8, recovery: +6 },
    onsetMinutes: 60, durationHours: 24, warnings: ['Принимать с жирной едой'], category: 'immune',
  },
  {
    name: 'Омега-3',
    aliases: ['омега', 'omega-3', 'omega3', 'рыбий жир', 'fish oil'],
    stateModifiers: { recovery: +14, inflammation: -16, energy: +4 },
    onsetMinutes: 90, durationHours: 24, warnings: ['Принимать с едой'], category: 'recovery',
  },
  {
    name: 'Цинк',
    aliases: ['цинк', 'zinc', 'zn'],
    stateModifiers: { recovery: +10, sleep: +5 },
    onsetMinutes: 60, durationHours: 16, warnings: ['Не совмещать с железом'], category: 'immune',
  },
  {
    name: 'B12',
    aliases: ['b12', 'витамин б12', 'vitamin b12', 'цианокобаламин', 'метилкобаламин'],
    stateModifiers: { energy: +14, recovery: +6, focus: +8 },
    onsetMinutes: 60, durationHours: 12, warnings: [], category: 'energy',
  },
  {
    name: 'Мелатонин',
    aliases: ['мелатонин', 'melatonin'],
    stateModifiers: { sleep: +22, energy: -5, stress: -8 },
    onsetMinutes: 25, durationHours: 6, warnings: ['Только перед сном', 'Не принимать днём'], category: 'sleep',
  },
  {
    name: 'Витамин C',
    aliases: ['витамин c', 'vitamin c', 'аскорбиновая', 'аскорбиновая кислота'],
    stateModifiers: { recovery: +9, stress: -6 },
    onsetMinutes: 30, durationHours: 10, warnings: [], category: 'immune',
  },
  {
    name: 'Кофеин',
    aliases: ['кофе', 'кофеин', 'caffeine', 'coffee', 'эспрессо', 'americano'],
    stateModifiers: { energy: +22, focus: +18, sleep: -28, stress: +8 },
    onsetMinutes: 15, durationHours: 5, warnings: ['Не после 15:00 при цели сон/восст.'], category: 'energy',
  },
  {
    name: 'Ашваганда',
    aliases: ['ашваганда', 'ashwagandha'],
    stateModifiers: { stress: -18, recovery: +10, sleep: +12, energy: +6 },
    onsetMinutes: 60, durationHours: 12, warnings: [], category: 'cognitive',
  },
  {
    name: 'Креатин',
    aliases: ['креатин', 'creatine', 'моногидрат'],
    stateModifiers: { energy: +10, recovery: +14, focus: +6 },
    onsetMinutes: 45, durationHours: 12, warnings: ['Пить больше воды'], category: 'energy',
  },
];

export const findSupplement = (name: string): SupplementProfile | undefined => {
  const n = name.toLowerCase().trim();
  return SUPPLEMENT_REGISTRY.find(s => s.aliases.some(a => n.includes(a) || a.includes(n)));
};
