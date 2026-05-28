import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CalendarRange, Search, Sparkles, Target, X } from 'lucide-react';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { useScores } from '@/core/hooks/useScores';
import { useAppStore } from '@/core/store/appStore';
import { fetchLast30Days, type DailySummary } from '@/core/boosta/syncEvents';
import { projectCourse } from '@/core/boosta/forecast';
import { detectPatterns, searchEvents, type Pattern } from '@/core/boosta/patterns';

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type SearchResult = {
  name: string;
  timestamp: string;
  impact_real: number;
};

type DaySnapshot = {
  date: string;
  label: string;
  dayNumber: string;
  real: number;
  ghost: number;
  gap: number;
  eventsCount: number;
  hasData: boolean;
  isToday: boolean;
};

type ScenarioCardModel = {
  title: string;
  value: string;
  body: string;
  tone: 'aligned' | 'neutral' | 'drift';
};

export default function HistoryScreen() {
  const navigate = useNavigate();
  const events = useBoostaStore((s) => s.events);
  const { readinessScore, ghostReadinessScore } = useScores();
  const realCharge = readinessScore ?? 80;
  const ghostCharge = ghostReadinessScore ?? 80;
  const courseGap = useAppStore((s) => s.courseGap);
  const insights = useAppStore((s) => s.insights);
  const scores = useAppStore((s) => s.scores);

  const [explanationDismissed, setExplanationDismissed] = useState<boolean>(
    () => localStorage.getItem('boosta_score_explanation_dismissed') === '1',
  );

  const dismissExplanation = () => {
    localStorage.setItem('boosta_score_explanation_dismissed', '1');
    setExplanationDismissed(true);
  };

  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    fetchLast30Days().then(setSummaries);
    detectPatterns(90).then(setPatterns);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const localMatches = events
        .filter((event) => event.name.toLowerCase().includes(query.toLowerCase()))
        .map((event) => ({
          name: event.name,
          timestamp: new Date(event.timestamp).toISOString(),
          impact_real: event.impactReal,
        }));

      searchEvents({ query })
        .then((remoteMatches) => {
          const merged = [...localMatches, ...remoteMatches];
          const unique = merged.filter(
            (item, index, array) =>
              array.findIndex((candidate) => candidate.name === item.name && candidate.timestamp === item.timestamp) === index,
          );
          setSearchResults(unique.slice(0, 12));
        })
        .catch(() => setSearchResults(localMatches.slice(0, 12)));
    }, 250);

    return () => clearTimeout(timer);
  }, [events, searchQuery]);

  const chart30 = useMemo(
    () => buildChart30(summaries, realCharge, ghostCharge, events),
    [summaries, realCharge, ghostCharge, events],
  );
  const week = chart30.slice(-7);
  const hasAnyData = chart30.some((day) => day.hasData);
  const activeDays30 = chart30.filter((day) => day.hasData).length;
  const totalEvents30 = chart30.reduce((sum, day) => sum + day.eventsCount, 0);
  const currentGap = Math.max(0, ghostCharge - realCharge);
  const gapSummary = getGapSummary(currentGap, hasAnyData);
  const weeklyRealAverage = Math.round(average(week.filter((day) => day.hasData).map((day) => day.real)));
  const weeklyGapAverage = Math.round(average(week.filter((day) => day.hasData).map((day) => day.gap)));
  const weekDelta = (week[week.length - 1]?.real ?? 0) - (week[0]?.real ?? 0);
  const trendSummary = getTrendSummary(weekDelta, week.filter((day) => day.hasData).length);
  const bestDay = [...chart30].filter((day) => day.hasData).sort((a, b) => b.real - a.real)[0] ?? null;
  const hardestDay = [...chart30].filter((day) => day.hasData).sort((a, b) => a.real - b.real)[0] ?? null;
  const forecastCards = buildScenarioCards(projectCourse(events), currentGap);

  return (
    <div style={{ padding: '20px 16px 130px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <BoostaSection spacing="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ ...boostaTokens.typography.titleCompact, margin: 0, overflowWrap: 'anywhere' }}>
            Твои дни
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: boostaTokens.color.surface.inkSoft,
              margin: 0,
            }}
          >
            Здесь видно, как в реальности проходят твои дни, насколько ты близко к своему лучшему сценарию и что
            повторяется из недели в неделю.
          </p>
        </div>
      </BoostaSection>

      <BoostaSection spacing="md">
        <BoostaCard padding="lg">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <div
                style={{
                  ...boostaTokens.typography.eyebrow,
                  color: boostaTokens.color.surface.inkMuted,
                }}
              >
                Живой итог дня
              </div>
              <h2
                style={{
                  fontSize: 24,
                  lineHeight: 1.15,
                  fontWeight: 700,
                  margin: '8px 0 0',
                  overflowWrap: 'anywhere',
                }}
              >
                {gapSummary.title}
              </h2>
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: boostaTokens.color.surface.inkSoft,
                }}
              >
                {gapSummary.body}
              </p>
            </div>
            <StatusBadge tone={gapSummary.tone} text={gapSummary.badge} />
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              borderRadius: 18,
              background: boostaTokens.color.surface.sunk,
              border: `1px solid ${boostaTokens.color.surface.line}`,
              fontSize: 13,
              lineHeight: 1.5,
              color: boostaTokens.color.surface.inkSoft,
            }}
          >
            <strong style={{ color: boostaTokens.color.surface.ink }}>Шкала 0–100</strong> — это условный заряд дня:
            чем выше число, тем стабильнее энергия, самочувствие и легче держать курс.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              marginTop: 16,
            }}
          >
            <StatTile
              icon={<Activity size={16} color={boostaTokens.color.real[600]} />}
              label="Твой день сейчас"
              value={`${realCharge}/100`}
              hint="фактическое состояние"
            />
            <StatTile
              icon={<Target size={16} color={boostaTokens.color.ghost[600]} />}
              label="Лучший сценарий"
              value={`${ghostCharge}/100`}
              hint="куда день мог прийти"
            />
            <StatTile
              icon={<Sparkles size={16} color={boostaTokens.color.ghost[600]} />}
              label="Разрыв"
              value={hasAnyData ? `${currentGap} п.` : '—'}
              hint="сколько пунктов отделяет от лучшего дня"
            />
            <StatTile
              icon={<CalendarRange size={16} color={boostaTokens.color.real[600]} />}
              label="История за 30 дней"
              value={hasAnyData ? `${activeDays30} дн.` : '0'}
              hint={`${totalEvents30} отмеченных событий`}
            />
          </div>
        </BoostaCard>
      </BoostaSection>

      {/* ── БЛОК 1: Как считается результат (показывается один раз) ───────── */}
      {!explanationDismissed && (
        <BoostaSection spacing="md">
          <BoostaCard padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ ...boostaTokens.typography.eyebrow, color: boostaTokens.color.surface.inkMuted }}>
                Как считается твой результат
              </div>
              <button
                onClick={dismissExplanation}
                aria-label="Закрыть"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: boostaTokens.color.surface.inkMuted, flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '🍽', label: 'Питание', desc: 'что ты ел и насколько это соответствует курсу' },
                { emoji: '🏃', label: 'Движение', desc: 'физическая активность за день' },
                { emoji: '🌙', label: 'Сон', desc: 'качество и количество сна' },
                { emoji: '💧', label: 'Гидратация', desc: 'сколько воды выпил' },
                { emoji: '🎯', label: 'Цель', desc: 'насколько действия совпадают с курсом' },
              ].map(({ emoji, label, desc }) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: boostaTokens.color.surface.ink }}>{label}</span>
                    <span style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft }}> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 14,
                background: `${boostaTokens.color.ghost[700]}14`,
                border: `1px solid ${boostaTokens.color.ghost[700]}33`,
                fontSize: 13,
                lineHeight: 1.5,
                color: boostaTokens.color.surface.inkSoft,
              }}
            >
              <strong style={{ color: boostaTokens.color.surface.ink }}>Результат Лучшего Я</strong> — тот же расчёт, но для запланированных действий по твоему интенсиву.
            </div>
            <button
              onClick={dismissExplanation}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '10px 0',
                borderRadius: 14,
                border: `1px solid ${boostaTokens.color.surface.line}`,
                background: boostaTokens.color.surface.sunk,
                fontSize: 13,
                fontWeight: 600,
                color: boostaTokens.color.surface.inkSoft,
                cursor: 'pointer',
              }}
            >
              Понял, не показывать снова
            </button>
          </BoostaCard>
        </BoostaSection>
      )}

      {/* ── БЛОК 2: Почему разрыв (courseGap → дрейф) ────────────────────── */}
      {courseGap && (courseGap.status === 'slightly_out' || courseGap.status === 'far_out') && (
        <BoostaSection spacing="md" label="Из-за чего отстаёшь от Лучшего Я">
          <BoostaCard padding="md">
            <div style={{ fontSize: 15, fontWeight: 600, color: boostaTokens.color.state.drift, marginBottom: 10 }}>
              {courseGap.headline}
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
              {courseGap.explanation}
            </p>
            {courseGap.strongestDrift && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: 'rgba(163,45,45,0.07)',
                  border: '1px solid rgba(163,45,45,0.15)',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: boostaTokens.color.surface.ink }}>Главная область дрейфа</div>
                  <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginTop: 2 }}>{courseGap.strongestDrift}</div>
                </div>
              </div>
            )}
            {courseGap.easiestReturn && (
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: `${boostaTokens.color.real[700]}10`,
                  border: `1px solid ${boostaTokens.color.real[700]}33`,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: boostaTokens.color.surface.ink }}>{courseGap.easiestReturn.title}</div>
                  <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginTop: 2 }}>{courseGap.easiestReturn.description}</div>
                </div>
              </div>
            )}
            {courseGap.confidence === 'low' && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>
                Данных пока мало — картина уточнится после 3+ дней.
              </p>
            )}
          </BoostaCard>
        </BoostaSection>
      )}

      {/* ── БЛОК 3: Благодаря чему опережаешь ────────────────────────────── */}
      {courseGap && courseGap.status === 'inside_corridor' && (
        <BoostaSection spacing="md" label="Благодаря чему ты в коридоре">
          <BoostaCard padding="md">
            <div style={{ fontSize: 15, fontWeight: 600, color: boostaTokens.color.state.aligned, marginBottom: 10 }}>
              {courseGap.headline}
            </div>
            {insights.filter((i) => i.kind === 'win').slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: 'rgba(29,158,117,0.07)',
                  border: '1px solid rgba(29,158,117,0.15)',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: boostaTokens.color.surface.ink }}>{insight.title}</div>
                  <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, marginTop: 2, lineHeight: 1.45 }}>{insight.body}</div>
                </div>
              </div>
            ))}
            {insights.filter((i) => i.kind === 'win').length === 0 && (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
                Ты держишь курс. Детальный анализ появится после 3+ дней активного использования.
              </p>
            )}
            {scores && (
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                }}
              >
                {[
                  { label: 'Питание', value: Math.round(scores.nutrition) },
                  { label: 'Восстановление', value: Math.round(scores.recovery) },
                  { label: 'Энергия', value: Math.round(scores.energy) },
                  { label: 'Сон', value: Math.round(scores.sleep) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 12,
                      background: boostaTokens.color.surface.sunk,
                      border: `1px solid ${boostaTokens.color.surface.line}`,
                    }}
                  >
                    <div style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: boostaTokens.color.state.aligned, marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}
          </BoostaCard>
        </BoostaSection>
      )}

      {!hasAnyData && (
        <BoostaSection spacing="lg" label="Когда экран оживёт">
          <BoostaCard variant="sunk" padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: boostaTokens.color.surface.ink }}>
                История решений появится после первого скана
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
                Каждый скан еды или жетон создаёт точку на карте твоих дней. Здесь соберётся понятная картина:
                как проходили дни, где ты был ближе всего к своей цели и что тянет состояние вверх или вниз.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {['Скан еды', 'Вода', 'Сон', 'Привычки'].map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: '8px 12px',
                      borderRadius: boostaTokens.radius.pill,
                      background: boostaTokens.color.surface.raised,
                      border: `1px solid ${boostaTokens.color.surface.line}`,
                      fontSize: 13,
                      color: boostaTokens.color.surface.ink,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/boosta', { state: { openScanner: true } })}
                style={{
                  padding: '12px 20px', borderRadius: 14, border: 'none',
                  background: boostaTokens.color.surface.ink,
                  color: boostaTokens.color.surface.base,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start',
                }}
              >
                Сделать первый скан
              </button>
            </div>
          </BoostaCard>
        </BoostaSection>
      )}

      {hasAnyData && (
        <>
          <BoostaSection spacing="lg" label="Последние 7 дней">
            <BoostaCard padding="md">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1 1 210px', minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: boostaTokens.color.surface.ink }}>
                    {trendSummary.title}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
                    {trendSummary.body}
                  </p>
                </div>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 16,
                    background: boostaTokens.color.surface.sunk,
                    border: `1px solid ${boostaTokens.color.surface.line}`,
                    minWidth: 132,
                  }}
                >
                  <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, marginBottom: 6 }}>
                    Среднее за неделю
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: boostaTokens.color.surface.ink }}>
                    {weeklyRealAverage || 0}/100
                  </div>
                  <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 4 }}>
                    средний разрыв {weeklyGapAverage || 0} п.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160, marginTop: 18 }}>
                {week.map((day) => (
                  <WeekBar key={day.date} day={day} />
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  marginTop: 16,
                  fontSize: 12,
                  color: boostaTokens.color.surface.inkSoft,
                }}
              >
                <LegendDot color={boostaTokens.color.real[400]} text="оранжевый столбик — как день прошёл" />
                <LegendDot color={boostaTokens.color.ghost[600]} text="зелёная отметка — лучший сценарий" />
              </div>
            </BoostaCard>
          </BoostaSection>

          <BoostaSection spacing="lg" label="30 дней одним взглядом">
            <BoostaCard padding="md">
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
                Каждая ячейка — один день. Чем она зеленее, тем ближе ты был к лучшему сценарию. Светлые ячейки означают,
                что данных пока мало.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {chart30.map((day) => (
                  <DayCell key={day.date} day={day} />
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <HighlightCard
                  title="Самый сильный день"
                  value={bestDay ? formatDate(bestDay.date) : 'Пока нет'}
                  body={
                    bestDay
                      ? `${bestDay.real}/100 и разрыв всего ${bestDay.gap} п.`
                      : 'Появится, когда накопится история.'
                  }
                  tone="aligned"
                />
                <HighlightCard
                  title="Самый тяжёлый день"
                  value={hardestDay ? formatDate(hardestDay.date) : 'Пока нет'}
                  body={
                    hardestDay
                      ? `${hardestDay.real}/100 и запас для улучшения ${hardestDay.gap} п.`
                      : 'Появится, когда накопится история.'
                  }
                  tone="drift"
                />
              </div>
            </BoostaCard>
          </BoostaSection>

          <BoostaSection spacing="lg" label="Что будет, если продолжать">
            <BoostaCard padding="md">
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
                Ниже не проценты “успеха”, а понятные ориентиры: сколько пунктов дневного заряда можно удержать или
                вернуть, если продолжать в том или ином ритме.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {forecastCards.map((card) => (
                  <ScenarioCard key={card.title} card={card} />
                ))}
              </div>
            </BoostaCard>
          </BoostaSection>

          <BoostaSection spacing="lg" label="Что уже повторяется">
            {patterns.length === 0 ? (
              <BoostaCard variant="sunk" padding="md">
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: boostaTokens.color.surface.inkSoft }}>
                  Когда накопится больше дней, здесь появятся повторяющиеся связки: тяжёлые вечера, хорошие паттерны
                  восстановления и то, что стабильно помогает держать курс.
                </p>
              </BoostaCard>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {patterns.slice(0, 4).map((pattern) => (
                  <BoostaCard key={pattern.id} padding="md">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 600,
                            color: boostaTokens.color.surface.ink,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {pattern.title}
                        </p>
                        {pattern.detail && (
                          <p
                            style={{
                              margin: '6px 0 0',
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: boostaTokens.color.surface.inkSoft,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {pattern.detail}
                          </p>
                        )}
                      </div>
                      <StatusBadge tone={patternConfidenceTone(pattern.confidence)} text={confidenceLabel(pattern.confidence)} />
                    </div>
                  </BoostaCard>
                ))}
              </div>
            )}
          </BoostaSection>
        </>
      )}

      <BoostaSection spacing="lg" label="Найти событие">
        <BoostaCard padding="md">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderRadius: 18,
              border: `1px solid ${boostaTokens.color.surface.line}`,
              background: boostaTokens.color.surface.sunk,
              padding: '12px 14px',
            }}
          >
            <Search size={16} color={boostaTokens.color.surface.inkMuted} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Например: кофе, вода, бег"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 15,
                color: boostaTokens.color.surface.ink,
                minWidth: 0,
              }}
            />
          </div>

          {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
            <p style={{ margin: '10px 0 0', fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
              Введи хотя бы 2 символа, чтобы найти событие.
            </p>
          )}

          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.name}-${result.timestamp}-${index}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 10,
                    alignItems: 'start',
                    padding: '12px 0',
                    borderTop: index === 0 ? 'none' : `1px solid ${boostaTokens.color.surface.line}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: boostaTokens.color.surface.ink,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {result.name}
                    </div>
                    <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginTop: 4 }}>
                      {formatDateTime(result.timestamp)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color:
                        result.impact_real < 0
                          ? boostaTokens.color.state.drift
                          : result.impact_real > 0
                            ? boostaTokens.color.state.aligned
                            : boostaTokens.color.surface.inkSoft,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {result.impact_real > 0 ? '+' : ''}
                    {result.impact_real} п.
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.5, color: boostaTokens.color.surface.inkSoft }}>
              По этому запросу пока ничего не найдено.
            </p>
          )}
        </BoostaCard>
      </BoostaSection>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: boostaTokens.color.surface.sunk,
        border: `1px solid ${boostaTokens.color.surface.line}`,
        padding: '14px 14px 12px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>{label}</span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: boostaTokens.color.surface.ink,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.45, color: boostaTokens.color.surface.inkSoft, marginTop: 4 }}>
        {hint}
      </div>
    </div>
  );
}

function StatusBadge({
  text,
  tone,
}: {
  text: string;
  tone: 'aligned' | 'neutral' | 'drift';
}) {
  const color =
    tone === 'aligned'
      ? boostaTokens.color.state.aligned
      : tone === 'drift'
        ? boostaTokens.color.state.drift
        : boostaTokens.color.surface.inkSoft;

  const background =
    tone === 'aligned'
      ? 'rgba(29, 158, 117, 0.10)'
      : tone === 'drift'
        ? 'rgba(163, 45, 45, 0.10)'
        : 'rgba(136, 135, 128, 0.12)';

  return (
    <span
      style={{
        padding: '8px 12px',
        borderRadius: boostaTokens.radius.pill,
        background,
        color,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function WeekBar({ day }: { day: DaySnapshot }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 34, height: 120 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: boostaTokens.color.surface.sunk,
            border: `1px solid ${boostaTokens.color.surface.line}`,
            overflow: 'hidden',
          }}
        >
          {day.hasData && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: `${Math.max(day.real, 8)}%`,
                background: boostaTokens.color.real[400],
              }}
            />
          )}
        </div>
        {day.hasData && (
          <div
            style={{
              position: 'absolute',
              left: 4,
              right: 4,
              bottom: `calc(${day.ghost}% - 1px)`,
              height: 2,
              borderRadius: 999,
              background: boostaTokens.color.ghost[600],
            }}
          />
        )}
      </div>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.ink }}>{day.label}</div>
        <div style={{ fontSize: 11, color: boostaTokens.color.surface.inkSoft, marginTop: 2 }}>
          {day.hasData ? `${day.real}/100` : '—'}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, text }: { color: string; text: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
          flexShrink: 0,
        }}
      />
      <span>{text}</span>
    </span>
  );
}

function DayCell({ day }: { day: DaySnapshot }) {
  const tone = getDayTone(day);

  return (
    <div
      title={buildDayTitle(day)}
      style={{
        aspectRatio: '1 / 1',
        borderRadius: 16,
        background: tone.background,
        border: day.isToday ? `2px solid ${boostaTokens.color.surface.ink}` : `1px solid ${tone.border}`,
        padding: '8px 6px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: tone.text,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600 }}>{day.dayNumber}</span>
      <span style={{ fontSize: 11, lineHeight: 1.2 }}>{day.hasData ? `${day.real}` : '—'}</span>
    </div>
  );
}

function HighlightCard({
  title,
  value,
  body,
  tone,
}: {
  title: string;
  value: string;
  body: string;
  tone: 'aligned' | 'drift';
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: '14px 14px 12px',
        background: tone === 'aligned' ? 'rgba(29, 158, 117, 0.08)' : 'rgba(239, 159, 39, 0.10)',
        border: `1px solid ${tone === 'aligned' ? 'rgba(29, 158, 117, 0.18)' : 'rgba(239, 159, 39, 0.18)'}`,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>{title}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: boostaTokens.color.surface.ink,
          marginTop: 6,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: boostaTokens.color.surface.inkSoft, marginTop: 6 }}>
        {body}
      </div>
    </div>
  );
}

function ScenarioCard({ card }: { card: ScenarioCardModel }) {
  const color =
    card.tone === 'aligned'
      ? boostaTokens.color.state.aligned
      : card.tone === 'drift'
        ? boostaTokens.color.state.drift
        : boostaTokens.color.surface.ink;

  const background =
    card.tone === 'aligned'
      ? 'rgba(29, 158, 117, 0.08)'
      : card.tone === 'drift'
        ? 'rgba(163, 45, 45, 0.08)'
        : boostaTokens.color.surface.sunk;

  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid ${boostaTokens.color.surface.line}`,
        background,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: boostaTokens.color.surface.ink, overflowWrap: 'anywhere' }}>
            {card.title}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: boostaTokens.color.surface.inkSoft, marginTop: 6 }}>
            {card.body}
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{card.value}</div>
      </div>
    </div>
  );
}

