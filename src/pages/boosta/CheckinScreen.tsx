import { useState } from 'react';
import { motion } from 'framer-motion';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import CategoryRow from '@/components/boosta/checkin/CategoryRow';
import HonestyBadge from '@/components/boosta/checkin/HonestyBadge';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { lookupImpact } from '@/core/boosta/impactTable';
import { analyzeBoostaEvent } from '@/core/boosta/analyzeEvent';
import { persistEvent } from '@/core/boosta/syncEvents';
import type { EventCategory } from '@/core/store/slices/boostaSlice';
import { useNavigate } from 'react-router-dom';

const CATEGORY_MAP: Record<string, EventCategory> = {
  'Бег': 'movement', 'Велик': 'movement', 'Лыжи': 'movement', 'Йога': 'movement',
  'Алкоголь': 'substance', 'Кофеин': 'substance', 'Сигарета': 'substance',
  'Сон': 'rest', 'Секс': 'rest', 'Медитация': 'rest',
  'Книга': 'stimulation', 'Игры': 'stimulation', 'Экран': 'stimulation', 'Работа': 'stimulation',
};

export default function CheckinScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const addEvent = useBoostaStore((s) => s.addEvent);
  const setWhisper = useBoostaStore((s) => s.setWhisper);
  const todayCourse = useBoostaStore((s) => s.todayCourse);
  const events = useBoostaStore((s) => s.events);

  const todayEvents = events.filter((e) => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const handleChip = async (chipName: string) => {
    if (loading) return;

    // Toggle selection
    setSelectedChips((prev) =>
      prev.includes(chipName) ? prev.filter((c) => c !== chipName) : [...prev, chipName]
    );

    setLoading(chipName);
    try {
      let impact = lookupImpact(chipName);
      let whisper: string | null = null;

      try {
        const analysis = await analyzeBoostaEvent(chipName, todayCourse, todayEvents);
        impact = {
          real: analysis.impactReal,
          ghost: analysis.impactGhost,
          verdict: analysis.verdict,
        };
        whisper = analysis.whisper;
      } catch {
        // local table fallback
      }

      const category: EventCategory = CATEGORY_MAP[chipName] ?? 'food';
      addEvent({ category, name: chipName, impactReal: impact.real, impactGhost: impact.ghost, verdict: impact.verdict });

      const stored = useBoostaStore.getState().events.at(-1);
      if (stored) persistEvent(stored);

      if (whisper) setWhisper(whisper);
    } finally {
      setLoading(null);
    }
  };

  const handleDone = () => {
    setSelectedChips([]);
    navigate('/boosta');
  };

  const todayCount = todayEvents.length;

  return (
    <div>
      <BoostaSection spacing="sm">
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
          Что было сегодня?
        </h1>
      </BoostaSection>

      <BoostaSection spacing="md">
        <HonestyBadge />
      </BoostaSection>

      <BoostaSection spacing="md">
        <CategoryRow title="Еда и напитки">
          <BoostaButton variant="secondary" onClick={() => navigate('/scanner')}>
            Сканировать
          </BoostaButton>
          <BoostaButton variant="secondary">
            Вписать
          </BoostaButton>
        </CategoryRow>
      </BoostaSection>

      <BoostaSection spacing="md">
        <CategoryRow
          title="Движение"
          chips={['Бег', 'Велик', 'Лыжи', 'Йога']}
          onChipClick={handleChip}
          loadingChip={loading}
          selectedChips={selectedChips}
        />
      </BoostaSection>

      <BoostaSection spacing="md">
        <CategoryRow
          title="Вещества"
          chips={['Алкоголь', 'Кофеин', 'Сигарета']}
          onChipClick={handleChip}
          loadingChip={loading}
          selectedChips={selectedChips}
        />
      </BoostaSection>

      <BoostaSection spacing="md">
        <CategoryRow
          title="Отдых"
          chips={['Сон', 'Секс', 'Медитация']}
          onChipClick={handleChip}
          loadingChip={loading}
          selectedChips={selectedChips}
        />
      </BoostaSection>

      <BoostaSection spacing="md">
        <CategoryRow
          title="Стимуляция"
          chips={['Книга', 'Игры', 'Экран', 'Работа']}
          onChipClick={handleChip}
          loadingChip={loading}
          selectedChips={selectedChips}
        />
      </BoostaSection>

      <BoostaSection spacing="md">
        <BoostaCard variant="sunk" padding="sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
              Уже отмечено сегодня: <b style={{ color: boostaTokens.color.surface.ink }}>{todayCount} событий</b>
            </p>
            <button
              onClick={() => navigate('/boosta')}
              style={{
                fontSize: 12,
                color: boostaTokens.color.ghost[600],
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Открыть ленту →
            </button>
          </div>
        </BoostaCard>
      </BoostaSection>

      {/* Fixed Done bar — appears when chips are selected */}
      {selectedChips.length > 0 && (
        <motion.div
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '14px 20px',
            background: boostaTokens.color.surface.raised,
            borderTop: `0.5px solid ${boostaTokens.color.surface.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            zIndex: 50,
          }}
        >
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
            Отмечено: {selectedChips.length}
          </p>
          <button
            onClick={handleDone}
            style={{
              background: boostaTokens.color.ghost[600],
              color: '#fff',
              border: 'none',
              borderRadius: boostaTokens.radius.md,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Готово
          </button>
        </motion.div>
      )}
    </div>
  );
}
