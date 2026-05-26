// DualPathScreen — main intensive-plan screen.
// Shows two parallel paths (real vs ghost) over today's timeline,
// day-progress dots, next event, dual battery, and ghost whisper.

import { useMemo } from 'react';
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

export default function DualPathScreen() {
  const navigate = useNavigate();
  const { activePlan, intensiveDayIndex } = useScores();
  const intensiveStartedAt = useAppStore((s) => s.intensiveStartedAt);
  const clearPlan = useAppStore((s) => s.clearIntensivePlan);
  const correction = useCorrectionTriggers();

  const today = useMemo(() => {
    if (!activePlan) return null;
    const dayIdx = intensiveDayIndex ?? 1;
    return activePlan.daily.find((d) => d.dayIndex === dayIdx) ?? activePlan.daily[0];
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

  if (!activePlan) {
    return (
      <div style={{
        minHeight: '100dvh', background: boostaTokens.color.surface.base,
        padding: 24, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <p style={{ fontSize: 16, color: boostaTokens.color.surface.ink, textAlign: 'center' }}>
          У тебя пока нет активного плана.
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
      minHeight: '100dvh', background: boostaTokens.color.surface.base,
      padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
          }}>
            {activePlan.badge} {activePlan.title}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: boostaTokens.color.surface.ink, margin: '4px 0 0' }}>
            День {dayIdx} из {totalDays}
          </h1>
        </div>
        <button
          onClick={() => {
            if (confirm('Сменить план? Текущий прогресс останется в истории.')) {
              clearPlan();
              navigate('/boosta/plan-forge');
            }
          }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 12, color: boostaTokens.color.surface.inkSoft,
            padding: '4px 8px',
          }}
        >План</button>
      </header>

      <DayProgressDots total={totalDays} current={dayIdx} />

      <DualBattery />

      {today && <DualPathTrack day={today} />}

      {nextItem && <NextEventBubble item={nextItem} />}

      <GhostWhisper />

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
