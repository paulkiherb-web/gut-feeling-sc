import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import type { ScanResult, Verdict } from '@/types/profile';
import { GOALS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { Scan, Upload, X, Check, AlertTriangle, Lightbulb, Plus, Bookmark, ArrowRight, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

// News tips contextual to goals
const NEWS_TIPS: Record<string, { title: string; body: string }> = {
  weight_loss: { title: '2 мин: почему клетчатка ускоряет сброс веса', body: 'Клетчатка замедляет всасывание сахара и продлевает сытость — это ваш главный союзник.' },
  energy: { title: '2 мин: почему магний связан с усталостью', body: 'Дефицит магния — причина №1 вялости. Проверьте свой рацион.' },
  recovery: { title: '2 мин: белок после травмы — сколько нужно', body: 'Для восстановления тканей нужно на 20-30% больше белка, чем обычно.' },
  sleep: { title: '2 мин: триптофан и мелатонин из еды', body: 'Бананы, вишня и индейка содержат предшественники мелатонина — лучший ужин для сна.' },
};

export default function Scanner() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  const goal = GOALS.find(g => g.value === profile.goal);
  const news = NEWS_TIPS[profile.goal] || NEWS_TIPS.energy;

  // Load last scan
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('scans')
          .select('id, food_name, verdict, reason, suggestion, created_at, image_url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data?.[0]) {
          setLastScan({
            id: data[0].id,
            foodName: data[0].food_name,
            verdict: data[0].verdict as Verdict,
            reason: data[0].reason,
            suggestion: data[0].suggestion || undefined,
            imageUrl: data[0].image_url || undefined,
            createdAt: data[0].created_at,
          });
        }
      }
    })();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imageBase64) {
      toast.error('Сначала загрузите фото');
      return;
    }
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          image: imageBase64,
          user_profile: {
            age: profile.age,
            gender: profile.gender,
            condition: profile.condition,
            goal: profile.goal,
            surgery_days: profile.surgeryDays,
            height_cm: profile.heightCm,
            weight_kg: profile.weightKg,
            location: profile.location,
            diets: profile.diets,
          },
        },
      });
      if (error) throw error;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const scanResult: ScanResult = {
        id: crypto.randomUUID(),
        foodName: parsed.food_name || 'Неизвестно',
        verdict: (parsed.verdict?.toLowerCase() || 'yellow') as Verdict,
        reason: parsed.reason || 'Анализ завершён',
        suggestion: parsed.suggestion,
        createdAt: new Date().toISOString(),
      };

      // Save to DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('scans').insert({
          user_id: user.id,
          food_name: scanResult.foodName,
          verdict: scanResult.verdict,
          reason: scanResult.reason,
          suggestion: scanResult.suggestion || null,
        });
      }

      setResult(scanResult);
      setLastScan(scanResult);
      setDrawerOpen(true);
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Ошибка анализа. Попробуйте ещё раз.');
    } finally {
      setScanning(false);
    }
  };

  const verdictConfig = {
    green: { color: 'text-safe', bg: 'bg-safe/10', border: 'border-safe/20', gradient: 'from-safe/20 to-safe/5', icon: Check, label: 'Подходит', emoji: '✅', actions: ['Добавить в день', 'Сохранить', 'Подробнее'] },
    yellow: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', gradient: 'from-warning/20 to-warning/5', icon: AlertTriangle, label: 'Спорно', emoji: '⚠️', actions: ['Показать замену', 'Сравнить', 'Добавить с оговоркой'] },
    red: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', gradient: 'from-danger/20 to-danger/5', icon: X, label: 'Не подходит', emoji: '🚫', actions: ['Альтернатива', 'Спросить помощника'] },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden pb-20">
      <OrganicBackground variant="default" intensity="subtle" />

      <div className="relative z-10 flex-1 flex flex-col px-5 pt-14">
        {/* Goal of the day */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Цель дня</p>
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl gradient-organic text-primary-foreground text-sm font-semibold shadow-sm">
              {goal?.icon} {goal?.label || 'Энергия'}
            </span>
            <p className="text-xs text-muted-foreground flex-1">
              {profile.goal === 'weight_loss' && 'Фокус на калорийность и насыщение'}
              {profile.goal === 'energy' && 'Фокус на белок и сложные углеводы'}
              {profile.goal === 'recovery' && 'Фокус на белок и микронутриенты'}
              {profile.goal === 'sleep' && 'Фокус на триптофан и магний'}
            </p>
          </div>
        </motion.div>

        {/* Big Scanner Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="relative w-full max-w-[280px] aspect-square mb-6">
            {/* Glow */}
            <motion.div
              className="absolute -inset-4 rounded-[2rem] opacity-20"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--glow)))' }}
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Scanner frame */}
            <div className="absolute inset-0 rounded-[1.5rem]">
              {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8`}>
                  <div className="w-full h-0.5 bg-primary/50 rounded-full" />
                  <div className="h-full w-0.5 bg-primary/50 rounded-full" />
                </div>
              ))}
            </div>
            <div className="absolute inset-2 rounded-[1.25rem] overflow-hidden glass flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 4, repeat: Infinity }}>
                    <Scan className="w-12 h-12 text-primary/25 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-xs text-muted-foreground">Еда · БАДы · Лекарства · Напитки</p>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm flex items-center justify-center">
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <p className="text-xs font-medium text-primary animate-pulse">Анализируем...</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 w-full max-w-[320px]">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-2xl h-14 glass border-border/40 text-sm"
            >
              <Upload className="w-4 h-4 mr-2" /> Загрузить
            </Button>
            <Button
              onClick={handleScan}
              disabled={scanning || !imageBase64}
              className="flex-[1.5] rounded-2xl h-14 text-sm font-bold gradient-organic border-0 shadow-lg glow-primary"
            >
              {scanning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Scan className="w-5 h-5" />
                </motion.div>
              ) : (
                <><Scan className="w-5 h-5 mr-2" /> Сканировать</>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Last Result */}
        {lastScan && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Последний результат</p>
            <button
              onClick={() => { setResult(lastScan); setDrawerOpen(true); }}
              className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
            >
              <div className={`w-10 h-10 rounded-xl ${verdictConfig[lastScan.verdict].bg} flex items-center justify-center shrink-0`}>
                {(() => { const Icon = verdictConfig[lastScan.verdict].icon; return <Icon className={`w-5 h-5 ${verdictConfig[lastScan.verdict].color}`} />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{lastScan.foodName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{lastScan.reason}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </motion.div>
        )}

        {/* Contextual News Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 mb-4"
        >
          <div className="glass rounded-2xl p-4 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <Newspaper className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{news.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{news.body}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scan Result Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="rounded-t-[2rem] border-border/20 max-h-[92vh]">
          {result && (() => {
            const vc = verdictConfig[result.verdict];
            const Icon = vc.icon;
            return (
              <div className="px-5 pb-6 pt-2 overflow-y-auto max-h-[85vh]">
                {/* Verdict Hero */}
                <div className="flex flex-col items-center py-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`w-18 h-18 rounded-[1.25rem] bg-gradient-to-br ${vc.gradient} border ${vc.border} flex items-center justify-center mb-3 shadow-lg`}
                  >
                    <Icon className={`w-8 h-8 ${vc.color}`} />
                  </motion.div>
                  <DrawerTitle className="text-xl font-display font-bold text-center">{result.foodName}</DrawerTitle>
                  <span className={`inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${vc.bg} ${vc.color} border ${vc.border}`}>
                    {vc.emoji} {vc.label}
                  </span>
                  <DrawerDescription className="sr-only">Результат анализа</DrawerDescription>
                </div>

                {/* AI Reasoning — 2-3 reasons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-strong rounded-2xl p-4 mb-3"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">🧠 Почему</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{result.reason}</p>
                </motion.div>

                {/* Suggestion / Alternative */}
                {result.suggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-2xl p-4 flex gap-3 mb-3"
                  >
                    <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Лучше попробуйте</p>
                      <p className="text-sm text-foreground/90">{result.suggestion}</p>
                    </div>
                  </motion.div>
                )}

                {/* Next Actions — NutriSee spec */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-2 mb-3"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Следующее действие</p>
                  <div className="flex flex-wrap gap-2">
                    {vc.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (action === 'Добавить в день' || action === 'Добавить с оговоркой') {
                            toast.success('Добавлено в режим дня');
                          } else if (action === 'Сохранить') {
                            toast.success('Сохранено в избранное');
                          } else if (action === 'Спросить помощника') {
                            setDrawerOpen(false);
                            navigate('/assistant');
                          } else {
                            toast.info('Функция скоро появится');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs font-medium transition-all active:scale-95"
                      >
                        {action.includes('Добавить') && <Plus className="w-3.5 h-3.5" />}
                        {action === 'Сохранить' && <Bookmark className="w-3.5 h-3.5" />}
                        {action}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Disclaimer */}
                <div className="glass rounded-2xl p-3 mb-4">
                  <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                    ⚠️ AI-рекомендация, НЕ медицинское заключение. Консультируйтесь с врачом.
                  </p>
                </div>

                {/* Main CTA */}
                <Button
                  onClick={() => { setDrawerOpen(false); setImagePreview(null); setImageBase64(null); }}
                  className="w-full rounded-2xl h-13 text-base font-semibold gradient-organic border-0 shadow-lg"
                >
                  Сканировать ещё
                </Button>
              </div>
            );
          })()}
        </DrawerContent>
      </Drawer>
      <BottomNav />
    </div>
  );
}
