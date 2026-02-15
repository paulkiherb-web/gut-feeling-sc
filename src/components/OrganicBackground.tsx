import { motion } from 'framer-motion';

interface Props {
  variant?: 'default' | 'warm' | 'cool';
  intensity?: 'subtle' | 'medium' | 'strong';
}

export default function OrganicBackground({ variant = 'default', intensity = 'medium' }: Props) {
  const opacityMap = { subtle: 0.15, medium: 0.25, strong: 0.4 };
  const op = opacityMap[intensity];

  const blobs = variant === 'warm' ? [
    { color: 'hsl(40 90% 56%)', x: '10%', y: '20%', size: 300 },
    { color: 'hsl(155 72% 40%)', x: '70%', y: '60%', size: 250 },
    { color: 'hsl(0 72% 55%)', x: '80%', y: '10%', size: 200 },
  ] : variant === 'cool' ? [
    { color: 'hsl(200 60% 50%)', x: '15%', y: '15%', size: 320 },
    { color: 'hsl(155 72% 40%)', x: '65%', y: '55%', size: 280 },
    { color: 'hsl(280 50% 55%)', x: '85%', y: '25%', size: 220 },
  ] : [
    { color: 'hsl(155 72% 40%)', x: '20%', y: '15%', size: 300 },
    { color: 'hsl(170 55% 42%)', x: '70%', y: '50%', size: 260 },
    { color: 'hsl(200 50% 45%)', x: '40%', y: '80%', size: 220 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            background: blob.color,
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
