// PlanForgeScreen — AI generates 3 intensive plans for the user's course/profile.
// User picks one with a single tap. NO swipe deck (cognitive load on first entry).

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/core/store/appStore';
import { supabase } from '@/integrations/supabase/client';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type IntensivePlanGeneratedEvent, type IntensivePlanSelectedEvent } from '@/core/store/types/events';
import { boostaTokens } from '@/design/boosta/tokens';
import type { IntensivePlan, IntensiveEffort } from '@/core/intensive/types';
import { generateFallbackPlans } from '@/core/intensive/fallbackPlans';
import { toast } from 'sonner';

interface EdgeResponse {
  plans: Omit<IntensivePlan, 'id' | 'course' | 'durationDays' | 'generatedAt'>[];
}

const EFFORT_ORDER: IntensiveEffort[] = ['gentle', 'balanced', 'intense'];
const EFFORT_BADGE: Record<IntensiveEffort, string> = { gentle: '🌱', balanced: '⚡', intense: '🔥' };
const EFFORT_LABEL: Record<IntensiveEffort, string> = { gentle: 'Мягкий', balanced: 'Сбалансированный', intense: 'Интенсивный' };
const PLAN_DURATION_DAYS = 14;
const LOAD_TIMEOUT_MS = 30_000;

const CATEGORY_ICON: Record<string, string> = {
  meal: '🍽', supplement: '💊', movement: '🏃', hydration: '💧',
  sleep: '🌙', habit: '✅', rest: '🛋',
};

