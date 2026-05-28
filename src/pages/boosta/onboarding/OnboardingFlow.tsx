import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Step1Welcome from './Step1Welcome';
import Step2TwoSelves from './Step2TwoSelves';
import Step3Goal from './Step3Goal';
import Step4Course from './Step4Course';
import Step5GhostMeet from './Step5GhostMeet';
import Step6Honesty from './Step6Honesty';
import Step7Biometrics from './Step7Biometrics';
import Step8Health from './Step8Health';
import Step9Diet from './Step9Diet';
import Step10Activity from './Step10Activity';
import Step11GhostBirth from './Step11GhostBirth';
import Step7Ready from './Step7Ready';
import { boostaTokens } from '@/design/boosta/tokens';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/core/store/appStore';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import type { Course } from '@/core/store/slices/boostaSlice';
import type { BiometricData } from './Step7Biometrics';
import type { DietData } from './Step9Diet';
import type { ActivityData } from './Step10Activity';

const TOTAL = 12;

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [course, setCourse] = useState('');

  // Biometrics (step 6)
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);

  // Health (step 7)
  const [conditions, setConditions] = useState<string[]>([]);

  // Diet (step 8)
  const [dietType, setDietType] = useState('unrestricted');
  const [ifWindow, setIfWindow] = useState('');
  const [badHabits, setBadHabits] = useState<string[]>([]);

  // Activity (step 9)
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [sleepHours, setSleepHours] = useState('7_8');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');

  const navigate = useNavigate();
  const setProfile = useAppStore((s) => s.setProfile);

  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));

  const handleBiometrics = (data: BiometricData) => {
    setGender(data.gender);
    setAge(data.age);
    setHeightCm(data.heightCm);
    setWeightKg(data.weightKg);
    next();
  };

  const handleDiet = (data: DietData) => {
    setDietType(data.dietType);
    setIfWindow(data.ifWindow);
    setBadHabits(data.badHabits);
    next();
  };

  const handleActivity = (data: ActivityData) => {
    setActivityLevel(data.activityLevel);
    setSleepHours(data.sleepHours);
    setWakeTime(data.wakeTime);
    setSleepTime(data.sleepTime);
    next();
  };

  const finish = async () => {
    setProfile({
      gender,
      age,
      heightCm: heightCm ?? undefined,
      weightKg: weightKg ?? undefined,
      conditions,
      dietType,
      ifWindow,
      badHabits,
      activityLevel,
      sleepHours,
      wakeTime,
      sleepTime,
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          user_id: user.id,
          age,
          gender,
          weight_kg: weightKg ?? null,
          height_cm: heightCm ?? null,
          long_goal: goal,
          boosta_onboarded: true,
          boosta_initial_course: course || 'focus',
        }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.warn('Onboarding profile sync failed', error);
    }

    useBoostaStore.getState().setCourse((course || 'focus') as Course);
    localStorage.setItem('boosta_onboarded', 'true');
    navigate('/boosta');
  };

  return (
    <div style={{
      height: '100dvh',
      background: boostaTokens.color.surface.base,
      padding: '20px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch' as never,
      boxSizing: 'border-box',
    }}>
      {/* Прогресс */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 8, paddingBottom: 24 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i <= step
                ? boostaTokens.color.ghost[600]
                : boostaTokens.color.surface.line,
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>

      {/* Назад */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: boostaTokens.color.surface.inkSoft,
            fontSize: 13,
            padding: 4,
            cursor: 'pointer',
          }}
        >
          ← Назад
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {step === 0  && <Step1Welcome key="s1" onNext={next} />}
          {step === 1  && <Step2TwoSelves key="s2" onNext={next} />}
          {step === 2  && <Step3Goal key="s3" onNext={(g) => { setGoal(g); next(); }} />}
          {step === 3  && <Step4Course key="s4" onNext={(c) => { setCourse(c); next(); }} />}
          {step === 4  && <Step5GhostMeet key="s5" onNext={next} />}
          {step === 5  && <Step6Honesty key="s6" onNext={next} />}
          {step === 6  && <Step7Biometrics key="s7" onNext={handleBiometrics} />}
          {step === 7  && <Step8Health key="s8" onNext={(c) => { setConditions(c); next(); }} />}
          {step === 8  && <Step9Diet key="s9" onNext={handleDiet} />}
          {step === 9  && <Step10Activity key="s10" onNext={handleActivity} />}
          {step === 10 && (
            <Step11GhostBirth
              key="s11"
              profile={{ age, gender, conditions, dietType, activityLevel, course: course || 'focus' }}
              onNext={next}
            />
          )}
          {step === 11 && <Step7Ready key="s12" onDone={finish} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
