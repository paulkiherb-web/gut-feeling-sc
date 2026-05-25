import { boostaTokens } from '@/design/boosta/tokens';

export default function GhostPresence() {
  return (
    <div style={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: boostaTokens.color.ghost[400],
      boxShadow: `0 0 0 3px ${boostaTokens.color.ghost[50]}`,
    }} />
  );
}
