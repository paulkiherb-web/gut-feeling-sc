import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';
import { proposeParole } from '@/core/boosta/bonds';
import { useSocialUnlock, unlockHint } from '@/core/boosta/unlock';

export default function ParoleFlow() {
  const navigate = useNavigate();
  const unlock = useSocialUnlock();
  const [handle, setHandle] = useState('');
  const [course, setCourse] = useState('focus');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!unlock.canTakeParole) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md"><h1 style={{ fontSize: 22, fontWeight: 600 }}>Взять на поруки</h1></BoostaSection>
        <BoostaCard>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft }}>
            {unlockHint('canTakeParole', unlock.daysActive, unlock.eventsTotal)}
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
      await proposeParole(handle, course);
      alert(`Запрос отправлен @${handle}. Когда подопечный подтвердит, ты будешь его вести.`);
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
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Взять на поруки</h1>
        <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginTop: 4 }}>
          Асимметричная связь. Ты ведёшь — он растёт. Твоя репутация растёт за его успехи.
        </p>
      </BoostaSection>
      <BoostaCard>
        <label style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>Handle подопечного</label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
          placeholder="ward_handle"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: `0.5px solid ${boostaTokens.color.surface.line}`,
            background: boostaTokens.color.surface.sunk,
            fontSize: 15, marginTop: 6, marginBottom: 14, boxSizing: 'border-box',
          }}
        />
        <label style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>Курс</label>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: `0.5px solid ${boostaTokens.color.surface.line}`,
            background: boostaTokens.color.surface.sunk,
            fontSize: 15, marginTop: 6, marginBottom: 14, boxSizing: 'border-box',
          }}
        >
          {['focus', 'energy', 'sleep', 'calm', 'weight_loss', 'recovery'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {error && <p style={{ color: boostaTokens.color.state.drift, fontSize: 13, marginBottom: 10 }}>{error}</p>}
        <BoostaButton fullWidth onClick={submit}>{busy ? 'Отправляю…' : 'Предложить взять на поруки'}</BoostaButton>
      </BoostaCard>
    </div>
  );
}
