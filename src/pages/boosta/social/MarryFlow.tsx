import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';
import { proposeMarriage } from '@/core/boosta/bonds';
import { useSocialUnlock, unlockHint } from '@/core/boosta/unlock';

const COURSES = ['focus', 'energy', 'sleep', 'calm', 'weight_loss', 'recovery'];
const DURATIONS = [30, 60, 90];

export default function MarryFlow() {
  const navigate = useNavigate();
  const unlock = useSocialUnlock();
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState('');
  const [course, setCourse] = useState<string>('focus');
  const [duration, setDuration] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!unlock.canMarry) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md">
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Жениться</h1>
        </BoostaSection>
        <BoostaCard>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft }}>
            {unlockHint('canMarry', unlock.daysActive, unlock.eventsTotal)}
          </p>
          <div style={{ marginTop: 14 }}>
            <BoostaButton onClick={() => navigate('/boosta')}>Назад</BoostaButton>
          </div>
        </BoostaCard>
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await proposeMarriage(handle, course);
      alert(`Предложение отправлено @${handle}. Срок: ${duration} дней.`);
      navigate('/boosta');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <BoostaSection spacing="md">
        <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Шаг {step + 1} из 3
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Жениться</h1>
      </BoostaSection>

      {step === 0 && (
        <BoostaCard>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginBottom: 10 }}>
            Введи handle партнёра (без @).
          </p>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            placeholder="partner_handle"
            style={inputStyle}
          />
          <div style={{ marginTop: 14 }}>
            <BoostaButton fullWidth onClick={() => handle && setStep(1)}>Дальше</BoostaButton>
          </div>
        </BoostaCard>
      )}

      {step === 1 && (
        <BoostaCard>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginBottom: 10 }}>
            Какой курс будем держать вместе?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COURSES.map((c) => (
              <button
                key={c}
                onClick={() => setCourse(c)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: course === c ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.sunk,
                  color: course === c ? '#fff' : boostaTokens.color.surface.ink,
                  fontSize: 13,
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <BoostaButton variant="ghost" onClick={() => setStep(0)}>Назад</BoostaButton>
            <BoostaButton fullWidth onClick={() => setStep(2)}>Дальше</BoostaButton>
          </div>
        </BoostaCard>
      )}

      {step === 2 && (
        <BoostaCard>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginBottom: 10 }}>
            На какой срок?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: duration === d ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.sunk,
                  color: duration === d ? '#fff' : boostaTokens.color.surface.ink,
                  fontSize: 14, fontWeight: 500,
                }}
              >
                {d} дн.
              </button>
            ))}
          </div>
          {error && <p style={{ color: boostaTokens.color.state.drift, fontSize: 13, marginTop: 10 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <BoostaButton variant="ghost" onClick={() => setStep(1)}>Назад</BoostaButton>
            <BoostaButton fullWidth onClick={submit}>
              {busy ? 'Отправляю…' : 'Предложить'}
            </BoostaButton>
          </div>
        </BoostaCard>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: `0.5px solid ${boostaTokens.color.surface.line}`,
  background: boostaTokens.color.surface.sunk,
  fontSize: 15,
  boxSizing: 'border-box',
};
