import { createClient } from '@supabase/supabase-js';

const URL = (import.meta.env.VITE_MY_SUPABASE_URL as string) ?? '';
const KEY = (import.meta.env.VITE_MY_SUPABASE_ANON_KEY as string) ?? '';

// When env vars are absent mySupabase is null and dual-write is silently skipped.
export const mySupabase = URL && KEY ? createClient(URL, KEY) : null;
