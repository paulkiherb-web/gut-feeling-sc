import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';
import { getMyProfile, upsertMyProfile, recomputeProfileStats, type BoostaProfile, type Visibility } from '@/core/boosta/profile';
import { listMyBonds, type BoostaBond } from '@/core/boosta/bonds';
import { listMyTeams, type BoostaTeam } from '@/core/boosta/teams';
import { listMyStories, type BoostaStory } from '@/core/boosta/stories';
import { useSocialUnlock } from '@/core/boosta/unlock';
import TokenCollection from './TokenCollection';

export default function BoostaProfile({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const unlock = useSocialUnlock();
  const [profile, setProfile] = useState<BoostaProfile | null>(null);
  const [bonds, setBonds]   = useState<BoostaBond[]>([]);
  const [teams, setTeams]   = useState<BoostaTeam[]>([]);
  const [stories, setStories] = useState<BoostaStory[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<BoostaProfile>>({});
  const [tab, setTab] = useState<'profile' | 'collection'>('profile');

  useEffect(() => {
    (async () => {
      await recomputeProfileStats();
      const p = await getMyProfile();
      setProfile(p);
      setDraft(p ?? { visibility: 'private' });
      const [b, t, s] = await Promise.all([listMyBonds(), listMyTeams(), listMyStories()]);
      setBonds(b);
      setTeams(t);
      setStories(s);
    })();
  }, []);

  const save = async () => {
    const p = await upsertMyProfile(draft);
    setProfile(p);
    setEditing(false);
  };

  if (!profile && !editing) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md">
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Профиль</h1>
        </BoostaSection>
        <BoostaCard>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, marginBottom: 14 }}>
            Создай свой профиль, чтобы тебя могли найти партнёры и поручители.
          </p>
          <BoostaButton fullWidth onClick={() => setEditing(true)}>Создать профиль</BoostaButton>
        </BoostaCard>
      </div>
    );
  }

  if (editing) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md">
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Редактировать профиль</h1>
        </BoostaSection>
        <BoostaCard>
          <Field label="Имя">
            <input
              value={draft.display_name ?? ''}
              onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <Field label="Handle (@уникальный)">
            <input
              value={draft.handle ?? ''}
              onChange={(e) => setDraft({ ...draft, handle: e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase() })}
              placeholder="my_handle"
              style={inputStyle}
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={draft.bio ?? ''}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              rows={3}
              style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </Field>
          <Field label="Видимость">
            <select
              value={draft.visibility ?? 'private'}
              onChange={(e) => setDraft({ ...draft, visibility: e.target.value as Visibility })}
              style={inputStyle}
            >
              <option value="private">Только я</option>
              <option value="friends">Связанные</option>
              <option value="public">Открыто</option>
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <BoostaButton fullWidth onClick={save}>Сохранить</BoostaButton>
            <BoostaButton variant="ghost" onClick={() => setEditing(false)}>Отмена</BoostaButton>
          </div>
        </BoostaCard>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20,
        background: boostaTokens.color.surface.sunk,
        borderRadius: 14, padding: 4 }}>
        {(['profile', 'collection'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              background: tab === t ? boostaTokens.color.surface.raised : 'transparent',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? boostaTokens.color.surface.ink : boostaTokens.color.surface.inkSoft,
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t === 'profile' ? 'Профиль' : 'Коллекция'}
          </button>
        ))}
      </div>

      {tab === 'collection' && <TokenCollection />}

      {tab === 'profile' && <>
      <BoostaSection spacing="md">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: boostaTokens.color.ghost[200],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: boostaTokens.color.ghost[800], fontWeight: 600,
          }}>
            {profile!.display_name[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>{profile!.display_name}</h1>
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted }}>@{profile!.handle}</p>
          </div>
          <button onClick={() => setEditing(true)} style={{
            fontSize: 12, color: boostaTokens.color.ghost[600], background: 'none', border: 'none', cursor: 'pointer',
          }}>Изменить</button>
        </div>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Близость с призраком · 30 дней">
        <BoostaCard>
          <div style={{ fontSize: 42, fontWeight: 700, color: boostaTokens.color.ghost[600], letterSpacing: '-0.02em' }}>
            {profile!.ghost_proximity_avg}%
          </div>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginTop: 4 }}>
            {profile!.days_active} дн. активности · репутация {profile!.reputation}
          </p>
        </BoostaCard>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Связи">
        {bonds.length === 0 ? (
          <BoostaCard variant="sunk" padding="sm">
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted }}>Пока никого нет рядом.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <BoostaButton variant="secondary" onClick={() => unlock.canMarry ? navigate('/boosta/marry') : alert('Доступно позже')}>
                Жениться
              </BoostaButton>
              <BoostaButton variant="secondary" onClick={() => unlock.canTakeParole ? navigate('/boosta/parole') : alert('Доступно позже')}>
                Взять на поруки
              </BoostaButton>
            </div>
          </BoostaCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bonds.map((b) => (
              <BoostaCard key={b.id} padding="sm">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14 }}>{labelBond(b.bond_type)}</span>
                  <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>{b.status}</span>
                </div>
              </BoostaCard>
            ))}
          </div>
        )}
      </BoostaSection>

      <BoostaSection spacing="lg" label="Команды">
        {teams.length === 0 ? (
          <BoostaCard variant="sunk" padding="sm">
            <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted }}>Ты не состоишь в командах.</p>
            <div style={{ marginTop: 10 }}>
              <BoostaButton variant="secondary" onClick={() => unlock.canJoinTeam ? navigate('/boosta/teams') : alert('Доступно позже')}>
                Найти команду
              </BoostaButton>
            </div>
          </BoostaCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teams.map((t) => (
              <BoostaCard key={t.id} padding="sm">
                <strong style={{ fontSize: 14 }}>{t.name}</strong>
                {t.course_focus && <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, marginLeft: 8 }}>· {t.course_focus}</span>}
              </BoostaCard>
            ))}
          </div>
        )}
      </BoostaSection>

      {profile!.visibility !== 'private' && stories.length > 0 && (
        <BoostaSection spacing="lg" label="Последние истории">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stories.slice(0, 5).map((s) => (
              <BoostaCard key={s.id} padding="sm">
                <span style={{ fontSize: 13 }}>{labelStory(s.story_type)}</span>
                <span style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted, marginLeft: 8 }}>
                  {new Date(s.created_at).toLocaleDateString('ru')}
                </span>
              </BoostaCard>
            ))}
          </div>
        </BoostaSection>
      )}

      <BoostaSection spacing="md">
        <BoostaButton variant="ghost" fullWidth onClick={() => navigate('/boosta')}>← Назад</BoostaButton>
      </BoostaSection>
      </>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  border: `0.5px solid ${boostaTokens.color.surface.line}`,
  background: boostaTokens.color.surface.sunk,
  fontSize: 14,
  marginTop: 4,
  boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>{label}</label>
      {children}
    </div>
  );
}

function labelBond(t: string) {
  return ({ married: 'Married 💍', parole: 'На поруках', sponsor: 'Спонсор', team_mate: 'Команда' } as Record<string, string>)[t] ?? t;
}
function labelStory(t: string) {
  return ({
    gap_today: 'Разрыв за день',
    whisper_moment: 'Реплика призрака',
    breakthrough: 'Прорыв',
    course_complete: 'Курс завершён',
    team_milestone: 'Команда достигла цели',
  } as Record<string, string>)[t] ?? t;
}
