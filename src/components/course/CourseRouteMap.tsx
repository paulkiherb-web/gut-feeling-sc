import type { CourseRoute, CourseRouteNode } from '@/core/course';

interface CourseRouteMapProps {
  route: CourseRoute | null;
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'hsl(var(--safe))',
  current: 'hsl(var(--primary))',
  available: 'hsl(var(--primary) / 0.7)',
  locked: 'hsl(var(--muted-foreground) / 0.5)',
  drifted: 'hsl(var(--warning))',
  return_available: 'hsl(var(--ring))',
};

function nodeColor(n: CourseRouteNode): string {
  return STATUS_COLOR[n.status] ?? STATUS_COLOR.available;
}

export default function CourseRouteMap({ route }: CourseRouteMapProps) {
  if (!route || route.nodes.length === 0) {
    return (
      <div className="rounded-2xl border border-border/30 bg-card/40 p-4 text-[11px] text-muted-foreground">
        Маршрут дня появится, когда будут первые отметки.
      </div>
    );
  }

  const mains = route.nodes.filter((n) => n.type === 'main');
  const branches = route.nodes.filter((n) => n.type !== 'main');

  return (
    <div className="relative w-full h-[150px] rounded-2xl border border-border/30 bg-gradient-to-b from-card/70 to-card/30 overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Main path lines */}
        {mains.slice(0, -1).map((n, i) => {
          const next = mains[i + 1];
          return (
            <line
              key={`line.main.${n.id}`}
              x1={n.x}
              y1={n.y}
              x2={next.x}
              y2={next.y}
              stroke="hsl(var(--primary) / 0.45)"
              strokeWidth={0.8}
              strokeDasharray={n.status === 'locked' ? '2,2' : undefined}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {/* Branch connections */}
        {branches.map((b) => {
          const anchor = mains.find((m) => m.phase === b.phase) ?? mains[1];
          return (
            <line
              key={`line.branch.${b.id}`}
              x1={anchor.x}
              y1={anchor.y}
              x2={b.x}
              y2={b.y}
              stroke={b.type === 'return' ? 'hsl(var(--ring) / 0.6)' : 'hsl(var(--warning) / 0.5)'}
              strokeWidth={0.7}
              strokeDasharray="2,2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {route.nodes.map((n) => {
        const color = nodeColor(n);
        const size = n.type === 'main' ? 'w-7 h-7' : 'w-5 h-5';
        const ring = n.status === 'current' ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : '';
        return (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            title={`${n.title} — ${n.description}`}
          >
            <div
              className={`${size} rounded-full flex items-center justify-center shadow-md ${ring}`}
              style={{ background: color }}
            >
              <span className="text-[8px] font-bold text-primary-foreground">
                {n.title.slice(0, 1)}
              </span>
            </div>
            <span className="mt-1 text-[8px] font-semibold text-foreground/70 whitespace-nowrap">
              {n.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
