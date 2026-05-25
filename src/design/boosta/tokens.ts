export const boostaTokens = {
  color: {
    real: {
      50:  '#FAEEDA',
      200: '#FAC775',
      400: '#EF9F27',
      600: '#BA7517',
      800: '#854F0B',
    },
    ghost: {
      50:  '#E1F5EE',
      200: '#9FE1CB',
      400: '#5DCAA5',
      600: '#1D9E75',
      800: '#085041',
    },
    surface: {
      base:     '#F5F2EC',
      raised:   '#FFFFFF',
      sunk:     '#EEEAE2',
      ink:      '#1F1D1A',
      inkSoft:  '#6B6862',
      inkMuted: '#A8A49C',
      line:     '#E0DBD2',
    },
    state: {
      drift:   '#A32D2D',
      neutral: '#888780',
      aligned: '#1D9E75',
    },
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
    xxl: 56,
  },
  shadow: {
    soft:  '0 1px 3px rgba(31,29,26,0.04), 0 4px 12px rgba(31,29,26,0.03)',
    raise: '0 2px 8px rgba(31,29,26,0.06), 0 12px 32px rgba(31,29,26,0.05)',
  },
  motion: {
    spring: { type: 'spring' as const, stiffness: 380, damping: 30 },
    smooth: { type: 'tween' as const, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    slow:   { type: 'tween' as const, duration: 0.7,  ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export type BoostaTokens = typeof boostaTokens;
