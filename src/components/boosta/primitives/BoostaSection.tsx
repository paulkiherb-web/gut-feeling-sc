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
            ...boostaTokens.typography.eyebrow,
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
