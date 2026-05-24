import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { COURSE_LIST } from '@/core/course';
import type { CourseKey, CourseStrictness } from '@/core/course';
import { useAppStore } from '@/core/store/appStore';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STRICTNESS_OPTIONS: { key: CourseStrictness; label: string; hint: string }[] = [
  { key: 'soft', label: 'Мягко', hint: 'Минимум давления, маленькие шаги.' },
  { key: 'balanced', label: 'Сбалансированно', hint: 'Обычный темп возврата в коридор.' },
  { key: 'focused', label: 'Сфокусированно', hint: 'Чуть строже к отклонениям.' },
];

export default function CourseSwitcherDrawer({ open, onOpenChange }: Props) {
  const course = useAppStore((s) => s.course);
  const setCourse = useAppStore((s) => s.setCourse);
  const [pickedCourse, setPickedCourse] = useState<CourseKey>(course.activeCourse);
  const [pickedStrictness, setPickedStrictness] = useState<CourseStrictness>(course.strictness);

  const apply = () => {
    setCourse({
      activeCourse: pickedCourse,
      strictness: pickedStrictness,
      startedAt:
        pickedCourse === course.activeCourse
          ? course.startedAt
          : new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Сменить курс</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {COURSE_LIST.map((c) => {
              const active = pickedCourse === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setPickedCourse(c.key)}
                  className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                    active
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 bg-card/50'
                  }`}
                >
                  <p className="text-sm font-display font-bold">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>
                </button>
              );
            })}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-2">
              Темп курса
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STRICTNESS_OPTIONS.map((opt) => {
                const active = pickedStrictness === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setPickedStrictness(opt.key)}
                    className={`p-2 rounded-xl border text-left ${
                      active
                        ? 'border-primary bg-primary/10'
                        : 'border-border/40 bg-card/40'
                    }`}
                  >
                    <p className="text-[11px] font-bold">{opt.label}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                      {opt.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={apply}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm"
          >
            Сделать текущим курсом
          </button>

          <p className="text-[10px] text-muted-foreground text-center">
            Это навигационная оценка направления, а не медицинская гарантия.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
