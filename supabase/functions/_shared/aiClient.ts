// Shared AI client for edge functions.
// Provider is switchable via env: AI_PROVIDER = "lovable" | "openai" | "anthropic" (default: lovable).

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface ChatOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  max_tokens?: number;
}

interface ProviderConfig {
  name: string;
  url: string;
  apiKey: string;
  defaultModel: string;
}

function resolveProvider(): ProviderConfig {
  const provider = (Deno.env.get("AI_PROVIDER") || "lovable").toLowerCase();

  if (provider === "openai") {
    return {
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
      defaultModel: Deno.env.get("AI_DEFAULT_MODEL") || "gpt-4o-mini",
    };
  }

  if (provider === "anthropic") {
    return {
      name: "anthropic",
      url: "https://api.anthropic.com/v1/messages",
      apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      defaultModel: Deno.env.get("AI_DEFAULT_MODEL") || "claude-3-5-sonnet-latest",
    };
  }

  return {
    name: "lovable",
    url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    apiKey: Deno.env.get("LOVABLE_API_KEY") ?? "",
    defaultModel: Deno.env.get("AI_DEFAULT_MODEL") || "google/gemini-2.5-flash",
  };
}

export async function chatCompletion(opts: ChatOptions): Promise<Response> {
  const provider = resolveProvider();
  if (!provider.apiKey) {
    throw new Error(`AI provider "${provider.name}" not configured (missing API key)`);
  }

  const model = opts.model || provider.defaultModel;
  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
  };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.tools) body.tools = opts.tools;
  if (opts.tool_choice) body.tool_choice = opts.tool_choice;
  if (opts.response_format) body.response_format = opts.response_format;
  if (opts.max_tokens) body.max_tokens = opts.max_tokens;

  return fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function getProviderName(): string {
  return resolveProvider().name;
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
