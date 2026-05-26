import { motion } from 'framer-motion';
import { boostaTokens } from '@/design/boosta/tokens';
import type { BlueprintItem } from '@/core/intensive/types';

const CATEGORY_ICON: Record<string, string> = {
  hydration: '💧', meal: '🍽', movement: '🚶',
  rest: '🌿', sleep: '🌙', supplement: '💊', habit: '✨',
};

export default function NextEventBubble({ item }: { item: BlueprintItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: boostaTokens.color.surface.raised,
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
        borderRadius: 16, padding: 14,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
      <span style={{ fontSize: 26 }}>{CATEGORY_ICON[item.category] ?? '•'}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
        }}>Следующее · {item.time}</p>
        <p style={{ fontSize: 14, fontWeight: 500, color: boostaTokens.color.surface.ink, margin: 0 }}>
          {item.title}
        </p>
        {item.description && (
          <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, margin: 0, lineHeight: 1.4 }}>
            {item.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
