import { boostaTokens } from '@/design/boosta/tokens';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export default function BoostaButton({
  children, onClick,
  variant = 'primary',
  fullWidth = false,
}: Props) {
  const styles = {
    primary: {
      background: boostaTokens.color.ghost[600],
      color: '#FFFFFF',
      border: 'none',
    },
    secondary: {
      background: boostaTokens.color.surface.raised,
      color: boostaTokens.color.surface.ink,
      border: `0.5px solid ${boostaTokens.color.surface.line}`,
    },
    ghost: {
      background: 'transparent',
      color: boostaTokens.color.surface.inkSoft,
      border: 'none',
    },
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        ...styles,
        padding: '14px 22px',
        borderRadius: boostaTokens.radius.md,
        fontSize: 15,
        fontWeight: 500,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {children}
    </motion.button>
  );
}
