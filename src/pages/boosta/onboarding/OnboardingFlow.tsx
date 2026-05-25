import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Step1Welcome from './Step1Welcome';
import Step2TwoSelves from './Step2TwoSelves';
import Step3Goal from './Step3Goal';
import Step4Course from './Step4Course';
import Step5GhostMeet from './Step5GhostMeet';
import Step6Honesty from './Step6Honesty';
import Step7Ready from './Step7Ready';
import { boostaTokens } from '@/design/boosta/tokens';
import { supabase } from '@/integrations/supabase/client';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import type { Course } from '@/core/store/slices/boostaSlice';

const TOTAL = 7;

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [course, setCourse] = useState('');
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));

  const finish = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          long_goal: goal,
          boosta_onboarded: true,
          boosta_initial_course: course || 'focus',
        });
      }
    } catch {
      // silent — continue even if Supabase fails
    }

    useBoostaStore.getState().setCourse((course || 'focus') as Course);
    // Mark locally for gate check (used when user has no Supabase session)
    localStorage.setItem('boosta_onboarded', 'true');
    navigate('/boosta');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: boostaTokens.color.surface.base,
      padding: '20px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Welcome key="s1" onNext={next} />}
          {step === 1 && <Step2TwoSelves key="s2" onNext={next} />}
          {step === 2 && <Step3Goal key="s3" onNext={(g) => { setGoal(g); next(); }} />}
          {step === 3 && <Step4Course key="s4" onNext={(c) => { setCourse(c); next(); }} />}
          {step === 4 && <Step5GhostMeet key="s5" onNext={next} />}
          {step === 5 && <Step6Honesty key="s6" onNext={next} />}
          {step === 6 && <Step7Ready key="s7" onDone={finish} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
