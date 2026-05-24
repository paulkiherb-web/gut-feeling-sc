import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scan, ChevronRight, Compass } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { COURSE_CATALOG } from '@/core/course';
import { useI18n } from '@/contexts/I18nContext';
import CourseJourneyMap from './CourseJourneyMap';
import CourseSwitcherDrawer from './CourseSwitcherDrawer';

export default function CourseJourneyHero() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const course = useAppStore((s) => s.course);
  const route = useAppStore((s) => s.courseRoute);
  const gap = useAppStore((s) => s.courseGap);

  const [switcherOpen, setSwitcherOpen] = useState(false);

  const meta = COURSE_CATALOG[course.activeCourse];

  // Determine current and next main nodes
  const mainNodes = route?.nodes.filter((n) => n.type === 'main') ?? [];
  const currentIdx = mainNodes.findIndex((n) => n.status === 'current');
  const currentNode = currentIdx >= 0 ? mainNodes[currentIdx] : null;
  const nextNode =
    currentIdx >= 0 && currentIdx < mainNodes.length - 1
      ? mainNodes[currentIdx + 1]
      : null;

  // Status phrase — soft, non-technical
  const statusPhrase = gap?.headline ?? t('journey.start_first_choice');
  const hintText =
    gap?.status === 'slightly_out' || gap?.status === 'far_out'
      ? t('journey.drift_note')
      : gap?.explanation ?? t('journey.scan_hint');

  return (
    <>
      <div
        className="rounded-3xl glass-premium p-4 space-y-3"
        data-testid="course-journey-hero"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              {t('journey.today_route')}
            </p>
            <p className="text-base font-display font-bold leading-tight mt-0.5 truncate">
              {t('journey.course_label')}: {meta.title}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl gradient-organic flex items-center justify-center shadow-md shrink-0">
            <Compass className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
          </div>
        </div>

        {/* Status phrase */}
        <p className="text-[13px] text-foreground/80 leading-snug font-medium">
          {statusPhrase}
        </p>

        {/* Route map — hero visual */}
        <CourseJourneyMap route={route} />

        {/* Current + next step chips */}
        {(currentNode || nextNode) && (
          <div className="flex gap-2">
            {currentNode && (
              <div className="flex-1 min-w-0 rounded-xl bg-primary/10 border border-primary/20 p-2.5">
                {/* 11px minimum — 9px was unreadable on mobile */}
                <p className="text-[11px] uppercase tracking-wide text-primary/70 font-bold">
                  {t('journey.current_step')}
                </p>
                <p className="text-[13px] font-semibold mt-0.5 leading-snug truncate">
                  {currentNode.title}
                </p>
              </div>
            )}
            {nextNode && (
              <div className="flex-1 min-w-0 rounded-xl bg-card/50 border border-border/30 p-2.5 opacity-65">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold">
                  {t('journey.next_step')}
                </p>
                <p className="text-[13px] font-semibold mt-0.5 leading-snug truncate">
                  {nextNode.title}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hint / drift note */}
        <p className="text-[11px] text-muted-foreground leading-snug">{hintText}</p>

        {/* Primary CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/scanner')}
          className="w-full flex items-center justify-center gap-2.5 gradient-organic rounded-2xl py-3.5 shadow-md shadow-primary/20 active:shadow-none transition-shadow"
          data-testid="scan-cta"
        >
          <Scan className="w-5 h-5 text-primary-foreground" strokeWidth={2.4} />
          <span className="font-display font-bold text-[15px] text-primary-foreground">
            {t('journey.scan_cta')}
          </span>
        </motion.button>

        {/* Secondary: change course — py-3 for ≥44px touch target */}
        <button
          onClick={() => setSwitcherOpen(true)}
          className="w-full flex items-center justify-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors py-3"
          data-testid="change-course-cta"
        >
          <span>{t('journey.change_course')}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <CourseSwitcherDrawer open={switcherOpen} onOpenChange={setSwitcherOpen} />
    </>
  );
}
