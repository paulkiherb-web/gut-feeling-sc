import { useEffect, useRef } from 'react';
import { useProfile } from './useProfile';

type Reminder = {
  time: string; // "HH:MM"
  title: string;
  body: string;
  tag: string;
};

const PLAN: Reminder[] = [
  { time: '07:30', title: '💧 Стакан воды', body: 'Гидратация после сна — запускает метаболизм.', tag: 'water-am' },
  { time: '09:00', title: '🍳 Завтрак', body: 'Белок + сложные углеводы. Не пропускайте.', tag: 'breakfast' },
  { time: '11:00', title: '🧘 Активность 5 мин', body: 'Разомнитесь, подышите, встряхните плечи.', tag: 'move-am' },
  { time: '13:00', title: '🥗 Обед', body: 'Главный приём: белок + овощи + сложные углеводы.', tag: 'lunch' },
  { time: '15:00', title: '⚡ Анти-провал 15:00', body: 'Стакан воды + горсть орехов. Без сахара.', tag: 'snack' },
  { time: '17:00', title: '🚶 Прогулка', body: '10–15 минут — кислород и снижение кортизола.', tag: 'walk' },
  { time: '19:00', title: '🍽 Ужин', body: 'Лёгкий, белковый, за 3ч до сна.', tag: 'dinner' },
  { time: '21:30', title: '🌙 Готовимся ко сну', body: 'Стакан воды, выключите экраны, магний.', tag: 'wind-down' },
];

const FIRED_KEY = 'nutrisee_reminders_fired';

// short pleasant beep via WebAudio (no asset)
function playBeep() {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.42);
    setTimeout(() => ctx.close(), 700);
  } catch {}
}

function inRestWindow(now: Date, start?: string, end?: string) {
  if (!start || !end) return false;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  if (s === e) return false;
  if (s < e) return cur >= s && cur < e;
  // crosses midnight
  return cur >= s || cur < e;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getFiredToday(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}');
    return raw[todayKey()] || [];
  } catch {
    return [];
  }
}

function markFired(tag: string) {
  const key = todayKey();
  const raw = (() => { try { return JSON.parse(localStorage.getItem(FIRED_KEY) || '{}'); } catch { return {}; } })();
  const today: string[] = raw[key] || [];
  if (!today.includes(tag)) today.push(tag);
  localStorage.setItem(FIRED_KEY, JSON.stringify({ [key]: today }));
}

export function useDayReminders() {
  const { profile } = useProfile();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!profile.notificationsEnabled) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const tick = () => {
      const now = new Date();
      if (inRestWindow(now, profile.restStart, profile.restEnd)) return;
      if (Notification.permission !== 'granted') return;

      const fired = getFiredToday();
      const curMin = now.getHours() * 60 + now.getMinutes();

      for (const r of PLAN) {
        if (fired.includes(r.tag)) continue;
        const [h, m] = r.time.split(':').map(Number);
        const target = h * 60 + m;
        // Fire if within 1 min window after target
        if (curMin >= target && curMin < target + 2) {
          try {
            new Notification(r.title, { body: r.body, tag: r.tag, silent: !profile.notificationsSound });
            if (profile.notificationsSound) playBeep();
            markFired(r.tag);
          } catch {}
        }
      }
    };

    tick();
    timerRef.current = window.setInterval(tick, 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [profile.notificationsEnabled, profile.notificationsSound, profile.restStart, profile.restEnd]);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

export const REMINDER_PLAN = PLAN;