function buildChart30(
  summaries: DailySummary[],
  todayReal: number,
  todayGhost: number,
  events: ReturnType<typeof useBoostaStore.getState>['events'],
): DaySnapshot[] {
  const summaryMap = new Map(summaries.map((summary) => [summary.date, summary]));
  const eventMap = new Map<string, { real: number; ghost: number; eventsCount: number }>();

  events.forEach((event) => {
    const key = new Date(event.timestamp).toISOString().slice(0, 10);
    const current = eventMap.get(key) ?? { real: 80, ghost: 80, eventsCount: 0 };
    eventMap.set(key, {
      real: clamp(current.real + event.impactReal),
      ghost: clamp(current.ghost + event.impactGhost),
      eventsCount: current.eventsCount + 1,
    });
  });

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));

    const key = date.toISOString().slice(0, 10);
    const summary = summaryMap.get(key);
    const local = eventMap.get(key);
    const isToday = index === 29;
    const eventsCount = isToday ? countTodayEvents(events) : summary?.events_count ?? local?.eventsCount ?? 0;
    const real = isToday ? todayReal : summary?.end_real ?? local?.real ?? 0;
    const ghost = isToday ? todayGhost : summary?.end_ghost ?? local?.ghost ?? 0;
    const hasData = eventsCount > 0;

    return {
      date: key,
      label: WEEK_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1],
      dayNumber: String(date.getDate()),
      real,
      ghost,
      gap: hasData ? Math.max(0, ghost - real) : 0,
      eventsCount,
      hasData,
      isToday,
    };
  });
}

