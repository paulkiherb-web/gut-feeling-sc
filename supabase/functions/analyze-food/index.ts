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

    const dietInfo = user_profile.diets?.length ? `Diets: ${user_profile.diets.join(', ')}` : 'No specific diet';
    const bmiInfo = user_profile.height_cm && user_profile.weight_kg
      ? `BMI: ${(user_profile.weight_kg / ((user_profile.height_cm / 100) ** 2)).toFixed(1)} (${user_profile.height_cm}cm, ${user_profile.weight_kg}kg)`
      : '';
    const locationInfo = user_profile.location ? `Location: ${user_profile.location}` : '';
    const situationInfo = situation ? `Current situation: ${situation}` : '';

    const systemPrompt = `You are GreenRed AI, a world-class bio-consumption analyst. Analyze the image — it could be food, supplements (БАДы), medication, tea, drinks, or any bio-consumable.

User profile:
- Age: ${user_profile.age}, Gender: ${user_profile.gender}
- Condition: ${user_profile.condition}${user_profile.condition === 'post_surgery' && user_profile.surgery_days ? ` (Day ${user_profile.surgery_days})` : ''}
- Goal: ${user_profile.goal}
- ${dietInfo}
${bmiInfo ? `- ${bmiInfo}` : ''}
${locationInfo ? `- ${locationInfo}` : ''}
${situationInfo ? `- ${situationInfo}` : ''}

Rules:
1. Identify what the item is (food, supplement, medication, drink, etc.)
2. Evaluate safety based on the user's FULL biological profile + situation
3. Be specific about WHY it's good/bad for THIS person
4. If Yellow or Red, suggest a concrete alternative
5. Keep reason to 2-3 sentences max`;

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
              { type: "text", text: "Analyze this image. What is it and should this person consume it given their profile and situation?" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "food_verdict",
              description: "Return the bio-consumption analysis verdict",
              parameters: {
                type: "object",
                properties: {
                  food_name: { type: "string", description: "Name of the identified item (food, supplement, medication, drink, etc.)" },
                  verdict: { type: "string", enum: ["Green", "Yellow", "Red"], description: "Green=Safe, Yellow=Caution, Red=Avoid" },
                  reason: { type: "string", description: "2-3 sentence explanation based on user's full profile and situation" },
                  suggestion: { type: "string", description: "Better alternative if Yellow or Red" },
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
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        food_name: "Unknown",
        verdict: "Yellow",
        reason: data.choices?.[0]?.message?.content || "Could not analyze",
        suggestion: null,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
