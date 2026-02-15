import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { CONDITIONS, GOALS, type Gender } from '@/types/profile';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        navigate('/paywall');
      }, 2500);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
        <OrganicBackground variant="default" intensity="strong" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-28 flex items-center justify-center mb-10"
        >
          <div className="absolute inset-0 rounded-full gradient-organic opacity-20 animate-morph" />
          <div className="absolute inset-2 rounded-full gradient-organic opacity-40 animate-morph" style={{ animationDelay: '0.5s' }} />
          <div className="w-16 h-16 rounded-full gradient-organic flex items-center justify-center">
            <Scan className="w-8 h-8 text-primary-foreground" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-display font-semibold text-foreground"
        >
          Creating your biological twin...
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mt-2"
        >
          Analyzing your unique profile
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <OrganicBackground variant="cool" intensity="subtle" />

      {/* Progress */}
      <div className="relative z-10 px-6 pt-14 pb-4">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted"
            >
              <motion.div
                className="h-full rounded-full gradient-organic"
                initial={false}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 font-medium tracking-wide">
          Step {step + 1} of {totalSteps}
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full"
          >
            {step === 0 && <BiometricsStep profile={profile} updateProfile={updateProfile} />}
            {step === 1 && <ConditionStep profile={profile} updateProfile={updateProfile} />}
            {step === 2 && <GoalStep profile={profile} updateProfile={updateProfile} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-6 pb-10 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={prev} className="rounded-2xl h-14 px-6 glass border-border/40">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={next}
          className="flex-1 rounded-2xl h-14 text-base font-semibold gradient-organic border-0 shadow-lg glow-primary"
        >
          {step === totalSteps - 1 ? 'Complete' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function BiometricsStep({ profile, updateProfile }: any) {
  const genders: { value: Gender; label: string; icon: string }[] = [
    { value: 'male', label: 'Male', icon: '♂' },
    { value: 'female', label: 'Female', icon: '♀' },
    { value: 'other', label: 'Other', icon: '⚧' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-display font-bold tracking-tight">Who are you?</h1>
        <p className="text-muted-foreground mt-2 text-base">Tell us about yourself for personalized analysis</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Gender</label>
        <div className="flex gap-3">
          {genders.map(g => (
            <motion.button
              key={g.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateProfile({ gender: g.value })}
              className={`flex-1 py-5 rounded-2xl text-base font-medium transition-all ${
                profile.gender === g.value
                  ? 'gradient-organic text-primary-foreground shadow-lg glow-primary'
                  : 'glass hover:border-primary/30'
              }`}
            >
              <span className="text-xl">{g.icon}</span>
              <span className="ml-1">{g.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Age</label>
          <motion.span
            key={profile.age}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-display font-bold text-primary"
          >
            {profile.age}
          </motion.span>
        </div>
        <Slider
          value={[profile.age]}
          onValueChange={([v]) => updateProfile({ age: v })}
          min={1}
          max={100}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

function ConditionStep({ profile, updateProfile }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold tracking-tight">Current State</h1>
        <p className="text-muted-foreground mt-2 text-base">What best describes your situation?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CONDITIONS.map(c => (
          <motion.button
            key={c.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => updateProfile({ condition: c.value })}
            className={`p-5 rounded-2xl text-left transition-all ${
              profile.condition === c.value
                ? 'glass-glow border-primary/50 shadow-lg'
                : 'glass hover:border-primary/20'
            }`}
          >
            <span className="text-3xl">{c.icon}</span>
            <p className="font-semibold mt-3 text-sm">{c.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
          </motion.button>
        ))}
      </div>

      {profile.condition === 'post_surgery' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-muted-foreground">Days since surgery</label>
          <Input
            type="number"
            value={profile.surgeryDays || ''}
            onChange={e => updateProfile({ surgeryDays: Number(e.target.value) })}
            placeholder="e.g. 14"
            className="rounded-xl h-12 glass border-border/40"
          />
        </motion.div>
      )}
    </div>
  );
}

function GoalStep({ profile, updateProfile }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold tracking-tight">Your Goal</h1>
        <p className="text-muted-foreground mt-2 text-base">What are you optimizing for?</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {GOALS.map(g => (
          <motion.button
            key={g.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => updateProfile({ goal: g.value })}
            className={`px-6 py-4 rounded-full text-base font-medium transition-all ${
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