function buildScenarioCards(
  forecast: ReturnType<typeof projectCourse>,
  currentGap: number,
): ScenarioCardModel[] {
  return [
    {
      title: 'Если ничего не менять',
      value: currentGap > 0 ? `разрыв ~${currentGap} п.` : 'ритм сохранится',
      body:
        currentGap > 0
          ? 'Без новых опор день, скорее всего, останется примерно на том же расстоянии от лучшего сценария.'
          : 'Сейчас день уже идёт ровно. Главное — не убирать то, что удерживает состояние.',
      tone: currentGap > 16 ? 'drift' : 'neutral',
    },
    {
      title: 'Если держать текущий ритм',
      value: `+${forecast.ifReal} п. к заряду`,
      body: 'Это сценарий без рывка: ты продолжаешь делать то, что уже работает, и медленно выравниваешь день.',
      tone: 'neutral',
    },
    {
      title: 'Если повторять лучшие решения',
      value:
        currentGap > 0
          ? forecast.ifGhost >= currentGap
            ? 'разрыв можно закрыть'
            : `-${forecast.ifGhost} п. разрыва`
          : 'ты уже близко к максимуму',
      body:
        currentGap > 0
          ? 'Это путь, где чаще повторяются самые удачные выборы: хороший завтрак, вода, восстановление и меньше провалов.'
          : 'Лучшие решения уже похожи на твою текущую траекторию — задача скорее удержать её.',
      tone: 'aligned',
    },
  ];
}

