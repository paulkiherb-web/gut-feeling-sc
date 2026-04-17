import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const { user_profile } = body;

    const dietInfo = user_profile.diets?.length ? `Диеты: ${user_profile.diets.join(', ')}` : 'Без диеты';
    const bmiInfo = user_profile.height_cm && user_profile.weight_kg
      ? `ИМТ: ${(user_profile.weight_kg / ((user_profile.height_cm / 100) ** 2)).toFixed(1)} (${user_profile.height_cm}см, ${user_profile.weight_kg}кг)`
      : '';

    const conditionLabel = user_profile.customCondition?.trim()
      ? `пользовательское: "${user_profile.customCondition.trim()}"`
      : user_profile.condition;
    const profileBlock = `Профиль: ${user_profile.age} лет, ${user_profile.gender === 'male' ? 'муж' : user_profile.gender === 'female' ? 'жен' : 'другой'}, состояние: ${conditionLabel}${user_profile.condition === 'post_surgery' && user_profile.surgery_days ? ` (день ${user_profile.surgery_days})` : ''}, цель: ${user_profile.goal}. ${dietInfo}. ${bmiInfo}`;

    // CHAT MODE — AI Assistant
    if (body.chat_mode) {
      const { question, conversation = [] } = body;
      const messages = [
        {
          role: "system",
          content: `Ты — NutriSee AI, персональный консультант по питанию и биохакингу. ${profileBlock}. Отвечай кратко (2-4 предложения), конкретно под профиль. Всегда на русском. В конце добавь краткий дисклаймер что это не медицинская рекомендация.`,
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
    const { image, situation } = body;
    const situationInfo = situation ? `Ситуация: ${situation}` : '';

    const systemPrompt = `Ты — NutriSee AI, элитный био-аналитик. Анализируй изображение (еда, БАДы, лекарства, напитки).

${profileBlock}
${situationInfo}

Правила:
1. Определи что на изображении
2. Оцени под цель пользователя: подходит / спорно / не подходит
3. Дай 2-3 конкретные причины почему
4. Если спорно/не подходит — предложи альтернативу
5. Макс 2-3 предложения
6. ВСЕГДА на русском`;

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
              { type: "text", text: "Проанализируй: подходит ли это под мою цель?" },
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
                  food_name: { type: "string", description: "Название на русском" },
                  verdict: { type: "string", enum: ["Green", "Yellow", "Red"] },
                  reason: { type: "string", description: "2-3 причины на русском" },
                  suggestion: { type: "string", description: "Альтернатива если Yellow/Red" },
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
