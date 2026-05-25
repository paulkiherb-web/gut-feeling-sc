import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  delta: number;
}

export default function BatteryDelta({ delta }: Props) {
  return (
    <p style={{
      fontSize: 18,
      fontWeight: 600,
      color: Math.abs(delta) < 10
        ? boostaTokens.color.ghost[600]
        : boostaTokens.color.state.drift,
    }}>
      {delta > 0 ? '+' : ''}{delta}%
    </p>
  );
}
