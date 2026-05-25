import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BiomassFill from './BiomassFill';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';

export default function DualBattery() {
  const real = useBoostaStore((s) => s.realCharge);
  const ghost = useBoostaStore((s) => s.ghostCharge);
  const delta = ghost - real;

  return (
    <BoostaCard padding="lg">
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: boostaTokens.color.real[600] }}>
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
          minWidth: 50,
        }}>
          <p style={{ fontSize: 10, color: boostaTokens.color.surface.inkMuted, marginBottom: 4 }}>
            разрыв
          </p>
          <p style={{
            fontSize: 18,
            fontWeight: 600,
            color: Math.abs(delta) < 10
              ? boostaTokens.color.ghost[600]
              : boostaTokens.color.state.drift,
          }}>
            {delta > 0 ? '+' : ''}{delta}%
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: boostaTokens.color.ghost[600] }}>
            Ты лучший
          </p>
          <BiomassFill percent={ghost} variant="ghost" />
          <p style={{ fontSize: 24, fontWeight: 600, color: boostaTokens.color.ghost[800] }}>
            {ghost}%
          </p>
        </div>
      </div>
    </BoostaCard>
  );
}
