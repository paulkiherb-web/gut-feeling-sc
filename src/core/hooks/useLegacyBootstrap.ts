// One-time bootstrap: import legacy localStorage scans into the unified event log.
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { newEvent, type ScanCompletedEvent } from '../store/types/events';

const KEY = 'core_bootstrap_v1';

export function useLegacyBootstrap() {
  const events = useAppStore(s => s.events);
  const append = useAppStore(s => s.appendEvent);

  useEffect(() => {
    if (localStorage.getItem(KEY) === 'done') return;
    try {
      const legacy = JSON.parse(localStorage.getItem('greenred_scans_local') || '[]');
      const existingIds = new Set(events.filter(e => e.type === 'scan.completed').map(e => (e as ScanCompletedEvent).payload.scanId));
      const toImport = legacy
        .filter((s: any) => s?.id && !existingIds.has(s.id))
        .slice(0, 100)
        .reverse();
      toImport.forEach((s: any) => {
        append(newEvent<ScanCompletedEvent>({
          type: 'scan.completed',
          source: 'scanner',
          timestamp: s.createdAt || new Date().toISOString(),
          payload: {
            scanId: s.id,
            verdict: (s.verdict || 'yellow') as any,
            title: s.foodName || s.food_name || 'Скан',
            recommendation: s.suggestion,
            imageUrl: s.imageUrl,
          },
        }));
      });
      localStorage.setItem(KEY, 'done');
    } catch {
      localStorage.setItem(KEY, 'done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
