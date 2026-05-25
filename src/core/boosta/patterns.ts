import { supabase } from '@/integrations/supabase/client';

export interface Pattern {
  id: string;
  title: string;
  detail?: string;
  confidence: 'low' | 'medium' | 'high';
}

interface RawEvent {
  category: string;
  name: string;
  timestamp: string;
  impact_real: number;
  impact_ghost: number;
}

const sb = supabase as any;

async function fetchRecentEvents(days = 90): Promise<RawEvent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data } = await sb
    .from('boosta_events')
    .select('category, name, timestamp, impact_real, impact_ghost')
    .eq('user_id', user.id)
    .gte('timestamp', since)
    .order('timestamp', { ascending: true });
  return (data ?? []) as RawEvent[];
}

export async function detectPatterns(days = 90): Promise<Pattern[]> {
  const events = await fetchRecentEvents(days);
  if (events.length < 5) return [];

  const patterns: Pattern[] = [];

  // 1. Weekday vs rest comparison (by avg impact_real)
  const byDow: Record<number, { sum: number; n: number }> = {};
  events.forEach((e) => {
    const d = new Date(e.timestamp).getDay();
    byDow[d] = byDow[d] ?? { sum: 0, n: 0 };
    byDow[d].sum += e.impact_real;
    byDow[d].n += 1;
  });
  const avgByDow = Object.entries(byDow).map(([d, v]) => ({ d: Number(d), avg: v.sum / v.n, n: v.n }));
  const overall = events.reduce((a, e) => a + e.impact_real, 0) / events.length;
  const dowNames = ['Воскресенья', 'Понедельники', 'Вторники', 'Среды', 'Четверги', 'Пятницы', 'Субботы'];
  const worst = avgByDow.filter((x) => x.n >= 3).sort((a, b) => a.avg - b.avg)[0];
  if (worst && worst.avg < overall - 2) {
    const pct = Math.round(((overall - worst.avg) / Math.max(1, Math.abs(overall))) * 100);
    patterns.push({
      id: 'dow_worst',
      title: `${dowNames[worst.d]} тяжелее остальных на ${Math.abs(pct)}%`,
      confidence: 'medium',
    });
  }

  // 2. Substance impact — alcohol/coffee patterns
  const subs = events.filter((e) => e.category === 'substance');
  if (subs.length >= 3) {
    const alc = subs.filter((e) => /алко/i.test(e.name));
    if (alc.length >= 2) {
      const avg = alc.reduce((a, e) => a + e.impact_real, 0) / alc.length;
      patterns.push({
        id: 'alcohol',
        title: `Алкоголь обходится тебе в ${Math.round(Math.abs(avg))} единиц заряда`,
        detail: `Сред. за ${alc.length} случаев`,
        confidence: 'high',
      });
    }
    const caf = subs.filter((e) => /кофе/i.test(e.name));
    if (caf.length >= 3) {
      const after17 = caf.filter((e) => new Date(e.timestamp).getHours() >= 17);
      if (after17.length >= 2) {
        patterns.push({
          id: 'coffee_late',
          title: `Кофе после 17:00 — повторялось ${after17.length} раз`,
          confidence: 'medium',
        });
      }
    }
  }

  // 3. Categories that hurt course most
  const byCat: Record<string, { sum: number; n: number }> = {};
  events.forEach((e) => {
    byCat[e.category] = byCat[e.category] ?? { sum: 0, n: 0 };
    byCat[e.category].sum += e.impact_real;
    byCat[e.category].n += 1;
  });
  const ranked = Object.entries(byCat).map(([c, v]) => ({ c, avg: v.sum / v.n, n: v.n }));
  const worstCat = ranked.filter((x) => x.n >= 3).sort((a, b) => a.avg - b.avg)[0];
  if (worstCat && worstCat.avg < -1) {
    patterns.push({
      id: `cat_${worstCat.c}`,
      title: `Категория «${worstCat.c}» уводит тебя от курса чаще всего`,
      confidence: 'medium',
    });
  }

  return patterns;
}

export async function getHeatmap90(): Promise<Array<{ date: string; real: number; ghost: number }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const since = new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10);
  const { data } = await sb
    .from('boosta_daily_summary')
    .select('date, end_real, end_ghost')
    .eq('user_id', user.id)
    .gte('date', since)
    .order('date', { ascending: true });
  return ((data ?? []) as Array<{ date: string; end_real: number; end_ghost: number }>).map((r) => ({
    date: r.date,
    real: r.end_real,
    ghost: r.end_ghost,
  }));
}

export async function searchEvents(opts: {
  category?: string;
  query?: string;
  fromHour?: number;
  toHour?: number;
}): Promise<RawEvent[]> {
  const all = await fetchRecentEvents(90);
  return all.filter((e) => {
    if (opts.category && e.category !== opts.category) return false;
    if (opts.query && !e.name.toLowerCase().includes(opts.query.toLowerCase())) return false;
    if (opts.fromHour != null) {
      const h = new Date(e.timestamp).getHours();
      if (h < opts.fromHour) return false;
    }
    if (opts.toHour != null) {
      const h = new Date(e.timestamp).getHours();
      if (h > opts.toHour) return false;
    }
    return true;
  });
}
