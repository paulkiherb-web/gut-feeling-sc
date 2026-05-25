import { supabase } from '@/integrations/supabase/client';

export type NotifyKind =
  | 'whisper_critical'
  | 'bond_change'
  | 'parole_slip'
  | 'team_milestone'
  | 'evening_close';

export interface NotifyPayload {
  kind: NotifyKind;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const sb = supabase as any;

export function isNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function showLocalNotification(p: NotifyPayload) {
  if (!isNotificationsSupported()) return;
  if (Notification.permission !== 'granted') return;
  if (localStorage.getItem('boosta_notify_muted') === 'true') return;
  try {
    new Notification(p.title, { body: p.body, icon: '/favicon.ico', tag: p.kind });
  } catch {
    /* noop */
  }
}

export async function requestServerNotify(p: NotifyPayload, recipientUserId?: string) {
  try {
    await sb.functions.invoke('boosta-notify', {
      body: { ...p, recipient_user_id: recipientUserId ?? null },
    });
  } catch {
    /* swallow */
  }
}

export function setEveningReminderMuted(muted: boolean) {
  localStorage.setItem('boosta_notify_muted', muted ? 'true' : 'false');
}

export function isEveningReminderMuted(): boolean {
  return localStorage.getItem('boosta_notify_muted') === 'true';
}

let eveningTimer: number | undefined;
export function scheduleEveningReminder() {
  if (typeof window === 'undefined') return;
  if (eveningTimer) window.clearTimeout(eveningTimer);
  if (isEveningReminderMuted()) return;
  const now = new Date();
  const target = new Date();
  target.setHours(21, 30, 0, 0);
  if (target.getTime() < now.getTime()) target.setDate(target.getDate() + 1);
  const ms = target.getTime() - now.getTime();
  eveningTimer = window.setTimeout(() => {
    showLocalNotification({
      kind: 'evening_close',
      title: 'Закончим день?',
      body: 'Открой Boosta — посмотрим на разрыв за сегодня.',
    });
    scheduleEveningReminder();
  }, ms) as unknown as number;
}
