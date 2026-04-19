import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeId = 'emerald' | 'sunset' | 'ocean' | 'lavender' | 'mono' | 'amber';

const THEME_KEY = 'greenred_theme';

interface ThemeDef {
  id: ThemeId;
  name: string;
  nameRu: string;
  swatch: [string, string, string];
  // Full set of CSS variable overrides (background, card, primary, etc.)
  vars: Record<string, string>;
  gradients: {
    organic: string;
    aurora: string;
    premium: string;
    deep: string;
    glassWarm: string;
    glassCool: string;
  };
  // Background blob colors (HSL strings, no hsl() wrapper)
  blobs: [string, string, string];
}

export const THEMES: ThemeDef[] = [
  {
    id: 'emerald',
    name: 'Emerald',
    nameRu: 'Изумрудный',
    swatch: ['158 64% 38%', '172 50% 40%', '195 48% 42%'],
    vars: {
      '--background': '150 20% 97%',
      '--foreground': '160 30% 8%',
      '--card': '150 15% 99%',
      '--card-foreground': '160 30% 8%',
      '--popover': '150 15% 99%',
      '--popover-foreground': '160 30% 8%',
      '--secondary': '150 12% 93%',
      '--secondary-foreground': '160 20% 15%',
      '--muted': '150 10% 94%',
      '--muted-foreground': '160 10% 45%',
      '--border': '150 15% 90%',
      '--input': '150 15% 90%',
      '--primary': '158 64% 38%',
      '--ring': '158 64% 38%',
      '--accent': '270 55% 62%',
      '--accent-foreground': '270 50% 15%',
      '--glow': '158 80% 48%',
      '--glow-warm': '36 92% 56%',
      '--glow-soft': '270 55% 62%',
      '--glow-cool': '195 70% 50%',
    },
    gradients: {
      organic: 'linear-gradient(135deg, hsl(158 64% 38%), hsl(172 50% 40%), hsl(195 48% 42%))',
      aurora: 'linear-gradient(135deg, hsl(158 64% 38% / 0.12), hsl(195 55% 48% / 0.08), hsl(270 55% 58% / 0.06), hsl(36 92% 54% / 0.08))',
      premium: 'linear-gradient(145deg, hsl(158 64% 38%), hsl(195 50% 40%), hsl(230 45% 48%))',
      deep: 'linear-gradient(160deg, hsl(230 45% 22%), hsl(270 40% 18%), hsl(195 45% 20%))',
      glassWarm: 'linear-gradient(145deg, hsl(36 92% 54% / 0.08), hsl(var(--card) / 0.7), hsl(348 72% 52% / 0.04))',
      glassCool: 'linear-gradient(145deg, hsl(195 70% 50% / 0.06), hsl(var(--card) / 0.7), hsl(270 55% 62% / 0.04))',
    },
    blobs: ['158 70% 50%', '172 55% 45%', '200 55% 50%'],
  },
  {
    id: 'sunset',
    name: 'Sunset Peach',
    nameRu: 'Закатный персик',
    swatch: ['12 88% 60%', '32 92% 60%', '350 80% 65%'],
    vars: {
      '--background': '24 60% 97%',
      '--foreground': '14 40% 12%',
      '--card': '20 70% 99%',
      '--card-foreground': '14 40% 12%',
      '--popover': '20 70% 99%',
      '--popover-foreground': '14 40% 12%',
      '--secondary': '24 40% 93%',
      '--secondary-foreground': '14 30% 18%',
      '--muted': '24 35% 94%',
      '--muted-foreground': '14 15% 45%',
      '--border': '24 40% 88%',
      '--input': '24 40% 88%',
      '--primary': '14 84% 56%',
      '--ring': '14 84% 56%',
      '--accent': '350 80% 65%',
      '--accent-foreground': '350 50% 15%',
      '--glow': '24 92% 60%',
      '--glow-warm': '12 92% 58%',
      '--glow-soft': '350 80% 65%',
      '--glow-cool': '270 55% 62%',
    },
    gradients: {
      organic: 'linear-gradient(135deg, hsl(14 84% 56%), hsl(28 92% 58%), hsl(350 78% 62%))',
      aurora: 'linear-gradient(135deg, hsl(14 84% 56% / 0.12), hsl(32 90% 58% / 0.1), hsl(350 78% 62% / 0.08), hsl(280 60% 60% / 0.06))',
      premium: 'linear-gradient(145deg, hsl(14 84% 56%), hsl(340 78% 56%), hsl(280 55% 50%))',
      deep: 'linear-gradient(160deg, hsl(340 50% 22%), hsl(14 55% 22%), hsl(28 55% 24%))',
      glassWarm: 'linear-gradient(145deg, hsl(14 92% 58% / 0.1), hsl(var(--card) / 0.72), hsl(350 80% 60% / 0.06))',
      glassCool: 'linear-gradient(145deg, hsl(350 80% 65% / 0.08), hsl(var(--card) / 0.7), hsl(280 60% 60% / 0.05))',
    },
    blobs: ['14 90% 62%', '32 92% 60%', '350 82% 66%'],
  },
  {
    id: 'ocean',
    name: 'Ocean Indigo',
    nameRu: 'Океанский индиго',
    swatch: ['218 80% 56%', '240 70% 60%', '195 80% 52%'],
    vars: {
      '--background': '210 40% 97%',
      '--foreground': '220 50% 10%',
      '--card': '210 45% 99%',
      '--card-foreground': '220 50% 10%',
      '--popover': '210 45% 99%',
      '--popover-foreground': '220 50% 10%',
      '--secondary': '210 30% 93%',
      '--secondary-foreground': '220 30% 18%',
      '--muted': '210 25% 94%',
      '--muted-foreground': '220 15% 45%',
      '--border': '210 30% 88%',
      '--input': '210 30% 88%',
      '--primary': '218 80% 52%',
      '--ring': '218 80% 52%',
      '--accent': '195 80% 50%',
      '--accent-foreground': '195 50% 12%',
      '--glow': '218 90% 60%',
      '--glow-warm': '36 90% 56%',
      '--glow-cool': '195 90% 56%',
      '--glow-soft': '240 70% 65%',
    },
    gradients: {
      organic: 'linear-gradient(135deg, hsl(218 80% 52%), hsl(208 75% 50%), hsl(195 80% 50%))',
      aurora: 'linear-gradient(135deg, hsl(218 80% 52% / 0.12), hsl(195 80% 50% / 0.1), hsl(240 65% 60% / 0.08), hsl(280 60% 58% / 0.06))',
      premium: 'linear-gradient(145deg, hsl(218 80% 52%), hsl(240 65% 50%), hsl(265 55% 50%))',
      deep: 'linear-gradient(160deg, hsl(218 60% 18%), hsl(240 55% 20%), hsl(195 55% 18%))',
      glassWarm: 'linear-gradient(145deg, hsl(195 90% 56% / 0.08), hsl(var(--card) / 0.72), hsl(240 70% 65% / 0.05))',
      glassCool: 'linear-gradient(145deg, hsl(218 90% 60% / 0.08), hsl(var(--card) / 0.7), hsl(265 55% 55% / 0.05))',
    },
    blobs: ['218 85% 58%', '240 72% 62%', '195 80% 55%'],
  },
  {
    id: 'lavender',
    name: 'Lavender Rose',
    nameRu: 'Лавандовая роза',
    swatch: ['278 65% 62%', '320 68% 65%', '255 70% 68%'],
    vars: {
      '--background': '290 35% 97%',
      '--foreground': '280 40% 12%',
      '--card': '290 40% 99%',
      '--card-foreground': '280 40% 12%',
      '--popover': '290 40% 99%',
      '--popover-foreground': '280 40% 12%',
      '--secondary': '290 25% 93%',
      '--secondary-foreground': '280 25% 18%',
      '--muted': '290 22% 94%',
      '--muted-foreground': '280 12% 45%',
      '--border': '290 25% 88%',
      '--input': '290 25% 88%',
      '--primary': '278 60% 56%',
      '--ring': '278 60% 56%',
      '--accent': '320 68% 62%',
      '--accent-foreground': '320 40% 15%',
      '--glow': '278 80% 65%',
      '--glow-warm': '14 80% 60%',
      '--glow-soft': '320 75% 68%',
      '--glow-cool': '210 70% 65%',
    },
    gradients: {
      organic: 'linear-gradient(135deg, hsl(278 60% 56%), hsl(300 60% 58%), hsl(320 68% 62%))',
      aurora: 'linear-gradient(135deg, hsl(278 60% 56% / 0.12), hsl(320 68% 62% / 0.1), hsl(220 70% 62% / 0.08), hsl(180 60% 55% / 0.06))',
      premium: 'linear-gradient(145deg, hsl(278 60% 56%), hsl(320 68% 58%), hsl(348 70% 58%))',
      deep: 'linear-gradient(160deg, hsl(278 45% 20%), hsl(320 45% 22%), hsl(255 50% 22%))',
      glassWarm: 'linear-gradient(145deg, hsl(320 75% 68% / 0.1), hsl(var(--card) / 0.72), hsl(14 75% 60% / 0.05))',
      glassCool: 'linear-gradient(145deg, hsl(278 80% 65% / 0.08), hsl(var(--card) / 0.7), hsl(210 70% 65% / 0.05))',
    },
    blobs: ['278 70% 65%', '320 72% 65%', '255 72% 68%'],
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    nameRu: 'Янтарное золото',
    swatch: ['38 92% 55%', '24 92% 58%', '50 88% 58%'],
    vars: {
      '--background': '40 50% 97%',
      '--foreground': '30 40% 12%',
      '--card': '40 55% 99%',
      '--card-foreground': '30 40% 12%',
      '--popover': '40 55% 99%',
      '--popover-foreground': '30 40% 12%',
      '--secondary': '40 35% 92%',
      '--secondary-foreground': '30 30% 18%',
      '--muted': '40 30% 94%',
      '--muted-foreground': '30 15% 45%',
      '--border': '40 35% 87%',
      '--input': '40 35% 87%',
      '--primary': '36 92% 50%',
      '--ring': '36 92% 50%',
      '--accent': '24 88% 56%',
      '--accent-foreground': '24 50% 15%',
      '--glow': '38 95% 58%',
      '--glow-warm': '32 92% 58%',
      '--glow-soft': '14 80% 60%',
      '--glow-cool': '195 70% 55%',
    },
    gradients: {
      organic: 'linear-gradient(135deg, hsl(36 92% 50%), hsl(28 90% 54%), hsl(50 88% 58%))',
      aurora: 'linear-gradient(135deg, hsl(36 92% 50% / 0.12), hsl(50 88% 58% / 0.1), hsl(24 88% 56% / 0.08), hsl(195 70% 55% / 0.06))',
      premium: 'linear-gradient(145deg, hsl(36 92% 50%), hsl(24 88% 50%), hsl(14 80% 48%))',
      deep: 'linear-gradient(160deg, hsl(28 50% 20%), hsl(38 50% 18%), hsl(14 50% 22%))',
      glassWarm: 'linear-gradient(145deg, hsl(38 95% 58% / 0.1), hsl(var(--card) / 0.72), hsl(14 80% 58% / 0.05))',
      glassCool: 'linear-gradient(145deg, hsl(195 70% 55% / 0.07), hsl(var(--card) / 0.7), hsl(50 88% 60% / 0.05))',
    },
    blobs: ['38 95% 58%', '24 90% 58%', '50 88% 60%'],
  },
  {
    id: 'mono',
    name: 'Mono Slate',
    nameRu: 'Графит',
    swatch: ['220 14% 30%', '220 10% 50%', '220 14% 22%'],
    vars: {
      '--background': '220 18% 96%',
      '--foreground': '220 25% 10%',
      '--card': '220 20% 99%',
      '--card-foreground': '220 25% 10%',
      '--popover': '220 20% 99%',
      '--popover-foreground': '220 25% 10%',
      '--secondary': '220 14% 92%',
      '--secondary-foreground': '220 20% 18%',
      '--muted': '220 12% 94%',
      '--muted-foreground': '220 8% 45%',
      '--border': '220 14% 87%',
      '--input': '220 14% 87%',
      '--primary': '220 18% 28%',
      '--ring': '220 18% 28%',
      '--accent': '220 14% 50%',
      '--accent-foreground': '220 30% 95%',
      '--glow': '220 14% 45%',
      '--glow-warm': '36 50% 50%',
      '--glow-soft': '220 14% 60%',
      '--glow-cool': '210 18% 50%',
    },
    gradients: {
      organic: 'linear-gradient(135deg, hsl(220 18% 28%), hsl(220 14% 38%), hsl(220 12% 48%))',
      aurora: 'linear-gradient(135deg, hsl(220 14% 30% / 0.14), hsl(210 12% 50% / 0.1), hsl(240 10% 40% / 0.08), hsl(220 14% 60% / 0.06))',
      premium: 'linear-gradient(145deg, hsl(220 20% 22%), hsl(220 14% 32%), hsl(220 10% 42%))',
      deep: 'linear-gradient(160deg, hsl(220 25% 12%), hsl(220 20% 18%), hsl(220 15% 22%))',
      glassWarm: 'linear-gradient(145deg, hsl(220 14% 60% / 0.08), hsl(var(--card) / 0.72), hsl(220 14% 45% / 0.05))',
      glassCool: 'linear-gradient(145deg, hsl(210 18% 50% / 0.08), hsl(var(--card) / 0.7), hsl(220 14% 60% / 0.05))',
    },
    blobs: ['220 18% 50%', '210 16% 55%', '230 14% 45%'],
  },
];

