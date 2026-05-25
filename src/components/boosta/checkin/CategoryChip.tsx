import { boostaTokens } from '@/design/boosta/tokens';
import { motion } from 'framer-motion';

interface Props {
  label: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function CategoryChip({ label, onClick, selected = false }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: boostaTokens.radius.pill,
        background: selected ? boostaTokens.color.ghost[50] : boostaTokens.color.surface.raised,
        border: `0.5px solid ${selected ? boostaTokens.color.ghost[400] : boostaTokens.color.surface.line}`,
        color: selected ? boostaTokens.color.ghost[800] : boostaTokens.color.surface.ink,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {selected && <span style={{ marginRight: 4 }}>✓</span>}
      {label}
    </motion.button>
  );
}
