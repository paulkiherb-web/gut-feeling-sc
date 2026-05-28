import { useMemo, type CSSProperties } from 'react';
import { Bell, MoonStar, Palette, UserRound } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAppStore } from '@/core/store/appStore';
import { DIETS, GOALS, type Diet, type Goal } from '@/types/profile';
import { boostaTokens } from '@/design/boosta/tokens';
import { COURSE_CATALOG } from '@/core/course/courseCatalog';
import type { CourseKey } from '@/core/course/types';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';

const GOAL_TO_COURSE: Record<Goal, CourseKey> = {
  weight_loss: 'weight_loss',
  longevity: 'calm',
  sleep: 'sleep',
  focus: 'focus',
  muscle_gain: 'muscle_gain',
  energy: 'energy',
  libido: 'calm',
  cardio: 'energy',
  calm: 'calm',
};

function cardStyle(): CSSProperties {
  return {
    background: boostaTokens.color.surface.raised,
    borderRadius: 24,
    padding: 16,
    border: `1px solid ${boostaTokens.color.surface.line}`,
  };
}

function inputStyle(): CSSProperties {
  return {
    width: '100%',
    borderRadius: 16,
    border: `1px solid ${boostaTokens.color.surface.line}`,
    background: boostaTokens.color.surface.base,
    padding: '12px 14px',
    fontSize: 14,
    color: boostaTokens.color.surface.ink,
    boxSizing: 'border-box',
  };
}

