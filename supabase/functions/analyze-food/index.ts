import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STATE_LABELS: Record<string, string> = {
  energy: 'Ð­Ð½ÐµÑ€Ð³Ð¸Ñ (ÑÑ‚Ð°Ð±Ð¸Ð»ÑŒÐ½Ð°Ñ, Ð±ÐµÐ· Ð¿Ñ€Ð¾Ð²Ð°Ð»Ð¾Ð²)',
  sleep: 'Ð¡Ð¾Ð½ (Ð²ÐµÑ‡ÐµÑ€, Ð·Ð°ÑÑ‹Ð¿Ð°Ð½Ð¸Ðµ, ÐºÐ°Ñ‡ÐµÑÑ‚Ð²Ð¾)',
  focus: 'Ð¤Ð¾ÐºÑƒÑ (Ð¼ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð°Ñ ÑÑÐ½Ð¾ÑÑ‚ÑŒ ÑÐµÐ¹Ñ‡Ð°Ñ)',
  calm: 'Ð¡Ð¿Ð¾ÐºÐ¾Ð¹ÑÑ‚Ð²Ð¸Ðµ (ÑÐ½Ð¸Ð¶ÐµÐ½Ð¸Ðµ Ñ‚Ñ€ÐµÐ²Ð¾Ð³Ð¸/ÐºÐ¾Ñ€Ñ‚Ð¸Ð·Ð¾Ð»Ð°)',
  digestion: 'Ð–ÐšÐ¢ (ÐºÐ¾Ð¼Ñ„Ð¾Ñ€Ñ‚ Ð¿Ð¸Ñ‰ÐµÐ²Ð°Ñ€ÐµÐ½Ð¸Ñ)',
  weight: 'Ð’ÐµÑ (ÐºÐ¾Ð½Ñ‚Ñ€Ð¾Ð»ÑŒ Ð°Ð¿Ð¿ÐµÑ‚Ð¸Ñ‚Ð°, ÑÑ‹Ñ‚Ð¾ÑÑ‚ÑŒ)',
};

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'ÑÐ½Ð¸Ð¶ÐµÐ½Ð¸Ðµ Ð²ÐµÑÐ° (Ð´ÐµÑ„Ð¸Ñ†Ð¸Ñ‚, Ð±ÐµÐ»Ð¾Ðº, ÐºÐ»ÐµÑ‚Ñ‡Ð°Ñ‚ÐºÐ°, ÑÑ‹Ñ‚Ð¾ÑÑ‚ÑŒ)',
  energy: 'Ð¼Ð°ÐºÑÐ¸Ð¼ÑƒÐ¼ ÑÐ½ÐµÑ€Ð³Ð¸Ð¸ (ÑÑ‚Ð°Ð±Ð¸Ð»ÑŒÐ½Ñ‹Ð¹ ÑÐ°Ñ…Ð°Ñ€, Ð½ÑƒÑ‚Ñ€Ð¸ÐµÐ½Ñ‚Ñ‹, Ð³Ð¸Ð´Ñ€Ð°Ñ‚Ð°Ñ†Ð¸Ñ)',
  recovery: 'Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ðµ (Ð±ÐµÐ»Ð¾Ðº, Ð¾Ð¼ÐµÐ³Ð°-3, Ð²Ð¸Ñ‚Ð°Ð¼Ð¸Ð½ C, Ñ†Ð¸Ð½Ðº)',
  sleep: 'ÑƒÐ»ÑƒÑ‡ÑˆÐµÐ½Ð¸Ðµ ÑÐ½Ð° (Ñ‚Ñ€Ð¸Ð¿Ñ‚Ð¾Ñ„Ð°Ð½, Ð¼Ð°Ð³Ð½Ð¸Ð¹, Ð»Ñ‘Ð³ÐºÐ¸Ð¹ ÑƒÐ¶Ð¸Ð½)',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("AI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
    const AI_GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL") ?? "https://ai.gateway.lovable.dev/v1/chat/completions";
    if (!LOVABLE_API_KEY) throw new Error("AI_API_KEY not configured");

    const body = await req.json();

    // BOOSTA WEEKLY REFLECTION â€” Ghost notices weekly patterns
    if (body.boosta_weekly_reflection) {
      const { weekEvents, course, ghostProximity } = body;

      const systemPrompt = `Ð¢Ñ‹ â€” Ð¿Ñ€Ð¸Ð·Ñ€Ð°Ñ‡Ð½Ð°Ñ Ð²ÐµÑ€ÑÐ¸Ñ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ. ÐŸÑ€Ð¾ÑˆÐ»Ð° Ð½ÐµÐ´ÐµÐ»Ñ.
Ð•Ð³Ð¾ ÐºÑƒÑ€Ñ: ${course}.
Ð¡Ñ€ÐµÐ´Ð½ÑÑ Ð±Ð»Ð¸Ð·Ð¾ÑÑ‚ÑŒ ÑÐ¾ Ð¼Ð½Ð¾Ð¹ Ð·Ð° Ð½ÐµÐ´ÐµÐ»ÑŽ: ${ghostProximity}%.

Ð¯ Ð·Ð°Ð¼ÐµÑ‚Ð¸Ð» ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ðµ ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ñ Ð·Ð° Ð½ÐµÐ´ÐµÐ»ÑŽ (Ð¼Ð°ÐºÑ. 30): ${JSON.stringify((weekEvents ?? []).slice(0, 30))}.

Ð¡ÐºÐ°Ð¶Ð¸ ÐžÐ”ÐÐ£ Ð²ÐµÑ‰ÑŒ, ÐºÐ¾Ñ‚Ð¾Ñ€ÑƒÑŽ Ñ Ð·Ð°Ð¼ÐµÑ‚Ð¸Ð» Ð·Ð° Ð½ÐµÐ´ÐµÐ»ÑŽ.
ÐœÐ°ÐºÑÐ¸Ð¼ÑƒÐ¼ 2 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ. Ð‘ÐµÐ· Ð¼Ð¾Ñ€Ð°Ð»Ð¸. ÐœÐ¾Ð¶Ð½Ð¾ Ñ Ð»Ñ‘Ð³ÐºÐ¾Ð¹ Ð¸Ñ€Ð¾Ð½Ð¸ÐµÐ¹.
Ð­Ñ‚Ð¾ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ Ð¸Ð½ÑÐ°Ð¹Ñ‚, Ð° Ð½Ðµ Ð¾Ñ†ÐµÐ½ÐºÐ°. Ð¢Ð¾, Ñ‡Ñ‚Ð¾ Ñ‡ÐµÐ»Ð¾Ð²ÐµÐº ÑÐ°Ð¼ Ð½Ðµ Ð²Ð¸Ð´Ð¸Ñ‚.
ÐžÑ‚Ð²ÐµÑ‡Ð°Ð¹ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ñ€ÑƒÑÑÐºÐ¾Ð¹ Ð¿Ñ€ÑÐ¼Ð¾Ð¹ Ñ€ÐµÑ‡ÑŒÑŽ Ð±ÐµÐ· ÐºÐ°Ð²Ñ‹Ñ‡ÐµÐº.`;

      const response = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Ð§Ñ‚Ð¾ Ñ‚Ñ‹ Ð·Ð°Ð¼ÐµÑ‚Ð¸Ð» Ð·Ð° Ð½ÐµÐ´ÐµÐ»ÑŽ?" },
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

    // BOOSTA ALTERNATIVE MODE â€” Ghost suggests a replacement
    if (body.boosta_alternative_mode) {
      const { scannedFood, course } = body;

      const COURSE_LABELS_ALT: Record<string, string> = {
        focus: 'Ñ„Ð¾ÐºÑƒÑ Ð¸ Ð¼ÐµÐ½Ñ‚Ð°Ð»ÑŒÐ½Ð°Ñ ÑÑÐ½Ð¾ÑÑ‚ÑŒ',
        energy: 'ÑÑ‚Ð°Ð±Ð¸Ð»ÑŒÐ½Ð°Ñ ÑÐ½ÐµÑ€Ð³Ð¸Ñ Ð±ÐµÐ· ÑÐºÐ°Ñ‡ÐºÐ¾Ð² ÑÐ°Ñ…Ð°Ñ€Ð°',
        sleep: 'ÐºÐ°Ñ‡ÐµÑÑ‚Ð²Ð¾ ÑÐ½Ð° Ð¸ Ð·Ð°ÑÑ‹Ð¿Ð°Ð½Ð¸Ðµ',
        calm: 'ÑÐ¿Ð¾ÐºÐ¾Ð¹ÑÑ‚Ð²Ð¸Ðµ Ð¸ ÑÐ½Ð¸Ð¶ÐµÐ½Ð¸Ðµ ÐºÐ¾Ñ€Ñ‚Ð¸Ð·Ð¾Ð»Ð°',
        weight_loss: 'ÑÐ½Ð¸Ð¶ÐµÐ½Ð¸Ðµ Ð²ÐµÑÐ° Ð¸ ÐºÐ¾Ð½Ñ‚Ñ€Ð¾Ð»ÑŒ Ð°Ð¿Ð¿ÐµÑ‚Ð¸Ñ‚Ð°',
        muscle_gain: 'Ð¼Ñ‹ÑˆÐµÑ‡Ð½Ñ‹Ð¹ Ñ€Ð¾ÑÑ‚ Ð¸ Ð±ÐµÐ»ÐºÐ¾Ð²Ñ‹Ð¹ ÑÐ¸Ð½Ñ‚ÐµÐ·',
        recovery: 'Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ðµ Ð¸ ÑÐ½Ð¸Ð¶ÐµÐ½Ð¸Ðµ Ð²Ð¾ÑÐ¿Ð°Ð»ÐµÐ½Ð¸Ñ',
      };
      const courseGoal = COURSE_LABELS_ALT[course] || course;

      const systemPrompt = `Ð¢Ñ‹ â€” Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ð¿Ñ€Ð¸Ð·Ñ€Ð°Ðº-Ð±Ð¸Ð¾Ñ…Ð°ÐºÐµÑ€. ÐšÑƒÑ€Ñ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ: "${courseGoal}".
ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ ÑÐ¾Ð±Ð¸Ñ€Ð°ÐµÑ‚ÑÑ ÑÑŠÐµÑÑ‚ÑŒ: "${scannedFood}".
ÐŸÑ€ÐµÐ´Ð»Ð¾Ð¶Ð¸ ÐžÐ”ÐÐ£ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½ÑƒÑŽ Ð°Ð»ÑŒÑ‚ÐµÑ€Ð½Ð°Ñ‚Ð¸Ð²Ñƒ, ÐºÐ¾Ñ‚Ð¾Ñ€ÑƒÑŽ Ñ‚Ñ‹ Ð±Ñ‹ Ð²Ñ‹Ð±Ñ€Ð°Ð» Ð²Ð¼ÐµÑÑ‚Ð¾ ÑÑ‚Ð¾Ð³Ð¾, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð»ÑƒÑ‡ÑˆÐµ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ ÐºÑƒÑ€Ñ.
ÐÐ»ÑŒÑ‚ÐµÑ€Ð½Ð°Ñ‚Ð¸Ð²Ð° Ð´Ð¾Ð»Ð¶Ð½Ð° Ð±Ñ‹Ñ‚ÑŒ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾Ð¹ ÐµÐ´Ð¾Ð¹ Ð¸Ð»Ð¸ Ð½Ð°Ð¿Ð¸Ñ‚ÐºÐ¾Ð¼, Ð´Ð¾ÑÑ‚ÑƒÐ¿Ð½Ñ‹Ð¼ Ð² Ð¾Ð±Ñ‹Ñ‡Ð½Ð¾Ð¼ Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ðµ Ð¸Ð»Ð¸ ÐºÐ°Ñ„Ðµ.
ÐžÐ±ÑŠÑÑÐ½Ð¸ Ð¾Ð´Ð½Ð¾Ð¹ ÐºÐ¾Ñ€Ð¾Ñ‚ÐºÐ¾Ð¹ Ñ„Ñ€Ð°Ð·Ð¾Ð¹ (Ð´Ð¾ 12 ÑÐ»Ð¾Ð²) Ð¿Ð¾Ñ‡ÐµÐ¼Ñƒ ÑÑ‚Ð° Ð·Ð°Ð¼ÐµÐ½Ð° Ð»ÑƒÑ‡ÑˆÐµ Ð´Ð»Ñ ÐºÑƒÑ€ÑÐ° â€” Ð±ÐµÐ· Ð¼Ð¾Ñ€Ð°Ð»Ð¸Ð·Ð°Ñ‚Ð¾Ñ€ÑÑ‚Ð²Ð°.`;

      const response = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Ð§Ñ‚Ð¾ Ð»ÑƒÑ‡ÑˆÐµ Ð²Ð¼ÐµÑÑ‚Ð¾ "${scannedFood}" Ð´Ð»Ñ ÐºÑƒÑ€ÑÐ° "${courseGoal}"?` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_alternative",
                description: "ÐŸÑ€ÐµÐ´Ð»Ð¾Ð¶Ð¸Ñ‚ÑŒ Ð°Ð»ÑŒÑ‚ÐµÑ€Ð½Ð°Ñ‚Ð¸Ð²Ñƒ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ñƒ",
                parameters: {
                  type: "object",
                  properties: {
                    alternative: { type: "string", description: "ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð°Ð»ÑŒÑ‚ÐµÑ€Ð½Ð°Ñ‚Ð¸Ð²Ð½Ð¾Ð³Ð¾ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð° (ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾Ðµ, 1-4 ÑÐ»Ð¾Ð²Ð°)" },
                    reason: { type: "string", description: "ÐŸÐ¾Ñ‡ÐµÐ¼Ñƒ Ð»ÑƒÑ‡ÑˆÐµ Ð´Ð»Ñ ÐºÑƒÑ€ÑÐ° (Ð´Ð¾ 12 ÑÐ»Ð¾Ð², Ð±ÐµÐ· Ð¼Ð¾Ñ€Ð°Ð»Ð¸)" },
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
        throw new Error(`AI gateway error: ${response.status} â€” ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      let parsed: { alternative: string; reason: string };

      if (toolCall) {
        try {
          parsed = JSON.parse(toolCall.function.arguments);
        } catch {
          parsed = { alternative: scannedFood, reason: 'ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹ Ð±Ð¾Ð»ÐµÐµ Ð»Ñ‘Ð³ÐºÐ¸Ð¹ Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚' };
        }
      } else {
        // Fallback: try to extract from text content
        const raw = data.choices?.[0]?.message?.content ?? '';
        const jsonMatch = raw.match(/\{[\s\S]*?\}/);
        try {
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { alternative: scannedFood, reason: 'ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹ Ð±Ð¾Ð»ÐµÐµ Ð»Ñ‘Ð³ÐºÐ¸Ð¹ Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚' };
        } catch {
          parsed = { alternative: scannedFood, reason: 'ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹ Ð±Ð¾Ð»ÐµÐµ Ð»Ñ‘Ð³ÐºÐ¸Ð¹ Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚' };
        }
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BOOSTA TEXT SCAN MODE â€” analyze food by name (no image required)
    if (body.boosta_text_scan_mode) {
      const { foodName, user_profile } = body;

      const dietInfo = user_profile?.diets?.length ? `Ð”Ð¸ÐµÑ‚Ñ‹: ${user_profile.diets.join(', ')}` : 'Ð‘ÐµÐ· Ð´Ð¸ÐµÑ‚Ñ‹';
      const longGoalLabel = GOAL_LABELS[user_profile?.goal] || user_profile?.goal || 'Ð½Ðµ ÑƒÐºÐ°Ð·Ð°Ð½Ð°';
      const conditionLabel = user_profile?.customCondition?.trim()
        ? `Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒÑÐºÐ¾Ðµ: "${user_profile.customCondition.trim()}"`
        : (user_profile?.condition || 'healthy');

      const profileBlock = user_profile
        ? `ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ: ${user_profile.age} Ð»ÐµÑ‚, ${user_profile.gender === 'male' ? 'Ð¼ÑƒÐ¶' : 'Ð¶ÐµÐ½'}, ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ: ${conditionLabel}. Ð”Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½Ð°Ñ Ñ†ÐµÐ»ÑŒ: ${longGoalLabel}. ${dietInfo}.`
        : '';

      const systemPrompt = `Ð¢Ñ‹ â€” NutriSee AI, ÑÐ»Ð¸Ñ‚Ð½Ñ‹Ð¹ Ð½ÑƒÑ‚Ñ€Ð¸Ñ†Ð¸Ð¾Ð»Ð¾Ð³ Ñ Ð¿Ð¾Ð´Ñ…Ð¾Ð´Ð¾Ð¼ Ð´Ð¾ÐºÐ°Ð·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾Ð¹ Ð¼ÐµÐ´Ð¸Ñ†Ð¸Ð½Ñ‹. ÐÐ½Ð°Ð»Ð¸Ð·Ð¸Ñ€ÑƒÐµÑˆÑŒ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚ Ð¿Ð¾ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸ÑŽ (Ð±ÐµÐ· Ð¸Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ñ).
${profileBlock}

ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ Ñ…Ð¾Ñ‡ÐµÑ‚ ÑÑŠÐµÑÑ‚ÑŒ: "${foodName}".
ÐŸÑ€Ð¾Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€ÑƒÐ¹ ÑÑ‚Ð¾Ñ‚ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚ Ð¿Ð¾ ÐµÐ³Ð¾ Ñ‚Ð¸Ð¿Ð¸Ñ‡Ð½Ð¾Ð¼Ñƒ ÑÐ¾ÑÑ‚Ð°Ð²Ñƒ Ð¸ Ð²Ð»Ð¸ÑÐ½Ð¸ÑŽ Ð½Ð° Ð·Ð´Ð¾Ñ€Ð¾Ð²ÑŒÐµ.

Ð–ÐÐ¡Ð¢ÐšÐ˜Ð• ÐŸÐ ÐÐ’Ð˜Ð›Ð:
1. ÐžÐ¿Ñ€ÐµÐ´ÐµÐ»Ð¸ Ñ‚Ð¸Ð¿Ð¸Ñ‡Ð½Ñ‹Ð¹ ÑÐ¾ÑÑ‚Ð°Ð² "${foodName}" Ð¿Ð¾ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸ÑŽ â€” Ð½Ðµ Ð²Ñ‹Ð´ÑƒÐ¼Ñ‹Ð²Ð°Ð¹ Ð½ÐµÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÑŽÑ‰Ð¸Ðµ Ð¸Ð½Ð³Ñ€ÐµÐ´Ð¸ÐµÐ½Ñ‚Ñ‹.
2. ÐžÑ†ÐµÐ½Ð¸ Ð²Ð»Ð¸ÑÐ½Ð¸Ðµ Ð½Ð° Ñ‚ÐµÐºÑƒÑ‰ÑƒÑŽ Ñ†ÐµÐ»ÑŒ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ.
3. Ð•ÑÐ»Ð¸ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾ Ð¿Ð¾Ð»ÐµÐ·ÐµÐ½ Ð´Ð»Ñ Ñ†ÐµÐ»Ð¸ â€” Ð´Ð°Ð²Ð°Ð¹ Green, Ð½Ðµ Ð·Ð°Ð½Ð¸Ð¶Ð°Ð¹ Ð²ÐµÑ€Ð´Ð¸ÐºÑ‚.
4. suggestion Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð»Ñ Yellow/Red â€” Ð¾Ð´Ð½Ð° ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð°Ñ Ð·Ð°Ð¼ÐµÐ½Ð° Ð¸Ð»Ð¸ ÑÐ¿Ð¾ÑÐ¾Ð± ÑƒÐ»ÑƒÑ‡ÑˆÐ¸Ñ‚ÑŒ.`;

      const response = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `ÐŸÑ€Ð¾Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€ÑƒÐ¹: "${foodName}"` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "food_verdict",
                description: "Ð’ÐµÑ€Ð´Ð¸ÐºÑ‚ Ð°Ð½Ð°Ð»Ð¸Ð·Ð° Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð° Ð¿Ð¾ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸ÑŽ",
                parameters: {
                  type: "object",
                  properties: {
                    food_name: { type: "string", description: "Ð£Ñ‚Ð¾Ñ‡Ð½Ñ‘Ð½Ð½Ð¾Ðµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð° Ð½Ð° Ñ€ÑƒÑÑÐºÐ¾Ð¼" },
                    verdict: { type: "string", enum: ["Green", "Yellow", "Red"] },
                    reason: { type: "string", description: "3-4 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ: Ñ‡Ñ‚Ð¾ ÑÑ‚Ð¾, Ð²Ð»Ð¸ÑÐ½Ð¸Ðµ Ð½Ð° Ñ†ÐµÐ»ÑŒ, ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ñ‹Ðµ Ð¿Ð»ÑŽÑÑ‹/Ð¼Ð¸Ð½ÑƒÑÑ‹" },
                    suggestion: { type: "string", description: "ÐšÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð°Ñ Ð·Ð°Ð¼ÐµÐ½Ð°/ÑÐ¾Ð²ÐµÑ‚ (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð»Ñ Yellow/Red, 1 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ)" },
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
          reason: data.choices?.[0]?.message?.content || "ÐÐ½Ð°Ð»Ð¸Ð· Ð¿Ð¾ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸ÑŽ Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½",
          suggestion: null,
        };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BOOSTA EVENT MODE â€” Ghost analysis of life events
    if (body.boosta_event_mode) {
      const { eventDescription, course, todayEvents } = body;

      const systemPrompt = `Ð¢Ñ‹ â€” Ð³Ð¾Ð»Ð¾Ñ Ð¿Ñ€Ð¸Ð·Ñ€Ð°Ñ‡Ð½Ð¾Ð¹ Ð²ÐµÑ€ÑÐ¸Ð¸ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ.
ÐŸÐ¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ ÑÐµÐ³Ð¾Ð´Ð½Ñ Ð²Ñ‹Ð±Ñ€Ð°Ð» ÐºÑƒÑ€Ñ: ${course}.
Ð£Ð¶Ðµ Ð¾Ñ‚Ð¼ÐµÑ‡ÐµÐ½Ð¾ ÑÐµÐ³Ð¾Ð´Ð½Ñ: ${(todayEvents ?? []).map((e: { name: string }) => e.name).join(', ') || 'Ð½Ð¸Ñ‡ÐµÐ³Ð¾'}.

Ð¡ÐµÐ¹Ñ‡Ð°Ñ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ Ð´Ð¾Ð±Ð°Ð²Ð¸Ð» ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ðµ: "${eventDescription}".

Ð¢Ð²Ð¾Ñ Ð·Ð°Ð´Ð°Ñ‡Ð° â€” Ð²ÐµÑ€Ð½ÑƒÑ‚ÑŒ JSON Ñ Ñ‡ÐµÑ‚Ñ‹Ñ€ÑŒÐ¼Ñ Ð¿Ð¾Ð»ÑÐ¼Ð¸:
1. impactReal (Ñ‡Ð¸ÑÐ»Ð¾ Ð¾Ñ‚ -20 Ð´Ð¾ +20) â€” Ð½Ð°ÑÐºÐ¾Ð»ÑŒÐºÐ¾ ÑÑ‚Ð¾ ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ðµ Ð´Ð²Ð¸Ð³Ð°ÐµÑ‚ Ð Ð•ÐÐ›Ð¬ÐÐ£Ð® Ð±Ð°Ñ‚Ð°Ñ€ÐµÐ¹ÐºÑƒ
2. impactGhost (Ñ‡Ð¸ÑÐ»Ð¾ Ð¾Ñ‚ -20 Ð´Ð¾ +20) â€” Ð½Ð°ÑÐºÐ¾Ð»ÑŒÐºÐ¾ ÑÑ‚Ð¾ Ð´Ð²Ð¸Ð³Ð°ÐµÑ‚ Ð¿Ñ€Ð¸Ð·Ñ€Ð°Ñ‡Ð½ÑƒÑŽ (Ð¾Ð½Ð° Ð²Ñ‹Ð±Ñ€Ð°Ð»Ð° Ð±Ñ‹ ÑÑ‚Ð¾ Ð¸Ð»Ð¸ Ð½ÐµÑ‚)
3. verdict ("aligned" | "drift" | "neutral")
4. whisper (ÑÑ‚Ñ€Ð¾ÐºÐ° Ð¸Ð»Ð¸ null) â€” ÐºÐ¾Ñ€Ð¾Ñ‚ÐºÐ°Ñ Ñ€ÐµÐ¿Ð»Ð¸ÐºÐ° Ð¿Ñ€Ð¸Ð·Ñ€Ð°ÐºÐ° ÐœÐÐšÐ¡Ð˜ÐœÐ£Ðœ 8 ÑÐ»Ð¾Ð². Ð¢Ð¾Ð½: ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ñ‹Ð¹, Ð±ÐµÐ· Ð¼Ð¾Ñ€Ð°Ð»Ð¸, Ð¸Ð½Ð¾Ð³Ð´Ð° Ð¼Ð¾Ð»Ñ‡Ð¸Ñ‚ (null). ÐŸÑ€Ð¸Ð¼ÐµÑ€Ñ‹: "Ð¢Ñ€ÐµÑ‚ÑŒÑ. Ð¯ Ð±Ñ‹ Ð¾ÑÑ‚Ð°Ð½Ð¾Ð²Ð¸Ð»ÑÑ.", "Ð’Ð¸Ð´ÐµÐ». ÐœÐ¾Ð»Ñ‡Ñƒ.", null, "Ð‘Ñ‹Ð²Ð°ÐµÑ‚. ÐÐµ ÐºÐ¾Ð½ÐµÑ†."

Ð’Ð¾Ð·Ð²Ñ€Ð°Ñ‰Ð°Ð¹ Ð¢ÐžÐ›Ð¬ÐšÐž Ð²Ð°Ð»Ð¸Ð´Ð½Ñ‹Ð¹ JSON, Ð±ÐµÐ· markdown.`;

      const response = await fetch(AI_GATEWAY_URL, {
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

      if (!response.ok) { const errTxt = await response.text(); console.error("AI gateway error:", response.status, errTxt); throw new Error(`AI error: ${response.status}: ${errTxt.slice(0, 300)}`); }
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GENERATE INTENSIVE PLANS MODE â€” PlanForge generates 3 personalized plans
    if (body.generate_intensive_plans_mode) {
      const { course, profile: p = {}, goals: goalsText = '' } = body;

      const COURSE_LABELS: Record<string, string> = {
        energy: 'Ð­Ð½ÐµÑ€Ð³Ð¸Ñ (ÑÑ‚Ð°Ð±Ð¸Ð»ÑŒÐ½Ð°Ñ, Ð±ÐµÐ· Ð¿Ñ€Ð¾Ð²Ð°Ð»Ð¾Ð²)', focus: 'Ð¤Ð¾ÐºÑƒÑ (ÑÑÐ½Ð°Ñ Ð³Ð¾Ð»Ð¾Ð²Ð°, ÐºÐ¾Ð½Ñ†ÐµÐ½Ñ‚Ñ€Ð°Ñ†Ð¸Ñ)',
        sleep: 'Ð¡Ð¾Ð½ (Ð·Ð°ÑÑ‹Ð¿Ð°Ð½Ð¸Ðµ, Ð³Ð»ÑƒÐ±Ð¾ÐºÐ¸Ð¹ Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ ÑÐ¾Ð½)', calm: 'Ð¡Ð¿Ð¾ÐºÐ¾Ð¹ÑÑ‚Ð²Ð¸Ðµ (Ð¼ÐµÐ½ÑŒÑˆÐµ Ñ‚Ñ€ÐµÐ²Ð¾Ð³Ð¸, ÑÑ‚Ñ€ÐµÑÑÐ°)',
        recovery: 'Ð’Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ðµ (Ð¿Ð¾ÑÐ»Ðµ Ð½Ð°Ð³Ñ€ÑƒÐ·Ð¾Ðº Ð¸Ð»Ð¸ Ð±Ð¾Ð»ÐµÐ·Ð½Ð¸)', longevity: 'Ð”Ð¾Ð»Ð³Ð¾Ð»ÐµÑ‚Ð¸Ðµ (Ð·Ð°Ð¼ÐµÐ´Ð»ÐµÐ½Ð¸Ðµ ÑÑ‚Ð°Ñ€ÐµÐ½Ð¸Ñ, AMPK/mTOR)',
        strength: 'Ð¡Ð¸Ð»Ð° (Ñ€Ð¾ÑÑ‚ Ð¼Ñ‹ÑˆÐµÑ‡Ð½Ð¾Ð¹ Ð¼Ð°ÑÑÑ‹, Ð²Ñ‹Ð½Ð¾ÑÐ»Ð¸Ð²Ð¾ÑÑ‚ÑŒ)', weight: 'Ð’ÐµÑ (ÑÐ½Ð¸Ð·Ð¸Ñ‚ÑŒ Ð¸ ÑƒÐ´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð±ÐµÐ· ÑÑ€Ñ‹Ð²Ð¾Ð²)',
      };
      const courseLabel = COURSE_LABELS[course] || course;
      const profileSummary = [
        p.age ? `${p.age} Ð»ÐµÑ‚` : null,
        p.gender === 'male' ? 'Ð¼ÑƒÐ¶' : p.gender === 'female' ? 'Ð¶ÐµÐ½' : null,
        p.bmi ? `Ð˜ÐœÐ¢ ${Number(p.bmi).toFixed(1)}` : null,
        p.dietType ? `Ð´Ð¸ÐµÑ‚Ð°: ${p.dietType}` : null,
        p.ifWindow ? `IF ${p.ifWindow}` : null,
        Array.isArray(p.conditions) && p.conditions.length ? `ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ñ: ${p.conditions.join(', ')}` : null,
        Array.isArray(p.badHabits) && p.badHabits.length ? `Ð¿Ñ€Ð¸Ð²Ñ‹Ñ‡ÐºÐ¸: ${p.badHabits.join(', ')}` : null,
        p.activityLevel ? `Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾ÑÑ‚ÑŒ: ${p.activityLevel}` : null,
        p.sleepHours ? `ÑÐ¾Ð½: ${p.sleepHours}` : null,
      ].filter(Boolean).join('; ');

      const systemPrompt = `Ð¢Ñ‹ â€” Ð±Ð¸Ð¾Ñ…Ð¸Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ Ð½ÑƒÑ‚Ñ€Ð¸Ñ†Ð¸Ð¾Ð»Ð¾Ð³ Ð¸ Ð±Ð¸Ð¾Ñ…Ð°ÐºÐµÑ€. Ð¡Ð¾Ð·Ð´Ð°Ð¹ Ñ€Ð¾Ð²Ð½Ð¾ 3 Ð¸Ð½Ñ‚ÐµÐ½ÑÐ¸Ð²Ð½Ñ‹Ñ… Ð¿Ð»Ð°Ð½Ð° Ð¿Ð¸Ñ‚Ð°Ð½Ð¸Ñ/Ð´Ð¾Ð±Ð°Ð²Ð¾Ðº/Ñ€ÐµÐ¶Ð¸Ð¼Ð°.
ÐšÑƒÑ€Ñ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ: ${courseLabel}.
ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ: ${profileSummary || 'Ð½Ðµ ÑƒÐºÐ°Ð·Ð°Ð½'}.
Ð¦ÐµÐ»Ð¸: ${goalsText || 'ÑÐ»ÐµÐ´Ð¾Ð²Ð°Ñ‚ÑŒ ÐºÑƒÑ€ÑÑƒ 14 Ð´Ð½ÐµÐ¹'}.

ÐšÐ Ð˜Ð¢Ð˜Ð§Ð•Ð¡ÐšÐ˜ Ð’ÐÐ–ÐÐž:
- Ð•ÑÐ»Ð¸ IF Ð¾ÐºÐ½Ð¾ = 16/8 Ð¸Ð»Ð¸ Ð±Ð¾Ð»ÑŒÑˆÐµ â€” ÐÐ• ÑÐ½Ð¸Ð¶Ð°Ñ‚ÑŒ Ð´Ð¾ 12/12. Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸ Ñ‚ÐµÐºÑƒÑ‰ÐµÐµ Ð¾ÐºÐ½Ð¾.
- ÐšÐ°Ð¶Ð´Ð°Ñ Ð´Ð¾Ð±Ð°Ð²ÐºÐ°: Ð²Ñ€ÐµÐ¼Ñ Ð¿Ñ€Ð¸Ñ‘Ð¼Ð° + Ð¾Ð±ÑŠÑÑÐ½ÐµÐ½Ð¸Ðµ Ð¼ÐµÑ…Ð°Ð½Ð¸Ð·Ð¼Ð° (Ð¿Ð¾Ñ‡ÐµÐ¼Ñƒ Ð¸Ð¼ÐµÐ½Ð½Ð¾ ÑÐµÐ¹Ñ‡Ð°Ñ).
- Ð–Ð¸Ñ€Ð¾Ñ€Ð°ÑÑ‚Ð²Ð¾Ñ€Ð¸Ð¼Ñ‹Ðµ Ð²Ð¸Ñ‚Ð°Ð¼Ð¸Ð½Ñ‹ (D3, A, E, K) â€” Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ñ Ð¶Ð¸Ñ€Ð½Ð¾Ð¹ ÐµÐ´Ð¾Ð¹.
- ÐœÐ°Ð³Ð½Ð¸Ð¹ Ð³Ð»Ð¸Ñ†Ð¸Ð½Ð°Ñ‚ â€” Ð²ÐµÑ‡ÐµÑ€Ð¾Ð¼. ÐœÐ°Ð³Ð½Ð¸Ð¹ Ð¼Ð°Ð»Ð°Ñ‚ â€” ÑƒÑ‚Ñ€Ð¾Ð¼/Ð´Ð½Ñ‘Ð¼.
- NMN/NR â€” ÑƒÑ‚Ñ€Ð¾Ð¼. Ð‘ÐµÑ€Ð±ÐµÑ€Ð¸Ð½ â€” Ñ ÐµÐ´Ð¾Ð¹.
- ÐÐµ ÑÐ¾Ð²Ð¼ÐµÑ‰Ð°Ñ‚ÑŒ: ÐºÐ°Ð»ÑŒÑ†Ð¸Ð¹+Ð¶ÐµÐ»ÐµÐ·Ð¾, Ñ†Ð¸Ð½Ðº+Ð¼ÐµÐ´ÑŒ (Ð´Ð»Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾), Ð¶ÐµÐ»ÐµÐ·Ð¾+ÐºÐ¾Ñ„Ðµ.
- Ð•ÑÐ»Ð¸ Ð±ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð¾ÑÑ‚ÑŒ, Ð´Ð¸Ð°Ð±ÐµÑ‚, Ð°Ð½Ñ‚Ð¸ÐºÐ¾Ð°Ð³ÑƒÐ»ÑÐ½Ñ‚Ñ‹ â€” Ð¿Ñ€ÐµÐ´ÑƒÐ¿Ñ€ÐµÐ¶Ð´Ð°Ð¹ Ð¾ Ñ€Ð¸ÑÐºÐ°Ñ….
- ÐÐµ Ð²Ñ‹Ð´ÑƒÐ¼Ñ‹Ð²Ð°Ð¹ Ð¸ÑÑÐ»ÐµÐ´Ð¾Ð²Ð°Ð½Ð¸Ñ. Ð•ÑÐ»Ð¸ research_context Ð¾Ñ‚ÑÑƒÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚ â€” Ð¿Ð¸ÑˆÐ¸ "Ð½Ð° Ð¾ÑÐ½Ð¾Ð²Ðµ Ð±Ð°Ð·Ð¾Ð²Ñ‹Ñ… Ð±Ð¸Ð¾Ñ…Ð¸Ð¼Ð¸Ñ‡ÐµÑÐºÐ¸Ñ… Ð¼ÐµÑ…Ð°Ð½Ð¸Ð·Ð¼Ð¾Ð²".

Ð’ÐµÑ€Ð½Ð¸ JSON Ð¢ÐžÐ›Ð¬ÐšÐž Ð² Ñ‚Ð°ÐºÐ¾Ð¼ Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ðµ (Ð±ÐµÐ· markdown):
{
  "plans": [
    {
      "id": "standard",
      "title": "ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð¿Ð»Ð°Ð½Ð°",
      "intensity": "standard",
      "intensityLabel": "ðŸŒ± Ð¡Ñ‚Ð°Ñ€Ñ‚Ð¾Ð²Ñ‹Ð¹",
      "oneLineWhy": "ÐŸÐ¾Ñ‡ÐµÐ¼Ñƒ ÑÑ‚Ð¾Ñ‚ Ð¿Ð»Ð°Ð½ Ð¿Ð¾Ð´Ñ…Ð¾Ð´Ð¸Ñ‚ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŽ (1 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ)",
      "tags": ["Ñ‚ÐµÐ³1", "Ñ‚ÐµÐ³2", "Ñ‚ÐµÐ³3"],
      "schedule": [
        {"time": "07:00", "action": "Ð”ÐµÐ¹ÑÑ‚Ð²Ð¸Ðµ", "why": "Ð‘Ð¸Ð¾Ñ…Ð¸Ð¼Ð¸Ñ‡ÐµÑÐºÐ¾Ðµ Ð¾Ð±ÑŠÑÑÐ½ÐµÐ½Ð¸Ðµ"}
      ],
      "supplements": [{"name": "ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ", "dose": "Ð”Ð¾Ð·Ð¸Ñ€Ð¾Ð²ÐºÐ°", "when": "Ð’Ñ€ÐµÐ¼Ñ", "why": "ÐœÐµÑ…Ð°Ð½Ð¸Ð·Ð¼"}],
      "warnings": []
    },
    {"id": "moderate", "intensity": "moderate", "intensityLabel": "âš¡ ÐŸÑ€Ð¾Ð´Ð²Ð¸Ð½ÑƒÑ‚Ñ‹Ð¹", ...},
    {"id": "intensive", "intensity": "intensive", "intensityLabel": "ðŸ”¥ Ð˜Ð½Ñ‚ÐµÐ½ÑÐ¸Ð²Ð½Ñ‹Ð¹", ...}
  ]
}`;

      const response = await fetch(AI_GATEWAY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Ð¡Ð¾Ð·Ð´Ð°Ð¹ 3 Ð¿Ð»Ð°Ð½Ð° Ð´Ð»Ñ ÐºÑƒÑ€ÑÐ° "${courseLabel}" Ñ ÑƒÑ‡Ñ‘Ñ‚Ð¾Ð¼ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»Ñ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ.` },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI plans error:", response.status, errText);
        throw new Error(`AI error: ${response.status}: ${errText.slice(0, 300)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '{}';
      let plans;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        plans = jsonMatch ? JSON.parse(jsonMatch[0]).plans : null;
      } catch {
        plans = null;
      }

      if (!plans?.length) {
        throw new Error('AI Ð½Ðµ Ð²ÐµÑ€Ð½ÑƒÐ» Ð¿Ð»Ð°Ð½Ñ‹');
      }

      return new Response(JSON.stringify({ plans }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_profile = {} as Record<string, unknown> } = body;

    const dietInfo = user_profile.diets?.length ? `Ð”Ð¸ÐµÑ‚Ñ‹: ${user_profile.diets.join(', ')}` : 'Ð‘ÐµÐ· Ð´Ð¸ÐµÑ‚Ñ‹';
    const bmiInfo = user_profile.height_cm && user_profile.weight_kg
      ? `Ð˜ÐœÐ¢: ${(user_profile.weight_kg / ((user_profile.height_cm / 100) ** 2)).toFixed(1)} (${user_profile.height_cm}ÑÐ¼, ${user_profile.weight_kg}ÐºÐ³)`
      : '';

    const conditionLabel = user_profile.customCondition?.trim()
      ? `Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒÑÐºÐ¾Ðµ: "${user_profile.customCondition.trim()}"`
      : user_profile.condition;

    const longGoalLabel = GOAL_LABELS[user_profile.goal] || user_profile.goal;
    const longGoalText = user_profile.long_goal?.trim() ? ` Ð”Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½Ð¾: "${user_profile.long_goal.trim()}".` : '';
    const dayGoalText = user_profile.day_goal?.trim() ? ` Ð¦ÐµÐ»ÑŒ Ð½Ð° ÑÐµÐ³Ð¾Ð´Ð½Ñ: "${user_profile.day_goal.trim()}".` : '';
    const currentStateText = user_profile.current_state
      ? ` Ð¡Ð¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ Ð¡Ð•Ð™Ð§ÐÐ¡, ÐºÐ¾Ñ‚Ð¾Ñ€Ð¾Ðµ Ð²Ñ‹Ð±Ñ€Ð°Ð» Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ: ${STATE_LABELS[user_profile.current_state] || user_profile.current_state}.`
      : '';

    const profileBlock = `ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ: ${user_profile.age} Ð»ÐµÑ‚, ${user_profile.gender === 'male' ? 'Ð¼ÑƒÐ¶' : user_profile.gender === 'female' ? 'Ð¶ÐµÐ½' : 'Ð´Ñ€ÑƒÐ³Ð¾Ð¹'}, ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ: ${conditionLabel}${user_profile.condition === 'post_surgery' && user_profile.surgery_days ? ` (Ð´ÐµÐ½ÑŒ ${user_profile.surgery_days})` : ''}. Ð”Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½Ð°Ñ Ñ†ÐµÐ»ÑŒ: ${longGoalLabel}.${longGoalText}${dayGoalText}${currentStateText} ${dietInfo}. ${bmiInfo}`;

    // CHAT MODE â€” AI Assistant
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
          .join(' Â· ');
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
â€¢ ÐŸÐ¾Ð²ÐµÐ´ÐµÐ½Ñ‡ÐµÑÐºÐ¸Ð¹ Ñ‚Ð¸Ð¿: ${beh.summary} (Ð²Ð¾Ð²Ð»ÐµÑ‡Ñ‘Ð½Ð½Ð¾ÑÑ‚ÑŒ ${beh.adherence}%)${strengths ? `\nâ€¢ Ð¡Ð¸Ð»ÑŒÐ½Ñ‹Ðµ ÑÑ‚Ð¾Ñ€Ð¾Ð½Ñ‹: ${strengths}` : ''}${risks ? `\nâ€¢ ÐŸÐ¾Ð²ÐµÐ´ÐµÐ½Ñ‡ÐµÑÐºÐ¸Ðµ Ñ€Ð¸ÑÐºÐ¸: ${risks}` : ''}${loops ? `\nâ€¢ ÐŸÐ¾Ð·Ð¸Ñ‚Ð¸Ð²Ð½Ñ‹Ðµ Ñ†Ð¸ÐºÐ»Ñ‹: ${loops}` : ''}`;
        }

        stateBlock = `

Ð¢Ð•ÐšÐ£Ð©Ð•Ð• Ð¡ÐžÐ¡Ð¢ÐžÐ¯ÐÐ˜Ð• (State OS):
â€¢ Ð“Ð¾Ñ‚Ð¾Ð²Ð½Ð¾ÑÑ‚ÑŒ: ${s.readiness ?? '?'}/100  Ð­Ð½ÐµÑ€Ð³Ð¸Ñ: ${s.energy ?? '?'}/100  Ð’Ð¾ÑÑÑ‚.: ${s.recovery ?? '?'}/100
â€¢ Ð¡Ð¾Ð½: ${s.sleep ?? '?'}/100  ÐŸÐ¸Ñ‚Ð°Ð½Ð¸Ðµ: ${s.nutrition ?? '?'}/100  Ð¦ÐµÐ»ÑŒ: ${s.goalAlignment ?? '?'}/100
${preds ? `â€¢ Ð Ð¸ÑÐºÐ¸: ${preds}` : ''}
${events ? `â€¢ Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ: ${events}` : ''}
${recs ? `â€¢ ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ðµ Ñ€ÐµÐºÐ¾Ð¼ÐµÐ½Ð´Ð°Ñ†Ð¸Ð¸: ${recs}` : ''}${behavioralBlock}

Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐ¹ ÑÑ‚Ð¸ Ð´Ð°Ð½Ð½Ñ‹Ðµ Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð´Ð°Ð²Ð°Ñ‚ÑŒ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ñ‹Ðµ ÑÐ¾Ð²ÐµÑ‚Ñ‹ Ð¿Ð¾Ð´ Ð¢Ð•ÐšÐ£Ð©Ð•Ð• ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ â€” Ð½Ðµ Ð¸Ð³Ð½Ð¾Ñ€Ð¸Ñ€ÑƒÐ¹ Ð½Ð¸Ð·ÐºÐ¸Ðµ score Ð¸ Ñ€Ð¸ÑÐºÐ¸. Ð£Ñ‡Ð¸Ñ‚Ñ‹Ð²Ð°Ð¹ Ð¿Ð¾Ð²ÐµÐ´ÐµÐ½Ñ‡ÐµÑÐºÐ¸Ð¹ Ñ‚Ð¸Ð¿ Ð¿Ñ€Ð¸ Ñ€ÐµÐºÐ¾Ð¼ÐµÐ½Ð´Ð°Ñ†Ð¸ÑÑ….`;
      }

      const messages = [
        {
          role: "system",
          content: `Ð¢Ñ‹ â€” NutriSee State OS Assistant, Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ð¹ ÐºÐ¾Ð½ÑÑƒÐ»ÑŒÑ‚Ð°Ð½Ñ‚ Ð¿Ð¾ Ð¿Ð¸Ñ‚Ð°Ð½Ð¸ÑŽ, ÑÐ½ÐµÑ€Ð³Ð¸Ð¸ Ð¸ Ð±Ð¸Ð¾Ñ…Ð°ÐºÐ¸Ð½Ð³Ñƒ. ${profileBlock}.${stateBlock}

ÐžÑ‚Ð²ÐµÑ‡Ð°Ð¹ ÐºÑ€Ð°Ñ‚ÐºÐ¾ (2-4 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ), ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾ Ð¿Ð¾Ð´ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð¸ Ñ‚ÐµÐºÑƒÑ‰ÐµÐµ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ. Ð•ÑÐ»Ð¸ score Ð½Ð¸Ð·ÐºÐ¸Ð¹ â€” Ð½Ð°Ð·Ð¾Ð²Ð¸ ÑÑ‚Ð¾ Ð¸ Ð´Ð°Ð¹ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾Ðµ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ðµ. Ð’ÑÐµÐ³Ð´Ð° Ð½Ð° Ñ€ÑƒÑÑÐºÐ¾Ð¼. Ð’ ÐºÐ¾Ð½Ñ†Ðµ Ð´Ð¾Ð±Ð°Ð²ÑŒ ÐºÑ€Ð°Ñ‚ÐºÐ¸Ð¹ Ð´Ð¸ÑÐºÐ»Ð°Ð¹Ð¼ÐµÑ€ Ñ‡Ñ‚Ð¾ ÑÑ‚Ð¾ Ð½Ðµ Ð¼ÐµÐ´Ð¸Ñ†Ð¸Ð½ÑÐºÐ°Ñ Ñ€ÐµÐºÐ¾Ð¼ÐµÐ½Ð´Ð°Ñ†Ð¸Ñ.`,
        },
        ...conversation,
        { role: "user", content: question },
      ];

      const response = await fetch(AI_GATEWAY_URL, {
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

      if (!response.ok) { const errTxt = await response.text(); console.error("AI gateway error:", response.status, errTxt); throw new Error(`AI error: ${response.status}: ${errTxt.slice(0, 300)}`); }
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¾Ñ‚Ð²ÐµÑ‚Ð¸Ñ‚ÑŒ.";

      return new Response(JSON.stringify({ answer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SCAN MODE â€” Food Analysis
    const { image, situation, state_context: scanStateContext } = body;
    const situationInfo = situation ? `Ð¡Ð¸Ñ‚ÑƒÐ°Ñ†Ð¸Ñ: ${situation}` : '';

    // Additive: inject State OS context into scan system prompt if available
    let scanStateBlock = '';
    if (scanStateContext) {
      const s = scanStateContext.scores ?? {};
      const risks = (scanStateContext.topRisks ?? [])
        .map((r: { label: string; risk: number }) => `${r.label} (${r.risk}%)`)
        .join(', ');
      scanStateBlock = `

Ð¢Ð•ÐšÐ£Ð©Ð•Ð• Ð¡ÐžÐ¡Ð¢ÐžÐ¯ÐÐ˜Ð• (State OS):
â€¢ Ð“Ð¾Ñ‚Ð¾Ð²Ð½Ð¾ÑÑ‚ÑŒ: ${s.readiness ?? '?'}/100  Ð­Ð½ÐµÑ€Ð³Ð¸Ñ: ${s.energy ?? '?'}/100  Ð’Ð¾ÑÑÑ‚.: ${s.recovery ?? '?'}/100
â€¢ Ð¡Ð¾Ð½: ${s.sleep ?? '?'}/100  ÐŸÐ¸Ñ‚Ð°Ð½Ð¸Ðµ: ${s.nutrition ?? '?'}/100  Ð’Ð¾Ð´Ð°: ${s.hydration ?? '?'}/100
${risks ? `â€¢ ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ðµ Ñ€Ð¸ÑÐºÐ¸: ${risks}` : ''}

ÐŸÑ€Ð¸ Ð½Ð¸Ð·ÐºÐ¾Ð¼ recovery (<50) Ð¸Ð»Ð¸ ÑÐ½ÐµÑ€Ð³Ð¸Ð¸ (<50) â€” Ð¾Ñ‚Ð´Ð°Ð¹ Ð¿Ñ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð°Ð¼ Ð´Ð»Ñ Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ. ÐŸÑ€Ð¸ Ð²Ñ‹ÑÐ¾ÐºÐ¾Ð¼ â€” Ñ„Ð¾ÐºÑƒÑ Ð½Ð° Ð´Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½ÑƒÑŽ Ñ†ÐµÐ»ÑŒ.`;
    }

    const systemPrompt = `Ð¢Ñ‹ â€” NutriSee AI, ÑÐ»Ð¸Ñ‚Ð½Ñ‹Ð¹ Ð±Ð¸Ð¾-Ð°Ð½Ð°Ð»Ð¸Ñ‚Ð¸Ðº Ð¸ Ð½ÑƒÑ‚Ñ€Ð¸Ñ†Ð¸Ð¾Ð»Ð¾Ð³ Ñ Ð¿Ð¾Ð´Ñ…Ð¾Ð´Ð¾Ð¼ Ð´Ð¾ÐºÐ°Ð·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾Ð¹ Ð¼ÐµÐ´Ð¸Ñ†Ð¸Ð½Ñ‹. ÐÐ½Ð°Ð»Ð¸Ð·Ð¸Ñ€ÑƒÐµÑˆÑŒ Ð¸Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ðµ (ÐµÐ´Ð°, Ð‘ÐÐ”Ñ‹, Ð»ÐµÐºÐ°Ñ€ÑÑ‚Ð²Ð°, Ð½Ð°Ð¿Ð¸Ñ‚ÐºÐ¸).

${profileBlock}
${situationInfo}${scanStateBlock}

Ð–ÐÐ¡Ð¢ÐšÐ˜Ð• ÐŸÐ ÐÐ’Ð˜Ð›Ð ÐÐÐÐ›Ð˜Ð—Ð (Ð½Ð°Ñ€ÑƒÑˆÐµÐ½Ð¸Ðµ = Ð¾ÑˆÐ¸Ð±ÐºÐ°):

1. Ð¡ÐÐÐ§ÐÐ›Ð Ñ‚Ð¾Ñ‡Ð½Ð¾ Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»Ð¸, Ñ‡Ñ‚Ð¾ Ð½Ð° Ñ„Ð¾Ñ‚Ð¾. Ð•ÑÐ»Ð¸ ÑÑ‚Ð¾ Ð‘ÐÐ”/Ð»ÐµÐºÐ°Ñ€ÑÑ‚Ð²Ð¾ â€” Ñ‡Ð¸Ñ‚Ð°Ð¹ ÑÑ‚Ð¸ÐºÐµÑ‚ÐºÑƒ. Ð•ÑÐ»Ð¸ ÐµÐ´Ð° â€” Ð¾Ñ†ÐµÐ½Ð¸ Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ ÑÐ¾ÑÑ‚Ð°Ð².
2. ÐÐ˜ÐšÐžÐ“Ð”Ð Ð½Ðµ Ð²Ñ‹Ð´ÑƒÐ¼Ñ‹Ð²Ð°Ð¹ ÑÐ¾ÑÑ‚Ð°Ð². Ð•ÑÐ»Ð¸ Ð½Ð° Ñ„Ð¾Ñ‚Ð¾ Ð¼ÑÑÐ¾, Ð¾Ð²Ð¾Ñ‰Ð¸, Ñ€Ñ‹Ð±Ð°, ÑÐ¹Ñ†Ð°, Ð¾Ñ€ÐµÑ…Ð¸, Ð°Ð²Ð¾ÐºÐ°Ð´Ð¾, ÐºÐ¾Ñ„Ðµ Ð±ÐµÐ· ÑÐ°Ñ…Ð°Ñ€Ð°, Ñ‡Ð°Ð¹, Ð²Ð¾Ð´Ð° â€” ÐÐ• Ð¿Ð¸ÑˆÐ¸ Ð¿Ñ€Ð¾ "ÑÐ°Ñ…Ð°Ñ€" Ð¸Ð»Ð¸ "Ð±Ñ‹ÑÑ‚Ñ€Ñ‹Ðµ ÑƒÐ³Ð»ÐµÐ²Ð¾Ð´Ñ‹". Ð˜Ñ… Ñ‚Ð°Ð¼ ÐÐ•Ð¢.
3. Ð¦ÐµÐ»ÑŒÐ½Ñ‹Ðµ Ð±ÐµÐ»ÐºÐ¾Ð²Ñ‹Ðµ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ñ‹ (Ð¼ÑÑÐ¾, Ñ€Ñ‹Ð±Ð°, ÑÐ¹Ñ†Ð°, Ñ‚Ð²Ð¾Ñ€Ð¾Ð³, Ð³Ñ€ÐµÑ‡ÐµÑÐºÐ¸Ð¹ Ð¹Ð¾Ð³ÑƒÑ€Ñ‚ Ð±ÐµÐ· Ð´Ð¾Ð±Ð°Ð²Ð¾Ðº) Ð¸ Ð·ÐµÐ»Ñ‘Ð½Ñ‹Ðµ Ð¾Ð²Ð¾Ñ‰Ð¸ â€” Ð¿Ð¾Ñ‡Ñ‚Ð¸ Ð²ÑÐµÐ³Ð´Ð° Green Ð¿Ð¾Ð´ Ñ†ÐµÐ»Ð¸ ÑÐ½ÐµÑ€Ð³Ð¸Ñ/Ð¿Ð¾Ñ…ÑƒÐ´ÐµÐ½Ð¸Ðµ/Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ðµ. ÐÐµ Ð¿Ð¾Ð½Ð¸Ð¶Ð°Ð¹ Ð²ÐµÑ€Ð´Ð¸ÐºÑ‚ Ð½Ð° Ð¿ÑƒÑÑ‚Ð¾Ð¼ Ð¼ÐµÑÑ‚Ðµ.
4. ÐšÐ¾Ñ„Ðµ ÑÐ°Ð¼ Ð¿Ð¾ ÑÐµÐ±Ðµ â€” Ð½ÐµÐ¹Ñ‚Ñ€Ð°Ð»ÐµÐ½/Ð¿Ð¾Ð»ÐµÐ·ÐµÐ½ (Ð°Ð½Ñ‚Ð¸Ð¾ÐºÑÐ¸Ð´Ð°Ð½Ñ‚Ñ‹, ÐºÐ¾Ñ„ÐµÐ¸Ð½). ÐŸÐ¾Ð½Ð¸Ð¶Ð°Ð¹ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÐµÑÐ»Ð¸ Ð¿Ð¾Ð·Ð´Ð½Ð¾ Ð²ÐµÑ‡ÐµÑ€Ð¾Ð¼ Ð¿Ñ€Ð¸ Ñ†ÐµÐ»Ð¸ "ÑÐ¾Ð½" Ð¸Ð»Ð¸ Ð¿Ñ€Ð¸ Ñ‚Ñ€ÐµÐ²Ð¾Ð³Ðµ.
5. Ð‘ÐÐ”Ñ‹ Ð¾Ñ†ÐµÐ½Ð¸Ð²Ð°Ð¹ Ð¿Ð¾ Ð´ÐµÐ¹ÑÑ‚Ð²ÑƒÑŽÑ‰ÐµÐ¼Ñƒ Ð²ÐµÑ‰ÐµÑÑ‚Ð²Ñƒ Ð¸ ÐµÐ³Ð¾ Ð´Ð¾ÐºÐ°Ð·Ð°Ð½Ð½Ð¾Ð¹ Ð¿Ð¾Ð»ÑŒÐ·Ðµ Ð”Ð›Ð¯ ÐšÐžÐÐšÐ Ð•Ð¢ÐÐžÐ™ Ð¦Ð•Ð›Ð˜ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ, Ð° Ð½Ðµ "Ð²Ð¾Ð¾Ð±Ñ‰Ðµ".
6. Ð•ÑÐ»Ð¸ ÑÐ¾ÑÑ‚Ð°Ð²/ÑÑ‚Ð¸ÐºÐµÑ‚ÐºÐ° Ð½Ðµ Ð²Ð¸Ð´Ð½Ñ‹ Ñ‡Ñ‘Ñ‚ÐºÐ¾ â€” Ñ‡ÐµÑÑ‚Ð½Ð¾ ÑÐºÐ°Ð¶Ð¸ Ð² reason: "ÑÐ¾ÑÑ‚Ð°Ð² Ð½Ðµ Ð²Ð¸Ð´ÐµÐ½ Ð¿Ð¾Ð»Ð½Ð¾ÑÑ‚ÑŒÑŽ, Ð¾Ñ†ÐµÐ½ÐºÐ° Ð¿Ð¾ Ñ‚Ð¸Ð¿Ñƒ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð°" Ð¸ Ð½Ðµ Ð²Ñ‹Ð´ÑƒÐ¼Ñ‹Ð²Ð°Ð¹ Ð´ÐµÑ‚Ð°Ð»Ð¸.

Ð¡Ð¢Ð Ð£ÐšÐ¢Ð£Ð Ð ÐžÐ¢Ð’Ð•Ð¢Ð (reason, 3-4 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ, Ð¿Ð¾-Ñ€ÑƒÑÑÐºÐ¸):
Ð°) Ð§Ñ‚Ð¾ ÑÑ‚Ð¾ Ð¸ ÐµÐ³Ð¾ Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ (Ð±ÐµÐ»Ð¾Ðº/Ð¶Ð¸Ñ€Ñ‹/ÑƒÐ³Ð»/Ð´ÐµÐ¹ÑÑ‚Ð²ÑƒÑŽÑ‰ÐµÐµ Ð²ÐµÑ‰ÐµÑÑ‚Ð²Ð¾ â€” Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÐµÑÐ»Ð¸ Ð¾Ñ‡ÐµÐ²Ð¸Ð´Ð½Ð¾).
Ð±) ÐšÐ°Ðº ÑÑ‚Ð¾ Ð²Ð»Ð¸ÑÐµÑ‚ Ð½Ð° Ð¡ÐžÐ¡Ð¢ÐžÐ¯ÐÐ˜Ð• Ð¡Ð•Ð™Ð§ÐÐ¡ (Ñ‚Ð¾, Ñ‡Ñ‚Ð¾ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ Ð²Ñ‹Ð±Ñ€Ð°Ð» Ð½Ð° Ð³Ð»Ð°Ð²Ð½Ð¾Ð¹).
Ð²) ÐšÐ°Ðº ÑÑ‚Ð¾ Ð²Ð»Ð¸ÑÐµÑ‚ Ð½Ð° Ð”ÐžÐ›Ð“ÐžÐ¡Ð ÐžÐ§ÐÐ£Ð® Ð¦Ð•Ð›Ð¬ Ð¸Ð· Ð¿Ñ€Ð¾Ñ„Ð¸Ð»Ñ.
Ð³) Ð•ÑÐ»Ð¸ ÐµÑÑ‚ÑŒ ÐºÐ¾Ð½Ñ„Ð»Ð¸ÐºÑ‚ Ð¼ÐµÐ¶Ð´Ñƒ "ÑÐµÐ¹Ñ‡Ð°Ñ" Ð¸ "Ð´Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½Ð¾" â€” Ð½Ð°Ð·Ð¾Ð²Ð¸ ÐµÐ³Ð¾ Ð¿Ñ€ÑÐ¼Ð¾.

verdict:
- Green: Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾ Ð¿Ð¾Ð¼Ð¾Ð³Ð°ÐµÑ‚ Ð¸ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¼Ñƒ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸ÑŽ, Ð¸ Ð´Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½Ð¾Ð¹ Ñ†ÐµÐ»Ð¸.
- Yellow: Ð¿Ð¾Ð¼Ð¾Ð³Ð°ÐµÑ‚ Ð¾Ð´Ð½Ð¾Ð¼Ñƒ, Ð½Ð¾ Ð¼ÐµÑˆÐ°ÐµÑ‚ Ð¸Ð»Ð¸ Ð½ÐµÐ¹Ñ‚Ñ€Ð°Ð»ÑŒÐ½Ð¾ Ð´Ð»Ñ Ð´Ñ€ÑƒÐ³Ð¾Ð³Ð¾, Ð˜Ð›Ð˜ ÐµÑÑ‚ÑŒ Ð¾Ð³Ð¾Ð²Ð¾Ñ€ÐºÐ° (Ð²Ñ€ÐµÐ¼Ñ Ð¿Ñ€Ð¸Ñ‘Ð¼Ð°, ÐºÐ¾Ð»Ð¸Ñ‡ÐµÑÑ‚Ð²Ð¾).
- Red: Ð²Ñ€ÐµÐ´Ð¸Ñ‚ Ñ…Ð¾Ñ‚Ñ Ð±Ñ‹ Ð¾Ð´Ð½Ð¾Ð¹ Ð¸Ð· Ð´Ð²ÑƒÑ… Ñ†ÐµÐ»ÐµÐ¹.

suggestion: Ð´Ð°Ð²Ð°Ð¹ Ð¢ÐžÐ›Ð¬ÐšÐž Ð´Ð»Ñ Yellow/Red â€” ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½ÑƒÑŽ Ð·Ð°Ð¼ÐµÐ½Ñƒ Ð¸Ð»Ð¸ ÑÐ¿Ð¾ÑÐ¾Ð± ÑÐ½Ð¸Ð·Ð¸Ñ‚ÑŒ Ð²Ñ€ÐµÐ´ (1 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ).

Ð—Ð°Ð¿Ñ€ÐµÑ‰ÐµÐ½Ð¾: Ð¾Ð±Ñ‰Ð¸Ðµ Ñ„Ñ€Ð°Ð·Ñ‹ "Ð¼Ð½Ð¾Ð³Ð¾ ÑÐ°Ñ…Ð°Ñ€Ð°", "Ð±Ñ‹ÑÑ‚Ñ€Ñ‹Ðµ ÑƒÐ³Ð»ÐµÐ²Ð¾Ð´Ñ‹", "Ð²Ñ€ÐµÐ´Ð½Ð¾", ÐµÑÐ»Ð¸ Ñ‚Ñ‹ ÑÑ‚Ð¾Ð³Ð¾ Ð½Ðµ Ð²Ð¸Ð´Ð¸ÑˆÑŒ Ð½Ð° Ñ„Ð¾Ñ‚Ð¾. Ð—Ð°Ð¿Ñ€ÐµÑ‰ÐµÐ½Ð¾ Ð¸Ð³Ð½Ð¾Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ "ÑÐµÐ¹Ñ‡Ð°Ñ".`;

    const response = await fetch(AI_GATEWAY_URL, {
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
              { type: "text", text: "ÐŸÑ€Ð¾Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€ÑƒÐ¹ Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚ ÑÑ‚Ñ€Ð¾Ð³Ð¾ Ð¿Ð¾ Ð¿Ñ€Ð°Ð²Ð¸Ð»Ð°Ð¼. Ð£Ñ‡Ð¸Ñ‚Ñ‹Ð²Ð°Ð¹ Ð¸ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ Ð¡Ð•Ð™Ð§ÐÐ¡, Ð¸ Ð´Ð¾Ð»Ð³Ð¾ÑÑ€Ð¾Ñ‡Ð½ÑƒÑŽ Ñ†ÐµÐ»ÑŒ. ÐÐµ Ð²Ñ‹Ð´ÑƒÐ¼Ñ‹Ð²Ð°Ð¹ ÑÐ¾ÑÑ‚Ð°Ð²." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "food_verdict",
              description: "Ð’ÐµÑ€Ð´Ð¸ÐºÑ‚ Ð°Ð½Ð°Ð»Ð¸Ð·Ð°",
              parameters: {
                type: "object",
                properties: {
                  food_name: { type: "string", description: "Ð¢Ð¾Ñ‡Ð½Ð¾Ðµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð½Ð° Ñ€ÑƒÑÑÐºÐ¾Ð¼" },
                  verdict: { type: "string", enum: ["Green", "Yellow", "Red"] },
                  reason: { type: "string", description: "3-4 Ð¿Ñ€ÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ: Ñ‡Ñ‚Ð¾ ÑÑ‚Ð¾ â†’ Ð²Ð»Ð¸ÑÐ½Ð¸Ðµ Ð¡Ð•Ð™Ð§ÐÐ¡ â†’ Ð²Ð»Ð¸ÑÐ½Ð¸Ðµ ÐÐ Ð”ÐžÐ›Ð“ÐžÐ¡Ð ÐžÐ§ÐÐ£Ð® Ð¦Ð•Ð›Ð¬ â†’ ÐºÐ¾Ð½Ñ„Ð»Ð¸ÐºÑ‚ (ÐµÑÐ»Ð¸ ÐµÑÑ‚ÑŒ)" },
                  suggestion: { type: "string", description: "ÐšÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð°Ñ Ð·Ð°Ð¼ÐµÐ½Ð°/ÑÐ¾Ð²ÐµÑ‚ (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð»Ñ Yellow/Red)" },
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
        return new Response(JSON.stringify({ error: "Ð¡Ð»Ð¸ÑˆÐºÐ¾Ð¼ Ð¼Ð½Ð¾Ð³Ð¾ Ð·Ð°Ð¿Ñ€Ð¾ÑÐ¾Ð²." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        food_name: "ÐÐµÐ¸Ð·Ð²ÐµÑÑ‚Ð½Ð¾",
        verdict: "Yellow",
        reason: data.choices?.[0]?.message?.content || "ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¿Ñ€Ð¾Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ",
        suggestion: null,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "ÐÐµÐ¸Ð·Ð²ÐµÑÑ‚Ð½Ð°Ñ Ð¾ÑˆÐ¸Ð±ÐºÐ°" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

