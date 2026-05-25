import { useState } from 'react';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import DualBattery from '@/components/boosta/battery/DualBattery';
import MirrorDualSelf from '@/components/boosta/MirrorDualSelf';
import FirstUseHint from '@/components/boosta/FirstUseHint';
import GhostWhisper from '@/components/boosta/ghost/GhostWhisper';
import DualTimeline from '@/components/boosta/timeline/DualTimeline';
import DayRoute from '@/components/boosta/timeline/DayRoute';
import EventFeed from '@/components/boosta/timeline/EventFeed';
import CoursePicker from '@/components/boosta/course/CoursePicker';
import AggregatedFeedBlock from '@/components/boosta/social/AggregatedFeedBlock';
import WeeklyReflection from '@/components/boosta/social/WeeklyReflection';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';

function getCurrentPhase(): 'morning' | 'day' | 'evening' | 'sleep' {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'day';
  if (h >= 18 && h < 23) return 'evening';
  return 'sleep';
}

const COURSE_LABELS: Record<string, string> = {
  focus:        'Больше фокуса',
  energy:       'Больше энергии',
  sleep:        'Лучше сон',
  calm:         'Спокойствие',
  weight_loss:  'Меньше веса',
  muscle_gain:  'Мышечный рост',
  recovery:     'Восстановление',
};

export default function MirrorScreen({ onScanPress }: { onScanPress?: () => void }) {
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);

  const todayCourse = useBoostaStore((s) => s.todayCourse);
  const customCourse = useBoostaStore((s) => s.customCourse);
  const setCourse = useBoostaStore((s) => s.setCourse);

  const courseLabel = COURSE_LABELS[todayCourse] ?? customCourse ?? todayCourse;

  const today = new Date().toLocaleDateString('ru', { weekday: 'long' });

  return (
    <div>
      <BoostaSection spacing="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginBottom: 4 }}>
              Сегодня · {today}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
              Курс: <span style={{ color: boostaTokens.color.ghost[600] }}>{courseLabel}</span>
            </h1>
          </div>
          <FirstUseHint hintId="course_pick">
            <button
              onClick={() => setCoursePickerOpen(true)}
              style={{
                fontSize: 12,
                color: boostaTokens.color.surface.inkSoft,
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
              }}
            >
              Сменить
            </button>
          </FirstUseHint>
        </div>
      </BoostaSection>

      <BoostaSection spacing="lg">
        <FirstUseHint hintId="dual_battery">
          <DualBattery />
        </FirstUseHint>
      </BoostaSection>

      <BoostaSection spacing="lg">
        <MirrorDualSelf />
      </BoostaSection>

      <BoostaSection spacing="lg">
        <GhostWhisper />
      </BoostaSection>

      <BoostaSection spacing="lg">
        <WeeklyReflection />
      </BoostaSection>

      <BoostaSection spacing="lg" label="Сейчас в Boosta">
        <AggregatedFeedBlock />
      </BoostaSection>

      <BoostaSection spacing="lg" label="День">
        <BoostaCard>
          <DualTimeline />
          <div style={{ height: 16 }} />
          <DayRoute currentPhase={getCurrentPhase()} />
        </BoostaCard>
      </BoostaSection>

      <BoostaSection spacing="lg" label="События дня">
        <EventFeed />
      </BoostaSection>

      <BoostaSection spacing="md">
        <BoostaButton fullWidth variant="primary" onClick={onScanPress}>
          Сканировать выбор
        </BoostaButton>
      </BoostaSection>

      {/* Course Picker Modal */}
      {coursePickerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(31,29,26,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
        }}
          onClick={() => setCoursePickerOpen(false)}
        >
          <div
            style={{
              background: boostaTokens.color.surface.raised,
              borderRadius: '24px 24px 0 0',
              padding: '24px 24px 48px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CoursePicker
              selected={todayCourse}
              onSelect={(c, custom) => {
                setCourse(c, custom);
                setCoursePickerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
