// One-time bootstrap: import legacy localStorage scans into the unified event log.
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { newEvent, type ScanCompletedEvent } from '../store/types/events';

const KEY = 'core_bootstrap_v1';

interface LegacyScanRecord {
  id: string;
  verdict?: 'green' | 'yellow' | 'red';
  foodName?: string;
  food_name?: string;
  suggestion?: string;
  imageUrl?: string;
  createdAt?: string;
}

export function useLegacyBootstrap() {
  const events = useAppStore((state) => state.events);
  const appendEvents = useAppStore((state) => state.appendEvents);

  useEffect(() => {
    if (localStorage.getItem(KEY) === 'done') return;
    try {
      const legacy = JSON.parse(localStorage.getItem('greenred_scans_local') || '[]') as LegacyScanRecord[];
      const existingIds = new Set(
        events
          .filter((event): event is ScanCompletedEvent => event.type === 'scan.completed')
          .map((event) => event.payload.scanId),
      );
      const toImport = legacy
        .filter((scan) => scan?.id && !existingIds.has(scan.id))
        .slice(0, 100)
        .reverse();
      const importedEvents = toImport.map((scan) =>
        newEvent<ScanCompletedEvent>({
          type: 'scan.completed',
          source: 'import',
          createdAt: scan.createdAt || new Date().toISOString(),
          payload: {
            scanId: scan.id,
            verdict: scan.verdict || 'yellow',
            title: scan.foodName || scan.food_name || 'Скан',
            recommendation: scan.suggestion,
            imageUrl: scan.imageUrl,
          },
        }),
      );
      if (importedEvents.length) {
        appendEvents(importedEvents);
      }
      localStorage.setItem(KEY, 'done');
    } catch (error) {
      console.warn('Legacy bootstrap failed', error);
      localStorage.setItem(KEY, 'done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
