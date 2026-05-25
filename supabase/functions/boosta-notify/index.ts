import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Decides what/whom to notify. In production this would dispatch via FCM/OneSignal.
// For Sprint 3 we validate the payload, log, and respond OK so the client can rely on
// the contract while infra is wired separately.

const ALLOWED_KINDS = new Set([
  'whisper_critical', 'bond_change', 'parole_slip', 'team_milestone', 'evening_close',
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { kind, title, body: text, recipient_user_id } = body ?? {};

    if (!kind || !ALLOWED_KINDS.has(kind)) {
      return new Response(JSON.stringify({ error: 'invalid kind' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!title || !text) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO(infra): dispatch via FCM/OneSignal using recipient_user_id => device token mapping.
    console.log('[boosta-notify]', { kind, recipient_user_id, title });

    return new Response(JSON.stringify({ ok: true, queued: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
