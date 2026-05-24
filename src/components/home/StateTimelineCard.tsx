import { motion } from 'framer-motion';
import { Scan, Droplets, Pill, CheckSquare, Moon, Activity, Zap } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { filterToday } from '@/core/store/calculators/_helpers';
import { useMemo } from 'react';
import type { DomainEvent } from '@/core/store/types/events';

interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const toTimelineEvent = (e: DomainEvent): TimelineEvent => {
  const time = formatTime(e.createdAt);

  if (e.type === 'scan.completed') {
    const v = e.payload.verdict;
    const color = v === 'green' ? 'hsl(var(--safe))' : v === 'red' ? 'hsl(var(--danger))' : 'hsl(var(--warning))';
    const bg = v === 'green' ? 'hsl(var(--safe) / 0.12)' : v === 'red' ? 'hsl(var(--danger) / 0.12)' : 'hsl(var(--warning) / 0.12)';
    return { id: e.id, time, label: e.payload.productName ?? e.payload.title ?? 'Скан', icon: Scan, color, bg };
  }
  if (e.type === 'hydration.logged') {
    return { id: e.id, time, label: `${e.payload.ml}мл`, icon: Droplets, color: 'hsl(200 85% 55%)', bg: 'hsl(200 85% 55% / 0.12)' };
  }
  if (e.type === 'supplement.taken') {
    return { id: e.id, time, label: e.payload.name, icon: Pill, color: 'hsl(270 65% 65%)', bg: 'hsl(270 65% 65% / 0.12)' };
  }
  if (e.type === 'habit.completed') {
    return { id: e.id, time, label: e.payload.name, icon: CheckSquare, color: 'hsl(var(--safe))', bg: 'hsl(var(--safe) / 0.12)' };
  }
  if (e.type === 'sleep.recorded') {
    const hrs = e.payload.durationHours ?? e.payload.hours ?? 0;
    return { id: e.id, time, label: `${hrs}ч сна`, icon: Moon, color: 'hsl(230 65% 65%)', bg: 'hsl(230 65% 65% / 0.12)' };
  }
  if (e.type === 'recovery.recorded') {
    return { id: e.id, time, label: 'Восст.', icon: Activity, color: 'hsl(var(--warning))', bg: 'hsl(var(--warning) / 0.12)' };
  }
  return { id: e.id, time, label: e.type, icon: Zap, color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted) / 0.3)' };
};

export default function StateTimelineCard() {
  const events = useAppStore(s => s.events);

  const timelineItems = useMemo(() => {
    const today = filterToday(events).filter(e =>
      ['scan.completed', 'hydration.logged', 'supplement.taken', 'habit.completed', 'sleep.recorded', 'recovery.recorded'].includes(e.type)
    );
    return today.slice(-10).map(toTimelineEvent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length]);

  if (!timelineItems.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-premium rounded-2xl p-4">
      <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold mb-3">
        События сегодня
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {timelineItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[52px]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: item.bg }}>
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <p className="text-[9px] text-center leading-tight font-medium text-foreground/70 max-w-[52px] line-clamp-1"
                title={item.label}>
                {item.label}
              </p>
              <p className="text-[8px] text-muted-foreground">{item.time}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
