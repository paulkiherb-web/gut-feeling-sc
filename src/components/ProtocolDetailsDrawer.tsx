import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Target, FlaskConical, AlertTriangle, Loader2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useI18n } from '@/contexts/I18nContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface ProtocolItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  phase?: string;
}

interface Details {
  why: string;
  mechanism: string;
  evidence: { source: string; finding: string }[];
  how_to: string[];
  personalized_note: string;
  caution: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: ProtocolItem | null;
  goal: string;
  depth: string;
}

const cache = new Map<string, Details>();

export default function ProtocolDetailsDrawer({ open, onOpenChange, item, goal, depth }: Props) {
  const { t, lang } = useI18n();
  const { profile } = useProfile();
  const [data, setData] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = item ? `${lang}:${goal}:${depth}:${item.id}:${profile.condition}:${profile.customCondition || ''}:${(profile.diets || []).join(',')}:${profile.age}:${profile.gender}` : '';

  const load = async () => {
    if (!item) return;
    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey)!);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke('protocol-details', {
        body: {
          lang,
          item: {
            title: item.title,
            description: item.description,
            time: item.time,
            phase: item.phase,
            goal,
            depth,
          },
          user_profile: {
            age: profile.age,
            gender: profile.gender,
            condition: profile.condition,
            customCondition: profile.customCondition,
            goal: profile.goal,
            diets: profile.diets,
            height_cm: profile.heightCm,
            weight_kg: profile.weightKg,
          },
        },
      });
      if (fnErr) throw fnErr;
      if (res?.error) throw new Error(res.error);
      cache.set(cacheKey, res as Details);
      setData(res as Details);
    } catch (e: any) {
      setError(e?.message || t('details.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && item) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id, lang]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[1.75rem] border-border/10 max-h-[88vh]">
        <div className="px-5 pb-6 pt-1 overflow-y-auto no-scrollbar">
          <div className="py-3 border-b border-border/10 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-organic flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <DrawerTitle className="text-base font-display font-bold leading-tight">
                  {item?.title || t('details.title')}
                </DrawerTitle>
                <DrawerDescription className="text-[11px] text-muted-foreground mt-0.5">
                  {item?.time && <span className="font-semibold">{item.time} · </span>}
                  {item?.description}
                </DrawerDescription>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">{t('details.loading')}</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-sm text-danger mb-3">{error}</p>
              <button onClick={load} className="px-4 py-2 rounded-xl gradient-organic text-primary-foreground text-xs font-semibold tap-card">
                {t('details.retry')}
              </button>
            </div>
          )}

          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {/* Why */}
              <div className="glass-premium rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">
                    {lang === 'ru' ? 'Зачем' : 'Why'}
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{data.why}</p>
              </div>

              {/* Mechanism */}
              <div className="glass-premium rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-accent" />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">
                    {lang === 'ru' ? 'Механизм' : 'Mechanism'}
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground/90">{data.mechanism}</p>
              </div>

              {/* Evidence */}
              <div className="glass-premium rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">
                    {t('details.studies')}
                  </p>
                </div>
                <div className="space-y-2">
                  {data.evidence.map((ev, i) => (
                    <div key={i} className="glass rounded-xl p-2.5">
                      <p className="text-[11px] font-bold text-primary leading-tight">{ev.source}</p>
                      <p className="text-[12px] text-foreground/80 mt-1 leading-relaxed">{ev.finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to */}
              <div className="glass-premium rounded-2xl p-3.5">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground mb-2">
                  {t('details.how')}
                </p>
                <ul className="space-y-1.5">
                  {data.how_to.map((step, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-foreground/90">
                      <span className="w-5 h-5 shrink-0 rounded-lg gradient-organic text-primary-foreground text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Personalized */}
              {data.personalized_note && (
                <div className="rounded-2xl p-3.5 gradient-aurora border border-primary/20">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary mb-1">
                    {t('details.personalized')}
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/90">{data.personalized_note}</p>
                </div>
              )}

              {/* Caution */}
              {data.caution && data.caution.trim() && (
                <div className="rounded-2xl p-3 flex items-start gap-2 bg-warning/10 border border-warning/30">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-[12px] leading-relaxed text-foreground/80">{data.caution}</p>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-center pt-1 pb-2">
                {lang === 'ru'
                  ? 'Образовательная информация. Не является медицинской рекомендацией.'
                  : 'Educational information. Not medical advice.'}
              </p>
            </motion.div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
