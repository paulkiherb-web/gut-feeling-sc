import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';
import {
  createTeam, joinTeam, leaveTeam, listMyTeams, listOpenTeams, getTeamAvgProximity, type BoostaTeam,
} from '@/core/boosta/teams';
import { useSocialUnlock, unlockHint } from '@/core/boosta/unlock';

export default function Teams() {
  const navigate = useNavigate();
  const unlock = useSocialUnlock();
  const [my, setMy] = useState<BoostaTeam[]>([]);
  const [open, setOpen] = useState<BoostaTeam[]>([]);
  const [avg, setAvg] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [course, setCourse] = useState('focus');

  const refresh = async () => {
    const [m, o] = await Promise.all([listMyTeams(), listOpenTeams()]);
    setMy(m);
    setOpen(o);
    const proxs = await Promise.all([...m, ...o].map(async (t) => [t.id, await getTeamAvgProximity(t.id)] as const));
    setAvg(Object.fromEntries(proxs));
  };

  useEffect(() => { refresh(); }, []);

  const doCreate = async () => {
    if (!name.trim()) return;
    await createTeam(name.trim(), course, true);
    setName('');
    setCreating(false);
    await refresh();
  };

  if (!unlock.canJoinTeam) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md"><h1 style={{ fontSize: 22, fontWeight: 600 }}>Команды</h1></BoostaSection>
        <BoostaCard>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft }}>
            {unlockHint('canJoinTeam', unlock.daysActive, unlock.eventsTotal)}
          </p>
          <div style={{ marginTop: 14 }}><BoostaButton onClick={() => navigate('/boosta')}>Назад</BoostaButton></div>
        </BoostaCard>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <BoostaSection spacing="md">
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Команды</h1>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Мои команды">
        {my.length === 0 ? (
          <BoostaCard variant="sunk" padding="sm">
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted }}>Ты пока не в команде.</p>
          </BoostaCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {my.map((t) => (
              <BoostaCard key={t.id} padding="sm">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{t.name}</strong>
                    <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, marginLeft: 8 }}>
                      · {t.course_focus ?? 'свободный курс'}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: boostaTokens.color.ghost[600] }}>
                    {avg[t.id] ?? 0}%
                  </span>
                </div>
                <button onClick={async () => { await leaveTeam(t.id); refresh(); }} style={{
                  marginTop: 8, fontSize: 12, color: boostaTokens.color.state.drift,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>Выйти</button>
              </BoostaCard>
            ))}
          </div>
        )}
      </BoostaSection>

      <BoostaSection spacing="lg" label="Открытые команды">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {open.filter((o) => !my.some((m) => m.id === o.id)).map((t) => (
            <BoostaCard key={t.id} padding="sm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{t.name}</strong>
                  <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, marginLeft: 8 }}>
                    · {t.course_focus ?? 'свободный'} · близость {avg[t.id] ?? 0}%
                  </span>
                </div>
                <BoostaButton variant="secondary" onClick={async () => { await joinTeam(t.id); refresh(); }}>
                  Вступить
                </BoostaButton>
              </div>
            </BoostaCard>
          ))}
          {open.length === 0 && (
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, textAlign: 'center' }}>
              Открытых команд пока нет.
            </p>
          )}
        </div>
      </BoostaSection>

      {unlock.canCreateTeam ? (
        <BoostaSection spacing="md">
          {!creating ? (
            <BoostaButton fullWidth onClick={() => setCreating(true)}>Создать команду</BoostaButton>
          ) : (
            <BoostaCard>
              <label style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>Название</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
              <label style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 12, display: 'block' }}>Курс</label>
              <select value={course} onChange={(e) => setCourse(e.target.value)} style={input}>
                {['focus', 'energy', 'sleep', 'calm', 'weight_loss', 'recovery'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <BoostaButton variant="ghost" onClick={() => setCreating(false)}>Отмена</BoostaButton>
                <BoostaButton fullWidth onClick={doCreate}>Создать</BoostaButton>
              </div>
            </BoostaCard>
          )}
        </BoostaSection>
      ) : (
        <BoostaSection spacing="md">
          <BoostaCard variant="sunk" padding="sm">
            <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>
              {unlockHint('canCreateTeam', unlock.daysActive, unlock.eventsTotal)}
            </p>
          </BoostaCard>
        </BoostaSection>
      )}
    </div>
  );
}

const input: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: `0.5px solid ${boostaTokens.color.surface.line}`,
  background: boostaTokens.color.surface.sunk,
  fontSize: 15, marginTop: 6, boxSizing: 'border-box',
};
