import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAppStore } from '@/core/store/appStore';
import { buildScanCourseImpact } from '@/core/course/buildScanCourseImpact';
import type { ScanCourseActionType, ScanImpactStatus, CourseDomain } from '@/core/course/scanCourseImpactTypes';
import type { ScanResultInput } from '@/core/course/buildScanCourseImpact';

interface Props {
  result: ScanResultInput | null;
}

const STATUS_CONFIG: Record<
  ScanImpactStatus,
  { emoji: string; colorClass: string; bgClass: string }
> = {
  supports_course:  { emoji: '✅', colorClass: 'text-green-600 dark:text-green-400',   bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  neutral:          { emoji: '➖', colorClass: 'text-muted-foreground',                bgClass: 'bg-muted/30 border-border/40' },
  slightly_drifts:  { emoji: '↗️', colorClass: 'text-amber-600 dark:text-amber-400',   bgClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  strongly_drifts:  { emoji: '⚠️', colorClass: 'text-orange-600 dark:text-orange-400', bgClass: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  unknown:          { emoji: '◌',  colorClass: 'text-muted-foreground',                bgClass: 'bg-muted/20 border-border/30' },
};

const ACTIONS: { key: ScanCourseActionType; i18nKey: string }[] = [
  { key: 'accepted',          i18nKey: 'scan.impact.action.accepted' },
  { key: 'already_consumed',  i18nKey: 'scan.impact.action.already_consumed' },
  { key: 'smoothed',          i18nKey: 'scan.impact.action.smoothed' },
  { key: 'replaced',          i18nKey: 'scan.impact.action.replaced' },
  { key: 'noted',             i18nKey: 'scan.impact.action.noted' },
];

export default function ScanCourseImpactCard({ result }: Props) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState<ScanCourseActionType | null>(null);

  const course     = useAppStore((s) => s.course);
  const courseGap  = useAppStore((s) => s.courseGap);
  const courseRoute = useAppStore((s) => s.courseRoute);
  const appendEvent = useAppStore((s) => s.appendEvent);
  const rebuildCourse = useAppStore((s) => s.rebuildCourse);

  const activeCourse = course?.activeCourse;

  // Compute impact (memoized so it doesn't re-run on every render)
  const impact = useMemo(() => {
    if (!activeCourse || !result) return null;
    return buildScanCourseImpact({
      scanResult: result,
      activeCourse,
      courseGap: courseGap ?? null,
      courseRoute: courseRoute ?? null,
      lang,
    });
  }, [result, activeCourse, courseGap, courseRoute, lang]);

  // No-course fallback
  if (!activeCourse) {
    return (
      <div className="mt-4 rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('scan.impact.section.title')}
          </p>
        </div>
        <p className="text-sm text-foreground/70">{t('scan.impact.no_course.text')}</p>
        <button
          onClick={() => navigate('/course')}
          className="w-full py-2 px-4 rounded-xl border border-border/60 text-sm font-semibold text-foreground/80 active:scale-95 transition"
        >
          {t('scan.impact.no_course.cta')}
        </button>
      </div>
    );
  }

  if (!impact) return null;

  const cfg = STATUS_CONFIG[impact.status];

  const handleAction = (action: ScanCourseActionType) => {
    setSelectedAction(action);

    const eventType = `scan.course.${action}` as
      | 'scan.course.accepted'
      | 'scan.course.already_consumed'
      | 'scan.course.smoothed'
      | 'scan.course.replaced'
      | 'scan.course.noted';

    appendEvent({
      type:       eventType,
      source:     'scanner',
      confidence: 0.7,
      payload: {
        scanId:          result?.id,
        activeCourse:    activeCourse,
        impactStatus:    impact.status,
        affectedDomains: impact.affectedDomains,
        selectedAction:  action,
        timestamp:       new Date().toISOString(),
      },
    });

    // Rebuild course if action actively corrects drift
    if (action === 'smoothed' || action === 'replaced') {
      try {
        rebuildCourse();
      } catch {
        // safe — non-critical rebuild
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`mt-4 rounded-2xl border p-4 space-y-3 ${cfg.bgClass}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t('scan.impact.section.title')}
        </p>
      </div>

      {/* Status badge + headline */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{cfg.emoji}</span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.colorClass}`}>
            {t(`scan.impact.status.${impact.status}`)}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug">{impact.headline}</p>
        <p className="text-xs text-foreground/60 leading-relaxed">{impact.explanation}</p>
      </div>

      {/* Affected domains */}
      {impact.affectedDomains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(impact.affectedDomains as CourseDomain[]).map((domain) => (
            <span
              key={domain}
              className="px-2 py-0.5 rounded-full bg-background/60 border border-border/40 text-[10px] font-medium text-foreground/70"
            >
              {t(`scan.impact.domain.${domain}`)}
            </span>
          ))}
        </div>
      )}

      {/* Easiest return */}
      {impact.easiestReturn && (
        <div className="rounded-xl bg-background/50 border border-border/30 p-3 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">
              {t('scan.impact.easiest_return')}
            </p>
          </div>
          <p className="text-xs font-semibold">{impact.easiestReturn.title}</p>
          <p className="text-[11px] text-foreground/60">{impact.easiestReturn.description}</p>
        </div>
      )}

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {selectedAction ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 py-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-foreground/70">{t('scan.impact.action.done')}</span>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {ACTIONS.map(({ key, i18nKey }) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                className="px-3 py-1.5 rounded-xl border border-border/50 bg-background/60 text-[11px] font-semibold text-foreground/80 active:scale-95 transition hover:border-border"
              >
                {t(i18nKey)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/60">{t('scan.impact.disclaimer')}</p>
    </motion.div>
  );
}
