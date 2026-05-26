// ghostWhisperRouter — subscribes to eventDispatcher and emits short, rare ghost whispers.
// Rules:
//  - max 1 whisper per 2 hours (LS-backed)
//  - whispers are SHORT: «Воды не хватает.» not «Ещё стакан — догоним норму»
//  - never punishes, never moralises
//  - silence is the default

import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import type { DomainEvent } from '@/core/store/types/events';

const RATE_KEY = 'ghost_whisper_last_at';
const RATE_LIMIT_MS = 2 * 60 * 60 * 1000;

function canSpeak(): boolean {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return true;
    const last = parseInt(raw, 10);
    if (!Number.isFinite(last)) return true;
    return Date.now() - last > RATE_LIMIT_MS;
  } catch { return true; }
}

function markSpoke(): void {
  try { localStorage.setItem(RATE_KEY, String(Date.now())); } catch {}
}

// Short whispers by trigger. Picked deterministically by event hash to avoid repeats.
const WHISPERS: Record<string, string[]> = {
  alcohol: ['Заметил.', 'Воды побольше завтра.'],
  late_caffeine: ['Кофе после трёх.', 'Утром почувствуешь.'],
  no_hydration: ['Воды не хватает.', 'Стакан.'],
  scan_red: ['Видел.', 'Без оценок.'],
  movement_done: ['Хорошо.', 'Идём.'],
  sleep_short: ['Сон коротковат.', 'Восстановись днём.'],
};

function pickWhisper(group: keyof typeof WHISPERS): string {
  const arr = WHISPERS[group];
  return arr[Math.floor(Math.random() * arr.length)];
}

function classify(event: DomainEvent): keyof typeof WHISPERS | null {
  if (event.type === 'token.logged') {
    const s = event.payload.signals ?? {};
    if (s.hasAlcohol) return 'alcohol';
    if (s.hasCaffeine && s.isEvening) return 'late_caffeine';
    if (s.isMovement) return 'movement_done';
  }
  if (event.type === 'scan.completed' && event.payload.verdict === 'red') {
    return 'scan_red';
  }
  if (event.type === 'sleep.recorded' && (event.payload.hours ?? 8) < 6) {
    return 'sleep_short';
  }
  return null;
}

let installed = false;

export function installGhostWhisperRouter(): () => void {
  if (installed) return () => {};
  installed = true;

  const unsub = eventDispatcher.subscribe((event) => {
    const group = classify(event);
    if (!group) return;
    if (!canSpeak()) return;
    const text = pickWhisper(group);
    try {
      useBoostaStore.getState().setWhisper(text);
      markSpoke();
    } catch {}
  });

  return () => {
    installed = false;
    unsub();
  };
}
