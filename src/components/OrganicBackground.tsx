import { motion } from 'framer-motion';

interface Props {
  variant?: 'default' | 'warm' | 'cool';
  intensity?: 'subtle' | 'medium' | 'strong';
}

/**
 * Theme-aware animated background. Reads --theme-blob-* CSS vars set by ThemeContext
 * so the background harmonizes with the selected palette across all screens.
 * The `variant` prop only shifts blob layout/size, not hue.
 */
export default function OrganicBackground({ variant = 'default', intensity = 'medium' }: Props) {
  const opacityMap = { subtle: 0.18, medium: 0.28, strong: 0.42 };
  const op = opacityMap[intensity];

  const layout = variant === 'warm' ? [
    { v: '--theme-blob-1', x: '8%', y: '12%', size: 320 },
    { v: '--theme-blob-2', x: '70%', y: '60%', size: 260 },
    { v: '--theme-blob-3', x: '78%', y: '8%', size: 220 },
  ] : variant === 'cool' ? [
    { v: '--theme-blob-3', x: '12%', y: '18%', size: 320 },
    { v: '--theme-blob-1', x: '68%', y: '55%', size: 280 },
    { v: '--theme-blob-2', x: '82%', y: '22%', size: 220 },
  ] : [
    { v: '--theme-blob-1', x: '18%', y: '14%', size: 300 },
    { v: '--theme-blob-2', x: '70%', y: '48%', size: 270 },
    { v: '--theme-blob-3', x: '40%', y: '78%', size: 230 },
  ];

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden
      style={{
        // Subtle theme-tinted base wash so even empty areas feel themed
        background:
          'radial-gradient(120% 80% at 50% 0%, hsl(var(--theme-blob-1) / 0.06), transparent 60%), hsl(var(--background))',
      }}
    >
      {layout.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            background: `hsl(var(${blob.v}))`,
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            opacity: op,
          }}
          animate={{
            scale: [1, 1.15, 0.95, 1],
            x: ['0%', '5%', '-3%', '0%'],
            y: ['0%', '-4%', '6%', '0%'],
            borderRadius: [
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '40% 60% 70% 30% / 40% 70% 30% 60%',
              '50% 50% 40% 60% / 35% 65% 35% 65%',
              '60% 40% 30% 70% / 60% 30% 70% 40%',
            ],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
