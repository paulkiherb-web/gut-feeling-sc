import { boostaTokens } from '@/design/boosta/tokens';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import CategoryChip from './CategoryChip';
import { ReactNode } from 'react';

interface Props {
  title: string;
  chips?: string[];
  children?: ReactNode;
  allowCustom?: boolean;
  onChipClick?: (chip: string) => void;
  loadingChip?: string | null;
}

export default function CategoryRow({ title, chips, children, allowCustom = true, onChipClick, loadingChip }: Props) {
  return (
    <BoostaCard padding="md">
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: boostaTokens.color.surface.inkMuted,
        marginBottom: 12,
      }}>
        {title}
      </p>
      {children ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chips?.map(c => (
            <CategoryChip
              key={c}
              label={loadingChip === c ? '...' : c}
              onClick={() => onChipClick?.(c)}
            />
          ))}
          {allowCustom && <CategoryChip label="+ свой" />}
        </div>
      )}
    </BoostaCard>
  );
}
