import { useState } from 'react';
import { ChevronRight, Compass } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { COURSE_CATALOG } from '@/core/course';
import CourseRouteMap from './CourseRouteMap';
import CourseCorridorStatus from './CourseCorridorStatus';
import CourseSwitcherDrawer from './CourseSwitcherDrawer';

export default function CourseTodayCard() {
  const course = useAppStore((s) => s.course);
  const gap = useAppStore((s) => s.courseGap);
  const route = useAppStore((s) => s.courseRoute);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const meta = COURSE_CATALOG[course.activeCourse];
  const pace = gap?.estimatedPace ?? {
    bestDays: meta.bestDays,
    currentDays: meta.currentDays,
    improvedDays: meta.improvedDays,
  };

  return (
    <>
      <div className="rounded-3xl glass-premium p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-2xl gradient-organic flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-4 h-4 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold">
                Курс сегодня
              </p>
              <p className="text-sm font-display font-bold truncate">{meta.title}</p>
            </div>
          </div>
          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-border/40 text-[10px] font-semibold text-foreground/80 active:scale-95 transition"
          >
            Сменить
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CourseCorridorStatus gap={gap} />
          <span className="text-[10px] text-muted-foreground">
            Уверенность: {gap?.confidence ?? 'low'}
          </span>
        </div>

        <div>
          <p className="text-[13px] font-semibold leading-snug">
            {gap?.headline ?? 'Курс готов, начнём с первых сигналов'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
            {gap?.explanation ?? 'Отметь первый приём еды или сон, и маршрут станет точнее.'}
          </p>
        </div>

        <CourseRouteMap route={route} />

        {gap?.easiestReturn && (
          <div className="rounded-2xl border border-border/30 p-3 bg-card/50">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold">
              Мягкий возврат
            </p>
            <p className="text-[12px] font-semibold mt-1">{gap.easiestReturn.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {gap.easiestReturn.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <PaceCell label="Лучший путь" value={`${pace.bestDays} дней`} />
          <PaceCell label="Сейчас" value={`около ${pace.currentDays} дней`} />
          <PaceCell label="Если вернуть" value={`около ${pace.improvedDays} дней`} />
        </div>

        <p className="text-[9px] text-muted-foreground/80 leading-snug">
          Это навигационная оценка направления, а не медицинская гарантия.
        </p>
      </div>

      <CourseSwitcherDrawer open={switcherOpen} onOpenChange={setSwitcherOpen} />
    </>
  );
}

function PaceCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card/40 border border-border/30 p-2">
      <p className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
        {label}
      </p>
      <p className="text-[11px] font-semibold mt-1">{value}</p>
    </div>
  );
}
