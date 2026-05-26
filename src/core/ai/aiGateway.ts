// Frontend AI gateway — single entry point for all AI calls.
// Default: invokes Supabase Edge Functions (which are themselves provider-switchable).
// Custom: when VITE_AI_PROVIDER === 'custom', POSTs directly to VITE_AI_ENDPOINT.

import { supabase } from '@/integrations/supabase/client';

export interface AIInvokeOptions<TBody = unknown> {
  functionName: string;
  body: TBody;
}

export interface AIResult<TData = unknown> {
  data: TData | null;
  error: { message: string } | null;
}

const PROVIDER = (import.meta.env.VITE_AI_PROVIDER as string | undefined)?.toLowerCase() ?? 'lovable';

export async function aiInvoke<TData = unknown, TBody = unknown>(
  opts: AIInvokeOptions<TBody>
): Promise<AIResult<TData>> {
  if (PROVIDER === 'custom') {
    const endpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
    const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;
    if (!endpoint) {
      return { data: null, error: { message: 'VITE_AI_ENDPOINT not set' } };
    }
    try {
      const res = await fetch(`${endpoint.replace(/\/$/, '')}/${opts.functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify(opts.body),
      });
      if (!res.ok) {
        const text = await res.text();
        return { data: null, error: { message: `${res.status} ${text}` } };
      }
      const data = (await res.json()) as TData;
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { message: (e as Error).message } };
    }
  }

  const { data, error } = await supabase.functions.invoke(opts.functionName, { body: opts.body });
  return {
    data: (data ?? null) as TData | null,
    error: error ? { message: error.message } : null,
  };
}

export function getAIProvider(): string {
  return PROVIDER;
}
