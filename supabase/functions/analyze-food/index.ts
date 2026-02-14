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

    const { image, user_profile } = await req.json();

    const systemPrompt = `You are GreenRed AI, a world-class nutritionist AI. Analyze the food image for this user:
- Age: ${user_profile.age}
- Gender: ${user_profile.gender}
- Condition: ${user_profile.condition}${user_profile.condition === 'post_surgery' && user_profile.surgery_days ? ` (Day ${user_profile.surgery_days} post-surgery)` : ''}
- Goal: ${user_profile.goal}

Based on their specific biological profile, determine if this food is appropriate.`;

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
              { type: "text", text: "Analyze this food image. What food is it and should this person eat it?" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "food_verdict",
              description: "Return the food analysis verdict",
              parameters: {
                type: "object",
                properties: {
                  food_name: { type: "string", description: "Name of the identified food" },
                  verdict: { type: "string", enum: ["Green", "Yellow", "Red"], description: "Green=Safe, Yellow=Caution, Red=Avoid" },
                  reason: { type: "string", description: "1-2 sentence explanation based on user's condition" },
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
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;

    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: parse from content
      result = {
        food_name: "Unknown Food",
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