function getGapSummary(gap: number, hasAnyData: boolean) {
  if (!hasAnyData) {
    return {
      title: 'История только начинает собираться',
      body: 'Первые отмеченные действия быстро превратят этот экран в понятную картину твоих дней.',
      badge: 'пока пусто',
      tone: 'neutral' as const,
    };
  }

  if (gap <= 8) {
    return {
      title: 'Ты почти в своём лучшем ритме',
      body: `Разрыв с лучшим сценарием всего ${gap} п. Это значит, что день идёт близко к тому состоянию, в котором ты обычно чувствуешь себя лучше всего.`,
      badge: 'почти совпадает',
      tone: 'aligned' as const,
    };
  }

  if (gap <= 20) {
    return {
      title: 'День хороший, но запас ещё есть',
      body: `Сейчас тебя отделяет ${gap} п. от лучшего сценария. Обычно этот разрыв закрывается базовыми опорами: вода, еда вовремя, сон и меньше случайных просадок.`,
      badge: 'есть запас',
      tone: 'neutral' as const,
    };
  }

  return {
    title: 'День заметно проседает относительно лучшего сценария',
    body: `Сейчас разрыв уже ${gap} п. Это не “плохо”, а сигнал, что день ушёл от твоего лучшего темпа и ему нужна одна-две сильные опоры.`,
    badge: 'нужно выровнять',
    tone: 'drift' as const,
  };
}

