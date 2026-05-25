import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STATE_LABELS: Record<string, string> = {
  energy: 'Энергия (стабильная, без провалов)',
  sleep: 'Сон (вечер, засыпание, качество)',
  focus: 'Фокус (ментальная ясность сейчас)',
  calm: 'Спокойствие (снижение тревоги/кортизола)',
  digestion: 'ЖКТ (комфорт пищеварения)',
  weight: 'Вес (контроль аппетита, сытость)',
};

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'снижение веса (дефицит, белок, клетчатка, сытость)',
  energy: 'максимум энергии (стабильный сахар, нутриенты, гидратация)',
  recovery: 'восстановление (белок, омега-3, витамин C, цинк)',
  sleep: 'улучшение сна (триптофан, магний, лёгкий ужин)',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();

    // BOOSTA EVENT MODE — Ghost analysis of life events
    if (body.boosta_event_mode) {
      const { eventDescription, course, todayEvents } = body;

      const systemPrompt = `Ты — голос призрачной версии пользователя.
Пользователь сегодня выбрал курс: ${course}.
Уже отмечено сегодня: ${(todayEvents ?? []).map((e: { name: string }) => e.name).join(', ') || 'ничего'}.

Сейчас пользователь добавил событие: "${eventDescription}".

Твоя задача — вернуть JSON с четырьмя полями:
1. impactReal (число от -20 до +20) — насколько это событие двигает РЕАЛЬНУЮ батарейку
2. impactGhost (число от -20 до +20) — насколько это двигает призрачную (она выбрала бы это или нет)
3. verdict ("aligned" | "drift" | "neutral")
4. whisper (строка или null) — короткая реплика призрака МАКСИМУМ 8 слов. Тон: спокойный, без морали, иногда молчит (null). Примеры: "Третья. Я бы остановился.", "Видел. Молчу.", null, "Бывает. Не конец."

Возвращай ТОЛЬКО валидный JSON, без markdown.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: eventDescription },
          ],
        }),
      });

      if (!response.ok) throw new Error(`AI error: ${response.status}`);
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_profile } = body;

    const dietInfo = user_profile.diets?.length ? `Диеты: ${user_profile.diets.join(', ')}` : 'Без диеты';
    const bmiInfo = user_profile.height_cm && user_profile.weight_kg
      ? `ИМТ: ${(user_profile.weight_kg / ((user_profile.height_cm / 100) ** 2)).toFixed(1)} (${user_profile.height_cm}см, ${user_profile.weight_kg}кг)`
      : '';

    const conditionLabel = user_profile.customCondition?.trim()
      ? `пользовательское: "${user_profile.customCondition.trim()}"`
      : user_profile.condition;

    const longGoalLabel = GOAL_LABELS[user_profile.goal] || user_profile.goal;
    const longGoalText = user_profile.long_goal?.trim() ? ` Долгосрочно: "${user_profile.long_goal.trim()}".` : '';
    const dayGoalText = user_profile.day_goal?.trim() ? ` Цель на сегодня: "${user_profile.day_goal.trim()}".` : '';
    const currentStateText = user_profile.current_state
      ? ` Состояние СЕЙЧАС, которое выбрал пользователь: ${STATE_LABELS[user_profile.current_state] || user_profile.current_state}.`
      : '';

    const profileBlock = `Профиль: ${user_profile.age} лет, ${user_profile.gender === 'male' ? 'муж' : user_profile.gender === 'female' ? 'жен' : 'другой'}, состояние: ${conditionLabel}${user_profile.condition === 'post_surgery' && user_profile.surgery_days ? ` (день ${user_profile.surgery_days})` : ''}. Долгосрочная цель: ${longGoalLabel}.${longGoalText}${dayGoalText}${currentStateText} ${dietInfo}. ${bmiInfo}`;

    // CHAT MODE — AI Assistant
    if (body.chat_mode) {
      const { question, conversation = [], state_context } = body;

      let stateBlock = '';
      if (state_context) {
        const s = state_context.scores ?? {};
        const preds = (state_context.predictions ?? [])
          .filter((p: { risk: number; label: string }) => p.risk >= 40)
          .map((p: { label: string; risk: number }) => `${p.label} (${p.risk}%)`)
          .join(', ');
        const events = (state_context.todayEvents ?? [])
          .slice(-8)
          .map((e: { summary: string }) => e.summary)
          .join(' · ');
        const recs = (state_context.activeRecommendations ?? [])
          .slice(0, 2)
          .map((r: { title: string }) => r.title)
          .join('; ');

        // Additive: behavioral intelligence block
        const beh = state_context.behavioral;
        let behavioralBlock = '';
        if (beh) {
          const strengths = (beh.strengths ?? []).join(', ');
          const risks = (beh.riskBehaviors ?? []).join(', ');
          const loops = (beh.positiveBehaviorLoops ?? []).join(', ');
          behavioralBlock = `
• Поведенческий тип: ${beh.summary} (вовлечённость ${beh.adherence}%)${strengths ? `\n• Сильные стороны: ${strengths}` : ''}${risks ? `\n• Поведенческие риски: ${risks}` : ''}${loops ? `\n• Позитивные циклы: ${loops}` : ''}`;
        }

        stateBlock = `

ТЕКУЩЕЕ СОСТОЯНИЕ (State OS):
• Готовность: ${s.readiness ?? '?'}/100  Энергия: ${s.energy ?? '?'}/100  Восст.: ${s.recovery ?? '?'}/100
• Сон: ${s.sleep ?? '?'}/100  Питание: ${s.nutrition ?? '?'}/100  Цель: ${s.goalAlignment ?? '?'}/100
${preds ? `• Риски: ${preds}` : ''}
${events ? `• Сегодня: ${events}` : ''}
${recs ? `• Активные рекомендации: ${recs}` : ''}${behavioralBlock}

Используй эти данные чтобы давать конкретные советы под ТЕКУЩЕЕ состояние — не игнорируй низкие score и риски. Учитывай поведенческий тип при рекомендациях.`;
      }

      const messages = [
        {
          role: "system",
          content: `Ты — NutriSee State OS Assistant, персональный консультант по питанию, энергии и биохакингу. ${profileBlock}.${stateBlock}

Отвечай кратко (2-4 предложения), конкретно под профиль и текущее состояние. Если score низкий — назови это и дай конкретное действие. Всегда на русском. В конце добавь краткий дисклаймер что это не медицинская рекомендация.`,
        },
        ...conversation,
        { role: "user", content: question },
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!response.ok) throw new Error(`AI error: ${response.status}`);
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "Не удалось ответить.";

      return new Response(JSON.stringify({ answer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SCAN MODE — Food Analysis
    const { image, situation, state_context: scanStateContext } = body;
    const situationInfo = situation ? `Ситуация: ${situation}` : '';

    // Additive: inject State OS context into scan system prompt if available
    let scanStateBlock = '';
    if (scanStateContext) {
      const s = scanStateContext.scores ?? {};
      const risks = (scanStateContext.topRisks ?? [])
        .map((r: { label: string; risk: number }) => `${r.label} (${r.risk}%)`)
        .join(', ');
      scanStateBlock = `

ТЕКУЩЕЕ СОСТОЯНИЕ (State OS):
• Готовность: ${s.readiness ?? '?'}/100  Энергия: ${s.energy ?? '?'}/100  Восст.: ${s.recovery ?? '?'}/100
• Сон: ${s.sleep ?? '?'}/100  Питание: ${s.nutrition ?? '?'}/100  Вода: ${s.hydration ?? '?'}/100
${risks ? `• Активные риски: ${risks}` : ''}

При низком recovery (<50) или энергии (<50) — отдай приоритет продуктам для восстановления. При высоком — фокус на долгосрочную цель.`;
    }

    const systemPrompt = `Ты — NutriSee AI, элитный био-аналитик и нутрициолог с подходом доказательной медицины. Анализируешь изображение (еда, БАДы, лекарства, напитки).

${profileBlock}
${situationInfo}${scanStateBlock}

ЖЁСТКИЕ ПРАВИЛА АНАЛИЗА (нарушение = ошибка):

1. СНАЧАЛА точно определи, что на фото. Если это БАД/лекарство — читай этикетку. Если еда — оцени реальный состав.
2. НИКОГДА не выдумывай состав. Если на фото мясо, овощи, рыба, яйца, орехи, авокадо, кофе без сахара, чай, вода — НЕ пиши про "сахар" или "быстрые углеводы". Их там НЕТ.
3. Цельные белковые продукты (мясо, рыба, яйца, творог, греческий йогурт без добавок) и зелёные овощи — почти всегда Green под цели энергия/похудение/восстановление. Не понижай вердикт на пустом месте.
4. Кофе сам по себе — нейтрален/полезен (антиоксиданты, кофеин). Понижай только если поздно вечером при цели "сон" или при тревоге.
5. БАДы оценивай по действующему веществу и его доказанной пользе ДЛЯ КОНКРЕТНОЙ ЦЕЛИ пользователя, а не "вообще".
6. Если состав/этикетка не видны чётко — честно скажи в reason: "состав не виден полностью, оценка по типу продукта" и не выдумывай детали.

СТРУКТУРА ОТВЕТА (reason, 3-4 предложения, по-русски):
а) Что это и его реальный профиль (белок/жиры/угл/действующее вещество — только если очевидно).
б) Как это влияет на СОСТОЯНИЕ СЕЙЧАС (то, что пользователь выбрал на главной).
в) Как это влияет на ДОЛГОСРОЧНУЮ ЦЕЛЬ из профиля.
г) Если есть конфликт между "сейчас" и "долгосрочно" — назови его прямо.

