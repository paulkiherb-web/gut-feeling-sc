import { motion } from 'framer-motion';
import type { CourseRoute, CourseRouteNode } from '@/core/course';
import { useI18n } from '@/contexts/I18nContext';

interface Props {
  route: CourseRoute | null;
}

const PHASE_EMOJI: Record<string, string> = {
  morning: '☀️',
  day: '⚡',
  evening: '🌅',
  sleep: '🌙',
};

/**
 * Fixed display x-positions (%) for the 4 main phase nodes.
 * Keeps nodes away from edges on narrow mobile screens (360–414px).
 * The route's own x values (10/38/66/94) are intentionally ignored for mains.
 */
const MAIN_PHASE_X: Record<string, number> = {
  morning: 12,
  day:     37,
  evening: 63,
  sleep:   88,
};

const NODE_STYLES: Record<
  string,
  { bg: string; label: string; opacity: number }
> = {
  completed:        { bg: 'hsl(var(--safe))',                    label: 'text-foreground/70',      opacity: 1    },
  current:          { bg: 'hsl(var(--primary))',                 label: 'text-foreground/90',      opacity: 1    },
  available:        { bg: 'hsl(var(--primary) / 0.55)',          label: 'text-foreground/70',      opacity: 1    },
  locked:           { bg: 'hsl(var(--muted-foreground) / 0.28)', label: 'text-muted-foreground/40',opacity: 0.55 },
  drifted:          { bg: 'hsl(var(--warning) / 0.85)',          label: 'text-foreground/70',      opacity: 1    },
  return_available: { bg: 'hsl(var(--ring) / 0.65)',             label: 'text-foreground/70',      opacity: 1    },
};

function nodeStyle(n: CourseRouteNode) {
  return NODE_STYLES[n.status] ?? NODE_STYLES.available;
}

/** Returns the visual x-coordinate (0–100) for a node, using mobile-safe positions for main nodes. */
function displayX(n: CourseRouteNode): number {
  return n.type === 'main' ? (MAIN_PHASE_X[n.phase] ?? n.x) : n.x;
}

export default function CourseJourneyMap({ route }: Props) {
  const { t } = useI18n();

  if (!route || route.nodes.length === 0) {
    return (
      <div
        className="w-full h-[160px] rounded-2xl border border-border/25 bg-card/40 flex items-center justify-center"
        data-testid="course-journey-map"
      >
        <p className="text-xs text-muted-foreground text-center px-6 leading-snug">
          {t('journey.map_empty')}
        </p>
      </div>
    );
  }

  const mains = route.nodes.filter((n) => n.type === 'main');
  const branches = route.nodes.filter((n) => n.type !== 'main');
  const hasBranch = branches.length > 0;

  // Extra height only when branch/return nodes are present
  const containerH = hasBranch ? 'h-[195px]' : 'h-[160px]';

  return (
    <div
      className={`relative w-full ${containerH} rounded-2xl border border-border/20 bg-gradient-to-b from-card/60 to-card/20 overflow-hidden`}
      data-testid="course-journey-map"
    >
      {/* SVG lines layer — uses same displayX() coords as node overlays */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cjm-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
          </linearGradient>
        </defs>

        {/* Main path lines */}
        {mains.slice(0, -1).map((n, i) => {
          const next = mains[i + 1];
          const dimmed = next.status === 'locked';
          return (
            <line
              key={`ml-${n.id}`}
              x1={displayX(n)}
              y1={n.y}
              x2={displayX(next)}
              y2={next.y}
              stroke={dimmed ? 'hsl(var(--muted-foreground) / 0.22)' : 'url(#cjm-grad)'}
              strokeWidth={1.4}
              strokeDasharray={dimmed ? '2.5,2' : undefined}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Branch / return lines */}
        {branches.map((b) => {
          const anchor = mains.find((m) => m.phase === b.phase) ?? mains[1];
          const isReturn = b.type === 'return';
          return (
            <line
              key={`bl-${b.id}`}
              x1={displayX(anchor)}
              y1={anchor.y}
              x2={b.x}
              y2={b.y}
              stroke={isReturn ? 'hsl(var(--ring) / 0.55)' : 'hsl(var(--warning) / 0.5)'}
              strokeWidth={1}
              strokeDasharray="2,1.8"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Node overlays */}
      {route.nodes.map((n) => {
        const style = nodeStyle(n);
        const isCurrent = n.status === 'current';
        const isMain = n.type === 'main';
        const isReturn = n.type === 'return';

        // Slightly tighter circles vs. original to give label text more room
        const outerSize = isCurrent ? 'w-10 h-10' : isMain ? 'w-8 h-8' : 'w-7 h-7';
        const emoji = isMain ? PHASE_EMOJI[n.phase] ?? '·' : isReturn ? '↩' : '~';
        const nx = displayX(n);

        return (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[2px]"
            style={{ left: `${nx}%`, top: `${n.y}%`, opacity: style.opacity }}
            data-phase={n.phase}
            data-status={n.status}
          >
            {/* Pulse ring on current node */}
            {isCurrent && (
              <motion.div
                className="absolute rounded-full"
                style={{ width: '2.75rem', height: '2.75rem', background: 'hsl(var(--primary) / 0.18)' }}
                animate={{ scale: [1, 1.45, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <div
              className={`${outerSize} rounded-full flex items-center justify-center shadow-md relative z-10 ${
                isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
              style={{ background: style.bg }}
            >
              <span className={isMain ? 'text-[13px] leading-none' : 'text-[10px] leading-none'}>
                {emoji}
              </span>
            </div>

            {/* Minimum 10px label — 8px was unreadable on mobile screens */}
            <span className={`text-[10px] font-semibold whitespace-nowrap leading-none ${style.label}`}>
              {n.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
