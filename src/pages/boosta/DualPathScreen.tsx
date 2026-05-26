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

export default function DualPathScreen() {
  const navigate = useNavigate();
  const { activePlan, intensiveDayIndex, dualPath, readinessScore, ghostReadinessScore } = useScores();
  const eventLog = useAppStore((s) => s.eventLog);
  const activeCourse = useAppStore((s) => s.course.activeCourse);
  const clearPlan = useAppStore((s) => s.clearIntensivePlan);
  const correction = useCorrectionTriggers();
  const recommendations = useAppStore((s) => s.recommendations);
  const [confirmChange, setConfirmChange] = useState(false);

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

  if (!activePlan) {
    return (
      <div style={{
        height: '100dvh', background: boostaTokens.color.surface.base,
        padding: 24, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
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
      padding: `calc(20px + env(safe-area-inset-top, 0px)) 16px calc(110px + env(safe-area-inset-bottom, 0px))`,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <BoostaLogo size="sm" />
          <p style={{
            fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
            marginTop: 6,
          }}>
            {activePlan.badge} {activePlan.title}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: boostaTokens.color.surface.ink, margin: '4px 0 0' }}>
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
            onClick={() => {
              if (confirmChange) {
                clearPlan();
                navigate('/boosta/plan-forge');
              } else {
                setConfirmChange(true);
                setTimeout(() => setConfirmChange(false), 3000);
              }
            }}
            style={{
              background: confirmChange ? 'rgba(227,93,93,0.12)' : 'transparent',
              border: 'none', cursor: 'pointer',
              fontSize: 11,
              color: confirmChange ? '#E35D5D' : boostaTokens.color.surface.inkSoft,
              padding: '2px 8px',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
          >{confirmChange ? 'Уверен?' : 'Сменить'}</button>
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
          <StatCard label="Призрак" value={`${Math.round(dualPath?.ghostCharge ?? ghostReadinessScore ?? 0)}%`} tone={boostaTokens.color.ghost[700]} />
        </div>
        {nextAction && (
          <div style={{ fontSize: 14, lineHeight: 1.45, color: boostaTokens.color.surface.inkSoft }}>
            Следующее мягкое действие: <span style={{ color: boostaTokens.color.surface.ink }}>{nextAction}</span>
          </div>
        )}
      </section>

      {nextItem && <NextEventBubble item={nextItem} />}

      <GhostWhisper />

      {upcoming && (
        <section
          style={{
            background: boostaTokens.color.surface.raised,
            borderRadius: 24,
            padding: 16,
            border: `1px solid ${boostaTokens.color.surface.line}`,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted, marginBottom: 6 }}>
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
        <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted }}>
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
      <div style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: tone }}>{value}</div>
    </div>
  );
}
