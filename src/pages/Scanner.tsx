import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { aiInvoke } from '@/core/ai/aiGateway';
import type { ScanResult, Verdict } from '@/types/profile';
import { GOALS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Scan, Upload, X, Check, AlertTriangle, Lightbulb, Plus, Bookmark, ArrowRight, Newspaper, TrendingUp, MessageCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import MobileLayout from '@/components/MobileLayout';
import StateImpactCard from '@/components/state/StateImpactCard';
import ScanCourseImpactCard from '@/components/course/ScanCourseImpactCard';
import { capturePipeline } from '@/core/capture';
import { useAppStore } from '@/core/store/appStore';
import { COURSE_CATALOG } from '@/core/course';
import { useI18n } from '@/contexts/I18nContext';
import { useScores } from '@/core/hooks/useScores';
import { useStateSnapshot } from '@/core/hooks/useStateSnapshot';
import { usePredictions } from '@/core/hooks/usePredictions';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { mapVerdictToImpact } from '@/core/boosta/mappers';
import { persistEvent } from '@/core/boosta/syncEvents';
import GhostAlternative from '@/components/boosta/ghost/GhostAlternative';
import SmartTokenPicker from '@/components/tokens/SmartTokenPicker';
import { boostaTokenMeta } from '@/components/tokens/boostaTokenMeta';

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

interface ScannerProps {
  boostaMode?: boolean;
}

/** Offline keyword-based food analysis for when AI backend is unavailable */
function localAnalyzeFood(foodName: string): { food_name: string; verdict: string; reason: string; suggestion?: string } {
  const name = (foodName || '').toLowerCase();
  const green = /курица|грудка|рыба|лосос|тунец|треска|яйц|греч|овсян|брокк|шпинат|помидор|огурец|яблок|авокад|орех|творог|кефир|йогурт|индейк|чечевиц|горох|фасоль|киноа|листья|салат|морковь|свёкл|черник|малин/;
  const red = /алкоголь|пиво|вин|водка|коньяк|виски|чипс|сухар|бургер|хот-дог|пицц|торт|пирожн|конфет|шоколад|газирован|кола|фастфуд|майонез|колбас/;
  if (green.test(name)) return { food_name: foodName, verdict: 'green', reason: 'Богатый нутриентами выбор — хорошо подходит под план.' };
  if (red.test(name)) return { food_name: foodName, verdict: 'red', reason: 'Высокая нагрузка — лучше с осторожностью.', suggestion: 'Попробуй заменить на более питательный вариант.' };
  return { food_name: foodName, verdict: 'yellow', reason: 'Умеренный выбор — контекст имеет значение.', suggestion: 'Оцени в рамках своего плана на день.' };
}

export default function Scanner({ boostaMode = false }: ScannerProps) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [ghostAlt, setGhostAlt] = useState<{ original: string; alternative: string; reason: string } | null>(null);
  const [loadingGhostAlt, setLoadingGhostAlt] = useState(false);
  const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
  // Macros captured during scan, committed to state only when user clicks "Add to day"
  const [scanMacros, setScanMacros] = useState<{ protein?: number; carbs?: number; fat?: number } | undefined>(undefined);

  // Active course for context display
  const courseState = useAppStore((s) => s.course);
  const courseMeta = COURSE_CATALOG[courseState.activeCourse];
  const boostaCourse = useBoostaStore((s) => s.todayCourse);

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
  const news = NEWS_TIPS[courseState.activeCourse] || NEWS_TIPS[profile.goal] || NEWS_TIPS.energy;
  const goalWhy = GOAL_WHY[courseState.activeCourse] || GOAL_WHY[profile.goal] || GOAL_WHY.energy;

  const normalizeImageForScan = (file: File) => new Promise<{ preview: string; base64: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Не удалось подготовить изображение'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось открыть изображение'));
      img.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось подготовить холст'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const normalizedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        const [, base64 = ''] = normalizedDataUrl.split(',');
        if (!base64) {
          reject(new Error('Не удалось получить данные изображения'));
          return;
        }

        resolve({ preview: normalizedDataUrl, base64 });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

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
            verdict: ((data[0].verdict ?? 'yellow').toLowerCase()) as Verdict,
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


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const normalized = await normalizeImageForScan(file);
      setImagePreview(normalized.preview);
      setImageBase64(normalized.base64);
    } catch (err) {
      console.error('Image prepare error:', err);
      toast.error(err instanceof Error ? err.message : 'Не удалось подготовить изображение');
    } finally {
      e.target.value = '';
    }
  };

  const handleScan = async () => {
    if (!imageBase64) { toast.error('Сначала загрузите фото'); return; }
    setScanning(true);
    try {
      const currentState = localStorage.getItem('nutrisee_selected_state') || undefined;
      const dayGoalKey = `greenred_day_goal_${new Date().toISOString().slice(0, 10)}`;
      const dayGoal = localStorage.getItem(dayGoalKey) || profile.dayGoal || undefined;
      const longGoal = profile.longGoal || undefined;

      const { data, error } = await aiInvoke<Record<string, unknown>>({
        functionName: 'analyze-food',
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
      if (error) throw new Error(error.message);
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

      // Store macros so handleAddToDay can commit the event with full nutrition data
      setScanMacros(parsed.macros);

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
    if (!result) return;

    // Commit the scan to the unified event store — updates scores, DualBattery, home metrics
    capturePipeline.scan({
      verdict: result.verdict,
      productName: result.foodName,
      macros: scanMacros,
      imageUrl: result.imageUrl,
      details: result.suggestion,
    });

    // Mirror to Boosta store so ghost-path and token analytics stay in sync
    const boostaAddEvent = useBoostaStore.getState().addEvent;
    boostaAddEvent({
      category: 'food',
      name: result.foodName,
      impactReal: mapVerdictToImpact(result.verdict, 'real'),
      impactGhost: mapVerdictToImpact(result.verdict, 'ghost'),
      verdict: result.verdict === 'green' ? 'aligned' : result.verdict === 'red' ? 'drift' : 'neutral',
      note: result.reason,
    });
    const latestEvent = useBoostaStore.getState().events.at(-1);
    if (latestEvent) persistEvent(latestEvent);

    toast.success('Добавлено в режим дня ✅');
    setDrawerOpen(false);
  };

  const handleGhostAlternative = async (foodName: string) => {
    if (loadingGhostAlt) return;
    setLoadingGhostAlt(true);
    try {
      const { data, error } = await aiInvoke<{ alternative: string; reason: string }>({
        functionName: 'analyze-food',
        body: { boosta_alternative_mode: true, scannedFood: foodName, course: boostaCourse },
      });
      if (error) throw new Error(error.message);
      setGhostAlt({ original: foodName, alternative: data!.alternative, reason: data!.reason });
    } catch {
      toast.error('Не удалось получить альтернативу');
    } finally {
      setLoadingGhostAlt(false);
    }
  };

  
  const handleScanByName = async (foodName: string) => {
    setGhostAlt(null);
    setDrawerOpen(false);
    setScanning(true);
    setScanMacros(undefined);
    try {
      const currentState = localStorage.getItem('nutrisee_selected_state') || undefined;
      const dayGoalKey = `greenred_day_goal_${new Date().toISOString().slice(0, 10)}`;
      const dayGoal = localStorage.getItem(dayGoalKey) || profile.dayGoal || undefined;
      const longGoal = profile.longGoal || undefined;
      const { data, error } = await aiInvoke<Record<string, unknown>>({
        functionName: 'analyze-food',
        body: {
          boosta_text_scan_mode: true,
          foodName,
          course: boostaCourse,
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
          state_context: buildScanStateContext(),
        },
      });
      // Fallback to local keyword analysis when AI backend is unavailable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed: Record<string, any> = error
        ? localAnalyzeFood(foodName)
        : (typeof data === 'string' ? JSON.parse(data) : data);
      const scanResult: ScanResult = {
        id: crypto.randomUUID(),
        foodName: parsed.food_name || foodName,
        verdict: (parsed.verdict?.toLowerCase() || 'yellow') as Verdict,
        reason: parsed.reason || 'Анализ завершён',
        suggestion: parsed.suggestion,
        createdAt: new Date().toISOString(),
      };
      setResult(scanResult);
      setLastScan(scanResult);
      setDrawerOpen(true);
    } catch {
      toast.error('Не удалось проанализировать альтернативу');
    } finally {
      setScanning(false);
    }
  };

  const verdictConfig = {
    green: { color: 'text-safe', bg: 'bg-safe/10', border: 'border-safe/20', gradient: 'from-safe/20 to-safe/5', icon: Check, label: 'Подходит', emoji: '✅' },
    yellow: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', gradient: 'from-warning/20 to-warning/5', icon: AlertTriangle, label: 'Спорно', emoji: '⚠️' },
    red: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', gradient: 'from-danger/20 to-danger/5', icon: X, label: 'Не подходит', emoji: '🚫' },
  };
  // Safe lookup — normalises verdict to lowercase and falls back to yellow
  // so uppercase verdicts stored in DB ('Yellow', 'GREEN') never cause a crash.
  const safeVc = (v: string | undefined) =>
    verdictConfig[(v?.toLowerCase() || 'yellow') as Verdict] ?? verdictConfig.yellow;

  const getActions = (verdict: Verdict) => {
    if (verdict === 'green') return [
      { label: 'Добавить в день', icon: Plus, action: handleAddToDay, primary: true },
      { label: 'Сохранить', icon: Bookmark, action: handleSaveFavorite },
      { label: 'Подробнее', icon: ArrowRight, action: () => navigate('/assistant') },
    ];
    if (verdict === 'yellow') return [
      { label: 'Добавить с оговоркой', icon: Plus, action: handleAddToDay },
      { label: 'Сохранить', icon: Bookmark, action: handleSaveFavorite },
    ];
    return [
      { label: 'Спросить помощника', icon: MessageCircle, action: () => navigate('/assistant') },
    ];
  };

  const inner = (
    <>
    <div className={`flex flex-col min-h-full px-4 ${boostaMode ? 'pt-10' : 'pt-3'}`}>
        {/* Course context — human-facing scanner intro */}
        {!boostaMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
          data-testid="scanner-course-context"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary shrink-0">
              {courseMeta?.shortTitle ?? ''}
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug flex-1">
              {t('scanner.course_context')}
            </p>
          </div>
        </motion.div>
        )}

        {/* Goal chip — shows current active course */}
        {!boostaMode && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl gradient-organic text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm glow-primary">
              {courseMeta?.shortTitle ?? goal?.label ?? 'Энергия'}
            </div>
            <p className="text-[11px] text-muted-foreground flex-1 leading-snug">{goalWhy}</p>
          </div>
        </motion.div>
        )}

        {/* Scanner area — hero CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
          className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="relative w-full max-w-[220px] aspect-square -mt-4 mb-9">
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

          <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
            {/* Camera input — opens rear camera directly */}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            {/* Gallery input — opens photo library / file picker */}
            <input ref={galleryRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <Button onClick={handleScan} disabled={scanning || !imageBase64}
              className="w-full rounded-2xl h-12 text-xs font-bold gradient-organic border-0 shadow-lg glow-primary">
              {scanning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Scan className="w-5 h-5" />
                </motion.div>
              ) : (
                <><Scan className="w-4 h-4 mr-1.5" /> Сканировать</>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()}
                className="rounded-2xl h-12 glass border-border/30 text-xs">
                📷 Камера
              </Button>
              <Button variant="outline" onClick={() => galleryRef.current?.click()}
                className="rounded-2xl h-12 glass border-border/30 text-xs">
                <Upload className="w-3.5 h-3.5 mr-1" /> Альбом
              </Button>
            </div>
            <Button variant="outline" onClick={() => setTokenPickerOpen(true)}
              className="w-full rounded-2xl h-12 glass border-border/30 text-xs">
              <span className="mr-1.5">🏷</span> Жетон
            </Button>
          </div>
        </motion.div>

        {/* Last Result — progressive disclosure via bottom sheet */}
        {lastScan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5">Последний результат</p>
            <button onClick={() => { setResult(lastScan); setDrawerOpen(true); }}
              className="w-full glass-premium rounded-2xl p-3 flex items-center gap-3 text-left tap-card">
              <div className={`w-9 h-9 rounded-xl ${safeVc(lastScan.verdict).bg} flex items-center justify-center shrink-0`}>
                {(() => { const Icon = safeVc(lastScan.verdict).icon; return <Icon className={`w-4 h-4 ${safeVc(lastScan.verdict).color}`} />; })()}
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
        {!boostaMode && (
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
        )}
      </div>

      {/* Result Sheet — plain CSS bottom sheet (no vaul, no portal, no animations that could crash) */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          {/* Sheet panel */}
          <div
            style={{ position: 'relative', background: '#F5F2EC', borderRadius: '24px 24px 0 0', maxHeight: '92dvh', overflowY: 'auto', zIndex: 1 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D5D0C8', margin: '12px auto 0' }} />
            {/* Close row — always visible regardless of result content */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 16px 0' }}>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ fontSize: 22, color: '#8a8070', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}
              >×</button>
            </div>

            {result && (() => {
              let vc = verdictConfig.yellow;
              let contextPrompt = '';
              let actions: ReturnType<typeof getActions> = [];
              try {
                vc = safeVc(result.verdict);
                contextPrompt = CONTEXTUAL_PROMPTS[result.verdict]?.[profile.goal] || '';
                actions = getActions(result.verdict);
              } catch { /* use defaults */ }
              const Icon = vc.icon;

              return (
                <div style={{ padding: '4px 20px 40px' }}>
                  {/* Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 12 }}>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${vc.gradient} border ${vc.border} flex items-center justify-center mb-2 shadow-lg`}>
                      <Icon className={`w-7 h-7 ${vc.color}`} />
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', margin: '4px 0' }}>{result.foodName || 'Результат'}</p>
                    <span className={`inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold ${vc.bg} ${vc.color} border ${vc.border}`}>
                      {vc.emoji} {vc.label}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="glass-premium rounded-2xl p-4 mb-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">🧠 Почему</p>
                    <p className="text-sm leading-relaxed text-foreground/90">{result.reason || '—'}</p>
                  </div>

                  {/* Context prompt */}
                  {!!contextPrompt && (
                    <div className={`rounded-2xl p-4 mb-3 border ${vc.border} ${vc.bg}`}>
                      <div className="flex gap-2.5 items-start">
                        <TrendingUp className={`w-4 h-4 ${vc.color} shrink-0 mt-0.5`} />
                        <p className="text-sm leading-relaxed text-foreground/80">{contextPrompt}</p>
                      </div>
                    </div>
                  )}

                  {/* Suggestion */}
                  {!!result.suggestion && (
                    <div className="glass-premium rounded-2xl p-4 flex gap-2.5 mb-3">
                      <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Как улучшить</p>
                        <p className="text-sm text-foreground/90">{result.suggestion}</p>
                      </div>
                    </div>
                  )}

                  {/* State / course impact (non-boostaMode only) */}
                  {!boostaMode && (
                    <div className="mb-3">
                      <StateImpactCard />
                    </div>
                  )}
                  {!boostaMode && (
                    <div className="mb-3">
                      <ScanCourseImpactCard result={result} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2.5 mb-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Следующее действие</p>
                    {(result.verdict === 'yellow' || result.verdict === 'red') && (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDrawerOpen(false)}
                          className="flex-1 rounded-2xl h-12 text-xs font-semibold glass border-border/30">
                          🍔 Съесть как есть
                        </Button>
                        <Button disabled={loadingGhostAlt} onClick={() => handleGhostAlternative(result.foodName)}
                          className="flex-1 rounded-2xl h-12 text-xs font-semibold gradient-organic border-0 shadow-lg glow-primary">
                          <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
                          {loadingGhostAlt ? '...' : 'Альтернатива'}
                        </Button>
                      </div>
                    )}
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
                  </div>

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
          </div>
        </div>
      )}

      {/* Ghost alternative overlay — boostaMode only */}
      <AnimatePresence>
        {ghostAlt && (
          <GhostAlternative
            original={ghostAlt.original}
            alternative={ghostAlt.alternative}
            reason={ghostAlt.reason}
            onClose={() => setGhostAlt(null)}
            onScanAlternative={() => {
              setGhostAlt(null);
              setDrawerOpen(false);
              setResult(null);
              setImagePreview(null);
              setImageBase64(null);
            }}
          />
        )}
      </AnimatePresence>

      {tokenPickerOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(31,29,26,0.6)',
        }} onClick={() => setTokenPickerOpen(false)}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: '#F5F2EC',
              borderRadius: '24px 24px 0 0',
              maxHeight: '88vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2,
              background: '#E0DBD2', margin: '12px auto 0' }} />
            <SmartTokenPicker
              onSelect={async (tokenType) => {
                setTokenPickerOpen(false);
                const meta = boostaTokenMeta[tokenType];
                const { lookupImpact } = await import('@/core/boosta/impactTable');
                const impact = lookupImpact(meta.labelRu);
                const addEvent = useBoostaStore.getState().addEvent;
                const setWhisper = useBoostaStore.getState().setWhisper;
                addEvent({
                  category: meta.group === 'substance' ? 'substance'
                    : meta.group === 'movement' || meta.group === 'sport' ? 'movement'
                    : meta.group === 'life' ? 'rest' : 'stimulation',
                  name: meta.labelRu,
                  impactReal: impact.real,
                  impactGhost: impact.ghost,
                  verdict: impact.verdict,
                });
                const { persistEvent: persistEventFn } = await import('@/core/boosta/syncEvents');
                const last = useBoostaStore.getState().events.at(-1);
                if (last) persistEventFn(last);
                // Bridge to core event log so token participates in scorecard/recommendations.
                const { dispatchTokenLogged } = await import('@/core/boosta/tokenBridge');
                dispatchTokenLogged(tokenType);
                toast.success(`${meta.labelRu} записано`);
                const { analyzeBoostaEvent } = await import('@/core/boosta/analyzeEvent');
                const allEvents = useBoostaStore.getState().events;
                const course = useBoostaStore.getState().todayCourse;
                analyzeBoostaEvent(meta.labelRu, course, allEvents)
                  .then(a => { if (a.whisper) setWhisper(a.whisper); })
                  .catch(() => {});
              }}
              onClose={() => setTokenPickerOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </>
  );

  if (boostaMode) {
    return <div className="flex flex-col h-full overflow-y-auto no-scrollbar">{inner}</div>;
  }

  return <MobileLayout noPadding>{inner}</MobileLayout>;
}
