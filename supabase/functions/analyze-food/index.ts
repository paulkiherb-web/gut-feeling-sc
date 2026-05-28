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

type IntensiveEffort = "gentle" | "balanced" | "intense";
type IntensiveBlueprintCategory =
  | "hydration"
  | "meal"
  | "movement"
  | "rest"
  | "sleep"
  | "supplement"
  | "habit";

interface IntensiveBlueprintImpact {
  energy?: number;
  recovery?: number;
  sleep?: number;
  nutrition?: number;
  readiness?: number;
}

interface IntensiveBlueprintItemInput {
  time: string;
  category: IntensiveBlueprintCategory;
  title: string;
  description?: string;
  durationMin?: number;
  easyAlt?: string;
  tokenIds?: string[];
  expectedImpact?: IntensiveBlueprintImpact;
}

interface IntensiveDailyBlueprintInput {
  items: IntensiveBlueprintItemInput[];
}

interface GeneratedIntensivePlanInput {
  effort: IntensiveEffort;
  title: string;
  oneLineWhy: string;
  tags: string[];
  expectedDelta?: {
    energy?: number;
    sleep?: number;
    readiness?: number;
  };
  dailyBlueprint: IntensiveDailyBlueprintInput;
}

const INTENSIVE_DURATION_DAYS = 14;
const INTENSIVE_BADGES: Record<IntensiveEffort, string> = {
  gentle: "🌱",
  balanced: "⚡",
  intense: "🔥",
};
const INTENSIVE_COURSE_LABELS: Record<string, string> = {
  energy: "Энергия",
  sleep: "Сон",
  focus: "Когнитивное здоровье",
  weight_loss: "Снижение веса",
  muscle_gain: "Набор мышц",
  calm: "Спокойствие",
  longevity: "Долголетие",
  libido: "Либидо",
  flexibility: "Гибкость",
  immunity: "Иммунитет",
  recovery: "Восстановление",
};

