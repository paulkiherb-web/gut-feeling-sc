export const boostaTokens = {
  color: {
    real: {
      50:  'hsl(var(--glow-warm) / 0.10)',
      200: 'hsl(var(--glow-warm) / 0.24)',
      400: 'hsl(var(--glow-warm))',
      500: 'hsl(var(--glow-warm))',
      600: 'hsl(var(--glow-warm) / 0.92)',
      700: 'hsl(var(--glow-warm) / 0.82)',
      800: 'hsl(var(--glow-warm) / 0.68)',
    },
    ghost: {
      50:  'hsl(var(--primary) / 0.10)',
      200: 'hsl(var(--primary) / 0.22)',
      400: 'hsl(var(--accent))',
      500: 'hsl(var(--primary) / 0.82)',
      600: 'hsl(var(--primary))',
      700: 'hsl(var(--primary) / 0.88)',
      800: 'hsl(var(--foreground) / 0.85)',
    },
    surface: {
      base:     'hsl(var(--background))',
      raised:   'hsl(var(--card))',
      sunk:     'hsl(var(--secondary))',
      ink:      'hsl(var(--foreground))',
      inkSoft:  'hsl(var(--muted-foreground))',
      inkMuted: 'hsl(var(--muted-foreground) / 0.78)',
      line:     'hsl(var(--border))',
    },
    state: {
      drift:   '#A32D2D',
      neutral: 'hsl(var(--muted-foreground))',
      aligned: 'hsl(var(--primary))',
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
  typography: {
    fontFamily: 'Inter, SF Pro Display, Avenir Next, Arial, sans-serif',
    title: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
    },
    titleCompact: {
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '-0.015em',
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.4,
    },
    bodyMuted: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.45,
    },
  },
};

export type BoostaTokens = typeof boostaTokens;
