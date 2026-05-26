import { useEffect, useState } from 'react';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import type { DomainEvent } from '@/core/store/types/events';

export interface CorrectionTrigger {
  type: string;
  payload?: Record<string, unknown>;
  summary: string;
}

const COOLDOWN_KEY = 'correction_trigger_last_at';
const COOLDOWN_MS = 30 * 60 * 1000;

function canTrigger(): boolean {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return true;
    return Date.now() - parseInt(raw, 10) > COOLDOWN_MS;
  } catch { return true; }
}

function markTriggered() {
  try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch {}
}

function classify(ev: DomainEvent): CorrectionTrigger | null {
  if (ev.type === 'token.logged') {
    const s = (ev.payload as any).signals ?? {};
    const label = (ev.payload as any).labelRu ?? 'жетон';
    if (s.hasAlcohol) return { type: ev.type, payload: ev.payload, summary: `алкоголь — ${label}` };
    if (s.hasSugar) return { type: ev.type, payload: ev.payload, summary: `сахар — ${label}` };
  }
  if (ev.type === 'scan.completed' && (ev.payload as any).verdict === 'red') {
    return { type: ev.type, payload: ev.payload, summary: 'красный скан' };
  }
  if (ev.type === 'sleep.recorded' && ((ev.payload as any).hours ?? 8) < 6) {
    return { type: ev.type, payload: ev.payload, summary: 'короткий сон' };
  }
  return null;
}

export function useCorrectionTriggers() {
  const [trigger, setTrigger] = useState<CorrectionTrigger | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = eventDispatcher.subscribe((ev) => {
      const t = classify(ev);
      if (!t) return;
      if (!canTrigger()) return;
      markTriggered();
      setTrigger(t);
      setOpen(true);
    });
    return unsub;
  }, []);

  return { trigger, open, close: () => setOpen(false) };
}
