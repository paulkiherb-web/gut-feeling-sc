import { supabase } from '@/integrations/supabase/client';
import { mySupabase } from '@/integrations/supabase/mySupabase';

type Row = Record<string, unknown>;

/**
 * Write to both Supabase instances.
 * Primary (Lovable) result is returned.
 * Secondary (own) is fire-and-forget — errors are logged but never block.
 */
export async function dualInsert(table: string, data: Row | Row[]) {
  const result = await (supabase as any).from(table).insert(data);
  if (mySupabase) {
    (mySupabase as any).from(table).insert(data)
      .then()
      .catch((e: unknown) => console.warn(`[dual] insert ${table}:`, e));
  }
  return result;
}

export async function dualUpsert(
  table: string,
  data: Row | Row[],
  onConflict?: string,
) {
  const opts = onConflict ? { onConflict } : undefined;
  const result = await (supabase as any).from(table).upsert(data, opts);
  if (mySupabase) {
    (mySupabase as any).from(table).upsert(data, opts)
      .then()
      .catch((e: unknown) => console.warn(`[dual] upsert ${table}:`, e));
  }
  return result;
}

export async function dualUpdate(
  table: string,
  data: Row,
  matchColumn: string,
  matchValue: unknown,
) {
  const result = await (supabase as any).from(table).update(data).eq(matchColumn, matchValue);
  if (mySupabase) {
    (mySupabase as any).from(table).update(data).eq(matchColumn, matchValue)
      .then()
      .catch((e: unknown) => console.warn(`[dual] update ${table}:`, e));
  }
  return result;
}

export async function dualDelete(
  table: string,
  matchColumn: string,
  matchValue: unknown,
) {
  const result = await (supabase as any).from(table).delete().eq(matchColumn, matchValue);
  if (mySupabase) {
    (mySupabase as any).from(table).delete().eq(matchColumn, matchValue)
      .then()
      .catch((e: unknown) => console.warn(`[dual] delete ${table}:`, e));
  }
  return result;
}
