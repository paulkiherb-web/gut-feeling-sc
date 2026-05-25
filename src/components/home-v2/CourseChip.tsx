import { useState } from 'react';
import { ChevronRight, Compass } from 'lucide-react';
import CourseSwitcherDrawer from '@/components/course/CourseSwitcherDrawer';
import { COURSE_CATALOG } from '@/core/course';
import { useAppStore } from '@/core/store/appStore';

export default function CourseChip() {
  const course = useAppStore((s) => s.course);
  const meta = COURSE_CATALOG[course.activeCourse];
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <Compass className="w-3.5 h-3.5 text-primary/60" strokeWidth={2} />
        <span>
          Курс:{' '}
          <strong className="text-foreground font-semibold">{meta?.title ?? '—'}</strong>
        </span>
        <ChevronRight className="w-3 h-3 opacity-50" />
      </button>

      <CourseSwitcherDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
