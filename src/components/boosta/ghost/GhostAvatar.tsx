import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  size?: number;
}

export default function GhostAvatar({ size = 40 }: Props) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: boostaTokens.color.ghost[50],
      border: `1px solid ${boostaTokens.color.ghost[200]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: '50%',
        background: boostaTokens.color.ghost[400],
        opacity: 0.6,
      }} />
    </div>
  );
}
