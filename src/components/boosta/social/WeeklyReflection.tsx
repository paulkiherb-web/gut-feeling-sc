import { useEffect, useState } from 'react';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import { boostaTokens } from '@/design/boosta/tokens';
import { fetchWeeklyReflection } from '@/core/boosta/social';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

export default function WeeklyReflection() {
  const course = useBoostaStore((s) => s.todayCourse);
  const realCharge = useBoostaStore((s) => s.realCharge);
  const ghostCharge = useBoostaStore((s) => s.ghostCharge);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const dow = new Date().getDay();
      if (dow !== 0) return; // only Sundays
      const cached = localStorage.getItem('boosta_weekly_reflection_at');
      const todayKey = new Date().toISOString().slice(0, 10);
      if (cached === todayKey) {
        const t = localStorage.getItem('boosta_weekly_reflection_text');
        if (t) { setText(t); return; }
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data } = await sb
        .from('boosta_events')
        .select('name, category, impact_real, impact_ghost, timestamp')
        .eq('user_id', user.id)
        .gte('timestamp', since);
      const r = await fetchWeeklyReflection({
        course,
        ghostProximity: 100 - Math.abs(ghostCharge - realCharge),
        weekEvents: (data ?? []) as Array<{ name: string; category: string; impact_real: number; impact_ghost: number; timestamp: string }>,
      });
      if (r?.whisper) {
        setText(r.whisper);
        localStorage.setItem('boosta_weekly_reflection_at', todayKey);
        localStorage.setItem('boosta_weekly_reflection_text', r.whisper);
      }
    })();
  }, [course, realCharge, ghostCharge]);

  if (!text) return null;

  return (
    <BoostaCard padding="md">
      <p style={{
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: boostaTokens.color.surface.inkMuted, marginBottom: 8,
      }}>
        Призрак за неделю
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.4, color: boostaTokens.color.surface.ink, fontStyle: 'italic' }}>
        «{text}»
      </p>
    </BoostaCard>
  );
}
