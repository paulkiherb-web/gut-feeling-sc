import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  color: string;
  position: number;
  label?: string;
}

export default function TimelineNode({ color, position, label }: Props) {
  return (
    <div
      title={label}
      style={{
        position: 'absolute',
        top: -4,
        left: `${position * 100}%`,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        border: `2px solid ${boostaTokens.color.surface.raised}`,
      }}
    />
  );
}
