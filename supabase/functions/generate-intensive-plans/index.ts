import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletion, CORS_HEADERS } from "../_shared/aiClient.ts";

interface ProfileInput {
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  diets?: string[];
  condition?: string;
  customCondition?: string;
}

interface RequestBody {
  course: string;
  profile?: ProfileInput;
  goals?: { primaryGoal?: string; dayGoal?: string; longGoal?: string };
  durationDays?: number;
  lang?: "ru" | "en";
}

const PLAN_SCHEMA_TOOL = {
  type: "function",
  function: {
    name: "return_intensive_plans",
    description: "Return exactly 3 intensive plans (gentle / balanced / intense).",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        plans: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["effort", "title", "oneLineWhy", "badge", "tags", "expectedDelta", "daily"],
            properties: {
              effort: { type: "string", enum: ["gentle", "balanced", "intense"] },
              title: { type: "string" },
              oneLineWhy: { type: "string" },
              badge: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              expectedDelta: {
                type: "object",
                additionalProperties: false,
                properties: {
                  energy: { type: "number" },
                  sleep: { type: "number" },
                  readiness: { type: "number" },
                },
              },
              daily: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["dayIndex", "items"],
                  properties: {
                    dayIndex: { type: "number" },
                    items: {
                      type: "array",
                      minItems: 3,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["time", "category", "title"],
                        properties: {
                          time: { type: "string" },
                          category: {
                            type: "string",
                            enum: ["hydration", "meal", "movement", "rest", "sleep", "supplement", "habit"],
                          },
                          title: { type: "string" },
                          description: { type: "string" },
                          durationMin: { type: "number" },
                          easyAlt: { type: "string" },
                          tokenIds: { type: "array", items: { type: "string" } },
                          expectedImpact: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                              energy: { type: "number" },
                              recovery: { type: "number" },
                              sleep: { type: "number" },
                              nutrition: { type: "number" },
                              readiness: { type: "number" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      required: ["plans"],
    },
  },
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = (await req.json()) as RequestBody;
    const lang: "ru" | "en" = body.lang === "en" ? "en" : "ru";
    const course = body.course || "energy";
    const durationDays = Math.min(Math.max(body.durationDays ?? 7, 3), 14);

    const p = body.profile ?? {};
    const bmi = p.heightCm && p.weightKg
      ? (p.weightKg / ((p.heightCm / 100) ** 2)).toFixed(1)
      : "n/a";
    const profileLine = `Age ${p.age ?? "?"}, sex ${p.gender ?? "?"}, BMI ${bmi}, condition ${
      p.customCondition?.trim() || p.condition || "healthy"
    }, diets ${(p.diets ?? []).join(", ") || "none"}.`;
    const goalLine = `Course: ${course}. Day goal: ${body.goals?.dayGoal ?? "none"}. Long goal: ${
      body.goals?.longGoal ?? "none"
    }.`;

    const systemPrompt = lang === "ru"
      ? `Ты — биохакинг-стратег. Сгенерируй РОВНО 3 интенсива на ${durationDays} дней под курс пользователя.
Уровни усилия: gentle (🌱 мягкий), balanced (⚡ сбалансированный), intense (🔥 интенсивный).
ТОН: уважительный, без вины, без наказания. Никаких слов "ошибка/плохо/виноват/fail/проиграл".
Каждый план: title (3-5 слов), oneLineWhy (одно предложение почему этот уровень), badge (эмодзи 🌱/⚡/🔥), tags (3-5 коротких меток), expectedDelta (прирост энергии/сна/готовности 0..30), daily (массив на ${durationDays} дней).
В каждом дне 4-10 items: hydration, meal, movement, rest, sleep, supplement, habit. Время HH:MM.
tokenIds — из: water, coffee, run, walk, swim, bike, ski, morning_charge, cardio, hiit, strength, yoga, stretch, sleep, meditation, rest, reading.
Учитывай BMI и возраст: для BMI>27 — больше движения низкой интенсивности; 45+ — мягче нагрузка, больше восстановления.
Отвечай ТОЛЬКО через tool call return_intensive_plans.`
      : `You are a biohacking strategist. Generate EXACTLY 3 intensives over ${durationDays} days.
Effort: gentle / balanced / intense. Tone: respectful, never punishing.
Use the return_intensive_plans tool.`;

    const userPrompt = `${profileLine}\n${goalLine}\n\nReturn 3 plans now.`;

    const response = await chatCompletion({
      temperature: 0.7,
      tools: [PLAN_SCHEMA_TOOL],
      tool_choice: { type: "function", function: { name: "return_intensive_plans" } },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({ error: `AI ${response.status}: ${text}` }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: "AI did not return tool call" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(
      JSON.stringify({ plans: parsed.plans, course, durationDays, generatedAt: new Date().toISOString() }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
