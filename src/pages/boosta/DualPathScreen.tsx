import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/core/store/appStore';
import { useScores } from '@/core/hooks/useScores';
import DualBattery from '@/components/boosta/battery/DualBattery';
import GhostWhisper from '@/components/boosta/ghost/GhostWhisper';
import DualPathTrack from '@/components/boosta/intensive/DualPathTrack';
import DayProgressDots from '@/components/boosta/intensive/DayProgressDots';
import NextEventBubble from '@/components/boosta/intensive/NextEventBubble';
import SoftCorrectionSheet from '@/components/boosta/intensive/SoftCorrectionSheet';
import { useCorrectionTriggers } from '@/core/hooks/useCorrectionTriggers';
import { boostaTokens } from '@/design/boosta/tokens';
import { buildDailyTimeline } from '@/core/domain/state/buildDailyTimeline';
import { getPlanDay, toClockMinutes } from '@/core/intensive/planUtils';
import { formatDelta } from '@/core/store/calculators/computeTokenDelta';
import { COURSE_CATALOG } from '@/core/course/courseCatalog';
import BoostaLogo from '@/components/boosta/BoostaLogo';

function entryIcon(kind: string): string {
  switch (kind) {
    case 'hydration':
      return '💧';
    case 'sleep':
      return '🌙';
    case 'habit':
      return '✨';
    case 'token':
      return '🏷';
    case 'recovery':
      return '🫀';
    default:
      return '•';
  }
}

// Course options for inline course-change picker
const CHANGE_COURSE_OPTIONS: { key: string; emoji: string; title: string; tagline: string }[] = [
  { key: 'weight_loss',  emoji: '🔥', title: 'Снижение веса',        tagline: 'Минус жир через белок и режим питания.' },
  { key: 'muscle_gain',  emoji: '💪', title: 'Набор мышечной массы', tagline: 'Достаточно белка, силовая нагрузка и сон.' },
  { key: 'longevity',    emoji: '✨', title: 'Долголетие',            tagline: 'Антивоспалительное питание — исследованный путь.' },
  { key: 'sleep',        emoji: '🌙', title: 'Качество сна',          tagline: 'Засыпать быстро, просыпаться без будильника.' },
  { key: 'energy',       emoji: '⚡', title: 'Больше энергии',        tagline: 'Устойчивая энергия без кофе-костыля.' },
  { key: 'focus',        emoji: '🧠', title: 'Когнитивное здоровье',  tagline: 'Чистая голова через стабильный сахар.' },
  { key: 'libido',       emoji: '💋', title: 'Либидо',                tagline: 'Гормональный баланс через сон и движение.' },
  { key: 'flexibility',  emoji: '🤸', title: 'Гибкость тела',         tagline: 'Меньше боли, лучше осанка.' },
  { key: 'immunity',     emoji: '🛡️', title: 'Иммунитет',            tagline: 'Питание и сон как главная защита.' },
  { key: 'calm',         emoji: '🌿', title: 'Спокойствие',           tagline: 'Меньше тревожности через режим.' },
];

