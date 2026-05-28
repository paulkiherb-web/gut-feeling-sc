import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAppStore } from '@/core/store/appStore';
import { CONDITIONS, DIETS, GOALS, type Diet, type Gender, type Goal } from '@/types/profile';
import type { CourseKey } from '@/core/course';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Scan, Plus, Check } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';
import { useI18n } from '@/contexts/I18nContext';

/** Map legacy goal → initial course */
const GOAL_TO_COURSE: Record<Goal, CourseKey> = {
  weight_loss: 'weight_loss',
  longevity: 'calm',
  sleep: 'sleep',
  focus: 'focus',
  muscle_gain: 'muscle_gain',
  energy: 'energy',
  libido: 'calm',
  cardio: 'energy',
  calm: 'calm',
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

// Trim to max N words
const trimWords = (s: string, max = 3) => s.trim().split(/\s+/).filter(Boolean).slice(0, max).join(' ');

export default function Onboarding() {
  const { profile, updateProfile, completeOnboarding } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const setCourse = useAppStore((s) => s.setCourse);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const next = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        // Map profile goal → starting course (user can change later inside the app)
        const initialCourse: CourseKey = GOAL_TO_COURSE[profile.goal] ?? 'energy';
        setCourse({
          activeCourse: initialCourse,
          startedAt: new Date().toISOString(),
          strictness: 'balanced',
          desiredPaceDays: 28,
        });
        completeOnboarding();
        navigate('/home');
      }, 2000);
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
        <OrganicBackground variant="default" intensity="strong" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-24 h-24 flex items-center justify-center mb-8"
        >
          <div className="absolute inset-0 rounded-full gradient-organic opacity-20" />
          <div className="absolute inset-2 rounded-full gradient-organic opacity-40" />
          <div className="w-14 h-14 rounded-full gradient-organic flex items-center justify-center">
            <Scan className="w-7 h-7 text-primary-foreground" />
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-display font-semibold text-foreground text-center px-6">
          {t('onb.creating')}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground mt-2">
          {t('onb.analyzing')}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background relative overflow-hidden">
      <OrganicBackground variant="cool" intensity="subtle" />

      {/* Progress */}
      <div className="relative z-10 px-5 pb-3 safe-top">
        <div className="flex gap-2 pt-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full gradient-organic"
                initial={false}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 font-medium tracking-wide uppercase">
          {t('onb.step')} {step + 1} {t('onb.of')} {totalSteps}
        </p>
      </div>

      {/* Content (scrollable) */}
      <div className="relative z-10 flex-1 px-5 overflow-y-auto overflow-x-hidden no-scrollbar">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pb-4"
          >
            {step === 0 && <BiometricsStep profile={profile} updateProfile={updateProfile} />}
            {step === 1 && <ConditionStep profile={profile} updateProfile={updateProfile} />}
            {step === 2 && <GoalStep profile={profile} updateProfile={updateProfile} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-5 pt-3 pb-4 safe-bottom flex gap-3 border-t border-border/10 glass-strong">
        {step > 0 && (
          <Button variant="outline" onClick={prev} className="rounded-2xl h-12 px-5 glass border-border/40">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={next}
          className="flex-1 rounded-2xl h-12 text-sm font-semibold gradient-organic border-0 shadow-lg glow-primary"
        >
          {step === totalSteps - 1 ? t('common.done') : t('common.next')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function BiometricsStep({ profile, updateProfile }: any) {
  const { t } = useI18n();
  const genders: { value: Gender; labelKey: string; icon: string }[] = [
    { value: 'male', labelKey: 'onb.gender.male', icon: '♂' },
    { value: 'female', labelKey: 'onb.gender.female', icon: '♀' },
    { value: 'other', labelKey: 'onb.gender.other', icon: '⚧' },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('onb.biometrics')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('onb.biometrics.sub')}</p>
      </div>
      <div className="space-y-2.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t('onb.gender')}</label>
        <div className="flex gap-2.5">
          {genders.map(g => (
            <motion.button
              key={g.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateProfile({ gender: g.value })}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                profile.gender === g.value
                  ? 'gradient-organic text-primary-foreground shadow-lg glow-primary'
                  : 'glass hover:border-primary/30'
              }`}
            >
              <span className="text-base">{g.icon}</span>
              <span className="ml-1">{t(g.labelKey)}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t('onb.age')}</label>
          <motion.span key={profile.age} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-display font-bold text-primary">
            {profile.age}
          </motion.span>
        </div>
        <Slider value={[profile.age]} onValueChange={([v]) => updateProfile({ age: v })} min={1} max={100} step={1} className="py-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground"><span>1</span><span>100</span></div>
      </div>
    </div>
  );
}

function ConditionStep({ profile, updateProfile }: any) {
  const { t } = useI18n();
  const [customMode, setCustomMode] = useState(!!profile.customCondition);
  const [draft, setDraft] = useState(profile.customCondition || '');

  const isCustomActive = !!profile.customCondition;

  const saveCustom = () => {
    const trimmed = trimWords(draft, 3);
    if (trimmed) {
      updateProfile({ customCondition: trimmed, condition: 'healthy' });
    } else {
      updateProfile({ customCondition: undefined });
    }
    setDraft(trimmed);
  };

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('onb.condition.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('onb.condition.sub')}</p>
      </div>
      <div className="space-y-2.5">
        {CONDITIONS.map(c => {
          const isActive = !isCustomActive && profile.condition === c.value;
          return (
            <motion.button
              key={c.value}
              whileTap={{ scale: 0.98 }}
              onClick={() => { updateProfile({ condition: c.value, customCondition: undefined }); setCustomMode(false); setDraft(''); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all ${
                isActive
                  ? 'gradient-organic text-primary-foreground shadow-lg glow-primary'
                  : 'glass hover:border-primary/20'
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t(`cond.${c.value}`)}</p>
                <p className={`text-[11px] mt-0.5 ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {t(`cond.${c.value}.desc`)}
                </p>
              </div>
            </motion.button>
          );
        })}

        {/* Custom condition row */}
        <motion.div
          whileTap={{ scale: customMode ? 1 : 0.98 }}
          className={`w-full p-3.5 rounded-2xl transition-all ${
            isCustomActive ? 'gradient-organic text-primary-foreground shadow-lg glow-primary' : 'glass'
          }`}
        >
          {!customMode && !isCustomActive ? (
            <button onClick={() => setCustomMode(true)} className="w-full flex items-center gap-3 text-left">
              <span className="text-2xl">✍️</span>
              <div className="flex-1">
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> {t('onb.condition.custom')}
                </p>
                <p className="text-[11px] mt-0.5 text-muted-foreground">{t('onb.condition.placeholder')}</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              <input
                value={draft}
                onChange={e => setDraft(trimWords(e.target.value, 3))}
                onBlur={saveCustom}
                onKeyDown={e => { if (e.key === 'Enter') { saveCustom(); (e.target as HTMLInputElement).blur(); } }}
                placeholder={t('onb.condition.placeholder')}
                autoFocus
                className={`flex-1 bg-transparent outline-none text-sm font-semibold placeholder:font-normal ${
                  isCustomActive ? 'text-primary-foreground placeholder:text-primary-foreground/60' : 'text-foreground placeholder:text-muted-foreground'
                }`}
              />
              <button onClick={saveCustom} className={`p-1.5 rounded-lg ${isCustomActive ? 'bg-white/20' : 'bg-primary/10'}`}>
                <Check className={`w-4 h-4 ${isCustomActive ? 'text-primary-foreground' : 'text-primary'}`} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function GoalStep({ profile, updateProfile }: any) {
  const { t } = useI18n();

  const toggleDiet = (dietValue: (typeof DIETS)[number]['value']) => {
    if (dietValue === 'none') {
      updateProfile({ diets: [] });
      return;
    }

    const currentDiets: Diet[] = Array.isArray(profile.diets) ? profile.diets : [];
    const nextDiets = currentDiets.includes(dietValue)
      ? currentDiets.filter((value) => value !== dietValue)
      : [...currentDiets.filter((value) => value !== 'none'), dietValue];

    updateProfile({ diets: nextDiets });
  };

  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t('onb.goal.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('onb.goal.sub')}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {GOALS.map(g => (
          <motion.button
            key={g.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => updateProfile({ goal: g.value })}
            className={`px-4 py-3 rounded-full text-sm font-medium transition-all ${
              profile.goal === g.value
                ? 'gradient-organic text-primary-foreground shadow-lg glow-primary'
                : 'glass hover:border-primary/20'
            }`}
          >
            {g.icon} {t(`goal.${g.value}`)}
          </motion.button>
        ))}
      </div>

      <div className="pt-2">
        <h2 className="text-base font-semibold tracking-tight">{t('onb.diet.title')}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t('onb.diet.sub')}</p>
      </div>
      <div className="flex flex-wrap gap-2.5 pb-2">
        {DIETS.map((diet) => {
          const isNone = diet.value === 'none';
          const active = isNone ? !profile.diets?.length : profile.diets?.includes(diet.value);

          return (
            <motion.button
              key={diet.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleDiet(diet.value)}
              className={`px-4 py-3 rounded-full text-sm font-medium transition-all ${
                active
                  ? 'gradient-organic text-primary-foreground shadow-lg glow-primary'
                  : 'glass hover:border-primary/20'
              }`}
            >
              {diet.icon} {t(`diet.${diet.value}`)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
