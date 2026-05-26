// usePlanReminders — fires notifications from the user's active intensive plan.
// Sits ALONGSIDE useDayReminders (static fallback): when a plan is active,
// plan items take precedence over the static plan via a different tag namespace.
//
// Same rate-limit/restWindow rules apply as in useDayReminders.

import { useEffect, useRef } from 'react';
import { useProfile } from './useProfile';
import { useAppStore } from '@/core/store/appStore';

const FIRED_KEY = 'plan_reminders_fired_v1';

function inRestWindow(now: Date, start?: string, end?: string) {
  if (!start || !end) return false;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  if (s === e) return false;
  if (s < e) return cur >= s && cur < e;
  return cur >= s || cur < e;
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

function readFired(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}');
    return raw[todayKey()] || [];
  } catch { return []; }
}

function markFired(tag: string) {
  const key = todayKey();
  let raw: Record<string, string[]> = {};
  try { raw = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}'); } catch {}
  const today = raw[key] || [];
  if (!today.includes(tag)) today.push(tag);
  localStorage.setItem(FIRED_KEY, JSON.stringify({ [key]: today }));
}

const CAT_ICON: Record<string, string> = {
  hydration: '💧', meal: '🍽', movement: '🚶',
  rest: '🌿', sleep: '🌙', supplement: '💊', habit: '✨',
};

export function usePlanReminders() {
  const { profile } = useProfile();
  const activePlanId = useAppStore((s) => s.activeIntensivePlanId);
  const planOptions = useAppStore((s) => s.intensivePlanOptions);
  const startedAt = useAppStore((s) => s.intensiveStartedAt);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePlanId || !profile.notificationsEnabled) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const plan = planOptions.find((p) => p.id === activePlanId);
    if (!plan) return;

    const tick = () => {
      const now = new Date();
      if (inRestWindow(now, profile.restStart, profile.restEnd)) return;
      if (Notification.permission !== 'granted') return;

      const dayMs = 24 * 60 * 60 * 1000;
      const dayIdx = Math.max(1, Math.floor(
        (now.getTime() - new Date(startedAt || now).getTime()) / dayMs
      ) + 1);
      const today = plan.daily.find((d) => d.dayIndex === dayIdx) ?? plan.daily[0];
      if (!today) return;

      const fired = readFired();
      const curMin = now.getHours() * 60 + now.getMinutes();

      for (const item of today.items) {
        const tag = `plan:${plan.id}:${dayIdx}:${item.time}:${item.title}`;
        if (fired.includes(tag)) continue;
        const [h, m] = item.time.split(':').map(Number);
        if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
        const target = h * 60 + m;
        if (curMin >= target && curMin < target + 2) {
          try {
            new Notification(
              `${CAT_ICON[item.category] ?? '•'} ${item.title}`,
              { body: item.description ?? '', tag, silent: !profile.notificationsSound },
            );
            markFired(tag);
          } catch {}
        }
      }
    };

    tick();
    timerRef.current = window.setInterval(tick, 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [
    activePlanId, planOptions, startedAt,
    profile.notificationsEnabled, profile.notificationsSound,
    profile.restStart, profile.restEnd,
  ]);
}
