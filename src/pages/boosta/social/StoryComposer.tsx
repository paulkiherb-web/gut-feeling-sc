import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';
import StoryCanvas from '@/components/boosta/social/StoryCanvas';
import { publishStory, type StoryType, type StoryVisibility } from '@/core/boosta/stories';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { useScores } from '@/core/hooks/useScores';
import { getMyProfile } from '@/core/boosta/profile';
import { useSocialUnlock, unlockHint } from '@/core/boosta/unlock';

const TYPES: { id: StoryType; title: string; desc: string }[] = [
  { id: 'gap_today',       title: 'Разрыв за день',  desc: 'Две батарейки за сегодня.' },
  { id: 'whisper_moment',  title: 'Реплика Лучшего Я', desc: 'Самая яркая фраза дня.' },
  { id: 'breakthrough',    title: 'Прорыв',          desc: 'Линии сошлись за период.' },
  { id: 'course_complete', title: 'Курс завершён',   desc: 'Финальная карточка.' },
  { id: 'team_milestone',  title: 'Команда',         desc: 'Достижение команды.' },
];

export default function StoryComposer({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const unlock = useSocialUnlock();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<StoryType>('gap_today');
  const [visibility, setVisibility] = useState<StoryVisibility>('friends');
  const [handle, setHandle] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const { readinessScore, ghostReadinessScore } = useScores();
  const realCharge = readinessScore ?? 80;
  const ghostCharge = ghostReadinessScore ?? 80;
  const todayCourse = useBoostaStore((s) => s.todayCourse);
  const lastWhisper = useBoostaStore((s) => s.lastWhisper);
  const events = useBoostaStore((s) => s.events);
  const lastEvent = events.at(-1);

  if (handle === undefined) {
    getMyProfile().then((p) => setHandle(p?.handle ?? ''));
  }

  if (!unlock.canShareStory) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md"><h1 style={{ fontSize: 22, fontWeight: 600 }}>Поделиться</h1></BoostaSection>
        <BoostaCard>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft }}>
            {unlockHint('canShareStory', unlock.daysActive, unlock.eventsTotal)}
          </p>
          <div style={{ marginTop: 14 }}>
            <BoostaButton onClick={() => onClose ? onClose() : navigate('/boosta')}>Назад</BoostaButton>
          </div>
        </BoostaCard>
      </div>
    );
  }

  const payload = buildPayload(type, {
    real: realCharge, ghost: ghostCharge,
    course: todayCourse, whisper: lastWhisper,
    eventName: lastEvent?.name, handle: handle || undefined,
  });

  const download = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `boosta-${type}-${Date.now()}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `boosta-${type}.png`, { type: 'image/png' });
      if ((navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }).canShare?.({ files: [file] })) {
        await (navigator as Navigator & { share: (d: ShareData & { files?: File[] }) => Promise<void> }).share({
          files: [file],
          title: 'Boosta',
          text: 'Мой день в Boosta',
        });
      } else {
        await download();
      }
      await publishStory(type, payload, visibility);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <BoostaSection spacing="md">
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Поделиться</h1>
      </BoostaSection>

      <BoostaSection spacing="md" label="Шаблон">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: type === t.id ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.sunk,
                color: type === t.id ? '#fff' : boostaTokens.color.surface.ink,
                fontSize: 13,
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </BoostaSection>

      <BoostaSection spacing="md">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StoryCanvas ref={canvasRef} type={type} data={payload} />
        </div>
      </BoostaSection>

      <BoostaSection spacing="md" label="Видимость">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['private', 'friends', 'public'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              style={{
                flex: 1, padding: 10, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: visibility === v ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.sunk,
                color: visibility === v ? '#fff' : boostaTokens.color.surface.ink, fontSize: 13,
              }}
            >
              {v === 'private' ? 'Только я' : v === 'friends' ? 'Связанные' : 'Открыто'}
            </button>
          ))}
        </div>
      </BoostaSection>

      <BoostaSection spacing="md">
        <div style={{ display: 'flex', gap: 10 }}>
          <BoostaButton variant="secondary" onClick={download}>{busy ? '…' : 'Скачать'}</BoostaButton>
          <BoostaButton fullWidth onClick={share}>{busy ? '…' : 'Поделиться'}</BoostaButton>
        </div>
      </BoostaSection>

      <BoostaSection spacing="md">
        <BoostaButton variant="ghost" fullWidth onClick={() => navigate('/boosta')}>Назад</BoostaButton>
      </BoostaSection>
    </div>
  );
}

function buildPayload(type: StoryType, ctx: {
  real: number; ghost: number; course: string;
  whisper?: string; eventName?: string; handle?: string;
}) {
  const base = { handle: ctx.handle };
  switch (type) {
    case 'gap_today':
      return { ...base, real: ctx.real, ghost: ctx.ghost, course: ctx.course };
    case 'whisper_moment':
      return { ...base, whisper: ctx.whisper ?? 'тихо сегодня', eventName: ctx.eventName };
    case 'breakthrough':
      return { ...base, real: ctx.real, ghost: ctx.ghost, days: 7 };
    case 'course_complete':
      return { ...base, course: ctx.course, days: 30 };
    case 'team_milestone':
      return { ...base, teamName: 'Моя команда', milestone: 'неделя без срывов' };
  }
}
