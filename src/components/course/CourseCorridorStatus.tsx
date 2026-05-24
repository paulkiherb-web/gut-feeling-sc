import type { CourseGap } from '@/core/course';

interface Props {
  gap: CourseGap | null;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  inside_corridor: {
    label: 'В коридоре курса',
    color: 'hsl(var(--safe))',
    bg: 'hsl(var(--safe) / 0.12)',
  },
  slightly_out: {
    label: 'Слегка ушёл',
    color: 'hsl(var(--warning))',
    bg: 'hsl(var(--warning) / 0.12)',
  },
  far_out: {
    label: 'Заметное отклонение',
    color: 'hsl(var(--danger))',
    bg: 'hsl(var(--danger) / 0.12)',
  },
  unknown: {
    label: 'Курс готов',
    color: 'hsl(var(--muted-foreground))',
    bg: 'hsl(var(--muted) / 0.4)',
  },
};

export default function CourseCorridorStatus({ gap }: Props) {
  const meta = STATUS_META[gap?.status ?? 'unknown'];
  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
      style={{ background: meta.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
    </div>
  );
}
