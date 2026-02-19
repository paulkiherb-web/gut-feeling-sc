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

    const { image, user_profile, situation } = await req.json();

    const dietInfo = user_profile.diets?.length ? `Диеты: ${user_profile.diets.join(', ')}` : 'Без диеты';
    const bmiInfo = user_profile.height_cm && user_profile.weight_kg
      ? `ИМТ: ${(user_profile.weight_kg / ((user_profile.height_cm / 100) ** 2)).toFixed(1)} (${user_profile.height_cm}см, ${user_profile.weight_kg}кг)`
      : '';
    const locationInfo = user_profile.location ? `Локация: ${user_profile.location}` : '';
    const situationInfo = situation ? `Текущая ситуация: ${situation}` : '';

    const systemPrompt = `Ты — GreenRed AI, элитный био-аналитик потребления. Анализируй изображение — это может быть еда, добавки (БАДы), лекарства, чай, напитки или любой биопродукт.

Профиль пользователя:
- Возраст: ${user_profile.age}, Пол: ${user_profile.gender === 'male' ? 'мужской' : user_profile.gender === 'female' ? 'женский' : 'другой'}
- Состояние: ${user_profile.condition}${user_profile.condition === 'post_surgery' && user_profile.surgery_days ? ` (День ${user_profile.surgery_days} после операции)` : ''}
- Цель: ${user_profile.goal}
- ${dietInfo}
${bmiInfo ? `- ${bmiInfo}` : ''}
${locationInfo ? `- ${locationInfo}` : ''}
${situationInfo ? `- ${situationInfo}` : ''}

Правила:
1. Определи что на изображении (еда, добавка, лекарство, напиток и т.д.)
2. Оцени безопасность на основе ПОЛНОГО биопрофиля + ситуации пользователя
3. Объясни КОНКРЕТНО почему это хорошо/плохо для ЭТОГО человека
4. Если Yellow или Red — предложи конкретную альтернативу
5. Ответ максимум 2-3 предложения
6. ВСЕГДА отвечай на русском языке`;

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
              { type: "text", text: "Проанализируй это изображение. Что это и стоит ли этому человеку это употреблять с учётом его профиля и ситуации?" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "food_verdict",
              description: "Возвращает вердикт анализа био-потребления",
              parameters: {
                type: "object",
                properties: {
                  food_name: { type: "string", description: "Название продукта на русском языке" },
                  verdict: { type: "string", enum: ["Green", "Yellow", "Red"], description: "Green=Безопасно, Yellow=Осторожно, Red=Избегать" },
                  reason: { type: "string", description: "Объяснение на русском языке, 2-3 предложения" },
                  suggestion: { type: "string", description: "Альтернатива на русском языке, если Yellow или Red" },
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
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов. Попробуйте позже." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-кредиты исчерпаны." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${response.status}`);
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
