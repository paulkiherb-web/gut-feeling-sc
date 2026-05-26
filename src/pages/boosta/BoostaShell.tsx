import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, History, House, ScanLine, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DualPathScreen from './DualPathScreen';
import DayScreen from './DayScreen';
import HistoryScreen from './HistoryScreen';
import Scanner from '@/pages/Scanner';
import ProfileScreen from './ProfileScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import { scheduleEveningReminder, requestPermission } from '@/core/boosta/notifications';
import { usePlanReminders } from '@/core/boosta/usePlanReminders';
import { boostaTokens } from '@/design/boosta/tokens';
import { useAppStore } from '@/core/store/appStore';
import BoostaLogo from '@/components/boosta/BoostaLogo';
import type { CourseKey } from '@/core/course/types';
import { generateFallbackPlans } from '@/core/intensive/fallbackPlans';

// ─── Course options ────────────────────────────────────────────────────────────

interface CourseOption {
  key: CourseKey;
  emoji: string;
  title: string;
  tagline: string;
  popular?: boolean;
}

const COURSE_OPTIONS: CourseOption[] = [
  { key: 'weight_loss', emoji: '🔥', title: 'Снижение веса',        tagline: 'Минус жир через белок и режим питания — без жёстких диет.', popular: true },
  { key: 'muscle_gain', emoji: '💪', title: 'Набор мышечной массы', tagline: 'Достаточно белка, силовая нагрузка и качественный сон.',      popular: true },
  { key: 'longevity',   emoji: '✨', title: 'Долголетие',            tagline: 'Антивоспалительное питание и движение — исследованный путь.', popular: true },
  { key: 'sleep',       emoji: '🌙', title: 'Качество сна',          tagline: 'Засыпать за 10 мин, просыпаться без будильника.' },
  { key: 'energy',      emoji: '⚡', title: 'Больше энергии',        tagline: 'Устойчивая энергия без кофе-костыля и сахарных качелей.' },
  { key: 'focus',       emoji: '🧠', title: 'Когнитивное здоровье',  tagline: 'Чистая голова и внимание через стабильный сахар в крови.' },
  { key: 'libido',      emoji: '💋', title: 'Либидо и сексуальность', tagline: 'Гормональный баланс через сон, цинк и движение.' },
  { key: 'flexibility', emoji: '🤸', title: 'Гибкость тела',         tagline: 'Ежедневная растяжка — меньше боли, лучше осанка.' },
  { key: 'immunity',    emoji: '🛡️', title: 'Иммунитет',            tagline: 'Питание и сон как главная защита. Быстро восстанавливаться.' },
  { key: 'calm',        emoji: '🌿', title: 'Спокойствие',           tagline: 'Меньше тревожного фона через режим и осознанность.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10);
const CHECKIN_KEY = 'boosta_daily_checkin';

function getLastCheckinDate(): string | null {
  try { return localStorage.getItem(CHECKIN_KEY); } catch { return null; }
}
function setCheckinDate(d: string) {
  try { localStorage.setItem(CHECKIN_KEY, d); } catch { /* ignore */ }
}

// ─── Daily micro-onboarding ────────────────────────────────────────────────────

function DailyCheckIn({ onConfirm }: { onConfirm: () => void }) {
  const activeCourse = useAppStore((s) => s.course.activeCourse);
  const setCourse = useAppStore((s) => s.setCourse);
  const events = useAppStore((s) => s.events);
  const activePlanId = useAppStore((s) => s.activeIntensivePlanId);
  const plans = useAppStore((s) => s.intensivePlanOptions);
  const intensiveStartedAt = useAppStore((s) => s.intensiveStartedAt);
  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  // Show inline course picker when no course or user explicitly wants to change
  const [pickingCourse, setPickingCourse] = useState<boolean>(!activeCourse);
  const [pickerSelected, setPickerSelected] = useState<CourseKey | null>(activeCourse ?? null);

  // Keep picker open when course becomes available (if it was null before)
  useEffect(() => {
    if (!activeCourse) setPickingCourse(true);
  }, [activeCourse]);

  const courseOption = COURSE_OPTIONS.find((c) => c.key === (activeCourse ?? ''));

  // Yesterday's summary
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const yesterdayEvents = useMemo(
    () => events.filter((e) => e.createdAt?.slice(0, 10) === yesterdayStr),
    [events, yesterdayStr],
  );
  const scanCount = yesterdayEvents.filter((e) => e.type === 'scan.completed').length;
  const tokenCount = yesterdayEvents.filter((e) => e.type === 'token.logged').length;
  const hasYesterdayData = scanCount > 0 || tokenCount > 0;

  // Today's blueprint preview — first 3 upcoming items from active plan or fallback
  const previewSteps = useMemo(() => {
    const course = activeCourse ?? (pickerSelected ?? 'energy');
    if (activePlan) {
      let dayIndex = 0;
      if (intensiveStartedAt) {
        const started = new Date(intensiveStartedAt);
        started.setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        dayIndex = Math.max(0, Math.min(Math.floor((todayDate.getTime() - started.getTime()) / 86_400_000), activePlan.daily.length - 1));
      }
      const dayItems = activePlan.daily[dayIndex]?.items ?? [];
      return dayItems.slice(0, 3).map((it) => ({ time: it.time, title: it.title }));
    }
    // Fallback preview from generated plan
    try {
      const plans = generateFallbackPlans(course as CourseKey, 1, 7);
      const items = plans[0]?.daily?.[0]?.items ?? [];
      return items.slice(0, 3).map((it) => ({ time: it.time, title: it.title }));
    } catch {
      return [
        { time: '08:00', title: 'Белковый завтрак' },
        { time: '10:30', title: 'Вода 300 мл' },
        { time: '12:30', title: 'Обед без быстрых углеводов' },
      ];
    }
  }, [activePlan, activeCourse, pickerSelected, intensiveStartedAt]);

  const confirmCourse = () => {
    if (!pickerSelected) return;
    setCourse({ activeCourse: pickerSelected });
    setPickingCourse(false);
  };

  // ── Inline course picker ────────────────────────────────────────
  if (pickingCourse) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: boostaTokens.color.surface.base,
        color: boostaTokens.color.surface.ink,
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 20px 40px',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 6 }}>
          <BoostaLogo size="md" />
        </div>
        <div style={{ marginBottom: 28, marginTop: 20 }}>
          {!activeCourse ? (
            <div style={{ fontSize: 13, color: boostaTokens.color.ghost[700], fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Добро пожаловать
            </div>
          ) : (
            <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, fontWeight: 500, marginBottom: 8 }}>
              Сменить курс
            </div>
          )}
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            {!activeCourse ? 'Выбери свой курс' : 'Какая цель сейчас?'}
          </h1>
          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
            {!activeCourse
              ? 'Призрак настроится под твою цель. Изменить можно в любой момент.'
              : 'Курс сохраняется пока ты не изменишь. Призрак перестроит план под новую цель.'}
          </p>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35' }} />
            <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, fontWeight: 600, letterSpacing: '0.05em' }}>
              ТОП-3 по популярности отмечены
            </span>
          </div>
        </div>

        {/* Course list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
          {COURSE_OPTIONS.map((c) => {
            const isSelected = pickerSelected === c.key;
            return (
              <motion.button
                key={c.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPickerSelected(c.key)}
                style={{
                  textAlign: 'left',
                  padding: '16px 18px',
                  borderRadius: 18,
                  border: `2px solid ${isSelected ? boostaTokens.color.ghost[600] : c.popular ? 'rgba(255,107,53,0.3)' : boostaTokens.color.surface.line}`,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(110,86,255,0.08), rgba(68,199,168,0.08))'
                    : c.popular
                      ? 'rgba(255,107,53,0.04)'
                      : boostaTokens.color.surface.raised,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'border-color 0.15s, background 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 26, flexShrink: 0 }}>{c.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: boostaTokens.color.surface.ink }}>{c.title}</span>
                    {c.popular && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#FF6B35',
                        background: 'rgba(255,107,53,0.12)', borderRadius: 8,
                        padding: '2px 7px', letterSpacing: '0.05em',
                      }}>
                        ТОП
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{c.tagline}</div>
                </div>
                {isSelected && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: boostaTokens.color.ghost[700],
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Actions */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={confirmCourse}
          disabled={!pickerSelected}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '18px 24px',
            borderRadius: 20,
            border: 'none',
            background: pickerSelected ? 'linear-gradient(135deg, #6E56FF, #44C7A8)' : boostaTokens.color.surface.line,
            color: pickerSelected ? '#fff' : boostaTokens.color.surface.inkMuted,
            fontSize: 17,
            fontWeight: 700,
            cursor: pickerSelected ? 'pointer' : 'default',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          {!activeCourse ? 'Начать курс →' : 'Применить курс →'}
        </motion.button>

        {activeCourse && (
          <button
            onClick={() => setPickingCourse(false)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '14px 24px',
              borderRadius: 20,
              border: `1.5px solid ${boostaTokens.color.surface.line}`,
              background: 'transparent',
              color: boostaTokens.color.surface.inkSoft,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
        )}
      </div>
    );
  }

  // ── Daily check-in ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh',
      background: boostaTokens.color.surface.base,
      color: boostaTokens.color.surface.ink,
      display: 'flex',
      flexDirection: 'column',
      padding: '52px 20px 40px',
    }}>
      {/* Logo + greeting */}
      <div style={{ marginBottom: 6 }}>
        <BoostaLogo size="md" />
      </div>
      <div style={{ marginBottom: 24, marginTop: 18 }}>
        <div style={{ fontSize: 13, color: boostaTokens.color.ghost[700], fontWeight: 600, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Доброе утро
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          Новый день начался
        </h1>
      </div>

      {/* Yesterday summary */}
      {hasYesterdayData && (
        <div style={{
          background: boostaTokens.color.surface.raised,
          borderRadius: 20,
          padding: '18px 20px',
          marginBottom: 16,
          border: `1px solid ${boostaTokens.color.surface.line}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Вчера
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {scanCount > 0 && (
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{scanCount}</div>
                <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>сканов еды</div>
              </div>
            )}
            {tokenCount > 0 && (
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{tokenCount}</div>
                <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>жетонов</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasYesterdayData && (
        <div style={{
          background: 'rgba(110,86,255,0.06)',
          borderRadius: 20,
          padding: '16px 20px',
          marginBottom: 16,
          border: `1px dashed ${boostaTokens.color.ghost[400] ?? '#c4b8ff'}`,
        }}>
          <div style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, lineHeight: 1.5 }}>
            Вчера данных не было. Начнём сегодня — призрак ждёт.
          </div>
        </div>
      )}

      {/* Current course */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(110,86,255,0.08), rgba(68,199,168,0.08))',
        borderRadius: 20,
        padding: '18px 20px',
        marginBottom: 16,
        border: `1.5px solid rgba(110,86,255,0.2)`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: boostaTokens.color.ghost[700], letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Активный курс
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{courseOption?.emoji ?? '🎯'}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{courseOption?.title ?? activeCourse}</div>
              <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 2 }}>
                {courseOption?.tagline ?? 'Продолжай в том же духе'}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setPickerSelected(activeCourse); setPickingCourse(true); }}
            style={{
              background: 'transparent',
              border: `1px solid ${boostaTokens.color.surface.line}`,
              borderRadius: 12,
              padding: '6px 12px',
              fontSize: 12,
              color: boostaTokens.color.surface.inkMuted,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Изменить
          </button>
        </div>
      </div>

      {/* Today's blueprint preview */}
      <div style={{
        background: boostaTokens.color.surface.raised,
        borderRadius: 20,
        padding: '18px 20px',
        marginBottom: 24,
        border: `1px solid ${boostaTokens.color.surface.line}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Сегодня призрак предлагает
        </div>
        {previewSteps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < previewSteps.length - 1 ? 10 : 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: boostaTokens.color.ghost[600] ?? '#6E56FF', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, width: 44, flexShrink: 0 }}>{step.time}</div>
            <div style={{ fontSize: 13, color: boostaTokens.color.surface.ink, fontWeight: 500 }}>{step.title}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Start day */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onConfirm}
        style={{
          width: '100%',
          padding: '18px 24px',
          borderRadius: 20,
          border: 'none',
          background: 'linear-gradient(135deg, #6E56FF, #44C7A8)',
          color: '#fff',
          fontSize: 17,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 10,
        }}
      >
        Начать день →
      </motion.button>
    </div>
  );
}
// ─── Shell ────────────────────────────────────────────────────────────────────

type ShellView = 'app' | 'daily-checkin';

export default function BoostaShell() {
  const [activeTab, setActiveTab] = useState<'home' | 'day' | 'scan' | 'history' | 'profile'>('home');

  // Apply saved accent color on mount
  useEffect(() => {
    try {
      const accent = localStorage.getItem('boosta_accent');
      if (accent) document.documentElement.style.setProperty('--boosta-accent', accent);
    } catch { /* ignore */ }
  }, []);

  // Determine initial shell view — no course always goes to daily-checkin
  const getInitialView = (): ShellView => {
    const last = getLastCheckinDate();
    if (!last || last !== todayStr()) return 'daily-checkin';
    return 'app';
  };

  const [shellView, setShellView] = useState<ShellView>(getInitialView);

  useEffect(() => {
    requestPermission().then(() => scheduleEveningReminder());
  }, []);

  usePlanReminders();

  const screens = useMemo(
    () => ({
      home: <DualPathScreen />,
      day: <DayScreen />,
      scan: <Scanner boostaMode={true} />,
      history: <HistoryScreen />,
      profile: <ProfileScreen />,
    }),
    [],
  );

  return (
    <AnimatePresence mode="wait">
      {shellView === 'daily-checkin' && (
        <motion.div
          key="daily-checkin"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ height: '100dvh', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' as never }}
        >
          <div style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <DailyCheckIn
              onConfirm={() => {
                setCheckinDate(todayStr());
                setShellView('app');
              }}
            />
          </div>
        </motion.div>
      )}

      {shellView === 'app' && (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div style={{
            height: '100dvh',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch' as never,
            background: boostaTokens.color.surface.base,
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}>
            <ErrorBoundary key={activeTab}>
              {screens[activeTab]}
            </ErrorBoundary>
            <nav
              style={{
                position: 'fixed',
                left: 12,
                right: 12,
                bottom: 12,
                zIndex: 120,
                padding: '10px 8px calc(10px + env(safe-area-inset-bottom, 0px))',
                background: 'rgba(245,242,236,0.92)',
                border: `1px solid ${boostaTokens.color.surface.line}`,
                borderRadius: 28,
                backdropFilter: 'blur(18px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 12px 32px rgba(34, 31, 26, 0.14)',
              }}
            >
              <TabButton icon={<House size={18} />} label="Главная" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <TabButton icon={<CalendarDays size={18} />} label="День" active={activeTab === 'day'} onClick={() => setActiveTab('day')} />
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab('scan')}
                style={{
                  width: 58,
                  height: 58,
                  justifySelf: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6E56FF, #44C7A8)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 12px 24px rgba(110, 86, 255, 0.28)',
                  marginTop: -26,
                  cursor: 'pointer',
                }}
                aria-label="Скан"
              >
                <ScanLine size={24} />
              </motion.button>
              <TabButton icon={<History size={18} />} label="История" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
              <TabButton icon={<UserRound size={18} />} label="Профиль" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: 'transparent',
        color: active ? boostaTokens.color.ghost[700] : boostaTokens.color.surface.inkMuted,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        padding: 6,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