interface Ctx {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: ThemeDef[];
}

const ThemeContext = createContext<Ctx>({ themeId: 'emerald', setTheme: () => {}, themes: THEMES });

const STYLE_ID = 'dynamic-theme-styles';

function applyTheme(theme: ThemeDef) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
  // Expose blob colors as CSS variables for OrganicBackground
  root.style.setProperty('--theme-blob-1', theme.blobs[0]);
  root.style.setProperty('--theme-blob-2', theme.blobs[1]);
  root.style.setProperty('--theme-blob-3', theme.blobs[2]);

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    .gradient-organic { background: ${theme.gradients.organic} !important; }
    .gradient-aurora { background: ${theme.gradients.aurora} !important; }
    .gradient-premium { background: ${theme.gradients.premium} !important; }
    .gradient-deep { background: ${theme.gradients.deep} !important; }
    .gradient-glass-warm { background: ${theme.gradients.glassWarm} !important; }
    .gradient-glass-cool { background: ${theme.gradients.glassCool} !important; }
  `;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(THEME_KEY) as ThemeId | null;
    return stored && THEMES.find(t => t.id === stored) ? stored : 'emerald';
  });

  useEffect(() => {
    const t = THEMES.find(t => t.id === themeId) || THEMES[0];
    applyTheme(t);
    localStorage.setItem(THEME_KEY, themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme: setThemeIdState, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
