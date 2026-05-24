import type { DomainEvent } from '../../store/types/events';
import { supabase } from '@/integrations/supabase/client';

// For now, only scans persist to a real table. Other event types fall back to
// a local mirror queue. When a dedicated `events` table is added, swap this body.
export async function syncEvent(event: DomainEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (event.type === 'scan.completed') {
      // Scanner already inserts into scans; this is a no-op safeguard
      return;
    }
    // No backend yet for non-scan events — queue locally for future replay
    const queueKey = 'core_event_outbox_v1';
    const existing = JSON.parse(localStorage.getItem(queueKey) || '[]');
    existing.push(event);
    localStorage.setItem(queueKey, JSON.stringify(existing.slice(-500)));
  } catch {
    // silent
  }
}
