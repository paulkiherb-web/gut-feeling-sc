// PlanForgeScreen — AI generates 3 intensive plans for the user's course/profile.
// User picks one with a single tap. NO swipe deck (cognitive load on first entry).

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/core/store/appStore';
import { aiInvoke } from '@/core/ai/aiGateway';
import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { newEvent, type IntensivePlanGeneratedEvent, type IntensivePlanSelectedEvent } from '@/core/store/types/events';
import { boostaTokens } from '@/design/boosta/tokens';
import type { IntensivePlan, IntensiveEffort } from '@/core/intensive/types';
import { toast } from 'sonner';

interface EdgeResponse {
  plans: Omit<IntensivePlan, 'id' | 'course' | 'durationDays' | 'generatedAt'>[];
  course: string;
  durationDays: number;
  generatedAt: string;
}

const EFFORT_ORDER: IntensiveEffort[] = ['gentle', 'balanced', 'intense'];
const EFFORT_BADGE: Record<IntensiveEffort, string> = { gentle: '🌱', balanced: '⚡', intense: '🔥' };
const EFFORT_LABEL: Record<IntensiveEffort, string> = { gentle: 'Мягкий', balanced: 'Сбалансированный', intense: 'Интенсивный' };

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

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await aiInvoke<EdgeResponse>({
      functionName: 'generate-intensive-plans',
      body: {
        course: course.activeCourse,
        profile: {
          age: profile.age,
          gender: profile.gender,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          diets: profile.diets,
          condition: profile.condition,
          customCondition: profile.customCondition,
        },
        goals: {
          primaryGoal: goals.primaryGoal,
          dayGoal: goals.dayGoal,
          longGoal: goals.longGoal,
        },
        durationDays: 7,
        lang: 'ru',
      },
    });
    setLoading(false);

    if (err || !data?.plans?.length) {
      setError(err?.message ?? 'Не удалось сгенерировать планы');
      return;
    }

    const enriched: IntensivePlan[] = data.plans.map((p) => ({
      ...p,
      id: crypto.randomUUID(),
      course: data.course,
      durationDays: data.durationDays,
      generatedAt: data.generatedAt,
    }));
    setPlanOptions(enriched);

    try {
      await eventDispatcher.dispatchEvent(
        newEvent<IntensivePlanGeneratedEvent>({
          type: 'intensive.plan.generated',
          source: 'system',
          payload: { planIds: enriched.map((p) => p.id), course: data.course },
        }),
      );
    } catch {}
  }, [course.activeCourse, profile, goals, setPlanOptions]);

  useEffect(() => {
    if (!planOptions.length && !loading) {
      generate();
    }
  }, [planOptions.length, loading, generate]);

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
    }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: boostaTokens.color.surface.ink }}>
          Три пути на 7 дней
        </h1>
        <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, lineHeight: 1.4 }}>
          ИИ собрал три варианта под твой курс и данные. Выбери тот, что отзывается.
        </p>
      </header>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `3px solid ${boostaTokens.color.surface.line}`,
              borderTopColor: boostaTokens.color.ghost[600],
              margin: '0 auto 12px',
            }}
          />
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
            Собираем планы…
          </p>
        </div>
      )}

      {error && (
        <div style={{
          padding: 16,
          borderRadius: 16,
          background: '#FFF4F0',
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

      {!loading && sorted.map((plan, idx) => (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{plan.badge || EFFORT_BADGE[plan.effort]}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
              }}>
                {EFFORT_LABEL[plan.effort]}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: boostaTokens.color.surface.ink, margin: 0 }}>
                {plan.title}
              </h2>
            </div>
          </div>

          <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, lineHeight: 1.45, margin: 0 }}>
            {plan.oneLineWhy}
          </p>

          {!!plan.tags?.length && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {plan.tags.slice(0, 5).map((t) => (
                <span key={t} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 999,
                  background: boostaTokens.color.surface.base,
                  color: boostaTokens.color.surface.inkSoft,
                }}>{t}</span>
              ))}
            </div>
          )}

          {plan.expectedDelta && (
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>
              {plan.expectedDelta.energy != null && <span>энергия +{plan.expectedDelta.energy}</span>}
              {plan.expectedDelta.sleep != null && <span>сон +{plan.expectedDelta.sleep}</span>}
              {plan.expectedDelta.readiness != null && <span>готовность +{plan.expectedDelta.readiness}</span>}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handlePick(plan)}
            style={{
              marginTop: 4,
              background: boostaTokens.color.ghost[600],
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '12px 16px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >Выбрать</motion.button>
        </motion.article>
      ))}
    </div>
  );
}
