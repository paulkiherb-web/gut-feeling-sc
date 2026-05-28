import { useEffect } from 'react';
import { useAppStore } from '@/core/store/appStore';
import { showLocalNotification } from '@/core/boosta/notifications';

/** Schedules local notifications for future blueprint items in today's active plan. */
export function usePlanReminders() {
  const activePlanId = useAppStore((s) => s.activeIntensivePlanId);
  const plans = useAppStore((s) => s.intensivePlanOptions);
  const intensiveStartedAt = useAppStore((s) => s.intensiveStartedAt);
  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  useEffect(() => {
    if (!activePlan) return;

    const today = new Date();
    const now = today.getHours() * 60 + today.getMinutes();

    // Compute which day of the plan we're on
    let dayIndex = 0;
    if (intensiveStartedAt) {
      const started = new Date(intensiveStartedAt);
      started.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - started.getTime()) / 86_400_000);
      dayIndex = Math.max(0, Math.min(diffDays, activePlan.daily.length - 1));
    }

    const dayBlueprint = activePlan.daily[dayIndex];
    if (!dayBlueprint) return;

    const timers: number[] = [];
    for (const item of dayBlueprint.items) {
      const [hStr, mStr] = item.time.split(':');
      const itemMinutes = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
      if (itemMinutes <= now) continue;

      const msUntil = (itemMinutes - now) * 60 * 1000;
      // Don't schedule more than 8 hours ahead to avoid stale notifications
      if (msUntil > 8 * 60 * 60 * 1000) continue;

      const t = window.setTimeout(() => {
        showLocalNotification({
          kind: 'plan_reminder',
          title: item.title,
          body: item.description ?? `${item.time} — ${item.title}`,
        });
      }, msUntil);
      timers.push(t);
    }

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [activePlan, intensiveStartedAt]);
}