const INTENSIVE_PLAN_TOOL = {
  type: "function",
  function: {
    name: "return_intensive_plans",
    description: "Return exactly 3 intensive plans using gentle, balanced, and intense effort keys.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["plans"],
      properties: {
        plans: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["effort", "title", "oneLineWhy", "tags", "dailyBlueprint"],
            properties: {
              effort: { type: "string", enum: ["gentle", "balanced", "intense"] },
              title: { type: "string" },
              oneLineWhy: { type: "string" },
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
              dailyBlueprint: {
                type: "object",
                additionalProperties: false,
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    minItems: 12,
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
  },
} as const;

function repeatDailyBlueprint(items: IntensiveBlueprintItemInput[], durationDays = INTENSIVE_DURATION_DAYS) {
  return Array.from({ length: durationDays }, (_, dayIndex) => ({
    dayIndex: dayIndex + 1,
    items: items.map((item, itemIndex) => ({
      ...item,
      id: `intensive-d${dayIndex + 1}-i${itemIndex + 1}`,
    })),
  }));
}

function normalizeIntensivePlans(rawPlans: GeneratedIntensivePlanInput[], durationDays = INTENSIVE_DURATION_DAYS) {
  if (!Array.isArray(rawPlans) || rawPlans.length !== 3) {
    throw new Error("AI did not return exactly 3 plans");
  }

  const plansByEffort = new Map(rawPlans.map((plan) => [plan.effort, plan] as const));

  return (["gentle", "balanced", "intense"] as const).map((effort) => {
    const plan = plansByEffort.get(effort);
    if (!plan || !Array.isArray(plan.dailyBlueprint?.items) || !plan.dailyBlueprint.items.length) {
      throw new Error(`AI plan is missing daily blueprint for ${effort}`);
    }

    return {
      effort,
      title: plan.title,
      oneLineWhy: plan.oneLineWhy,
      badge: INTENSIVE_BADGES[effort],
      tags: Array.isArray(plan.tags) ? plan.tags : [],
      expectedDelta: plan.expectedDelta ?? {},
      daily: repeatDailyBlueprint(plan.dailyBlueprint.items, durationDays),
    };
  });
}

function buildFallbackIntensivePlans(course: string, condition?: string) {
  const courseLabel = INTENSIVE_COURSE_LABELS[course] ?? course;
  const conditionLabel = condition?.trim() || "без выраженных ограничений";

  const gentleTemplate: IntensiveBlueprintItemInput[] = [
    { time: "06:45", category: "supplement", title: "NMN 250 мг", description: "Натощак сразу после пробуждения. Поддержка NAD+ и утренней бодрости. Не переносить на вечер — может сдвигать циркадный ритм.", expectedImpact: { energy: 2, readiness: 2 } },
    { time: "07:00", category: "hydration", title: "Вода 400 мл", description: "Первая точка гидратации для мягкого старта дня.", tokenIds: ["water"], expectedImpact: { energy: 2 } },
    { time: "08:00", category: "meal", title: "Завтрак: яйца, греческий йогурт, ягоды", description: "Белок и умеренные углеводы без сахарных качелей. Подходит для устойчивого старта и лучшей сытости.", expectedImpact: { energy: 4, nutrition: 4 } },
    { time: "09:30", category: "hydration", title: "Вода 300 мл", description: "Вторая точка воды до кофе или вместе с ним.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "11:30", category: "hydration", title: "Вода 350 мл", description: "Поддержка концентрации и профилактика дневной усталости.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "12:30", category: "meal", title: "Обед: курица, гречка, салат, оливковое масло", description: "Белок + медленные углеводы + жиры для стабильной энергии и контролируемого аппетита.", expectedImpact: { energy: 4, nutrition: 5 } },
    { time: "14:30", category: "supplement", title: "Витамин C 500 мг", description: "После обеда или днём, не одновременно с кофе. Поддержка антиоксидантной защиты и иммунного ответа.", expectedImpact: { recovery: 2 } },
    { time: "15:30", category: "hydration", title: "Вода 350 мл", description: "Четвёртая точка воды, чтобы не догонять объём вечером.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "17:30", category: "movement", title: "Прогулка 25 минут", description: "Низкоинтенсивная активность улучшает чувствительность к инсулину и помогает снять ментальную усталость.", durationMin: 25, tokenIds: ["walk"], expectedImpact: { energy: 3, recovery: 2 } },
    { time: "18:30", category: "meal", title: "Ужин: рыба, овощи, авокадо", description: "Лёгкий белковый ужин с жирами для восстановления и более спокойного вечера.", expectedImpact: { nutrition: 5, recovery: 3 } },
    { time: "19:00", category: "supplement", title: "Omega-3 1.5 г + D3 2000 МЕ", description: "Только с ужином, где есть жиры. Omega-3 помогает мембранам и воспалительному ответу, D3 лучше усваивается с жирами и не мешает дню.", expectedImpact: { recovery: 3 } },
    { time: "20:30", category: "hydration", title: "Вода 250 мл", description: "Последняя небольшая точка воды без перегруза перед сном.", tokenIds: ["water"], expectedImpact: { recovery: 1 } },
    { time: "21:30", category: "supplement", title: "Магний глицинат 300 мг", description: "За 30–60 минут до сна. Поддержка расслабления и глубины сна; не сочетать с высокими дозами кальция в тот же приём.", expectedImpact: { sleep: 3, recovery: 2 } },
    { time: "22:30", category: "sleep", title: "Сон 7.5–8 часов", description: "Цель — стабильный отход ко сну без экранов за 45 минут.", tokenIds: ["sleep"], expectedImpact: { sleep: 5, readiness: 5 } },
  ];

  const balancedTemplate: IntensiveBlueprintItemInput[] = [
    { time: "06:30", category: "supplement", title: "NMN 350 мг", description: "Натощак утром. Поддержка NAD+ и дневной энергии; не переносить на вечер.", expectedImpact: { energy: 3, readiness: 2 } },
    { time: "06:40", category: "hydration", title: "Вода 450 мл", description: "Стартовая гидратация до первого кофе.", tokenIds: ["water"], expectedImpact: { energy: 2 } },
    { time: "07:15", category: "movement", title: "Быстрая ходьба или зона 2 — 30 минут", description: "Мягкое кардио улучшает метаболическую гибкость и помогает курсу без лишнего стресса.", durationMin: 30, tokenIds: ["walk", "cardio"], expectedImpact: { energy: 4, recovery: 3 } },
    { time: "08:15", category: "meal", title: "Завтрак: омлет, лосось, цельнозерновой тост", description: "Белок, жиры и умеренные углеводы для стабильной энергии и лучшей когнитивной работы.", expectedImpact: { energy: 5, nutrition: 5 } },
    { time: "10:30", category: "hydration", title: "Вода 350 мл", description: "Вторая точка гидратации до обеда.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "12:30", category: "meal", title: "Обед: индейка, киноа, салат, оливковое масло", description: "Комбинация белка, клетчатки и умеренных углеводов для ровной продуктивности во второй половине дня.", expectedImpact: { energy: 5, nutrition: 6 } },
    { time: "13:30", category: "supplement", title: "Витамин C 500–1000 мг", description: "С едой или через час после кофе. Поддержка коллагена и восстановления, не запивать кофе.", expectedImpact: { recovery: 2 } },
    { time: "15:00", category: "hydration", title: "Вода 400 мл", description: "Третья рабочая точка воды.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "16:30", category: "movement", title: "Силовой блок 20 минут или mobility", description: "Короткий блок поддерживает чувствительность к инсулину, мышечный тонус и осанку.", durationMin: 20, tokenIds: ["strength", "stretch"], expectedImpact: { energy: 3, recovery: 3 } },
    { time: "17:30", category: "hydration", title: "Вода 350 мл", description: "Четвёртая точка воды до ужина.", tokenIds: ["water"], expectedImpact: { recovery: 1 } },
    { time: "18:45", category: "meal", title: "Ужин: говядина или тофу, овощи, тахини", description: "Белок и жиры вечером помогают сытости и не перегружают сон быстрыми сахарами.", expectedImpact: { nutrition: 5, recovery: 4 } },
    { time: "19:00", category: "supplement", title: "Omega-3 2 г + D3 3000 МЕ", description: "Только вместе с ужином, где есть жиры. Omega-3 поддерживает мембраны и воспалительный ответ, D3 лучше усваивается с жирной пищей.", expectedImpact: { recovery: 3 } },
    { time: "20:30", category: "hydration", title: "Вода 250 мл", description: "Последняя небольшая точка воды.", tokenIds: ["water"], expectedImpact: { recovery: 1 } },
    { time: "21:30", category: "supplement", title: "Магний глицинат 350 мг", description: "Перед сном для релаксации и нервной системы. Не сочетать с алкоголем — ухудшает архитектуру сна.", expectedImpact: { sleep: 4, recovery: 2 } },
    { time: "22:15", category: "sleep", title: "Сон 8 часов", description: "Целевой отбой в одно и то же время все 14 дней.", tokenIds: ["sleep"], expectedImpact: { sleep: 6, readiness: 6 } },
  ];

  const intenseTemplate: IntensiveBlueprintItemInput[] = [
    { time: "06:00", category: "supplement", title: "NMN 500 мг", description: "Только утром натощак. Поддержка NAD+ и митохондрий; не принимать вечером, чтобы не сдвигать циркадный ритм.", expectedImpact: { energy: 4, readiness: 3 } },
    { time: "06:05", category: "hydration", title: "Вода 500 мл", description: "Стартовая гидратация до нагрузки.", tokenIds: ["water"], expectedImpact: { energy: 2 } },
    { time: "06:30", category: "movement", title: "Кардио зона 2 или интервалы — 35 минут", description: "Блок на выносливость и метаболическую гибкость; интенсивность подбирать по самочувствию.", durationMin: 35, tokenIds: ["cardio", "run"], expectedImpact: { energy: 5, recovery: 3 } },
    { time: "07:30", category: "meal", title: "Завтрак: яйца, творог/йогурт, ягоды, семена", description: "Плотный белковый завтрак снижает вероятность дневных провалов и поддерживает восстановление после утренней работы.", expectedImpact: { energy: 6, nutrition: 6 } },
    { time: "09:30", category: "hydration", title: "Вода 400 мл", description: "Вторая точка воды.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "11:30", category: "meal", title: "Приём пищи: протеин, рис/гречка, овощи", description: "Стабилизирует гликоген и поддерживает курс без тяги на быстрые углеводы.", expectedImpact: { energy: 4, nutrition: 5 } },
    { time: "12:30", category: "supplement", title: "Витамин C 1000 мг", description: "С едой или минимум через час после кофе. Поддержка антиоксидантной защиты; не сочетать с кофе в один момент.", expectedImpact: { recovery: 2 } },
    { time: "13:30", category: "hydration", title: "Вода 400 мл", description: "Третья точка воды.", tokenIds: ["water"], expectedImpact: { energy: 1 } },
    { time: "16:00", category: "movement", title: "Силовой блок 30 минут", description: "Поддержка композиции тела, чувствительности к инсулину и уверенного общего тонуса.", durationMin: 30, tokenIds: ["strength"], expectedImpact: { energy: 4, recovery: 4 } },
    { time: "17:00", category: "hydration", title: "Вода 350 мл", description: "Четвёртая точка воды.", tokenIds: ["water"], expectedImpact: { recovery: 1 } },
    { time: "18:30", category: "meal", title: "Ужин: рыба/мясо, зелёные овощи, оливковое масло", description: "Белок и жиры помогают восстановлению без тяжёлого углеводного хвоста перед сном.", expectedImpact: { nutrition: 6, recovery: 4 } },
    { time: "18:45", category: "supplement", title: "Omega-3 2–3 г + D3 4000 МЕ", description: "Только с ужином, где есть жиры. Omega-3 нужен для мембран и воспалительного ответа, D3 с жирами усваивается надёжнее.", expectedImpact: { recovery: 4 } },
    { time: "20:30", category: "hydration", title: "Вода 250 мл", description: "Последняя небольшая точка воды.", tokenIds: ["water"], expectedImpact: { recovery: 1 } },
    { time: "21:15", category: "supplement", title: "Магний глицинат 400 мг", description: "Перед сном для нервной системы и глубины сна. Следить, чтобы не совмещать с другими седативными добавками без необходимости.", expectedImpact: { sleep: 5, recovery: 3 } },
    { time: "22:00", category: "sleep", title: "Сон 8 часов", description: "Жёсткий приоритет сна, без алкоголя и поздних экранов в будни.", tokenIds: ["sleep"], expectedImpact: { sleep: 7, readiness: 7 } },
  ];

  return {
    plans: normalizeIntensivePlans([
      {
        effort: "gentle",
        title: `Мягкий старт · ${courseLabel}`,
        oneLineWhy: `Щадящий ритм для курса «${courseLabel}» с учётом состояния: ${conditionLabel}.`,
        tags: ["7ч сна", "2.2л воды", "без алкоголя будни"],
        expectedDelta: { energy: 8, sleep: 6, readiness: 10 },
        dailyBlueprint: { items: gentleTemplate },
      },
      {
        effort: "balanced",
        title: `Сбалансированный курс · ${courseLabel}`,
        oneLineWhy: `Оптимальный объём действий, если нужен заметный сдвиг без перегруза.`,
        tags: ["8ч сна", "2.4л воды", "движение ежедневно"],
        expectedDelta: { energy: 14, sleep: 10, readiness: 18 },
        dailyBlueprint: { items: balancedTemplate },
      },
      {
        effort: "intense",
        title: `Интенсивный курс · ${courseLabel}`,
        oneLineWhy: `Плотный протокол для пользователя, готового держать дисциплину все 14 дней.`,
        tags: ["8ч сна", "2.6л воды", "два блока активности"],
        expectedDelta: { energy: 20, sleep: 12, readiness: 24 },
        dailyBlueprint: { items: intenseTemplate },
      },
    ]),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
    const body = await req.json();

    if (body.generate_intensive_plans_mode) {
      const course = typeof body.course === "string" && body.course.trim() ? body.course.trim() : "energy";
      const profile = body.profile ?? {};
      const bmi = profile.bmi ?? "не указан";
      const condition = profile.condition ?? "не указано";
      const goals = typeof body.goals === "string" && body.goals.trim()
        ? body.goals.trim()
        : "не указана";
      const fallback = buildFallbackIntensivePlans(course, condition);

      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify(fallback), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = `Ты — персональный биохакинг-коуч.
Создай 3 варианта 14-дневного интенсива для человека:
- Курс: ${course}
- Возраст: ${profile.age ?? "не указан"}, пол: ${profile.gender ?? "не указан"}, ИМТ: ${bmi}
- Состояние: ${condition}
- Цель: ${goals}

Варианты: Мягкий / Сбалансированный / Интенсивный.

Для каждого варианта дай:
1. title и oneLineWhy (почему подходит этому профилю)
2. DailyBlueprint — расписание на день:
   - hydration: 5-6 точек с временем и количеством мл
   - meals: 3-4 приёма с временем, составом и ПОЧЕМУ именно это
   - movement: 1-2 блока с временем и типом активности и ПОЧЕМУ
   - supplements: полный стек с временем, условием приёма
     (натощак/с едой/с жирами), биохимическим обоснованием 1 строка
     и предупреждениями о несовместимостях
   - sleep: время отхода и целевые часы
3. tags: ['7ч сна', '2.2л воды', 'без алкоголя будни']
4. expectedDelta: ожидаемое изменение скоров через 14 дней

ВАЖНО для стека добавок:
- NMN только утром натощак (не вечером — сдвигает циркадный ритм)
- Омега-3 только с едой содержащей жиры
- Магний глицинат — перед сном
- D3 — с едой с жирами, лучше вечером
- Витамин C — не одновременно с кофе (снижает усвоение)
Для каждой добавки: что, когда, с чем, почему — обязательно.

Формат:
- effort должен быть одним из ключей: gentle, balanced, intense
- dailyBlueprint.items — это шаблон ОДНОГО дня, который потом будет повторён на 14 дней
- В items используй только категории hydration, meal, movement, supplement, sleep, habit, rest
- description используй для деталей "что, когда, с чем, почему" и предупреждений

Верни данные только через tool call return_intensive_plans.`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Собери три варианта интенсива и верни только структурированные данные." },
            ],
            tools: [INTENSIVE_PLAN_TOOL],
            tool_choice: { type: "function", function: { name: "return_intensive_plans" } },
          }),
        });

        if (!response.ok) {
          throw new Error(`AI error: ${response.status}: ${(await response.text()).slice(0, 300)}`);
        }

        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        const raw = toolCall?.function?.arguments ?? data.choices?.[0]?.message?.content;
        const parsed = typeof raw === "string"
          ? JSON.parse(raw.replace(/```json|```/g, "").trim())
          : raw;
        const plans = normalizeIntensivePlans(parsed?.plans ?? parsed);

        return new Response(JSON.stringify({ plans }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("AI intensive-plans error, using fallback:", error);
        return new Response(JSON.stringify(fallback), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // BOOSTA WEEKLY REFLECTION — Ghost notices weekly patterns
    if (body.boosta_weekly_reflection) {
      const { weekEvents, course, ghostProximity } = body;

      const systemPrompt = `Ты — призрачная версия пользователя. Прошла неделя.
Его курс: ${course}.
Средняя близость со мной за неделю: ${ghostProximity}%.

Я заметил следующие события за неделю (макс. 30): ${JSON.stringify((weekEvents ?? []).slice(0, 30))}.

Скажи ОДНУ вещь, которую я заметил за неделю.
Максимум 2 предложения. Без морали. Можно с лёгкой иронией.
Это должен быть инсайт, а не оценка. То, что человек сам не видит.
Отвечай только русской прямой речью без кавычек.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Что ты заметил за неделю?" },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI gateway error (weekly reflection):", response.status, errText);
        throw new Error(`AI error: ${response.status}: ${errText.slice(0, 300)}`);
      }
      const ai = await response.json();
      const whisper = ai?.choices?.[0]?.message?.content?.trim?.() ?? '';
      return new Response(JSON.stringify({ whisper }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BOOSTA ALTERNATIVE MODE — Ghost suggests a replacement
    if (body.boosta_alternative_mode) {
      const { scannedFood, course } = body;

      const COURSE_LABELS_ALT: Record<string, string> = {
        focus: 'фокус и ментальная ясность',
        energy: 'стабильная энергия без скачков сахара',
        sleep: 'качество сна и засыпание',
        calm: 'спокойствие и снижение кортизола',
        weight_loss: 'снижение веса и контроль аппетита',
        muscle_gain: 'мышечный рост и белковый синтез',
        recovery: 'восстановление и снижение воспаления',
      };
      const courseGoal = COURSE_LABELS_ALT[course] || course;

      const systemPrompt = `Ты — персональный призрак-биохакер. Курс пользователя: "${courseGoal}".
Пользователь собирается съесть: "${scannedFood}".
Предложи ОДНУ конкретную альтернативу, которую ты бы выбрал вместо этого, чтобы лучше поддержать курс.
Альтернатива должна быть реальной едой или напитком, доступным в обычном магазине или кафе.
Объясни одной короткой фразой (до 12 слов) почему эта замена лучше для курса — без морализаторства.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Что лучше вместо "${scannedFood}" для курса "${courseGoal}"?` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_alternative",
                description: "Предложить альтернативу продукту",
                parameters: {
                  type: "object",
                  properties: {
                    alternative: { type: "string", description: "Название альтернативного продукта (конкретное, 1-4 слова)" },
                    reason: { type: "string", description: "Почему лучше для курса (до 12 слов, без морали)" },
                  },
                  required: ["alternative", "reason"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "suggest_alternative" } },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI alternative error:", response.status, errText);
        throw new Error(`AI gateway error: ${response.status} — ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let parsed: { alternative: string; reason: string };

      if (toolCall) {
        try {
          parsed = JSON.parse(toolCall.function.arguments);
        } catch {
          parsed = { alternative: scannedFood, reason: 'Попробуй более лёгкий вариант' };
        }
      } else {
        // Fallback: try to extract from text content
        const raw = data.choices?.[0]?.message?.content ?? '';
        const jsonMatch = raw.match(/\{[\s\S]*?\}/);
        try {
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { alternative: scannedFood, reason: 'Попробуй более лёгкий вариант' };
        } catch {
          parsed = { alternative: scannedFood, reason: 'Попробуй более лёгкий вариант' };
        }
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BOOSTA TEXT SCAN MODE — analyze food by name (no image required)
    if (body.boosta_text_scan_mode) {
      const { foodName, user_profile } = body;

      const dietInfo = user_profile?.diets?.length ? `Диеты: ${user_profile.diets.join(', ')}` : 'Без диеты';
      const longGoalLabel = GOAL_LABELS[user_profile?.goal] || user_profile?.goal || 'не указана';
      const conditionLabel = user_profile?.customCondition?.trim()
        ? `пользовательское: "${user_profile.customCondition.trim()}"`
        : (user_profile?.condition || 'healthy');

      const profileBlock = user_profile
        ? `Профиль: ${user_profile.age} лет, ${user_profile.gender === 'male' ? 'муж' : 'жен'}, состояние: ${conditionLabel}. Долгосрочная цель: ${longGoalLabel}. ${dietInfo}.`
        : '';

      const systemPrompt = `Ты — NutriSee AI, элитный нутрициолог с подходом доказательной медицины. Анализируешь продукт по названию (без изображения).
${profileBlock}

Пользователь хочет съесть: "${foodName}".
Проанализируй этот продукт по его типичному составу и влиянию на здоровье.

ЖЁСТКИЕ ПРАВИЛА:
1. Определи типичный состав "${foodName}" по названию — не выдумывай несуществующие ингредиенты.
2. Оцени влияние на текущую цель пользователя.
3. Если продукт реально полезен для цели — давай Green, не занижай вердикт.
4. suggestion только для Yellow/Red — одна конкретная замена или способ улучшить.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Проанализируй: "${foodName}"` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "food_verdict",
                description: "Вердикт анализа продукта по названию",
                parameters: {
                  type: "object",
                  properties: {
                    food_name: { type: "string", description: "Уточнённое название продукта на русском" },
                    verdict: { type: "string", enum: ["Green", "Yellow", "Red"] },
                    reason: { type: "string", description: "3-4 предложения: что это, влияние на цель, конкретные плюсы/минусы" },
                    suggestion: { type: "string", description: "Конкретная замена/совет (только для Yellow/Red, 1 предложение)" },
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
        const errText = await response.text();
        console.error("AI text-scan error:", response.status, errText);
        throw new Error(`AI error: ${response.status}: ${errText.slice(0, 300)}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let result;
      if (toolCall) {
        result = JSON.parse(toolCall.function.arguments);
      } else {
        result = {
          food_name: foodName,
          verdict: "Yellow",
          reason: data.choices?.[0]?.message?.content || "Анализ по названию завершён",
          suggestion: null,
        };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          model: "google/gemini-2.0-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: eventDescription },
          ],
        }),
      });

      if (!response.ok) { const errTxt = await response.text(); console.error("AI gateway error:", response.status, errTxt); throw new Error(`AI error: ${response.status}: ${errTxt.slice(0, 300)}`); }
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
          model: "google/gemini-2.0-flash",
          messages,
        }),
      });

      if (!response.ok) { const errTxt = await response.text(); console.error("AI gateway error:", response.status, errTxt); throw new Error(`AI error: ${response.status}: ${errTxt.slice(0, 300)}`); }
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
        model: "google/gemini-2.0-flash",
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
      throw new Error(`AI error: ${response.status}: ${errorText.slice(0, 300)}`);
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
