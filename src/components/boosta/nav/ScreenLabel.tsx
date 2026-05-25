import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  label: string;
}

export default function ScreenLabel({ label }: Props) {
  return (
    <p style={{
      fontSize: 13,
      fontWeight: 500,
      color: boostaTokens.color.surface.ink,
      letterSpacing: '-0.01em',
    }}>
      {label}
    </p>
  );
}
