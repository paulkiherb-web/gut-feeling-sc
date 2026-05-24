import type { DomainEvent } from '../../store/types/events';
import { supabase } from '@/integrations/supabase/client';
import { loadJson, saveJson } from './storage';

// For now, only scans persist to a real table. Other event types fall back to
// a local mirror queue. When a dedicated `events` table is added, swap this body.
export async function syncEvent(event: DomainEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || event.type === 'scan.completed') {
      const queueKey = 'state-os-event-outbox-v1';
      const existing = loadJson<DomainEvent[]>(queueKey, []);
      saveJson(queueKey, [...existing, event].slice(-500));
      return;
    }

    const queueKey = 'state-os-event-outbox-v1';
    const existing = loadJson<DomainEvent[]>(queueKey, []);
    saveJson(queueKey, [...existing, event].slice(-500));
  } catch (error) {
    console.warn('Failed to sync event', error);
  }
}
