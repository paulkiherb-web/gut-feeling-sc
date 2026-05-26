import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { boostaTokens } from '@/design/boosta/tokens';
import { aiInvoke } from '@/core/ai/aiGateway';
import { useAppStore } from '@/core/store/appStore';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent } from '@/core/store/types/events';
import type { DomainEvent } from '@/core/store/types/events';

interface AICorrection {
  id: string;
  effortBadge: 'быстро' | 'надёжно' | 'полностью';
  title: string;
  actionText: string;
  windowMin: number;
  category: string;
}

interface Props {
  open: boolean;
  trigger: { type: string; payload?: Record<string, unknown>; summary?: string } | null;
  onClose: () => void;
}

const BADGE_COLOR: Record<string, string> = {
  'быстро': boostaTokens.color.real[600],
  'надёжно': boostaTokens.color.real[800],
  'полностью': boostaTokens.color.ghost[800],
};

export default function SoftCorrectionSheet({ open, trigger, onClose }: Props) {
  const [corrections, setCorrections] = useState<AICorrection[]>([]);
  const [loading, setLoading] = useState(false);
  const addCorrection = useAppStore((s) => s.addCorrection);
  const activePlanId = useAppStore((s) => s.activeIntensivePlanId);
  const plans = useAppStore((s) => s.intensivePlanOptions);
  const activePlan = plans.find((p) => p.id === activePlanId);

  useEffect(() => {
    if (!open || !trigger) return;
    let cancelled = false;
    setLoading(true);
    setCorrections([]);
    aiInvoke<{ corrections: AICorrection[] }>({
      functionName: 'generate-corrections',
      body: {
        trigger,
        context: activePlan
          ? { activePlanTitle: activePlan.title }
          : undefined,
      },
    })
      .then((res) => { if (!cancelled) setCorrections(res?.corrections ?? []); })
      .catch(() => { if (!cancelled) setCorrections([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, trigger, activePlan]);

  const accept = (c: AICorrection) => {
    const correctionId = `c_${Date.now()}`;
    addCorrection({
      id: correctionId,
      effort: c.effortBadge === 'быстро' ? 'fast' : c.effortBadge === 'надёжно' ? 'reliable' : 'full',
      title: c.title,
      description: c.actionText,
      scheduledFor: new Date(Date.now() + c.windowMin * 60_000).toISOString(),
      status: 'accepted',
      createdAt: new Date().toISOString(),
    });
    eventDispatcher.dispatchEvent(newEvent<DomainEvent>({
      type: 'correction.accepted',
      source: 'ui',
      payload: { correctionId, effort: c.effortBadge, title: c.title },
    } as any));
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 50,
            }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
              background: boostaTokens.color.surface.base,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: '20px 16px 32px', maxHeight: '85vh', overflowY: 'auto',
            }}>
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: boostaTokens.color.surface.line,
              margin: '0 auto 16px',
            }} />
            <p style={{
              fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
              textAlign: 'center', margin: 0,
            }}>Мягкая коррекция</p>
            <h2 style={{
              fontSize: 18, fontWeight: 600, textAlign: 'center',
              color: boostaTokens.color.surface.ink, margin: '6px 0 18px',
            }}>Три варианта — без оценок</h2>

            {loading && (
              <p style={{
                textAlign: 'center', color: boostaTokens.color.surface.inkSoft,
                fontSize: 13, padding: '32px 0',
              }}>подбираем варианты…</p>
            )}

            {!loading && corrections.map((c) => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => accept(c)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: boostaTokens.color.surface.raised,
                  border: `0.5px solid ${boostaTokens.color.surface.line}`,
                  borderRadius: 16, padding: 14, marginBottom: 10,
                  cursor: 'pointer',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: BADGE_COLOR[c.effortBadge] ?? boostaTokens.color.surface.ink,
                  }}>{c.effortBadge}</span>
                  <span style={{
                    fontSize: 10, color: boostaTokens.color.surface.inkMuted,
                  }}>· {c.windowMin} мин</span>
                </div>
                <p style={{
                  fontSize: 15, fontWeight: 500, color: boostaTokens.color.surface.ink,
                  margin: '0 0 4px',
                }}>{c.title}</p>
                <p style={{
                  fontSize: 13, color: boostaTokens.color.surface.inkSoft,
                  margin: 0, lineHeight: 1.4,
                }}>{c.actionText}</p>
              </motion.button>
            ))}

            <button
              onClick={onClose}
              style={{
                display: 'block', width: '100%', marginTop: 8,
                padding: '12px', borderRadius: 14, border: 'none',
                background: 'transparent', color: boostaTokens.color.surface.inkMuted,
                fontSize: 14, cursor: 'pointer',
              }}>сейчас не надо</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