function getTrendSummary(delta: number, daysWithData: number) {
  if (daysWithData === 0) {
    return {
      title: 'Пока ещё нечего сравнивать',
      body: 'Как только появится несколько дней подряд, здесь будет видно, выравнивается ли неделя или становится тяжелее.',
    };
  }

  if (delta >= 8) {
    return {
      title: 'Неделя выравнивается',
      body: 'Последние дни выглядят устойчивее, чем начало недели. Значит, рабочие опоры уже начинают повторяться.',
    };
  }

  if (delta <= -8) {
    return {
      title: 'Последние дни стали тяжелее',
      body: 'Конец недели просел относительно начала. Обычно это знак, что накопилась усталость или выбился базовый ритм.',
    };
  }

  return {
    title: 'Ритм пока ровный',
    body: 'Сильных качелей нет: неделя идёт без резких провалов, но и без большого рывка вперёд.',
  };
}

function getDayTone(day: DaySnapshot) {
  if (!day.hasData) {
    return {
      background: boostaTokens.color.surface.sunk,
      border: boostaTokens.color.surface.line,
      text: boostaTokens.color.surface.inkMuted,
    };
  }

  if (day.gap <= 8) {
    return {
      background: boostaTokens.color.ghost[600],
      border: 'rgba(29, 158, 117, 0.28)',
      text: '#FFFFFF',
    };
  }

  if (day.gap <= 18) {
    return {
      background: boostaTokens.color.ghost[200],
      border: 'rgba(93, 202, 165, 0.4)',
      text: boostaTokens.color.surface.ink,
    };
  }

  if (day.gap <= 30) {
    return {
      background: boostaTokens.color.real[200],
      border: 'rgba(239, 159, 39, 0.36)',
      text: boostaTokens.color.surface.ink,
    };
  }

  return {
    background: 'rgba(163, 45, 45, 0.12)',
    border: 'rgba(163, 45, 45, 0.22)',
    text: boostaTokens.color.state.drift,
  };
}

function buildDayTitle(day: DaySnapshot): string {
  if (!day.hasData) {
    return `${formatDate(day.date)}: данных пока нет`;
  }

  return `${formatDate(day.date)}: ${day.real}/100, разрыв ${day.gap} п., событий ${day.eventsCount}`;
}

function patternConfidenceTone(confidence: Pattern['confidence']): 'aligned' | 'neutral' | 'drift' {
  if (confidence === 'high') return 'aligned';
  if (confidence === 'medium') return 'neutral';
  return 'drift';
}

function confidenceLabel(confidence: Pattern['confidence']): string {
  if (confidence === 'high') return 'уверенный сигнал';
  if (confidence === 'medium') return 'повторяется';
  return 'гипотеза';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function countTodayEvents(events: ReturnType<typeof useBoostaStore.getState>['events']): number {
  const today = new Date().toISOString().slice(0, 10);
  return events.filter((event) => new Date(event.timestamp).toISOString().slice(0, 10) === today).length;
}
