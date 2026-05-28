import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BiomassFill from './BiomassFill';
import { boostaTokens } from '@/design/boosta/tokens';
import { useScores } from '@/core/hooks/useScores';

export default function DualBattery() {
  const { readinessScore, ghostReadinessScore } = useScores();
  const real = Math.round(readinessScore ?? 80);
  const ghost = Math.round(ghostReadinessScore ?? 80);
  // delta > 0 means you're behind the ghost; < 0 means you're ahead of plan.
  const delta = real - ghost;
  const absDelta = Math.abs(delta);

  let caption: string;
  if (absDelta < 2) caption = 'Вы идёте вместе. День ещё открыт.';
  else if (delta > 0) caption = 'Ты обогнал план. Лучший Я догоняет.';
  else if (absDelta < 8) caption = 'Небольшое отставание — день не сломан.';
  else caption = 'Лучший Я ушёл вперёд. Следующий выбор сократит разрыв.';

  const deltaColor =
    absDelta < 2
      ? boostaTokens.color.surface.inkMuted
      : delta > 0
        ? boostaTokens.color.real[700]
        : absDelta < 8
          ? boostaTokens.color.ghost[600]
          : boostaTokens.color.state.drift;

  const deltaSign = delta > 0 ? '+' : delta < 0 ? '−' : '';

  return (
    <BoostaCard padding="lg">
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: boostaTokens.color.real[600] }}>
            Ты
          </p>
          <BiomassFill percent={real} variant="real" />
          <p style={{ fontSize: 24, fontWeight: 600, color: boostaTokens.color.real[800] }}>
            {real}%
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 56,
        }}>
          <p style={{ fontSize: 10, color: boostaTokens.color.surface.inkMuted, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Разрыв
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: deltaColor }}>
            {deltaSign}{absDelta}%
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: boostaTokens.color.ghost[600] }}>
            Лучший Я
          </p>
          <BiomassFill percent={ghost} variant="ghost" />
          <p style={{ fontSize: 24, fontWeight: 600, color: boostaTokens.color.ghost[800] }}>
            {ghost}%
          </p>
        </div>
      </div>

      <p style={{
        marginTop: 14,
        fontSize: 13,
        lineHeight: 1.4,
        color: boostaTokens.color.surface.inkSoft,
        textAlign: 'center',
      }}>
        {caption}
      </p>
    </BoostaCard>
  );
}
