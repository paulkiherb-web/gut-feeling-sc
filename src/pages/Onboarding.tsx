import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { CONDITIONS, GOALS, type Gender, type Condition, type Goal } from '@/types/profile';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Scan } from 'lucide-react';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full gradient-safe flex items-center justify-center mb-8"
        >
          <Scan className="w-12 h-12 text-safe-foreground" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-medium text-foreground"
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Step {step + 1} of {totalSteps}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-hidden">
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
      <div className="px-6 pb-8 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={prev} className="rounded-2xl h-14 px-6">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Button onClick={next} className="flex-1 rounded-2xl h-14 text-base font-semibold">
          {step === totalSteps - 1 ? 'Complete' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function BiometricsStep({ profile, updateProfile }: any) {
  const genders: { value: Gender; label: string }[] = [
    { value: 'male', label: '♂ Male' },
    { value: 'female', label: '♀ Female' },
    { value: 'other', label: '⚧ Other' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Who are you?</h1>
        <p className="text-muted-foreground mt-2">Tell us about yourself for personalized analysis</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gender</label>
        <div className="flex gap-3">
          {genders.map(g => (
            <button
              key={g.value}
              onClick={() => updateProfile({ gender: g.value })}
              className={`flex-1 py-4 rounded-2xl text-base font-medium transition-all border ${
                profile.gender === g.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Age</label>
          <span className="text-4xl font-bold text-primary">{profile.age}</span>
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
        <h1 className="text-3xl font-bold tracking-tight">Current State</h1>
        <p className="text-muted-foreground mt-2">What best describes your situation?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CONDITIONS.map(c => (
          <button
            key={c.value}
            onClick={() => updateProfile({ condition: c.value })}
            className={`p-5 rounded-2xl text-left transition-all border ${
              profile.condition === c.value
                ? 'bg-primary/10 border-primary shadow-md'
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            <span className="text-3xl">{c.icon}</span>
            <p className="font-semibold mt-3 text-sm">{c.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
          </button>
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
            className="rounded-xl h-12"
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
        <h1 className="text-3xl font-bold tracking-tight">Your Goal</h1>
        <p className="text-muted-foreground mt-2">What are you optimizing for?</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {GOALS.map(g => (
          <button
            key={g.value}
            onClick={() => updateProfile({ goal: g.value })}
            className={`px-6 py-4 rounded-full text-base font-medium transition-all border ${
              profile.goal === g.value
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-card border-border hover:border-primary/50'
            }`}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
