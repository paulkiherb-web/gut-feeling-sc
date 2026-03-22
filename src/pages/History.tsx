import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/types/profile';
import type { Verdict } from '@/types/profile';
import { Check, AlertTriangle, X, Calendar, Filter, Bookmark, StickyNote } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

interface ScanItem {
  id: string;
  food_name: string;
  verdict: string;
  reason: string;
  suggestion: string | null;
  created_at: string;
}

export default function History() {
  const { profile } = useProfile();
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalFilter, setGoalFilter] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('scans')
        .select('id, food_name, verdict, reason, suggestion, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setScans(data);
    }
    setLoading(false);
  };

  // Group by date
  const grouped = scans.reduce<Record<string, ScanItem[]>>((acc, s) => {
    const key = s.created_at.slice(0, 10);
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  const verdictIcon = (v: string) => {
    if (v === 'green') return <Check className="w-4 h-4 text-safe" />;
    if (v === 'red') return <X className="w-4 h-4 text-danger" />;
    return <AlertTriangle className="w-4 h-4 text-warning" />;
  };

  const verdictBg = (v: string) => {
    if (v === 'green') return 'bg-safe/10';
    if (v === 'red') return 'bg-danger/10';
    return 'bg-warning/10';
  };

  const verdictLabel = (v: string) => {
    if (v === 'green') return 'Подходит';
    if (v === 'red') return 'Не подходит';
    return 'Спорно';
  };

  const timeStr = (d: string) => new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const dateLabel = (d: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const ds = d.slice(0, 10);
    if (ds === today) return 'Сегодня';
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (ds === y) return 'Вчера';
    return new Date(d).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });
  };

  // Stats
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayScans = scans.filter(s => s.created_at.slice(0, 10) === todayKey);
  const greenToday = todayScans.filter(s => s.verdict === 'green').length;
  const yellowToday = todayScans.filter(s => s.verdict === 'yellow').length;
  const redToday = todayScans.filter(s => s.verdict === 'red').length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <OrganicBackground variant="cool" intensity="subtle" />
      <div className="relative z-10 px-5 pt-14">
        <h1 className="text-2xl font-display font-extrabold tracking-tight mb-1">Лента решений</h1>
        <p className="text-xs text-muted-foreground mb-5">Эволюция ваших выборов</p>

        {/* Day Summary */}
        {todayScans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-glow rounded-2xl p-4 mb-5"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">Сегодня</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-safe/10 p-3 text-center">
                <p className="text-xl font-display font-bold text-safe">{greenToday}</p>
                <p className="text-[9px] text-muted-foreground font-medium">подходит</p>
              </div>
              <div className="flex-1 rounded-xl bg-warning/10 p-3 text-center">
                <p className="text-xl font-display font-bold text-warning">{yellowToday}</p>
                <p className="text-[9px] text-muted-foreground font-medium">спорно</p>
              </div>
              <div className="flex-1 rounded-xl bg-danger/10 p-3 text-center">
                <p className="text-xl font-display font-bold text-danger">{redToday}</p>
                <p className="text-[9px] text-muted-foreground font-medium">избегать</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Goal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
          <button
            onClick={() => setGoalFilter(null)}
            className={`flex-none px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !goalFilter ? 'gradient-organic text-primary-foreground' : 'glass text-muted-foreground'
            }`}
          >
            Все
          </button>
          {['green', 'yellow', 'red'].map(v => (
            <button
              key={v}
              onClick={() => setGoalFilter(goalFilter === v ? null : v)}
              className={`flex-none px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                goalFilter === v
                  ? v === 'green' ? 'bg-safe text-safe-foreground' : v === 'yellow' ? 'bg-warning text-warning-foreground' : 'bg-danger text-danger-foreground'
                  : 'glass text-muted-foreground'
              }`}
            >
              {verdictLabel(v)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
            </motion.div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-display font-bold text-lg mb-1">Пока нет решений</p>
            <p className="text-sm text-muted-foreground">Сканируйте первый продукт — он появится здесь</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, items], gi) => {
              const filtered = goalFilter ? items.filter(s => s.verdict === goalFilter) : items;
              if (filtered.length === 0) return null;
              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.04 }}
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                    {dateLabel(items[0].created_at)}
                  </p>
                  <div className="space-y-2">
                    {filtered.map((scan, i) => (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gi * 0.04 + i * 0.02 }}
                        className="glass-strong rounded-2xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl ${verdictBg(scan.verdict)} flex items-center justify-center shrink-0 mt-0.5`}>
                            {verdictIcon(scan.verdict)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm truncate">{scan.food_name}</p>
                              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{timeStr(scan.created_at)}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{scan.reason}</p>
                            {scan.suggestion && (
                              <p className="text-[11px] text-warning mt-1 flex items-center gap-1">
                                <Bookmark className="w-3 h-3" /> {scan.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
