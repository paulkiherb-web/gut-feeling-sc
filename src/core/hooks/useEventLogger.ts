import { useCallback } from 'react';
import { eventDispatcher } from '../services/events/eventDispatcher';
import { newEvent, type DomainEvent, type EventBuilderInput, type EventSource } from '../store/types/events';

export function useEventLogger(defaultSource: EventSource = 'system') {
  return useCallback(<T extends DomainEvent>(input: EventBuilderInput<T> & { source?: EventSource }) => {
    const event = newEvent<T>({ ...input, source: input.source ?? defaultSource });
    void eventDispatcher.dispatchEvent(event);
    return event;
  }, [defaultSource]);
}