export default function ProfileScreen() {
  const { profile, updateProfile } = useProfile();
  const { t, lang } = useI18n();
  const { themeId, setTheme, themes } = useTheme();
  const activePlanId = useAppStore((state) => state.activeIntensivePlanId);
  const activeCourse = useAppStore((state) => state.course?.activeCourse ?? null);
  const setCourse = useAppStore((state) => state.setCourse);
  const plans = useAppStore((state) => state.intensivePlanOptions);
  const tokenCount = useAppStore((state) => state.eventLog.filter((event) => event.type === 'token.logged').length);
  const correctionsCount = useAppStore((state) => state.corrections.length);
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? null;

  const bmi = useMemo(() => {
    if (!profile.heightCm || !profile.weightKg) return null;
    const meters = profile.heightCm / 100;
    return profile.weightKg / (meters * meters);
  }, [profile.heightCm, profile.weightKg]);

  const currentGoalTitle = t(`goal.${profile.goal}`);
  const currentCourseTitle = activeCourse ? COURSE_CATALOG[activeCourse]?.shortTitle ?? activeCourse : null;
  const notificationsTitle = lang === 'ru' ? 'Уведомления' : 'Notifications';
  const soundTitle = lang === 'ru' ? 'Звук' : 'Sound';
  const rhythmTitle = lang === 'ru' ? 'Ритм и цель' : 'Rhythm and goal';
  const primaryGoalTitle = lang === 'ru' ? 'Основная цель' : 'Primary goal';
  const restWindowTitle = lang === 'ru' ? 'Окно отдыха' : 'Rest window';
  const longGoalTitle = lang === 'ru' ? 'Долгая цель' : 'Long-term goal';
  const longGoalPlaceholder = lang === 'ru' ? 'Например: больше энергии к 16:00' : 'E.g. more energy by 4 PM';
  const themeSectionTitle = lang === 'ru' ? 'Тема приложения' : 'App theme';
  const themeSectionHint = lang === 'ru' ? 'Используем ту же рабочую тему, что и в основном приложении.' : 'Uses the same working theme as the main app.';
  const collectedTitle = lang === 'ru' ? 'Что уже собрано' : 'What is already collected';

  const toggleDiet = (dietValue: (typeof DIETS)[number]['value']) => {
    if (dietValue === 'none') {
      updateProfile({ diets: [] });
      return;
    }

    const currentDiets: Diet[] = Array.isArray(profile.diets) ? profile.diets : [];
    const nextDiets = currentDiets.includes(dietValue)
      ? currentDiets.filter((value) => value !== dietValue)
      : [...currentDiets.filter((value) => value !== 'none'), dietValue];

    updateProfile({ diets: nextDiets });
  };

  const applyGoal = (goal: Goal) => {
    updateProfile({ goal });
    setCourse({ activeCourse: GOAL_TO_COURSE[goal] });
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: boostaTokens.color.surface.base,
        color: boostaTokens.color.surface.ink,
        padding: '20px 16px 110px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: boostaTokens.typography.fontFamily,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--accent) / 0.20))',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <UserRound size={22} color={boostaTokens.color.ghost[700]} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, overflowWrap: 'anywhere' }}>
            {profile.displayName || (lang === 'ru' ? 'Твой профиль' : 'Your profile')}
          </div>
          <div style={{ ...boostaTokens.typography.bodyMuted, color: boostaTokens.color.surface.inkSoft }}>
            {activePlan ? `${activePlan.title} · ${activePlan.badge}` : (lang === 'ru' ? 'План пока не выбран' : 'No active plan yet')}
          </div>
        </div>
      </header>

      <section style={cardStyle()}>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
              {lang === 'ru' ? 'Имя' : 'Name'}
            </span>
            <input style={inputStyle()} value={profile.displayName ?? ''} onChange={(e) => updateProfile({ displayName: e.target.value })} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
                {lang === 'ru' ? 'Возраст' : 'Age'}
              </span>
              <input style={inputStyle()} type="number" value={profile.age ?? ''} onChange={(e) => updateProfile({ age: Number(e.target.value) || 0 })} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
                {lang === 'ru' ? 'Пол' : 'Gender'}
              </span>
              <select style={inputStyle()} value={profile.gender} onChange={(e) => updateProfile({ gender: e.target.value as typeof profile.gender })}>
                <option value="male">{lang === 'ru' ? 'Мужчина' : 'Male'}</option>
                <option value="female">{lang === 'ru' ? 'Женщина' : 'Female'}</option>
                <option value="other">{lang === 'ru' ? 'Другое' : 'Other'}</option>
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
                {lang === 'ru' ? 'Рост, см' : 'Height, cm'}
              </span>
              <input style={inputStyle()} type="number" value={profile.heightCm ?? ''} onChange={(e) => updateProfile({ heightCm: Number(e.target.value) || undefined })} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
                {lang === 'ru' ? 'Вес, кг' : 'Weight, kg'}
              </span>
              <input style={inputStyle()} type="number" value={profile.weightKg ?? ''} onChange={(e) => updateProfile({ weightKg: Number(e.target.value) || undefined })} />
            </label>
          </div>
          {bmi && (
            <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
              {lang === 'ru' ? 'ИМТ' : 'BMI'}:{' '}
              <strong style={{ color: boostaTokens.color.surface.ink }}>{bmi.toFixed(1)}</strong>
            </div>
          )}
        </div>
      </section>

      <section style={cardStyle()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MoonStar size={16} color={boostaTokens.color.ghost[700]} />
          <strong>{rhythmTitle}</strong>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
              {primaryGoalTitle}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GOALS.map((goal) => {
                const active = profile.goal === goal.value;
                return (
                  <button
                    key={goal.value}
                    onClick={() => applyGoal(goal.value)}
                    style={{
                      borderRadius: 999,
                      padding: '10px 14px',
                      border: `1px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                      background: active ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' : boostaTokens.color.surface.base,
                      color: active ? '#fff' : boostaTokens.color.surface.ink,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {goal.icon} {t(`goal.${goal.value}`)}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: boostaTokens.color.surface.inkSoft }}>
              {lang === 'ru'
                ? `Сейчас выбрана цель «${currentGoalTitle}». Маршрут дня строится вокруг курса «${currentCourseTitle ?? GOAL_TO_COURSE[profile.goal]}».`
                : `Your main goal is “${currentGoalTitle}”. The day route is currently built around “${currentCourseTitle ?? GOAL_TO_COURSE[profile.goal]}”.`}
            </div>
          </div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
              {restWindowTitle}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input style={inputStyle()} type="time" value={profile.restStart ?? '22:30'} onChange={(e) => updateProfile({ restStart: e.target.value })} />
              <input style={inputStyle()} type="time" value={profile.restEnd ?? '07:00'} onChange={(e) => updateProfile({ restEnd: e.target.value })} />
            </div>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ ...boostaTokens.typography.fieldLabel, color: boostaTokens.color.surface.inkMuted }}>
              {longGoalTitle}
            </span>
            <input
              style={inputStyle()}
              value={profile.longGoal ?? ''}
              onChange={(e) => updateProfile({ longGoal: e.target.value })}
              placeholder={longGoalPlaceholder}
            />
          </label>
        </div>
      </section>

      <section style={cardStyle()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Bell size={16} color={boostaTokens.color.real[700]} />
          <strong>{lang === 'ru' ? 'Уведомления' : 'Notifications'}</strong>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <ToggleRow
            label={notificationsTitle}
            checked={profile.notificationsEnabled ?? true}
            onChange={(checked) => updateProfile({ notificationsEnabled: checked })}
          />
          <ToggleRow
            label={soundTitle}
            checked={profile.notificationsSound ?? true}
            onChange={(checked) => updateProfile({ notificationsSound: checked })}
          />
        </div>
      </section>

      <section style={cardStyle()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <strong>{t('profile.diet_type')}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DIETS.map((diet) => {
            const active = diet.value === 'none' ? !profile.diets?.length : profile.diets.includes(diet.value);

            return (
              <button
                key={diet.value}
                onClick={() => toggleDiet(diet.value)}
                style={{
                  borderRadius: 999,
                  padding: '8px 12px',
                  border: `1px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                  background: active ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' : boostaTokens.color.surface.base,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: active ? '#fff' : boostaTokens.color.surface.ink,
                  fontWeight: 600,
                }}
              >
                {diet.icon} {t(`diet.${diet.value}`)}
              </button>
            );
          })}
        </div>
      </section>

      <section style={cardStyle()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Palette size={16} color={boostaTokens.color.ghost[700]} />
          <strong>{themeSectionTitle}</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {themes.map((theme) => {
            const active = themeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 18,
                  border: `1px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                  background: active ? boostaTokens.color.surface.sunk : boostaTokens.color.surface.base,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {theme.swatch.map((color) => (
                    <span
                      key={color}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: `hsl(${color})`,
                        border: '1px solid rgba(255,255,255,0.7)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: boostaTokens.color.surface.ink, overflowWrap: 'anywhere' }}>
                    {lang === 'ru' ? theme.nameRu : theme.name}
                  </div>
                  <div style={{ fontSize: 11, color: boostaTokens.color.surface.inkSoft, marginTop: 2 }}>
                    {active ? (lang === 'ru' ? 'Выбрана' : 'Selected') : (lang === 'ru' ? 'Нажми, чтобы применить' : 'Tap to apply')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 10 }}>
          {themeSectionHint}
        </div>
      </section>

      <section style={cardStyle()}>
        <strong>{collectedTitle}</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
          {[
            { label: lang === 'ru' ? 'Жетоны' : 'Tokens', value: tokenCount },
            { label: lang === 'ru' ? 'Планы' : 'Plans', value: plans.length },
            { label: lang === 'ru' ? 'Коррекции' : 'Corrections', value: correctionsCount },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 12,
                borderRadius: 18,
                background: boostaTokens.color.surface.base,
                border: `1px solid ${boostaTokens.color.surface.line}`,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        border: `1px solid ${boostaTokens.color.surface.line}`,
        background: boostaTokens.color.surface.base,
        borderRadius: 18,
        padding: '12px 14px',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 14, color: boostaTokens.color.surface.ink }}>{label}</span>
      <span
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          background: checked ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line,
          position: 'relative',
          transition: 'background 160ms ease',
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            transition: 'left 160ms ease',
          }}
        />
      </span>
    </button>
  );
}
