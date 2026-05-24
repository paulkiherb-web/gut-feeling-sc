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
import { Scan, Upload, X, Check, AlertTriangle, Lightbulb, Plus, Bookmark, ArrowRight, Newspaper, TrendingUp, MessageCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import StateImpactCard from '@/components/state/StateImpactCard';
import { capturePipeline } from '@/core/capture';
import { useAppStore } from '@/core/store/appStore';
import { useScores } from '@/core/hooks/useScores';
import { useStateSnapshot } from '@/core/hooks/useStateSnapshot';
import { usePredictions } from '@/core/hooks/usePredictions';

const GOAL_WHY: Record<string, string> = {
  weight_loss: 'Фокус на дефицит калорий и насыщение белком',
  energy: 'Стабильный сахар и баланс белков с углеводами',
  recovery: 'Приоритет белка, витамина C и omega-3',
  sleep: 'Триптофан, магний и лёгкий ужин',
};

const NEWS_TIPS: Record<string, { title: string; body: string }> = {
  weight_loss: { title: '2 мин: почему клетчатка ускоряет сброс веса', body: 'Клетчатка замедляет всасывание сахара и продлевает сытость — это ваш главный союзник.' },
  energy: { title: '2 мин: почему магний связан с усталостью', body: 'Дефицит магния — причина №1 вялости. Проверьте свой рацион.' },
  recovery: { title: '2 мин: белок после травмы — сколько нужно', body: 'Для восстановления тканей нужно на 20-30% больше белка, чем обычно.' },
  sleep: { title: '2 мин: триптофан и мелатонин из еды', body: 'Бананы, вишня и индейка содержат предшественники мелатонина — лучший ужин для сна.' },
};

const CONTEXTUAL_PROMPTS: Record<string, Record<string, string>> = {
  green: {
    weight_loss: 'Подходит под цель — насыщает и не перегружает калориями. Добавить в режим дня?',
    energy: 'Хороший выбор для стабильной энергии. Добавить в режим дня?',
    recovery: 'Усиливает восстановление — достаточно белка и нутриентов. Добавить в режим дня?',
    sleep: 'Подходит для вечера — не мешает сну. Добавить в режим дня?',
  },
  yellow: {
    weight_loss: 'Для похудения здесь много быстрых углеводов. Показать, чем заменить?',
    energy: 'Для энергии здесь мало белка и слишком быстрые углеводы. Показать, что добрать сейчас?',
    recovery: 'Подходит, но лучше принимать с едой. Добавить в режим дня с оговоркой?',
    sleep: 'Может мешать засыпанию — содержит стимуляторы. Есть альтернатива. Показать?',
  },
  red: {
    weight_loss: 'Слишком калорийно и бедно по нутриентам. Есть более удачная альтернатива — показать 3 варианта?',
    energy: 'Вызовет скачок и падение энергии. Открыть альтернативу?',
    recovery: 'Может замедлить заживление. Спросить помощника о замене?',
    sleep: 'Содержит то, что мешает сну. Показать безопасный аналог?',
  },
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
  const [savedResultId, setSavedResultId] = useState<string | null>(null);

  // State OS — additive context for enriched AI analysis
  const scores = useScores();
  const { snapshot } = useStateSnapshot();
  const { predictions } = usePredictions();

  const buildScanStateContext = () => {
    if (!snapshot) return undefined;
    return {
      scores,
      topRisks: predictions.filter(p => p.score > 45).slice(0, 2).map(p => ({
        label: p.title, risk: Math.round(p.score),
      })),
      readinessLabel: scores.readiness >= 70 ? 'высокая' : scores.readiness >= 45 ? 'средняя' : 'низкая',
      recoveryLabel: scores.recovery >= 70 ? 'хорошее' : scores.recovery >= 45 ? 'среднее' : 'снижено',
    };
  };

  const goal = GOALS.find(g => g.value === profile.goal);
  const news = NEWS_TIPS[profile.goal] || NEWS_TIPS.energy;
  const goalWhy = GOAL_WHY[profile.goal] || GOAL_WHY.energy;

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
          return;
        }
      }
      // Fallback: local history
      try {
        const local = JSON.parse(localStorage.getItem('greenred_scans_local') || '[]');
        if (local[0]) setLastScan(local[0]);
      } catch {}
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
    if (!imageBase64) { toast.error('Сначала загрузите фото'); return; }
    setScanning(true);
    try {
      const currentState = localStorage.getItem('nutrisee_selected_state') || undefined;
      const dayGoalKey = `greenred_day_goal_${new Date().toISOString().slice(0, 10)}`;
      const dayGoal = localStorage.getItem(dayGoalKey) || profile.dayGoal || undefined;
      const longGoal = profile.longGoal || undefined;

      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          image: imageBase64,
          user_profile: {
            age: profile.age, gender: profile.gender, condition: profile.condition,
            customCondition: profile.customCondition,
            goal: profile.goal, surgery_days: profile.surgeryDays,
            height_cm: profile.heightCm, weight_kg: profile.weightKg,
            location: profile.location, diets: profile.diets,
            current_state: currentState,
            day_goal: dayGoal,
            long_goal: longGoal,
          },
          // Additive: inject current state OS context for richer AI analysis
          state_context: buildScanStateContext(),
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: inserted } = await supabase.from('scans').insert({
          user_id: user.id,
          food_name: scanResult.foodName,
          verdict: scanResult.verdict,
          reason: scanResult.reason,
          suggestion: scanResult.suggestion || null,
        }).select('id').single();
        if (inserted) {
          scanResult.id = inserted.id;
          setSavedResultId(inserted.id);
        }
      }

      // Always persist locally too (works without auth and for instant history)
      try {
        const local = JSON.parse(localStorage.getItem('greenred_scans_local') || '[]');
        const next = [scanResult, ...local].slice(0, 200);
        localStorage.setItem('greenred_scans_local', JSON.stringify(next));
      } catch {}

      // Dispatch unified event via capture pipeline (enriches impactHints automatically)
      capturePipeline.scan({
        verdict: scanResult.verdict,
        productName: scanResult.foodName,
        calories: scanResult.calories,
        macros: parsed.macros,
        imageUrl: scanResult.imageUrl,
        details: scanResult.suggestion,
      });

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

  const handleSaveFavorite = async () => {
    if (!savedResultId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('scan_favorites').insert({ scan_id: savedResultId, user_id: user.id });
    toast.success('Сохранено в избранное ⭐');
  };

  const handleAddToDay = () => {
    toast.success('Добавлено в режим дня ✅');
  };

  const verdictConfig = {
    green: { color: 'text-safe', bg: 'bg-safe/10', border: 'border-safe/20', gradient: 'from-safe/20 to-safe/5', icon: Check, label: 'Подходит', emoji: '✅' },
    yellow: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', gradient: 'from-warning/20 to-warning/5', icon: AlertTriangle, label: 'Спорно', emoji: '⚠️' },
    red: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', gradient: 'from-danger/20 to-danger/5', icon: X, label: 'Не подходит', emoji: '🚫' },
  };

  const getActions = (verdict: Verdict) => {
    if (verdict === 'green') return [
      { label: 'Добавить в день', icon: Plus, action: handleAddToDay, primary: true },
      { label: 'Сохранить', icon: Bookmark, action: handleSaveFavorite },
      { label: 'Подробнее', icon: ArrowRight, action: () => navigate('/assistant') },
    ];
    if (verdict === 'yellow') return [
      { label: 'Показать замену', icon: Lightbulb, action: () => navigate('/assistant'), primary: true },
      { label: 'Добавить с оговоркой', icon: Plus, action: handleAddToDay },
      { label: 'Сохранить', icon: Bookmark, action: handleSaveFavorite },
    ];
    return [
      { label: 'Альтернатива', icon: Lightbulb, action: () => navigate('/assistant'), primary: true },
      { label: 'Спросить помощника', icon: MessageCircle, action: () => navigate('/assistant') },
    ];
  };

  return (
    <MobileLayout noPadding>
      <div className="flex flex-col min-h-full px-4 pt-3">
        {/* Goal chip — action-first */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl gradient-organic text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm glow-primary">
              {goal?.icon} {goal?.label || 'Энергия'}
            </div>
            <p className="text-[11px] text-muted-foreground flex-1 leading-snug">{goalWhy}</p>
          </div>
        </motion.div>

        {/* Scanner area — hero CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
          className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="relative w-full max-w-[220px] aspect-square mb-5">
            {/* Glow ring */}
            <motion.div className="absolute -inset-4 rounded-[2rem] opacity-10"
              style={{ background: 'conic-gradient(from 180deg, hsl(var(--glow)), hsl(var(--glow-cool)), hsl(var(--glow-soft)), hsl(var(--glow-warm)), hsl(var(--glow)))' }}
              animate={{ opacity: [0.06, 0.15, 0.06], rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
            {/* Corner marks */}
            <div className="absolute inset-0 rounded-[1.25rem]">
              {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-7 h-7`}>
                  <div className="w-full h-0.5 bg-primary/40 rounded-full" />
                  <div className="h-full w-0.5 bg-primary/40 rounded-full" />
                </div>
              ))}
            </div>
            <div className="absolute inset-1.5 rounded-[1rem] overflow-hidden glass-premium flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity }}>
                    <Scan className="w-10 h-10 text-primary/20 mx-auto mb-1.5" />
                  </motion.div>
                  <p className="text-[11px] text-muted-foreground">Еда · БАДы · Напитки</p>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm flex items-center justify-center">
                  <motion.div className="absolute left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
                  <p className="text-xs font-medium text-primary animate-pulse">Анализируем...</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2.5 w-full max-w-[280px]">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <Button variant="outline" onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-2xl h-12 glass border-border/30 text-xs">
              <Upload className="w-4 h-4 mr-1.5" /> Загрузить
            </Button>
            <Button onClick={handleScan} disabled={scanning || !imageBase64}
              className="flex-[1.4] rounded-2xl h-12 text-xs font-bold gradient-organic border-0 shadow-lg glow-primary">
              {scanning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Scan className="w-5 h-5" />
                </motion.div>
              ) : (
                <><Scan className="w-4 h-4 mr-1.5" /> Сканировать</>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Last Result — progressive disclosure via bottom sheet */}
        {lastScan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5">Последний результат</p>
            <button onClick={() => { setResult(lastScan); setDrawerOpen(true); }}
              className="w-full glass-premium rounded-2xl p-3 flex items-center gap-3 text-left tap-card">
              <div className={`w-9 h-9 rounded-xl ${verdictConfig[lastScan.verdict].bg} flex items-center justify-center shrink-0`}>
                {(() => { const Icon = verdictConfig[lastScan.verdict].icon; return <Icon className={`w-4 h-4 ${verdictConfig[lastScan.verdict].color}`} />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{lastScan.foodName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{lastScan.reason}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            </button>
          </motion.div>
        )}

        {/* Context News — one card, no feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-3 mb-2">
          <div className="glass-premium rounded-2xl p-3.5 flex gap-3">
            <div className="w-9 h-9 rounded-xl gradient-glass-cool flex items-center justify-center shrink-0">
              <Newspaper className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{news.title}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{news.body}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result Drawer — progressive disclosure: status → reasons → action */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="rounded-t-[1.75rem] border-border/10 max-h-[92dvh]">
          {result && (() => {
            const vc = verdictConfig[result.verdict];
            const Icon = vc.icon;
            const contextPrompt = CONTEXTUAL_PROMPTS[result.verdict]?.[profile.goal] || '';
            const actions = getActions(result.verdict);
            return (
              <div className="px-5 pb-6 pt-1 overflow-y-auto max-h-[85dvh] no-scrollbar">
                {/* Level 1: Status */}
                <div className="flex flex-col items-center py-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${vc.gradient} border ${vc.border} flex items-center justify-center mb-2 shadow-lg`}>
                    <Icon className={`w-7 h-7 ${vc.color}`} />
                  </motion.div>
                  <DrawerTitle className="text-lg font-display font-bold text-center">{result.foodName}</DrawerTitle>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${vc.bg} ${vc.color} border ${vc.border}`}>
                    {vc.emoji} {vc.label}
                  </span>
                  <DrawerDescription className="sr-only">Результат анализа</DrawerDescription>
                </div>

                {/* Level 2: Reasons */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="glass-premium rounded-2xl p-4 mb-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">🧠 Почему</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{result.reason}</p>
                </motion.div>

                {/* Context prompt */}
                {contextPrompt && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`rounded-2xl p-4 mb-3 border ${vc.border} ${vc.bg}`}>
                    <div className="flex gap-2.5 items-start">
                      <TrendingUp className={`w-4 h-4 ${vc.color} shrink-0 mt-0.5`} />
                      <p className="text-sm leading-relaxed text-foreground/80">{contextPrompt}</p>
                    </div>
                  </motion.div>
                )}

                {result.suggestion && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="glass-premium rounded-2xl p-4 flex gap-2.5 mb-3">
                    <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Лучше попробуйте</p>
                      <p className="text-sm text-foreground/90">{result.suggestion}</p>
                    </div>
                  </motion.div>
                )}

                {/* State impact — derived from unified store */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mb-3">
                  <StateImpactCard />
                </motion.div>



                {/* Level 3: Actions — sticky CTA */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="space-y-2.5 mb-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Следующее действие</p>
                  {actions.filter(a => a.primary).map((a, i) => {
                    const AIcon = a.icon;
                    return (
                      <Button key={i} onClick={a.action}
                        className="w-full rounded-2xl h-12 text-sm font-semibold gradient-organic border-0 shadow-lg glow-primary">
                        <AIcon className="w-4 h-4 mr-2" /> {a.label}
                      </Button>
                    );
                  })}
                  <div className="flex flex-wrap gap-1.5">
                    {actions.filter(a => !a.primary).map((a, i) => {
                      const AIcon = a.icon;
                      return (
                        <button key={i} onClick={a.action}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-premium text-xs font-medium tap-card">
                          <AIcon className="w-3.5 h-3.5" /> {a.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                <div className="glass rounded-xl p-2.5 mb-3">
                  <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                    ⚠️ AI-рекомендация, НЕ медицинское заключение.
                  </p>
                </div>

                <Button onClick={() => { setDrawerOpen(false); setImagePreview(null); setImageBase64(null); }}
                  variant="outline" className="w-full rounded-2xl h-11 glass border-border/30 text-sm">
                  Сканировать ещё
                </Button>
              </div>
            );
          })()}
        </DrawerContent>
      </Drawer>
    </MobileLayout>
  );
}