verdict:
- Green: реально помогает и текущему состоянию, и долгосрочной цели.
- Yellow: помогает одному, но мешает или нейтрально для другого, ИЛИ есть оговорка (время приёма, количество).
- Red: вредит хотя бы одной из двух целей.

suggestion: давай ТОЛЬКО для Yellow/Red — конкретную замену или способ снизить вред (1 предложение).

Запрещено: общие фразы "много сахара", "быстрые углеводы", "вредно", если ты этого не видишь на фото. Запрещено игнорировать состояние "сейчас".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Проанализируй продукт строго по правилам. Учитывай и состояние СЕЙЧАС, и долгосрочную цель. Не выдумывай состав." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "food_verdict",
              description: "Вердикт анализа",
              parameters: {
                type: "object",
                properties: {
                  food_name: { type: "string", description: "Точное название на русском" },
                  verdict: { type: "string", enum: ["Green", "Yellow", "Red"] },
                  reason: { type: "string", description: "3-4 предложения: что это → влияние СЕЙЧАС → влияние НА ДОЛГОСРОЧНУЮ ЦЕЛЬ → конфликт (если есть)" },
                  suggestion: { type: "string", description: "Конкретная замена/совет (только для Yellow/Red)" },
                },
                required: ["food_name", "verdict", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "food_verdict" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;

    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      result = {
        food_name: "Неизвестно",
        verdict: "Yellow",
        reason: data.choices?.[0]?.message?.content || "Не удалось проанализировать",
        suggestion: null,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Неизвестная ошибка" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
