import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';
import { getMyProfile, recomputeProfileStats, type BoostaProfile, type Visibility } from '@/core/boosta/profile';
import { listMyBonds, type BoostaBond } from '@/core/boosta/bonds';
import { listMyTeams, type BoostaTeam } from '@/core/boosta/teams';
import { listMyStories, type BoostaStory } from '@/core/boosta/stories';
import { useSocialUnlock, unlockHint } from '@/core/boosta/unlock';
import TokenCollection from './TokenCollection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Не авторизован');
      return;
    }

    const { error } = await (supabase as any)
      .from('boosta_users')
      .upsert({
        user_id: user.id,
        display_name: (draft.display_name ?? '').trim() || 'Пользователь',
        handle: (draft.handle ?? '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${user.id.slice(0, 8)}`,
        bio: (draft.bio ?? '').trim(),
        visibility: draft.visibility ?? 'private',
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Profile save error:', error);
      if (error.code === '42P01') {
        toast.error('Таблица профилей не создана. Запустите миграции.');
        return;
      }
      toast.error('Ошибка сохранения');
      return;
    }

    toast.success('Профиль сохранён');
    const p = await getMyProfile();
    setProfile(p);
    setEditing(false);
    onClose?.();
  };

  if (!profile && !editing) {
    return (
      <div style={{ padding: 20 }}>
        <BoostaSection spacing="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Профиль</h1>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              padding: '3px 8px', borderRadius: 20,
              background: 'rgba(239,159,39,0.15)',
              color: '#B45309', border: '1px solid rgba(239,159,39,0.3)',
            }}>БЕТА</span>
          </div>
        </BoostaSection>
        <BoostaCard>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, marginBottom: 6 }}>
            Социальные функции появятся после 7 дней использования.
          </p>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, marginBottom: 14 }}>
            Создай профиль сейчас, чтобы партнёры и поручители могли тебя найти когда разблокируется.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: boostaTokens.color.ghost[200],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: boostaTokens.color.ghost[800], fontWeight: 600,
            }}>
              {profile!.display_name[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{profile!.display_name}</h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                  padding: '2px 6px', borderRadius: 20,
                  background: 'rgba(239,159,39,0.15)',
                  color: '#B45309', border: '1px solid rgba(239,159,39,0.3)',
                }}>БЕТА</span>
              </div>
              <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, margin: '2px 0 0' }}>@{profile!.handle}</p>
            </div>
          </div>
          <button onClick={() => setEditing(true)} style={{
            fontSize: 12, color: boostaTokens.color.ghost[600], background: 'none', border: 'none', cursor: 'pointer',
          }}>Изменить</button>
        </div>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Близость с Лучшим Я · 30 дней">
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
              <div style={{ opacity: unlock.canMarry ? 1 : 0.5 }}>
                <BoostaButton variant="secondary" onClick={() => { if (unlock.canMarry) navigate('/boosta/marry'); }}>
                  Жениться {!unlock.canMarry && `· ${unlockHint('canMarry', unlock.daysActive, unlock.eventsTotal)}`}
                </BoostaButton>
              </div>
              <div style={{ opacity: unlock.canTakeParole ? 1 : 0.5 }}>
                <BoostaButton variant="secondary" onClick={() => { if (unlock.canTakeParole) navigate('/boosta/parole'); }}>
                  Взять на поруки {!unlock.canTakeParole && `· ${unlockHint('canTakeParole', unlock.daysActive, unlock.eventsTotal)}`}
                </BoostaButton>
              </div>
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
              <div style={{ opacity: unlock.canJoinTeam ? 1 : 0.5 }}>
                <BoostaButton variant="secondary" onClick={() => { if (unlock.canJoinTeam) navigate('/boosta/teams'); }}>
                  Найти команду {!unlock.canJoinTeam && `· ${unlockHint('canJoinTeam', unlock.daysActive, unlock.eventsTotal)}`}
                </BoostaButton>
              </div>
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
    whisper_moment: 'Реплика Лучшего Я',
    breakthrough: 'Прорыв',
    course_complete: 'Курс завершён',
    team_milestone: 'Команда достигла цели',
  } as Record<string, string>)[t] ?? t;
}
