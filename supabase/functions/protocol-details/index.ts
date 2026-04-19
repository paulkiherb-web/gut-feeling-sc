import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProtocolItemInput {
  time?: string;
  title: string;
  description?: string;
  phase?: string;
  goal?: string;
  depth?: string;
}

interface UserProfile {
  age?: number;
  gender?: string;
  condition?: string;
  customCondition?: string;
  goal?: string;
  diets?: string[];
  height_cm?: number;
  weight_kg?: number;
  day_goal?: string;
  long_goal?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const item = body.item as ProtocolItemInput;
    const user_profile = (body.user_profile || {}) as UserProfile;
    const lang: 'ru' | 'en' = body.lang === 'en' ? 'en' : 'ru';

    if (!item || !item.title) {
      return new Response(JSON.stringify({ error: "item.title required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const conditionLabel = user_profile.customCondition?.trim() || user_profile.condition || 'healthy';
    const dietInfo = user_profile.diets?.length ? user_profile.diets.join(', ') : 'none';
    const bmi = user_profile.height_cm && user_profile.weight_kg
      ? (user_profile.weight_kg / ((user_profile.height_cm / 100) ** 2)).toFixed(1)
      : 'n/a';
    const dayGoal = user_profile.day_goal?.trim() || (lang === 'ru' ? 'не задана' : 'not set');
    const longGoal = user_profile.long_goal?.trim() || (lang === 'ru' ? 'не задана' : 'not set');

    const profileBlock = `Age ${user_profile.age || '?'}, sex ${user_profile.gender || '?'}, condition: ${conditionLabel}, base goal: ${user_profile.goal || '?'}, diets: ${dietInfo}, BMI ${bmi}. Today's goal: "${dayGoal}". Long-term goal: "${longGoal}".`;

    const systemRu = `Ты — NutriSee AI, эксперт по биохакингу и доказательной медицине. Тебе дают пункт протокола из дневного интенсива. Сгенерируй полезный, основанный на исследованиях разбор, персонализированный под профиль пользователя.

Профиль пользователя: ${profileBlock}

Требования:
- Только на русском
- Конкретно и по делу, без воды
- Опирайся на доказательную базу: упоминай реальные исследования (название журнала или авторы и год), мета-анализы, RCT, эффект-сайзы или процентные изменения
- Если что-то противопоказано под состояние/диету — обязательно скажи
- Не давай медицинских назначений, только образовательную информацию`;

    const systemEn = `You are NutriSee AI, an evidence-based biohacking expert. You will be given a daily protocol item. Generate a useful, research-backed breakdown personalized to the user's profile.

User profile: ${profileBlock}

Requirements:
- English only
- Concrete and to the point, no fluff
- Cite evidence: name real studies (journal or author + year), meta-analyses, RCTs, effect sizes or percent changes
- Flag contraindications for the user's condition/diet
- Educational only — not medical advice`;

    const userPrompt = lang === 'ru'
      ? `Пункт протокола: "${item.title}".\nКраткое описание: "${item.description || '—'}".\nВремя: ${item.time || '—'}, фаза дня: ${item.phase || '—'}, цель: ${item.goal || '—'}, уровень погружения: ${item.depth || '—'}.\n\nДай разбор по структуре.`
      : `Protocol item: "${item.title}".\nShort description: "${item.description || '—'}".\nTime: ${item.time || '—'}, phase: ${item.phase || '—'}, goal: ${item.goal || '—'}, depth: ${item.depth || '—'}.\n\nReturn structured analysis.`;

    const tool = {
      type: "function" as const,
      function: {
        name: "protocol_details",
        description: lang === 'ru' ? "Подробный разбор пункта протокола" : "Detailed protocol item breakdown",
        parameters: {
          type: "object",
          properties: {
            why: {
              type: "string",
              description: lang === 'ru'
                ? "Зачем это нужно именно для цели и состояния пользователя (2-3 предложения)"
                : "Why this matters for the user's specific goal and condition (2-3 sentences)",
            },
            mechanism: {
              type: "string",
              description: lang === 'ru'
                ? "Биологический механизм: как это работает в организме (2-3 предложения)"
                : "Biological mechanism: how it works in the body (2-3 sentences)",
            },
            evidence: {
              type: "array",
              description: lang === 'ru'
                ? "3 ключевых исследования с названием журнала/авторов, годом и кратким выводом"
                : "3 key studies with journal/authors, year, and brief finding",
              items: {
                type: "object",
                properties: {
                  source: { type: "string", description: lang === 'ru' ? "Авторы / журнал и год" : "Authors / journal and year" },
                  finding: { type: "string", description: lang === 'ru' ? "Вывод одной фразой" : "One-line finding" },
                },
                required: ["source", "finding"],
                additionalProperties: false,
              },
              minItems: 2,
              maxItems: 4,
            },
            how_to: {
              type: "array",
              description: lang === 'ru' ? "3-4 конкретных практических шага" : "3-4 concrete practical steps",
              items: { type: "string" },
              minItems: 2,
              maxItems: 5,
            },
            personalized_note: {
              type: "string",
              description: lang === 'ru'
                ? "Персональная подстройка с учётом состояния, диет и ИМТ пользователя (1-2 предложения)"
                : "Personal tweak based on user's condition, diets and BMI (1-2 sentences)",
            },
            caution: {
              type: "string",
              description: lang === 'ru'
                ? "Противопоказания или моменты осторожности (1 предложение). Если нет — пустая строка."
                : "Contraindications or cautions (1 sentence). Empty string if none.",
            },
          },
          required: ["why", "mechanism", "evidence", "how_to", "personalized_note", "caution"],
          additionalProperties: false,
        },
      },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: lang === 'ru' ? systemRu : systemEn },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "protocol_details" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: lang === 'ru' ? "Слишком много запросов. Попробуйте через минуту." : "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: lang === 'ru' ? "Закончились кредиты AI. Пополните баланс в настройках." : "AI credits exhausted. Top up in settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("protocol-details error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
