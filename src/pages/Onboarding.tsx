import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { CONDITIONS, GOALS, type Gender } from '@/types/profile';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Scan } from 'lucide-react';
import OrganicBackground from '@/components/OrganicBackground';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function Onboarding() {
  const { profile, updateProfile, completeOnboarding } = useProfile();
  const navigate = useNavigate();
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
        completeOnboarding();
        navigate('/intensive');
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
          Создаём ваш био-цифровой профиль...
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground mt-2">
          Анализируем ваши данные
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
          Шаг {step + 1} из {totalSteps}
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
          {step === totalSteps - 1 ? 'Готово' : 'Далее'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function BiometricsStep({ profile, updateProfile }: any) {
  const genders: { value: Gender; label: string; icon: string }[] = [
    { value: 'male', label: 'Муж.', icon: '♂' },
    { value: 'female', label: 'Жен.', icon: '♀' },
    { value: 'other', label: 'Другое', icon: '⚧' },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Биометрия</h1>
        <p className="text-muted-foreground mt-1 text-sm">Пол и возраст для персонализации</p>
      </div>
      <div className="space-y-2.5">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Пол</label>
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
              <span className="ml-1">{g.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Возраст</label>
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
  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Текущее состояние</h1>
        <p className="text-muted-foreground mt-1 text-sm">Что описывает вас лучше всего?</p>
      </div>
      <div className="space-y-2.5">
        {CONDITIONS.map(c => (
          <motion.button
            key={c.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateProfile({ condition: c.value })}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all ${
              profile.condition === c.value
                ? 'gradient-organic text-primary-foreground shadow-lg glow-primary'
                : 'glass hover:border-primary/20'
            }`}
          >
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{c.label}</p>
              <p className={`text-[11px] mt-0.5 ${profile.condition === c.value ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {c.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function GoalStep({ profile, updateProfile }: any) {
  return (
    <div className="space-y-5 pt-2">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Активная цель</h1>
        <p className="text-muted-foreground mt-1 text-sm">На что хотите сделать упор?</p>
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
            {g.icon} {g.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
