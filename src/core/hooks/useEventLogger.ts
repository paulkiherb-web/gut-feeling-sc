import { useCallback } from 'react';
import { eventDispatcher } from '../services/events/eventDispatcher';
import { newEvent, type DomainEvent, type EventSource } from '../store/types/events';

type EventInput = Parameters<typeof newEvent>[0];

export function useEventLogger(defaultSource: EventSource = 'system') {
  return useCallback(<T extends DomainEvent>(input: Omit<EventInput, 'source'> & { source?: EventSource }) => {
    const e = newEvent<T>({ source: defaultSource, ...input } as any);
    eventDispatcher.dispatchEvent(e);
    return e;
  }, [defaultSource]);
}
