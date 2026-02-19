import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import type { ScanResult, Verdict } from '@/types/profile';
import { SITUATION_TAGS } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from '@/components/ui/drawer';
import { Scan, Upload, X, Check, AlertTriangle, Lightbulb, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import OrganicBackground from '@/components/OrganicBackground';
import BottomNav from '@/components/BottomNav';

export default function Scanner() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customContext, setCustomContext] = useState('');
  const tagsRef = useRef<HTMLDivElement>(null);

  // Load recent scans from DB
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('scans')
          .select('id, food_name, verdict, reason, suggestion, created_at, image_url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        if (data) {
          setRecentScans(data.map(s => ({
            id: s.id,
            foodName: s.food_name,
            verdict: s.verdict as Verdict,
            reason: s.reason,
            suggestion: s.suggestion || undefined,
            imageUrl: s.image_url || undefined,
            createdAt: s.created_at,
          })));
        }
      }
    })();
  }, []);

  const scrollTags = (dir: 'left' | 'right') => {
    tagsRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
  };
  const toggleTag = (label: string) => {
    setSelectedTags(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const situationText = [...selectedTags, customContext].filter(Boolean).join(', ');

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
          situation: situationText,
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
      setDrawerOpen(true);
      setRecentScans(prev => [scanResult, ...prev].slice(0, 3));
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('Ошибка анализа. Попробуйте ещё раз.');
    } finally {
      setScanning(false);
    }
  };

  const verdictConfig = {
    green: { color: 'text-safe', bg: 'bg-safe/10', border: 'border-safe/20', gradient: 'from-safe/20 to-safe/5', icon: Check, label: 'Безопасно для вас', emoji: '✅' },
    yellow: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', gradient: 'from-warning/20 to-warning/5', icon: AlertTriangle, label: 'С осторожностью', emoji: '⚠️' },
    red: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', gradient: 'from-danger/20 to-danger/5', icon: X, label: 'Лучше избегать', emoji: '🚫' },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden pb-20">
      <OrganicBackground variant="default" intensity="subtle" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-2">
        <h2 className="text-lg font-display font-bold tracking-tight mb-2">GreenRed AI</h2>

        {/* Situation Tags */}
        <div className="space-y-2">
          <div className="relative flex items-center gap-1">
            <button onClick={() => scrollTags('left')} className="shrink-0 w-6 h-6 rounded-full glass flex items-center justify-center text-muted-foreground">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div ref={tagsRef} className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {SITUATION_TAGS.map(t => (
                <motion.button
                  key={t.label}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleTag(t.label)}
                  className={`flex-none px-2.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                    selectedTags.includes(t.label)
                      ? 'gradient-organic text-primary-foreground shadow-sm'
                      : 'glass text-muted-foreground'
                  }`}
                >
                  {t.icon} {t.label}
                </motion.button>
              ))}
            </div>
            <button onClick={() => scrollTags('right')} className="shrink-0 w-6 h-6 rounded-full glass flex items-center justify-center text-muted-foreground">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Input
            value={customContext}
            onChange={e => setCustomContext(e.target.value)}
            placeholder="Ситуация: напр. 3й триместр, перед залом..."
            className="rounded-xl h-9 glass border-border/40 text-xs placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-72 h-72 mb-8">
          <motion.div
            className="absolute -inset-3 rounded-3xl opacity-30"
            style={{ background: 'linear-gradient(135deg, hsl(155 72% 40%), hsl(200 50% 45%))' }}
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-10 h-10`}>
              <div className="w-full h-0.5 bg-primary/60 rounded-full" />
              <div className="h-full w-0.5 bg-primary/60 rounded-full" />
            </div>
          ))}
          <div className="absolute inset-3 rounded-2xl overflow-hidden glass flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 4, repeat: Infinity }}>
                  <Scan className="w-14 h-14 text-primary/30 mx-auto mb-3" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Загрузите фото для анализа</p>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm flex items-center justify-center">
                <motion.div
                  className="absolute left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(155 72% 40%), transparent)' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <p className="text-xs font-medium text-primary animate-pulse">Анализируем...</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="rounded-2xl h-14 px-6 glass border-border/40">
            <Upload className="w-5 h-5 mr-2" /> Загрузить
          </Button>
          <Button
            onClick={handleScan}
            disabled={scanning || !imageBase64}
            className="rounded-2xl h-14 px-8 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary"
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
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="relative z-10 px-6 pb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Недавние</p>
          <div className="flex gap-3">
            {recentScans.map(s => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-4 rounded-2xl glass">
                <div className={`w-3 h-3 rounded-full ${s.verdict === 'green' ? 'bg-safe' : s.verdict === 'yellow' ? 'bg-warning' : 'bg-danger'} mb-2`} />
                <p className="text-xs font-medium truncate">{s.foodName}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result Drawer — mobile-optimized */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="rounded-t-[2rem] border-border/20 max-h-[92vh]">
          {result && (() => {
            const vc = verdictConfig[result.verdict];
            const Icon = vc.icon;
            return (
              <div className="px-5 pb-6 pt-2 overflow-y-auto max-h-[85vh]">
                {/* Verdict Hero */}
                <div className="flex flex-col items-center py-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${vc.gradient} border ${vc.border} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className={`w-9 h-9 ${vc.color}`} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <DrawerTitle className="text-xl font-display font-bold text-center">{result.foodName}</DrawerTitle>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                    <span className={`inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${vc.bg} ${vc.color} border ${vc.border}`}>
                      {vc.emoji} {vc.label}
                    </span>
                  </motion.div>
                  <DrawerDescription className="sr-only">Результат анализа продукта</DrawerDescription>
                </div>

                {/* AI Reasoning */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-strong rounded-2xl p-4 mb-3"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">🧠 Анализ AI</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{result.reason}</p>
                </motion.div>

                {/* Suggestion */}
                {result.suggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-strong rounded-2xl p-4 flex gap-3 mb-3"
                  >
                    <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Лучше попробуйте</p>
                      <p className="text-sm text-foreground/90">{result.suggestion}</p>
                    </div>
                  </motion.div>
                )}

                {/* Disclaimer */}
                <div className="glass rounded-2xl p-3 mb-4">
                  <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                    ⚠️ Это AI-рекомендация, а НЕ медицинское заключение. Проконсультируйтесь с врачом перед изменением рациона.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => { setDrawerOpen(false); setImagePreview(null); setImageBase64(null); }}
                    className="flex-1 rounded-2xl h-13 text-base font-semibold gradient-organic border-0 shadow-lg"
                  >
                    Сканировать ещё
                  </Button>
                  <Button variant="outline" onClick={() => toast.info('Функция скоро появится!')} className="rounded-2xl h-13 px-5 glass border-border/40">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </DrawerContent>
      </Drawer>
      <BottomNav />
    </div>
  );
}
