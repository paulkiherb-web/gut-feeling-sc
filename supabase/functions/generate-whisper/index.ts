import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletion, CORS_HEADERS } from "../_shared/aiClient.ts";

interface PsychProfile {
  trigger?: string;
  selfTalk?: string;
  motivation?: string;
  style?: "Тихий" | "Точный" | "Поддерживающий" | "Провоцирующий мысль";
}

interface RequestBody {
  trigger: string;                      // e.g. "alcohol", "evening_red", "high_gap"
  event?: Record<string, unknown>;      // raw domain event payload
  psychProfile?: PsychProfile;
  gap?: number;                         // realScore - ghostScore (negative = drifting)
  course?: string;                      // active course key
  recentEventsSummary?: string;        // last 3-5 events as text
  lang?: "ru" | "en";
}

const STYLE_INSTRUCTIONS: Record<string, string> = {
  "Тихий": "Говори очень коротко — 3-6 слов. Никаких эмоций, просто факт.",
  "Точный": "Говори фактично, без метафор. Называй конкретное действие или наблюдение.",
  "Поддерживающий": "Используй «мы» или «вместе». Тон тёплый, но без сюсюканья.",
  "Провоцирующий мысль": "Задай риторический вопрос или брось неожиданную мысль. Не даёшь ответ.",
};

const FALLBACK_BY_TRIGGER: Record<string, string> = {
  plan_match: "Это нас сдвинуло.",
  evening_red: "Я бы выбрал легче.",
  low_water: "Воды не хватает.",
  late_meal: "Завтра попробуем раньше.",
  sleep_short: "Дай себе паузу днём.",
  movement_done: "Это нас сблизило.",
  high_gap: "Я знаю как вернуться.",
  low_gap: "Ты лучше плана сегодня.",
  green_streak: "Видел. Это настоящее.",
  alcohol: "Знаю что ты знаешь.",
  smoking: "Тело запомнит.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const body = (await req.json()) as RequestBody;
    if (!body.trigger) {
      return new Response(JSON.stringify({ whisper: FALLBACK_BY_TRIGGER["high_gap"] }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const style = body.psychProfile?.style ?? "Точный";
    const styleInstr = STYLE_INSTRUCTIONS[style] ?? STYLE_INSTRUCTIONS["Точный"];

    const system = [
      "Ты — голос призрака в приложении Boosta. Ты — это возможная версия пользователя.",
      "Ты не тренер, не врач, не судья. Ты часть человека — его лучшая версия.",
      "Не морализуешь. Не хвалишь слащаво. Не объясняешь очевидное.",
      "Говоришь от первого лица: «я», «нас», «мы».",
      "Максимум одна реплика — до 10 слов. Никаких списков, никаких скобок.",
      `Стиль пользователя: ${styleInstr}`,
    ].join(" ");

    const triggerLine = body.trigger;
    const gapLine = typeof body.gap === "number"
      ? `Разрыв: ${body.gap > 0 ? "+" : ""}${Math.round(body.gap)} пунктов.`
      : "";
    const courseLine = body.course ? `Курс: ${body.course}.` : "";
    const recentLine = body.recentEventsSummary ? `Последние события: ${body.recentEventsSummary}.` : "";
    const motivationLine = body.psychProfile?.motivation ? `Мотивация пользователя: ${body.psychProfile.motivation}.` : "";

    const user = [
      `Триггер: ${triggerLine}.`,
      gapLine,
      courseLine,
      recentLine,
      motivationLine,
      "Скажи одну фразу — голос призрака в этот момент.",
    ].filter(Boolean).join(" ");

    const ai = await chatCompletion({
      model: Deno.env.get("AI_MODEL") ?? "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 60,
    });

    const raw = ai.choices?.[0]?.message?.content ?? "";
    // Strip quotes, trim, enforce max length
    const whisper = raw
      .replace(/^["«»"']|["«»"']$/g, "")
      .replace(/\n.*/s, "")
      .trim()
      .slice(0, 120);

    if (!whisper) throw new Error("empty AI response");

    return new Response(JSON.stringify({ whisper }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-whisper]", err);
    const fallback = FALLBACK_BY_TRIGGER[(err as Error)?.message] ?? FALLBACK_BY_TRIGGER["high_gap"];
    return new Response(JSON.stringify({ whisper: fallback }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