export default function DualPathScreen() {
  const navigate = useNavigate();
  const { activePlan, intensiveDayIndex, dualPath, readinessScore, ghostReadinessScore } = useScores();
  const eventLog = useAppStore((s) => s.eventLog);
  const activeCourse = useAppStore((s) => s.course.activeCourse);
  const clearPlan = useAppStore((s) => s.clearIntensivePlan);
  const setCourse = useAppStore((s) => s.setCourse);
  const correction = useCorrectionTriggers();
  const recommendations = useAppStore((s) => s.recommendations);
  const [pickingCourse, setPickingCourse] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string | null>(activeCourse ?? null);

  const today = useMemo(() => {
    if (!activePlan) return null;
    return getPlanDay(activePlan, intensiveDayIndex ?? 1);
  }, [activePlan, intensiveDayIndex]);

  const nextItem = useMemo(() => {
    if (!today) return null;
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    return today.items
      .map((it) => {
        const [h, m] = it.time.split(':').map((x) => parseInt(x, 10));
        return { ...it, _minutes: (Number.isFinite(h) ? h : 8) * 60 + (Number.isFinite(m) ? m : 0) };
      })
      .filter((it) => it._minutes >= minutesNow)
      .sort((a, b) => a._minutes - b._minutes)[0] ?? null;
  }, [today]);
  const timeline = useMemo(() => buildDailyTimeline(eventLog, activeCourse).reverse().slice(0, 6), [eventLog, activeCourse]);
  const gap = Math.round((ghostReadinessScore ?? 0) - (readinessScore ?? 0));
  const upcoming = (today?.items ?? []).filter((item) => toClockMinutes(item.time) > (new Date().getHours() * 60 + new Date().getMinutes())).slice(0, 1)[0];
  const nextAction = recommendations[0]?.body;
  const courseMeta = activeCourse ? COURSE_CATALOG[activeCourse] : null;

  // ── Inline course picker ─────────────────────────────────────────────────────
  if (pickingCourse) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: boostaTokens.color.surface.base,
        color: boostaTokens.color.surface.ink,
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 20px 40px',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        <div style={{ marginBottom: 4 }}>
          <BoostaLogo size="md" />
        </div>
        <div style={{ marginBottom: 24, marginTop: 16 }}>
          <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, fontWeight: 500, marginBottom: 6 }}>
            Смена курса
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Какая цель сейчас?
          </h1>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
            После выбора курса мы подберём стек интенсивности — мягкий, средний или сложный.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
          {CHANGE_COURSE_OPTIONS.map((c) => {
            const isSelected = pickerSelected === c.key;
            return (
              <motion.button
                key={c.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPickerSelected(c.key)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 18,
                  border: `2px solid ${isSelected ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(110,86,255,0.08), rgba(68,199,168,0.08))'
                    : boostaTokens.color.surface.raised,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <span style={{ fontSize: 26, flexShrink: 0 }}>{c.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: boostaTokens.color.surface.ink }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{c.tagline}</div>
                </div>
                {isSelected && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: boostaTokens.color.ghost[700],
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!pickerSelected}
          onClick={() => {
            if (!pickerSelected) return;
            setCourse({ activeCourse: pickerSelected as never });
            clearPlan();
            setPickingCourse(false);
            navigate('/boosta/plan-forge');
          }}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '18px 24px',
            borderRadius: 20,
            border: 'none',
            background: pickerSelected ? 'linear-gradient(135deg, #6E56FF, #44C7A8)' : boostaTokens.color.surface.line,
            color: pickerSelected ? '#fff' : boostaTokens.color.surface.inkMuted,
            fontSize: 17,
            fontWeight: 700,
            cursor: pickerSelected ? 'pointer' : 'default',
            flexShrink: 0,
          }}
        >
          Выбрать курс и стек →
        </motion.button>
        <button
          onClick={() => setPickingCourse(false)}
          style={{
            marginTop: 10, width: '100%', padding: '14px 24px', borderRadius: 20,
            border: `1.5px solid ${boostaTokens.color.surface.line}`, background: 'transparent',
            color: boostaTokens.color.surface.inkSoft, fontSize: 15, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </div>
    );
  }

  // ── No active plan ────────────────────────────────────────────────────────────
  if (!activePlan) {
    return (
      <div style={{
        height: '100dvh', background: boostaTokens.color.surface.base,
        padding: 24, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
        fontFamily: boostaTokens.typography.fontFamily,
      }}>
        {courseMeta && (
          <div style={{
            padding: '10px 16px', borderRadius: 20,
            background: 'rgba(113,88,255,0.08)',
            border: `1px solid ${boostaTokens.color.ghost[200]}`,
            fontSize: 13, color: boostaTokens.color.ghost[700],
            marginBottom: 8,
          }}>
            Курс: <strong>{courseMeta.shortTitle}</strong>
          </div>
        )}
        <p style={{ fontSize: 16, color: boostaTokens.color.surface.ink, textAlign: 'center' }}>
          Нет активного плана. Сгенерируй его — займёт пол минуты.
        </p>
        <button
          onClick={() => navigate('/boosta/plan-forge')}
          style={{
            background: boostaTokens.color.ghost[600], color: '#fff',
            border: 'none', borderRadius: 14, padding: '12px 22px',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >Подобрать план</button>
      </div>
    );
  }

  const totalDays = activePlan.durationDays;
  const dayIdx = intensiveDayIndex ?? 1;

  return (
    <div style={{
      height: '100dvh', background: boostaTokens.color.surface.base,
      overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box',
      padding: `calc(20px + env(safe-area-inset-top, 0px)) 16px calc(130px + env(safe-area-inset-bottom, 0px))`,
      display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: boostaTokens.typography.fontFamily,
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <BoostaLogo size="xl" />
          <p style={{
            ...boostaTokens.typography.eyebrow,
            color: boostaTokens.color.surface.inkMuted,
            marginTop: 10,
          }}>
            {activePlan.badge} {activePlan.title}
          </p>
          <h1 style={{ ...boostaTokens.typography.title, color: boostaTokens.color.surface.ink, margin: '6px 0 0' }}>
            День {dayIdx} из {totalDays}
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {courseMeta && (
            <div style={{
              fontSize: 11, fontWeight: 600, color: boostaTokens.color.ghost[600],
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(113,88,255,0.08)',
              border: `1px solid ${boostaTokens.color.ghost[200]}`,
            }}>
              {courseMeta.shortTitle}
            </div>
          )}
          <button
            onClick={() => setPickingCourse(true)}
            style={{
              background: 'transparent',
              border: 'none', cursor: 'pointer',
              ...boostaTokens.typography.fieldLabel,
              color: boostaTokens.color.surface.inkSoft,
              padding: '2px 8px',
              borderRadius: 8,
            }}
          >Сменить</button>
        </div>
      </header>

      <DayProgressDots total={totalDays} current={dayIdx} />

      <DualBattery />

      {today && <DualPathTrack day={today} />}

      <section
        style={{
          background: boostaTokens.color.surface.raised,
          borderRadius: 24,
          padding: 16,
          border: `1px solid ${boostaTokens.color.surface.line}`,
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <StatCard label="Ты" value={`${Math.round(dualPath?.realCharge ?? readinessScore ?? 0)}%`} tone={boostaTokens.color.real[700]} />
          <StatCard
            label="Разрыв"
            value={`${gap > 0 ? '−' : gap < 0 ? '+' : ''}${Math.abs(gap)}%`}
            tone={Math.abs(gap) < 8 ? boostaTokens.color.ghost[700] : '#E35D5D'}
          />
          <StatCard label="Лучший Я" value={`${Math.round(dualPath?.ghostCharge ?? ghostReadinessScore ?? 0)}%`} tone={boostaTokens.color.ghost[700]} />
        </div>
        {nextAction && (
          <div style={{ fontSize: 14, lineHeight: 1.45, color: boostaTokens.color.surface.inkSoft }}>
            Следующее мягкое действие: <span style={{ color: boostaTokens.color.surface.ink }}>{nextAction}</span>
          </div>
        )}
      </section>

      {nextItem && <NextEventBubble item={nextItem} />}

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <GhostWhisper />
      </div>

      {upcoming && (
        <section
          style={{
            background: boostaTokens.color.surface.raised,
            borderRadius: 24,
            padding: 16,
            border: `1px solid ${boostaTokens.color.surface.line}`,
          }}
          >
            <div style={{ ...boostaTokens.typography.eyebrow, color: boostaTokens.color.surface.inkMuted, marginBottom: 6 }}>
              Сейчас по плану
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{upcoming.title}</div>
          <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginTop: 4 }}>
            {upcoming.description ?? 'Следующее событие по плану уже на горизонте.'}
          </div>
        </section>
      )}

      <section
        style={{
          background: boostaTokens.color.surface.raised,
          borderRadius: 24,
          padding: 16,
          border: `1px solid ${boostaTokens.color.surface.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ ...boostaTokens.typography.eyebrow, color: boostaTokens.color.surface.inkMuted }}>
          События дня
        </div>
        {timeline.length === 0 && (
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, margin: 0 }}>
            День начнётся с первого скана, глотка воды или жетона.
          </p>
        )}
        {timeline.map((entry) => {
          const delta = formatDelta(entry.scoreDelta);
          const deltaColor = (entry.scoreDelta ?? 0) < 0 ? '#E35D5D' : (entry.scoreDelta ?? 0) > 0 ? boostaTokens.color.real[700] : boostaTokens.color.surface.inkSoft;
          return (
            <div
              key={entry.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '42px 20px 1fr auto',
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
                borderBottom: `1px solid ${boostaTokens.color.surface.line}`,
              }}
            >
              <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>{entry.time}</span>
              <span style={{ fontSize: 14 }}>{entryIcon(entry.kind)}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.title}</div>
                {entry.subtitle && <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>{entry.subtitle}</div>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: deltaColor }}>{delta}</span>
            </div>
          );
        })}
      </section>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/scanner')}
        style={{
          marginTop: 8,
          background: boostaTokens.color.ghost[600],
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          padding: '14px 18px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >Сканировать / отметить</motion.button>
      <SoftCorrectionSheet
        open={correction.open}
        trigger={correction.trigger}
        onClose={correction.close}
      />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 18, background: boostaTokens.color.surface.base, border: `1px solid ${boostaTokens.color.surface.line}` }}>
      <div style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: tone }}>{value}</div>
    </div>
  );
}
