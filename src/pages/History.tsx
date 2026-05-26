import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { GOALS } from '@/types/profile';
import type { Verdict } from '@/types/profile';
import { Check, AlertTriangle, X, Calendar, Bookmark, StickyNote, Star, TrendingUp, ChevronDown, Send, Filter, Newspaper, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';

interface ScanItem {
  id: string; food_name: string; verdict: string; reason: string;
  suggestion: string | null; created_at: string; isFavorite?: boolean; note?: string;
}

const NEWS_CARDS: Record<string, string> = {
  weight_loss: 'Клетчатка замедляет всасывание сахара и продлевает сытость на 2-3 часа.',
  energy: 'Обезвоживание на 2% снижает когнитивную функцию на 20%.',
  recovery: 'Сон + белок + вит. C — три столпа регенерации.',
  sleep: 'Регулярный ритм сна важнее длительности.',
};

export default function History() {
  const { profile } = useProfile();
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [expandedScan, setExpandedScan] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const goal = GOALS.find(g => g.value === profile.goal);

  useEffect(() => { loadScans(); }, []);

  const loadScans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      try {
        const local = JSON.parse(localStorage.getItem('greenred_scans_local') || '[]');
        setScans(local.map((s: any) => ({
          id: s.id,
          food_name: s.foodName || s.food_name,
          verdict: s.verdict,
          reason: s.reason,
          suggestion: s.suggestion || null,
          created_at: s.createdAt || s.created_at,
        })));
      } catch {}
      setLoading(false);
      return;
    }
    const [scansRes, favsRes, notesRes] = await Promise.all([
      supabase.from('scans').select('id, food_name, verdict, reason, suggestion, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(200),
      supabase.from('scan_favorites').select('scan_id').eq('user_id', user.id),
      supabase.from('scan_notes').select('scan_id, content').eq('user_id', user.id),
    ]);
    const favIds = new Set((favsRes.data || []).map(f => f.scan_id));
    const noteMap = new Map((notesRes.data || []).map(n => [n.scan_id, n.content]));
    let merged = (scansRes.data || []).map(s => ({ ...s, isFavorite: favIds.has(s.id), note: noteMap.get(s.id) }));
    // Merge any local-only scans (e.g. saved before login)
    try {
      const local = JSON.parse(localStorage.getItem('greenred_scans_local') || '[]');
      const existing = new Set(merged.map(m => m.id));
      const extras = local
        .filter((s: any) => !existing.has(s.id))
        .map((s: any) => ({
          id: s.id,
          food_name: s.foodName || s.food_name,
          verdict: s.verdict,
          reason: s.reason,
          suggestion: s.suggestion || null,
          created_at: s.createdAt || s.created_at,
        }));
      merged = [...extras, ...merged].sort((a, b) => b.created_at.localeCompare(a.created_at));
    } catch {}
    setScans(merged);
    setLoading(false);
  };


  const toggleFavorite = async (scanId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const scan = scans.find(s => s.id === scanId);
    if (!scan) return;
    if (scan.isFavorite) {
      await supabase.from('scan_favorites').delete().eq('scan_id', scanId).eq('user_id', user.id);
      toast('Удалено из избранного');
    } else {
      await supabase.from('scan_favorites').insert({ scan_id: scanId, user_id: user.id });
      toast.success('Добавлено в избранное ⭐');
    }
    setScans(prev => prev.map(s => s.id === scanId ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const saveNote = async (scanId: string) => {
    if (!noteInput.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = scans.find(s => s.id === scanId)?.note;
    if (existing) {
      await supabase.from('scan_notes').update({ content: noteInput.trim() }).eq('scan_id', scanId).eq('user_id', user.id);
    } else {
      await supabase.from('scan_notes').insert({ scan_id: scanId, user_id: user.id, content: noteInput.trim() });
    }
    setScans(prev => prev.map(s => s.id === scanId ? { ...s, note: noteInput.trim() } : s));
    setEditingNote(null); setNoteInput('');
    toast.success('Заметка сохранена');
  };

  const filtered = scans.filter(s => !verdictFilter || s.verdict === verdictFilter).filter(s => !favOnly || s.isFavorite);
  const grouped = filtered.reduce<Record<string, ScanItem[]>>((acc, s) => {
    const key = s.created_at.slice(0, 10);
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  // Insights
  const greenScans = scans.filter(s => s.verdict === 'green');
  const foodCounts = greenScans.reduce<Record<string, number>>((acc, s) => { acc[s.food_name] = (acc[s.food_name] || 0) + 1; return acc; }, {});
  const bestProducts = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const redScans = scans.filter(s => s.verdict === 'red');
  const redCounts = redScans.reduce<Record<string, number>>((acc, s) => { acc[s.food_name] = (acc[s.food_name] || 0) + 1; return acc; }, {});
  const repeatingMistakes = Object.entries(redCounts).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Daily compliance
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayScans = scans.filter(s => s.created_at.slice(0, 10) === todayKey);
  const greenToday = todayScans.filter(s => s.verdict === 'green').length;
  const yellowToday = todayScans.filter(s => s.verdict === 'yellow').length;
  const redToday = todayScans.filter(s => s.verdict === 'red').length;
  const complianceScore = todayScans.length > 0
    ? Math.round(((greenToday * 1 + yellowToday * 0.5) / todayScans.length) * 100) : 0;

  const verdictIcon = (v: string) => v === 'green' ? <Check className="w-4 h-4 text-safe" /> : v === 'red' ? <X className="w-4 h-4 text-danger" /> : <AlertTriangle className="w-4 h-4 text-warning" />;
  const verdictBg = (v: string) => v === 'green' ? 'bg-safe/10' : v === 'red' ? 'bg-danger/10' : 'bg-warning/10';
  const timeStr = (d: string) => new Date(d).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateLabel = (d: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (d === today) return 'Сегодня';
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (d === y) return 'Вчера';
    return new Date(d).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });
  };

  const newsCard = NEWS_CARDS[profile.goal] || NEWS_CARDS.energy;

  return (
    <MobileLayout title="Лента решений" subtitle={`${goal?.icon} ${goal?.label}`} variant="cool">
      <div className="pt-3 space-y-3">
        {/* Compliance Score */}
        {todayScans.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-premium rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none"
                  stroke={complianceScore >= 70 ? 'hsl(var(--safe))' : complianceScore >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--danger))'}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - complianceScore / 100)}
                  className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-display font-bold">{complianceScore}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1">Соответствие цели</p>
              <div className="flex gap-2">
                {[
                  { val: greenToday, cls: 'text-safe', label: '✅' },
                  { val: yellowToday, cls: 'text-warning', label: '⚠️' },
                  { val: redToday, cls: 'text-danger', label: '🚫' },
                ].map(s => (
                  <span key={s.label} className={`text-sm font-bold ${s.cls}`}>{s.label}{s.val}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Best products & mistakes */}
        {bestProducts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
            className="glass-premium rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-safe" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Лучшие под цель</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bestProducts.map(([name, count]) => (
                <span key={name} className="px-2.5 py-1 rounded-full bg-safe/10 text-safe text-[11px] font-medium">✅ {name} ×{count}</span>
              ))}
            </div>
          </motion.div>
        )}

        {repeatingMistakes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-premium rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Повторяющиеся ошибки</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {repeatingMistakes.map(([name, count]) => (
                <span key={name} className="px-2.5 py-1 rounded-full bg-danger/10 text-danger text-[11px] font-medium">🚫 {name} ×{count}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters — verdict + favorites */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
          {[
            { key: null, label: 'Все', fav: false },
            { key: 'green', label: '✅ Подходит', fav: false },
            { key: 'yellow', label: '⚠️ Спорно', fav: false },
            { key: 'red', label: '🚫 Избегать', fav: false },
            { key: '__fav', label: '⭐ Избранное', fav: true },
          ].map(f => (
            <button key={f.key || 'all'} onClick={() => {
              if (f.fav) { setFavOnly(!favOnly); setVerdictFilter(null); }
              else { setVerdictFilter(f.key === verdictFilter ? null : f.key); setFavOnly(false); }
            }}
              className={`flex-none px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all tap-card ${
                (f.fav && favOnly) || (!f.fav && verdictFilter === f.key) || (!f.fav && !f.key && !verdictFilter && !favOnly)
                  ? 'gradient-organic text-primary-foreground shadow-sm'
                  : 'glass text-muted-foreground'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline — decision feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent" />
            </motion.div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="font-display font-bold text-base mb-1">{favOnly ? 'Нет избранного' : 'Пока нет решений'}</p>
            {favOnly ? (
              <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                Отмеченные звёздочкой сканы появятся здесь — чтобы быстро возвращаться к находкам.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                Здесь будет хроника твоих решений — каждый скан, каждый жетон, каждый день с разрывом
                между тобой и призраком. Появится после первого скана.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, items], gi) => (
              <motion.div key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.03 }}>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">{dateLabel(date)}</p>
                <div className="space-y-1.5">
                  {items.map((scan, i) => {
                    const isExpanded = expandedScan === scan.id;
                    return (
                      <motion.div key={scan.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gi * 0.03 + i * 0.015 }}>
                        <div className="glass-premium rounded-2xl p-3">
                          <button onClick={() => setExpandedScan(isExpanded ? null : scan.id)} className="w-full">
                            <div className="flex items-start gap-2.5">
                              <div className={`w-9 h-9 rounded-xl ${verdictBg(scan.verdict)} flex items-center justify-center shrink-0`}>
                                {verdictIcon(scan.verdict)}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="font-semibold text-sm truncate">{scan.food_name}</p>
                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    {scan.isFavorite && <Star className="w-3 h-3 text-warning fill-warning" />}
                                    <span className="text-[10px] text-muted-foreground">{timeStr(scan.created_at)}</span>
                                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1">{scan.reason}</p>
                              </div>
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="pt-2.5 mt-2.5 border-t border-border/15 space-y-2.5">
                                  {scan.suggestion && (
                                    <div className="flex gap-2 items-start">
                                      <Bookmark className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                                      <p className="text-[11px] text-warning">{scan.suggestion}</p>
                                    </div>
                                  )}
                                  {scan.note && editingNote !== scan.id && (
                                    <div className="glass rounded-xl p-2.5">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <StickyNote className="w-3 h-3 text-accent" />
                                        <span className="text-[10px] font-semibold text-muted-foreground">Заметка</span>
                                      </div>
                                      <p className="text-[11px] text-foreground/80">{scan.note}</p>
                                    </div>
                                  )}
                                  {editingNote === scan.id && (
                                    <div className="glass rounded-xl p-2 flex gap-2">
                                      <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                                        placeholder="Ваша заметка..."
                                        className="flex-1 bg-transparent text-xs outline-none px-2"
                                        autoFocus onKeyDown={e => e.key === 'Enter' && saveNote(scan.id)} />
                                      <Button size="sm" onClick={() => saveNote(scan.id)}
                                        className="rounded-lg h-7 w-7 p-0 gradient-organic border-0">
                                        <Send className="w-3.5 h-3.5 text-primary-foreground" />
                                      </Button>
                                    </div>
                                  )}
                                  <div className="flex gap-1.5">
                                    <button onClick={() => toggleFavorite(scan.id)}
                                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-medium tap-card ${scan.isFavorite ? 'bg-warning/15 text-warning' : 'glass text-muted-foreground'}`}>
                                      <Star className={`w-3 h-3 ${scan.isFavorite ? 'fill-warning' : ''}`} />
                                      {scan.isFavorite ? 'В избранном' : 'Сохранить'}
                                    </button>
                                    <button onClick={() => { setEditingNote(scan.id); setNoteInput(scan.note || ''); }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass text-[10px] font-medium text-muted-foreground tap-card">
                                      <StickyNote className="w-3 h-3" />
                                      {scan.note ? 'Ред.' : 'Заметка'}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Context news card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-premium rounded-2xl p-3.5 flex gap-3">
          <div className="w-8 h-8 rounded-lg gradient-glass-cool flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Полезно знать</p>
            <p className="text-[11px] text-foreground/80 leading-relaxed">{newsCard}</p>
          </div>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
