// One-time migration: fetch user's existing Supabase scans + boosta_events
// and inject them into the core event log. De-duped by source id.
//
// Runs once per device. Gated by a localStorage flag plus per-event id checks
// so it's safe to re-run after schema changes.

import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { supabase } from '@/integrations/supabase/client';
import {
  newEvent,
  type ScanCompletedEvent,
  type TokenLoggedEvent,
  type ScanVerdict,
} from '../store/types/events';
import { boostaTokenMeta, type BoostaTokenType } from '@/components/tokens/boostaTokenMeta';
import { extractTokenSignals } from '@/core/boosta/tokenBridge';

const KEY = 'core_supabase_bootstrap_v1';

function labelToTokenType(label: string): BoostaTokenType | null {
  const entry = Object.entries(boostaTokenMeta).find(
    ([, m]) => m.labelRu.toLowerCase() === label.toLowerCase(),
  );
  return (entry?.[0] as BoostaTokenType) ?? null;
}

export function useSupabaseBootstrap() {
  const appendEvents = useAppStore((s) => s.appendEvents);
  const events = useAppStore((s) => s.events);
  const isHydrated = useAppStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (localStorage.getItem(KEY) === 'done') return;

    let cancelled = false;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // try again next mount once signed in

        // Ids we already have.
        const knownScanIds = new Set(
          events
            .filter((e): e is ScanCompletedEvent => e.type === 'scan.completed')
            .map((e) => e.payload.scanId)
            .filter(Boolean) as string[],
        );
        const knownTokenIds = new Set(
          events
            .filter((e): e is TokenLoggedEvent => e.type === 'token.logged')
            .map((e) => (e.payload as { sourceId?: string }).sourceId)
            .filter(Boolean) as string[],
        );

        // 1) scans → scan.completed
        const { data: scans } = await supabase
          .from('scans')
          .select('id, food_name, verdict, reason, suggestion, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200);

        const scanEvents: ScanCompletedEvent[] = (scans ?? [])
          .filter((s) => s.id && !knownScanIds.has(s.id))
          .reverse()
          .map((s) =>
            newEvent<ScanCompletedEvent>({
              type: 'scan.completed',
              source: 'sync',
              createdAt: s.created_at || new Date().toISOString(),
              payload: {
                scanId: s.id,
                verdict: (s.verdict as ScanVerdict) || 'yellow',
                title: s.food_name || 'Скан',
                recommendation: s.suggestion ?? undefined,
                details: s.reason ?? undefined,
              },
            }),
          );

        // 2) boosta_events → token.logged
        const { data: bevs } = await supabase
          .from('boosta_events')
          .select('id, category, name, timestamp')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(200);

        const tokenEvents: TokenLoggedEvent[] = (bevs ?? [])
          .filter((b) => b.id && !knownTokenIds.has(b.id))
          .reverse()
          .map((b) => {
            const tokenType = labelToTokenType(b.name) ?? 'rest';
            return newEvent<TokenLoggedEvent>({
              type: 'token.logged',
              source: 'sync',
              createdAt: b.timestamp || new Date().toISOString(),
              payload: {
                tokenId: tokenType,
                labelRu: b.name,
                category: b.category ?? undefined,
                signals: extractTokenSignals(tokenType, new Date(b.timestamp)),
                // @ts-expect-error: extra field for dedup on re-runs
                sourceId: b.id,
              },
            });
          });

        const all = [...scanEvents, ...tokenEvents];
        if (cancelled) return;
        if (all.length) {
          appendEvents(all);
        }
        localStorage.setItem(KEY, 'done');
      } catch (error) {
        console.warn('Supabase bootstrap failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, appendEvents, events]);
}
