import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletion, CORS_HEADERS } from "../_shared/aiClient.ts";

interface TriggerEvent {
  type: string;
  payload?: Record<string, unknown>;
  summary?: string;
}

interface RequestBody {
  trigger: TriggerEvent;
  context?: {
    activePlanTitle?: string;
    dayIndex?: number;
    realCharge?: number;
    ghostCharge?: number;
    delta?: number;
  };
  lang?: "ru" | "en";
}

const CORRECTIONS_SCHEMA_TOOL = {
  type: "function",
  function: {
    name: "return_corrections",
    description:
      "Return exactly 3 soft corrections to partially or fully offset the recent action. No punishment, no moralising, no percentages.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        corrections: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "effortBadge", "title", "actionText", "windowMin", "category"],
            properties: {
              id: { type: "string" },
              effortBadge: { type: "string", enum: ["быстро", "надёжно", "полностью"] },
              title: { type: "string", description: "Short label, 2-5 words, Russian." },
              actionText: { type: "string", description: "One sentence imperative, no blame." },
              windowMin: { type: "integer", minimum: 5, maximum: 240 },
              category: {
                type: "string",
                enum: ["hydration", "meal", "movement", "rest", "sleep", "supplement", "habit"],
              },
            },
          },
        },
      },
      required: ["corrections"],
    },
  },
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const body = (await req.json()) as RequestBody;
    const trigger = body.trigger;
    if (!trigger?.type) {
      return new Response(JSON.stringify({ error: "trigger.type required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const ctx = body.context ?? {};
    const triggerLine = trigger.summary
      || `${trigger.type} ${JSON.stringify(trigger.payload ?? {})}`;

    const system = [
      "Ты — мягкий ассистент в приложении биохакинга.",
      "Никогда не наказываешь, не морализуешь, не используешь слова: плохо, ошибка, виноват, провал.",
      "Предлагаешь ровно 3 мягкие коррекции с эффортом 'быстро' / 'надёжно' / 'полностью'.",
      "Каждая коррекция — одно действие на ближайшие 5–240 минут.",
      "Формулировки короткие, утвердительные, без процентов и цифр компенсации.",
    ].join(" ");

    const user = [
      `Событие: ${triggerLine}.`,
      ctx.activePlanTitle ? `План: «${ctx.activePlanTitle}», день ${ctx.dayIndex ?? "?"}.` : "",
      typeof ctx.delta === "number"
        ? `Текущее отклонение от плана: ${ctx.delta > 0 ? "+" : ""}${Math.round(ctx.delta)}.`
        : "",
      "Предложи 3 коррекции через инструмент return_corrections.",
    ].filter(Boolean).join(" ");

    const ai = await chatCompletion({
      model: Deno.env.get("AI_MODEL") ?? "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [CORRECTIONS_SCHEMA_TOOL],
      tool_choice: { type: "function", function: { name: "return_corrections" } },
    });

    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    const args = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    if (!args?.corrections) throw new Error("missing corrections");

    return new Response(JSON.stringify(args), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-corrections]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
