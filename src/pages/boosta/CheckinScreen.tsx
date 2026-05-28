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
import BoostaToken from '@/components/tokens/BoostaToken';
import { boostaTokenMeta, BoostaTokenType } from '@/components/tokens/boostaTokenMeta';
import TokenGalleryPicker from '@/components/tokens/TokenGalleryPicker';

const CATEGORY_MAP: Record<string, EventCategory> = {
  'Бег': 'movement', 'Велик': 'movement', 'Лыжи': 'movement', 'Йога': 'movement',
  'Алкоголь': 'substance', 'Кофеин': 'substance', 'Сигарета': 'substance',
  'Сон': 'rest', 'Секс': 'rest', 'Медитация': 'rest',
  'Книга': 'stimulation', 'Игры': 'stimulation', 'Экран': 'stimulation', 'Работа': 'stimulation',
};

export default function CheckinScreen({ onScanPress }: { onScanPress?: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [tokenGalleryOpen, setTokenGalleryOpen] = useState(false);

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

  const handleTokenSelect = async (tokenType: BoostaTokenType) => {
    const meta = boostaTokenMeta[tokenType];
    const impact = lookupImpact(meta.labelRu);

    const category: EventCategory =
      meta.group === 'substance' ? 'substance'
      : meta.group === 'movement' || meta.group === 'sport' ? 'movement'
      : meta.group === 'life' ? 'rest'
      : 'stimulation';

    addEvent({
      category,
      name: meta.labelRu,
      impactReal: impact.real,
      impactGhost: impact.ghost,
      verdict: impact.verdict,
    });

    const stored = useBoostaStore.getState().events.at(-1);
    if (stored) persistEvent(stored);

    // Bridge to core event log so token participates in scorecard/recommendations.
    const { dispatchTokenLogged } = await import('@/core/boosta/tokenBridge');
    dispatchTokenLogged(tokenType);

    analyzeBoostaEvent(meta.labelRu, todayCourse, events)
      .then((analysis) => {
        if (analysis.whisper) setWhisper(analysis.whisper);
      })
      .catch(() => {});
  };

  const handleDone = () => {
    setSelectedChips([]);
    navigate('/boosta');
  };

  const todayCount = todayEvents.length;

  return (
    <div>
      <BoostaSection spacing="sm">
        <h1 style={{ ...boostaTokens.typography.titleCompact, margin: 0 }}>
          Что было сегодня?
        </h1>
      </BoostaSection>

      <BoostaSection spacing="md">
        <HonestyBadge />
      </BoostaSection>

      <BoostaSection spacing="md">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setTokenGalleryOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
            padding: '14px 18px',
            borderRadius: boostaTokens.radius.lg,
            background: '#1a1a1a',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {(['run', 'sleep', 'alcohol'] as BoostaTokenType[]).map((t) => (
              <BoostaToken
                key={t}
                type={t}
                size={28}
                showLabel={false}
                showSubLabel={false}
              />
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'white',
              marginBottom: 2,
            }}>
              Добавить жетон
            </p>
            <p style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
            }}>
              активность, сон, привычки и другое
            </p>
          </div>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>→</span>
        </motion.button>
      </BoostaSection>

      <BoostaSection spacing="md">
        <CategoryRow title="Еда и напитки">
          <BoostaButton variant="secondary" onClick={onScanPress}>
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

      {tokenGalleryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(31,29,26,0.6)',
          }}
          onClick={() => setTokenGalleryOpen(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={boostaTokens.motion.smooth}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: boostaTokens.color.surface.base,
              borderRadius: '24px 24px 0 0',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: boostaTokens.color.surface.line,
              margin: '12px auto 4px',
            }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px 8px',
            }}>
              <p style={{
                fontSize: 18,
                fontWeight: 600,
                color: boostaTokens.color.surface.ink,
              }}>
                Выбери жетон
              </p>
              <button
                onClick={() => setTokenGalleryOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  color: boostaTokens.color.surface.inkSoft,
                  cursor: 'pointer',
                }}
              >
                Закрыть
              </button>
            </div>

            <TokenGalleryPicker
              onSelect={async (tokenType) => {
                setTokenGalleryOpen(false);
                await handleTokenSelect(tokenType);
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
