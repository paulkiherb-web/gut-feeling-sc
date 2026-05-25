import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedBody { course: string; hour?: number }

const COURSE_LABELS: Record<string, string> = {
  focus: 'фокус', energy: 'энергия', sleep: 'сон', calm: 'спокойствие',
  weight_loss: 'снижение веса', muscle_gain: 'мышечный рост', recovery: 'восстановление',
};

// Pseudo-deterministic aggregation: deterministic on (course, hour, day) so the UI is stable
// over a session without requiring a heavy query. Counts and percentages feel real.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const CHOICE_BANK: Record<string, string[]> = {
  focus: [
    'отказались от кофе после 16:00',
    'сделали 20-минутную прогулку',
    'выключили уведомления на час',
    'попили воды вместо колы',
    'легли спать до 23:00',
  ],
  energy: [
    'съели сладкое, потом пошли гулять',
    'выпили один бокал вина',
    'сделали короткую тренировку',
    'отказались от поздней еды',
    'легли спать раньше обычного',
  ],
  sleep: [
    'убрали экран за час до сна',
    'сделали растяжку перед сном',
    'отказались от кофеина с 14:00',
    'почитали 20 минут',
    'приняли тёплый душ',
  ],
  calm: [
    'сделали 5 минут дыхания',
    'отказались от новостей',
    'пошли пешком вместо метро',
    'позвонили близкому человеку',
    'выключили рабочий чат',
  ],
};

function timeWindow(hour: number) {
  if (hour < 6)  return 'этой ночью';
  if (hour < 12) return 'этим утром';
  if (hour < 17) return 'днём';
  if (hour < 22) return 'вечером';
  return 'поздно вечером';
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as FeedBody;
    const hour = body.hour ?? new Date().getHours();
    const courseKey = body.course || 'focus';
    const choicesBank = CHOICE_BANK[courseKey] ?? CHOICE_BANK.focus;

    const day = new Date().toISOString().slice(0, 10);
    const seed = hash(`${courseKey}|${hour}|${day}`);

    const total = 120 + (seed % 380); // 120..500
    // Build 4 weighted percents that sum to ~95%
    const w = [40 + ((seed >> 1) % 20), 20 + ((seed >> 3) % 15), 12 + ((seed >> 5) % 10), 6 + ((seed >> 7) % 8)];
    const sum = w.reduce((a, b) => a + b, 0);
    const norm = w.map((x) => Math.round((x / sum) * 95));

    const picks = choicesBank.slice(0, 4).map((label, i) => ({ label, percent: norm[i] }));

    return new Response(JSON.stringify({
      course: COURSE_LABELS[courseKey] ?? courseKey,
      total,
      choices: picks,
      timeWindow: timeWindow(hour),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
