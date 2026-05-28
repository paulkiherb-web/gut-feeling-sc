import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, MoonStar, Sparkles } from 'lucide-react';
import { useAppStore } from '@/core/store/appStore';
import { useScores } from '@/core/hooks/useScores';
import { buildDailyTimeline } from '@/core/domain/state/buildDailyTimeline';
import { formatDelta } from '@/core/store/calculators/computeTokenDelta';
import { getPlanDay, toClockMinutes } from '@/core/intensive/planUtils';
import { boostaTokens } from '@/design/boosta/tokens';
import { capturePipeline } from '@/core/capture';
import { COURSE_CATALOG } from '@/core/course/courseCatalog';
import DailySupplementStack from '@/components/boosta/DailySupplementStack';

function progress(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function impactLabel(entry: { scoreDelta?: number; verdict?: string }): string {
  return formatDelta(entry.scoreDelta ?? null);
}

function impactColor(entry: { scoreDelta?: number }): string {
  const d = entry.scoreDelta ?? 0;
  if (d < 0) return '#E35D5D';
  if (d > 0) return '#44C7A8';
  return boostaTokens.color.surface.inkMuted;
}

function labelForEntry(kind: string): string {
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

const WATER_OPTIONS = [200, 350, 500] as const;

function ProgressRow({ label, value, total, suffix }: { label: string; value: number; total: number; suffix: string }) {
  const width = progress(value, total);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: boostaTokens.color.surface.ink }}>
        <span>{label}</span>
        <span style={{ color: boostaTokens.color.surface.inkSoft }}>
          {Math.round(value)}/{Math.round(total)}{suffix}
        </span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: boostaTokens.color.surface.line, overflow: 'hidden' }}>
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            borderRadius: 999,
            background: width >= 70 ? boostaTokens.color.real[700] : width >= 40 ? '#F5A524' : '#E35D5D',
          }}
        />
      </div>
    </div>
  );
}