export default function PlanForgeScreen() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const goals = useAppStore((s) => s.goals);
  const course = useAppStore((s) => s.course);
  const planOptions = useAppStore((s) => s.intensivePlanOptions);
  const setPlanOptions = useAppStore((s) => s.setIntensivePlanOptions);
  const selectPlan = useAppStore((s) => s.selectIntensivePlan);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitPlans = useCallback(async (plans: IntensivePlan[], fallback = false) => {
    setPlanOptions(plans);
    setIsFallback(fallback);

    try {
      await eventDispatcher.dispatchEvent(
        newEvent<IntensivePlanGeneratedEvent>({
          type: 'intensive.plan.generated',
          source: 'system',
          payload: { planIds: plans.map((p) => p.id), course: course.activeCourse },
        }),
      );
    } catch {}
  }, [course.activeCourse, setPlanOptions]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    // 30-second hard timeout — show fallback if AI doesn't respond in time
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      const fallback = generateFallbackPlans(course.activeCourse, PLAN_DURATION_DAYS);
      void commitPlans(fallback, true);
    }, LOAD_TIMEOUT_MS);

    try {
      const bmi = profile.heightCm && profile.weightKg
        ? Number((profile.weightKg / ((profile.heightCm / 100) ** 2)).toFixed(1))
        : null;
      const goalsText = [
        goals.primaryGoal ? `Основная цель: ${goals.primaryGoal}` : null,
        goals.dayGoal ? `Цель на день: ${goals.dayGoal}` : null,
        goals.longGoal ? `Долгая цель: ${goals.longGoal}` : null,
      ].filter(Boolean).join('. ') || 'Поддерживать курс стабильно 14 дней';

      const { data, error: err } = await supabase.functions.invoke('analyze-food', {
        body: {
          generate_intensive_plans_mode: true,
          course: course.activeCourse,
          profile: {
            age: profile.age,
            gender: profile.gender,
            bmi,
            condition: profile.customCondition?.trim() || profile.condition,
            conditions: profile.conditions ?? [],
            dietType: profile.dietType,
            ifWindow: profile.ifWindow,
            badHabits: profile.badHabits ?? [],
            activityLevel: profile.activityLevel,
            sleepHours: profile.sleepHours,
          },
          goals: goalsText,
        },
      });

      if (err) {
        throw new Error(err.message);
      }

      const plans = (data as EdgeResponse | null)?.plans;
      if (!plans?.length) {
        throw new Error('Функция не вернула планы');
      }

      const generatedAt = new Date().toISOString();
      const enriched: IntensivePlan[] = plans.map((plan) => ({
        ...plan,
        id: crypto.randomUUID(),
        course: course.activeCourse,
        durationDays: plan.daily?.length || PLAN_DURATION_DAYS,
        generatedAt,
      }));
      await commitPlans(enriched, false);
    } catch (err) {
      console.error('Plan generation failed, using fallback:', err);
      const fallback = generateFallbackPlans(course.activeCourse, PLAN_DURATION_DAYS);
      await commitPlans(fallback, true);
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoading(false);
    }
  }, [
    commitPlans,
    course.activeCourse,
    goals.dayGoal,
    goals.longGoal,
    goals.primaryGoal,
    profile.age,
    profile.condition,
    profile.customCondition,
    profile.gender,
    profile.heightCm,
    profile.weightKg,
    profile.conditions,
    profile.dietType,
    profile.ifWindow,
    profile.badHabits,
    profile.activityLevel,
    profile.sleepHours,
  ]);

  useEffect(() => {
    if (!planOptions.length && !loading && !error) {
      void generate();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = async (plan: IntensivePlan) => {
    selectPlan(plan.id);
    try {
      await eventDispatcher.dispatchEvent(
        newEvent<IntensivePlanSelectedEvent>({
          type: 'intensive.plan.selected',
          source: 'home',
          payload: { planId: plan.id, effort: plan.effort, course: plan.course },
        }),
      );
    } catch {}
    toast.success(`План выбран: ${plan.title}`);
    navigate('/boosta');
  };

  const handleRegenerate = () => {
    setPlanOptions([]);
    void generate();
  };

  // Sort plans by effort
  const sorted = [...planOptions].sort(
    (a, b) => EFFORT_ORDER.indexOf(a.effort) - EFFORT_ORDER.indexOf(b.effort),
  );

  return (
    <div style={{
      minHeight: '100dvh',
      background: boostaTokens.color.surface.base,
      padding: '24px 16px 96px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      fontFamily: boostaTokens.typography.fontFamily,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch' as never,
      boxSizing: 'border-box',
    }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ ...boostaTokens.typography.title, color: boostaTokens.color.surface.ink, margin: 0 }}>
          Три пути на 14 дней
        </h1>
        <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, lineHeight: 1.4 }}>
          ИИ собрал три варианта под твой курс и данные. Выбери тот, что отзывается.
        </p>
      </header>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `3px solid ${boostaTokens.color.surface.line}`,
              borderTopColor: boostaTokens.color.ghost[600],
              margin: '0 auto 14px',
            }}
          />
          <p style={{ fontSize: 14, fontWeight: 500, color: boostaTokens.color.surface.ink, marginBottom: 4 }}>
            Собираем планы…
          </p>
          <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>
            ИИ анализирует твой профиль. До 30 секунд.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          padding: 16, borderRadius: 16, background: '#FFF4F0',
          border: `1px solid ${boostaTokens.color.surface.line}`,
        }}>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.ink, marginBottom: 8 }}>{error}</p>
          <button
            onClick={generate}
            style={{
              background: boostaTokens.color.ghost[600], color: '#fff',
              border: 'none', borderRadius: 12, padding: '8px 16px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >Попробовать снова</button>
        </div>
      )}

      {/* Fallback banner */}
      {!loading && isFallback && !!sorted.length && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 14,
          background: 'rgba(255,180,50,0.1)',
          border: '1px solid rgba(255,180,50,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#7A5800', margin: '0 0 2px' }}>
              AI недоступен
            </p>
            <p style={{ fontSize: 12, color: '#A07000', margin: 0 }}>
              Показываем базовые планы
            </p>
          </div>
          <button
            onClick={handleRegenerate}
            style={{
              padding: '7px 14px', borderRadius: 10, flexShrink: 0,
              background: '#F5A623', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Попробовать с AI
          </button>
        </div>
      )}

      {/* Plan cards */}
      {!loading && sorted.map((plan, idx) => {
        const previewItems = (plan.daily?.[0]?.items ?? [])
          .filter((item) => ['meal', 'supplement', 'movement', 'sleep'].includes(item.category))
          .slice(0, 4);

        return (
          <motion.article
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            style={{
              background: boostaTokens.color.surface.raised,
              border: `0.5px solid ${boostaTokens.color.surface.line}`,
              borderRadius: 20,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 30 }}>{plan.badge || EFFORT_BADGE[plan.effort]}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ ...boostaTokens.typography.eyebrow, color: boostaTokens.color.surface.inkMuted }}>
                  {EFFORT_LABEL[plan.effort]}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: boostaTokens.color.surface.ink, margin: 0 }}>
                  {plan.title}
                </h2>
              </div>
            </div>

            {/* Why */}
            <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, lineHeight: 1.45, margin: 0 }}>
              {plan.oneLineWhy}
            </p>

            {/* Tags */}
            {!!plan.tags?.length && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {plan.tags.slice(0, 4).map((t) => (
                  <span key={t} style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 999,
                    background: boostaTokens.color.surface.base,
                    color: boostaTokens.color.surface.inkSoft,
                  }}>{t}</span>
                ))}
              </div>
            )}

            {/* Daily schedule preview */}
            {previewItems.length > 0 && (
              <div style={{
                borderTop: `1px solid ${boostaTokens.color.surface.line}`,
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: boostaTokens.color.surface.inkMuted,
                }}>
                  День
                </span>
                {previewItems.map((item) => (
                  <div key={item.id ?? item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                      {CATEGORY_ICON[item.category] ?? '•'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                          {item.time}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: boostaTokens.color.surface.ink }}>
                          {item.title}
                        </span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, margin: '2px 0 0', lineHeight: 1.4 }}>
                          {item.description.length > 90 ? item.description.slice(0, 90) + '…' : item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expected delta */}
            {plan.expectedDelta && (
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>
                {plan.expectedDelta.energy != null && <span>⚡ энергия +{plan.expectedDelta.energy}</span>}
                {plan.expectedDelta.sleep != null && <span>🌙 сон +{plan.expectedDelta.sleep}</span>}
                {plan.expectedDelta.readiness != null && <span>✅ готовность +{plan.expectedDelta.readiness}</span>}
              </div>
            )}

            {/* Pick button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePick(plan)}
              style={{
                marginTop: 4,
                background: boostaTokens.color.ghost[600],
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '13px 16px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Выбрать этот план
            </motion.button>
          </motion.article>
        );
      })}

      {/* Regenerate button */}
      {!loading && !!sorted.length && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRegenerate}
          style={{
            background: 'transparent',
            color: boostaTokens.color.surface.inkSoft,
            border: `1px solid ${boostaTokens.color.surface.line}`,
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          🔄 Сгенерировать заново
        </motion.button>
      )}
    </div>
  );
}
