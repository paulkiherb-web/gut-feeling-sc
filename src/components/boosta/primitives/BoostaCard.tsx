import { boostaTokens } from '@/design/boosta/tokens';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'raised' | 'sunk' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BoostaCard({
  children,
  variant = 'raised',
  padding = 'md',
  className = '',
}: Props) {
  const bg = {
    raised: boostaTokens.color.surface.raised,
    sunk:   boostaTokens.color.surface.sunk,
    flat:   'transparent',
  }[variant];

  const pad = {
    sm: '14px 16px',
    md: '18px 20px',
    lg: '24px 22px',
  }[padding];

  return (
    <div
      className={`rounded-[24px] ${className}`}
      style={{
        background: bg,
        padding: pad,
        boxShadow: variant === 'raised' ? boostaTokens.shadow.soft : 'none',
        border: variant === 'raised' ? `0.5px solid ${boostaTokens.color.surface.line}` : 'none',
      }}
    >
      {children}
    </div>
  );
}