export default function DayScreen() {
  const [selectedWaterMl, setSelectedWaterMl] = useState<number | null>(null);
  const { activePlan, intensiveDayIndex, energy, recovery, sleep, nutrition } = useScores();
  const stateSnapshot = useAppStore((state) => state.stateSnapshot);
  const eventLog = useAppStore((state) => state.eventLog);
  const profile = useAppStore((state) => state.profile);
  const recommendations = useAppStore((state) => state.recommendations);

  const activeCourse = useAppStore((state) => state.course.activeCourse);
  const timeline = useMemo(() => buildDailyTimeline(eventLog, activeCourse).reverse(), [eventLog, activeCourse]);
  const todayPlan = useMemo(
    () => (activePlan ? getPlanDay(activePlan, intensiveDayIndex ?? 1) : null),
    [activePlan, intensiveDayIndex],
  );
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const futurePlanItems = (todayPlan?.items ?? []).filter((item) => toClockMinutes(item.time) > currentMinutes).slice(0, 4);

  const hydration = stateSnapshot?.hydration;
  const hydrationMl = hydration?.ml ?? 0;
  const hydrationTargetMl = hydration?.targetMl ?? 2200;
  const hydrationPercent = Math.round((hydration?.progress ?? 0) * 100);
  const macros = stateSnapshot?.nutrition;
  const proteinTarget = Math.max(90, Math.round((profile.weightKg ?? 76) * 1.6));
  const fatTarget = Math.max(55, Math.round((profile.weightKg ?? 76) * 0.8));
  const carbsTarget = activePlan?.course === 'sleep' ? 140 : 180;
  const nextAction = recommendations[0]?.body ?? 'Добавь белок к ужину — это мягко компенсирует дефицит дня.';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: boostaTokens.color.surface.base,
        color: boostaTokens.color.surface.ink,
        padding: '20px 16px 110px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: boostaTokens.typography.fontFamily,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            ...boostaTokens.typography.eyebrow,
            color: boostaTokens.color.surface.inkMuted,
          }}
        >
          День · {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        <h1 style={{ ...boostaTokens.typography.title, margin: 0 }}>Живой срез дня</h1>
      </header>

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
          {[
            { label: 'Энергия', value: energy, tone: boostaTokens.color.real[700] },
            { label: 'Восстановление', value: recovery, tone: boostaTokens.color.ghost[700] },
            { label: 'Сон', value: sleep, tone: '#7E6BF2' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 12,
                borderRadius: 18,
                background: boostaTokens.color.surface.base,
                border: `1px solid ${boostaTokens.color.surface.line}`,
              }}
            >
                <div style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: item.tone }}>{Math.round(item.value)}</div>
              </div>
            ))}
        </div>
        <div
          style={{
            borderRadius: 18,
            padding: 14,
            background: 'linear-gradient(135deg, rgba(84,199,157,0.14), rgba(113,88,255,0.10))',
            border: `1px solid ${boostaTokens.color.surface.line}`,
          }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color={boostaTokens.color.ghost[700]} />
              <div>
                <div style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>Курс</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {(() => {
                    const key = activePlan?.course ?? activeCourse;
                  return key ? (COURSE_CATALOG[key as keyof typeof COURSE_CATALOG]?.shortTitle ?? key) : '—';
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          background: boostaTokens.color.surface.raised,
          borderRadius: 24,
          padding: 16,
          border: `1px solid ${boostaTokens.color.surface.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={18} color={boostaTokens.color.real[700]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <strong>Вода</strong>
              <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>
                Отмечай выпитую воду прямо здесь
              </span>
            </div>
          </div>
          <span style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
            {(hydrationMl / 1000).toFixed(1)} / {(hydrationTargetMl / 1000).toFixed(1)}л
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Прогресс воды за день"
          aria-valuemin={0}
          aria-valuemax={hydrationTargetMl}
          aria-valuenow={hydrationMl}
          style={{ height: 12, borderRadius: 999, background: boostaTokens.color.surface.line, overflow: 'hidden' }}
        >
          <motion.div
            animate={{ width: `${hydrationPercent}%` }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #8DDEFF, #42B7FF)',
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {WATER_OPTIONS.map((ml) => (
            <motion.button
              key={ml}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedWaterMl(ml);
                void capturePipeline.hydration({ ml, source: 'day-screen' });
              }}
              style={{
                minHeight: 78,
                borderRadius: 16,
                border: `1px solid ${selectedWaterMl === ml ? '#42B7FF' : boostaTokens.color.surface.line}`,
                background: selectedWaterMl === ml ? 'rgba(66, 183, 255, 0.10)' : boostaTokens.color.surface.base,
                padding: '12px 10px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: boostaTokens.color.surface.ink,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700 }}>{ml}</span>
              <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>мл</span>
            </motion.button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>
          Голубое заполнение показывает, сколько воды уже отмечено за сегодня.
        </div>
      </section>

      <section
        style={{
          background: boostaTokens.color.surface.raised,
          borderRadius: 24,
          padding: 16,
          border: `1px solid ${boostaTokens.color.surface.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <strong>БЖУ</strong>
        <ProgressRow label="Белок" value={macros?.protein ?? 0} total={proteinTarget} suffix="г" />
        <ProgressRow label="Жиры" value={macros?.fat ?? 0} total={fatTarget} suffix="г" />
        <ProgressRow label="Углеводы" value={macros?.carbs ?? 0} total={carbsTarget} suffix="г" />
        <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>Питание: {Math.round(nutrition)} / 100</div>
      </section>

      <DailySupplementStack />

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
        <strong>Таймлайн</strong>
        {timeline.length === 0 && (
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, margin: 0 }}>
            Сегодня пока тихо. Первый скан или запись сразу оживит день.
          </p>
        )}
        {timeline.map((entry) => (
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
            <span style={{ fontSize: 14 }}>{labelForEntry(entry.kind)}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.title}</div>
              {entry.subtitle && <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>{entry.subtitle}</div>}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: impactColor(entry) }}>{impactLabel(entry)}</span>
          </div>
        ))}
        {futurePlanItems.map((item) => (
          <div
            key={`plan-${item.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 20px 1fr',
              gap: 10,
              alignItems: 'center',
              padding: '10px 0',
            }}
          >
            <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>{item.time}</span>
            <span style={{ fontSize: 14, color: boostaTokens.color.ghost[700] }}>○</span>
            <div style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft }}>
              {item.title} <span style={{ color: boostaTokens.color.surface.inkMuted }}>(план)</span>
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          background: 'linear-gradient(135deg, rgba(113,88,255,0.10), rgba(84,199,157,0.14))',
          borderRadius: 24,
          padding: 16,
          border: `1px solid ${boostaTokens.color.surface.line}`,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <MoonStar size={18} color={boostaTokens.color.ghost[700]} style={{ marginTop: 2 }} />
        <div>
          <div style={{ ...boostaTokens.typography.eyebrow, color: boostaTokens.color.surface.inkMuted }}>
            Следующее лучшее действие
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.45, marginTop: 4 }}>{nextAction}</div>
        </div>
      </section>
    </div>
  );
}
