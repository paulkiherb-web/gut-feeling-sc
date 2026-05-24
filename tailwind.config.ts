import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'system-ui', 'sans-serif'],
        editorial: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Design system typography scale
        'ds-display':   ['clamp(32px,8vw,40px)',   { lineHeight: '1.1',  letterSpacing: '-0.04em' }],
        'ds-hero':      ['clamp(26px,6.5vw,32px)', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        'ds-title':     ['clamp(20px,5vw,24px)',   { lineHeight: '1.2',  letterSpacing: '-0.025em' }],
        'ds-section':   ['clamp(16px,4vw,18px)',   { lineHeight: '1.3',  letterSpacing: '-0.02em' }],
        'ds-body':      ['15px',                   { lineHeight: '1.65', letterSpacing: '-0.01em' }],
        'ds-secondary': ['13px',                   { lineHeight: '1.55', letterSpacing: '0em' }],
        'ds-caption':   ['11px',                   { lineHeight: '1.45', letterSpacing: '0.01em' }],
        'ds-micro':     ['9px',                    { lineHeight: '1.3',  letterSpacing: '0.07em' }],
      },
      spacing: {
        // Design system spacing scale (4pt grid)
        'ds-1':  '4px',
        'ds-2':  '8px',
        'ds-3':  '12px',
        'ds-4':  '16px',
        'ds-5':  '20px',
        'ds-6':  '24px',
        'ds-8':  '32px',
        'ds-10': '40px',
        'ds-12': '48px',
        'ds-16': '64px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Design system radius scale
        'ds-xs':   '4px',
        'ds-sm':   '6px',
        'ds-md':  '10px',
        'ds-lg':  '14px',
        'ds-xl':  '18px',
        'ds-2xl': '24px',
        'ds-pill': '999px',
      },
      boxShadow: {
        // Design system elevation scale
        'ds-1': '0 1px 2px rgba(0,0,0,0.04)',
        'ds-2': '0 2px 8px rgba(0,0,0,0.05)',
        'ds-3': '0 4px 16px rgba(0,0,0,0.07)',
        'ds-4': '0 8px 32px rgba(0,0,0,0.09)',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        safe: {
          DEFAULT: "hsl(var(--safe))",
          foreground: "hsl(var(--safe-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        glow: {
          DEFAULT: "hsl(var(--glow))",
          warm: "hsl(var(--glow-warm))",
          soft: "hsl(var(--glow-soft))",
          cool: "hsl(var(--glow-cool))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Design system state semantic colors
        'ds-state': {
          recovery:  "hsl(var(--ds-state-recovery))",
          readiness: "hsl(var(--ds-state-readiness))",
          warning:   "hsl(var(--ds-state-warning))",
          improving: "hsl(var(--ds-state-improving))",
          declining: "hsl(var(--ds-state-declining))",
          neutral:   "hsl(var(--ds-state-neutral))",
        },
      },
      backdropBlur: {
        '3xl': '64px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "scan-line": {
          "0%": { top: "0%" },
          "50%": { top: "100%" },
          "100%": { top: "0%" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1) translate(0, 0)", opacity: "0.4" },
          "33%": { transform: "scale(1.1) translate(5%, -3%)", opacity: "0.6" },
          "66%": { transform: "scale(0.95) translate(-3%, 5%)", opacity: "0.35" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(5px) rotate(-0.5deg)" },
        },
        "morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "33%": { borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%" },
          "66%": { borderRadius: "50% 50% 40% 60% / 35% 65% 35% 65%" },
        },
        // Design system motion
        "ds-fade-in": {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        "ds-fade-up": {
          "from": { opacity: "0", transform: "translateY(8px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "ds-scale-in": {
          "from": { opacity: "0", transform: "scale(0.97)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
        "breathe": "breathe 8s ease-in-out infinite",
        "breathe-slow": "breathe 12s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "morph": "morph 8s ease-in-out infinite",
        // Design system motion presets
        "ds-fade-in": "ds-fade-in 0.25s cubic-bezier(0.4,0,0.2,1) both",
        "ds-fade-up": "ds-fade-up 0.25s cubic-bezier(0.4,0,0.2,1) both",
        "ds-scale-in": "ds-scale-in 0.2s cubic-bezier(0.4,0,0.2,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
