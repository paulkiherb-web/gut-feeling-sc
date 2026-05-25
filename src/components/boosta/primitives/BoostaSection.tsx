import { boostaTokens } from '@/design/boosta/tokens';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
}

export default function BoostaSection({ children, spacing = 'md', label }: Props) {
  const gap = {
    sm: boostaTokens.spacing.md,
    md: boostaTokens.spacing.lg,
    lg: boostaTokens.spacing.xl,
    xl: boostaTokens.spacing.xxl,
  }[spacing];

  return (
    <section style={{ marginBottom: gap }}>
      {label && (
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: boostaTokens.color.surface.inkMuted,
            marginBottom: 10,
          }}
        >
          {label}
        </p>
      )}
      {children}
    </section>
  );
}
