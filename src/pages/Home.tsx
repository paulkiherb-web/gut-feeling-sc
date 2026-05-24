import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Moon, Target, Leaf, Salad, Scale, Scan, ArrowRight, Sparkles, Crown, Plus } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/core/store/appStore';
import StateHeroCard from '@/components/home/StateHeroCard';
import NextBestActionCard from '@/components/home/NextBestActionCard';
import PredictionWarningsCard from '@/components/home/PredictionWarningsCard';
import RecoveryTrajectoryCard from '@/components/home/RecoveryTrajectoryCard';
import BehavioralInsightFeed from '@/components/home/BehavioralInsightFeed';
import DailyMomentumCard from '@/components/home/DailyMomentumCard';
import StateTimelineCard from '@/components/home/StateTimelineCard';
import LongitudinalInsightsCard from '@/components/home/LongitudinalInsightsCard';
import PersonalPatternsCard from '@/components/home/PersonalPatternsCard';
import DriftSignalsCard from '@/components/home/DriftSignalsCard';
import QuickLogPanel from '@/components/state/QuickLogPanel';
import CourseTodayCard from '@/components/course/CourseTodayCard';
import { selectPredictions } from '@/core/store/selectors';
import { AdaptiveSurfaceLayer, useAdaptiveExperience } from '@/design/adaptive';

type StateKey = 'energy' | 'sleep' | 'focus' | 'calm' | 'digestion' | 'weight';
interface StateOpt { key: StateKey; labelRu: string; labelEn: string; Icon: typeof Zap; }

const STATES: StateOpt[] = [
  { key: 'energy',    labelRu: 'Энергия',  labelEn: 'Energy',    Icon: Zap },
  { key: 'sleep',     labelRu: 'Сон',      labelEn: 'Sleep',     Icon: Moon },
  { key: 'focus',     labelRu: 'Фокус',    labelEn: 'Focus',     Icon: Target },
  { key: 'calm',      labelRu: 'Спокойн.', labelEn: 'Calm',      Icon: Leaf },
  { key: 'digestion', labelRu: 'ЖКТ',      labelEn: 'Digestion', Icon: Salad },
  { key: 'weight',    labelRu: 'Вес',      labelEn: 'Weight',    Icon: Scale },
];

const SELECTED_STATE_KEY = 'nutrisee_selected_state';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { lang, t } = useI18n();
  const setGoals = useAppStore(s => s.setGoals);
  const predictions = useAppStore(selectPredictions);
  const { focusModeActive, showSection, filterPredictions, secondaryOpacity } = useAdaptiveExperience();

  const [selected, setSelected] = useState<StateKey>(() => {
    const saved = localStorage.getItem(SELECTED_STATE_KEY) as StateKey | null;
    return saved && STATES.find(s => s.key === saved) ? saved : 'energy';
  });
  const [userName, setUserName] = useState<string>('');
  const [quickLog, setQuickLog] = useState(false);

  useEffect(() => {
    localStorage.setItem(SELECTED_STATE_KEY, selected);
    setGoals({ currentFocusState: selected });
  }, [selected, setGoals]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const name = profile.displayName || user.email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      } else if (profile.displayName) setUserName(profile.displayName);
    })();
  }, [profile.displayName]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (lang === 'ru') return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <MobileLayout title="" hideNav={false} noPadding variant="default">
      <div className="px-5 pt-3 pb-6 safe-top">
        {/* Brand */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-2xl gradient-organic flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="relative w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-[17px] tracking-tight">NutriSee</span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/70 mt-0.5">State · Operating · Center</span>
            </div>
          </div>
          <button onClick={() => navigate('/paywall')}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full overflow-hidden active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, hsl(45 95% 60% / 0.18), hsl(36 92% 56% / 0.10))', border: '1px solid hsl(45 95% 60% / 0.4)' }}>
            <Crown className="w-3 h-3" style={{ color: 'hsl(42 95% 55%)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'hsl(42 90% 50%)' }}>
              {lang === 'ru' ? 'Премиум' : 'Premium'}
            </span>
          </button>
        </div>

        <p className="text-[12px] text-muted-foreground font-medium mb-3">
          {greeting}{userName ? `, ` : ''}<span className="text-foreground font-semibold">{userName}</span> 👋
        </p>

        {/* Focus state selector */}
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {STATES.map(s => {
            const isActive = selected === s.key;
            const Icon = s.Icon;
            return (
              <motion.button key={s.key} whileTap={{ scale: 0.92 }} onClick={() => setSelected(s.key)}
                className={`relative flex flex-col items-center justify-center gap-1 h-[60px] rounded-2xl transition-all overflow-hidden px-0.5 ${
                  isActive ? 'text-primary-foreground shadow-lg shadow-primary/30' : 'glass border border-border/30 text-foreground/80'
                }`}
                style={isActive ? { background: 'linear-gradient(145deg, hsl(var(--primary)), hsl(var(--ring)))' } : undefined}>
                <Icon className={`relative w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-primary/80'}`} strokeWidth={2.2} />
                <span className="relative text-[9px] font-semibold leading-none text-center truncate w-full">
                  {lang === 'ru' ? s.labelRu : s.labelEn}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/*
          Adaptive Surface Layer
          Applies section gap scaling and data attributes.
          Core cards always render. Optional sections are conditionally shown.
        */}
        <AdaptiveSurfaceLayer>
          {/* Course today — primary block */}
          <CourseTodayCard />

          {/* Hero state — always shown */}
          <StateHeroCard />

          {/* Prediction warnings — shown when active risks exist (focus mode: critical only) */}
          {filterPredictions(predictions).some(p => p.riskLevel !== 'low') && (
            <PredictionWarningsCard />
          )}

          {/* Next Best Action — always shown */}
          <NextBestActionCard />

          {/* Scan CTA — always shown */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/scanner')}
            className="w-full flex items-center gap-3 glass-premium rounded-2xl p-3.5">
            <div className="w-10 h-10 rounded-xl gradient-organic flex items-center justify-center shrink-0 shadow-md glow-primary">
              <Scan className="w-5 h-5 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-display font-bold leading-tight">{t('home.scan.cta')}</p>
              <p className="text-[10px] text-muted-foreground">{t('home.scan.sub')}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>

          {/* ── Secondary section ─────────────────────────────────── */}
          <div className="mt-1 space-y-3" style={{ opacity: secondaryOpacity }}>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/30" />
              <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50 font-bold">
                {t('home.secondary.label')}
              </span>
              <div className="h-px flex-1 bg-border/30" />
            </div>

            {showSection('trajectory') && <RecoveryTrajectoryCard />}

            {showSection('momentum') && <DailyMomentumCard />}

            {!focusModeActive && showSection('insights') && <BehavioralInsightFeed />}

            {!focusModeActive && showSection('timeline') && <StateTimelineCard />}

            {!focusModeActive && showSection('trajectory') && <DriftSignalsCard />}

            {!focusModeActive && showSection('insights') && <LongitudinalInsightsCard />}

            {!focusModeActive && showSection('insights') && <PersonalPatternsCard />}
          </div>
        </AdaptiveSurfaceLayer>

        {/* Quick Log FAB */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setQuickLog(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full gradient-organic shadow-xl shadow-primary/30 flex items-center justify-center glow-primary"
        >
          <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
        </motion.button>
      </div>

      <QuickLogPanel open={quickLog} onClose={() => setQuickLog(false)} />
    </MobileLayout>
  );
}
