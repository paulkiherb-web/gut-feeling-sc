import { newEvent, type DomainEvent, type TokenLoggedEvent } from './types/events';
import { defaultTokenDuration } from './calculators/tokenScoring';

function buildTokenCompanions(event: TokenLoggedEvent): DomainEvent[] {
  const { tokenId, labelRu } = event.payload;
  const base = {
    source: 'system' as const,
    createdAt: event.createdAt,
    confidence: 0.7,
  };

  switch (tokenId) {
    case 'water':
      return [
        newEvent({
          ...base,
          type: 'hydration.logged',
          payload: {
            ml: 350,
            beverage: 'water',
            source: 'token',
          },
        }),
      ];
    case 'sleep':
      return [
        newEvent({
          ...base,
          type: 'sleep.recorded',
          payload: {
            hours: 7.6,
            durationHours: 7.6,
            quality: 0.82,
            sleepImpact: { source: 'token-bridge' },
          },
        }),
      ];
    case 'medicine':
      return [
        newEvent({
          ...base,
          type: 'supplement.taken',
          payload: {
            name: labelRu,
            notes: 'token-bridge',
          },
        }),
      ];
    case 'stress':
      return [
        newEvent({
          ...base,
          type: 'recovery.recorded',
          payload: {
            stressLoad: 8,
            soreness: 4,
            subjectiveScore: 42,
            notes: 'Токен стресса',
          },
        }),
      ];
    case 'coffee':
    case 'alcohol':
    case 'smoking':
      return [
        newEvent({
          ...base,
          type: 'meal.logged',
          payload: {
            title: labelRu,
            name: labelRu,
            verdict: tokenId === 'coffee' && !event.payload.signals?.isEvening ? 'yellow' : 'red',
            kcal: tokenId === 'alcohol' ? 180 : tokenId === 'coffee' ? 8 : 0,
            notes: 'token-bridge',
          },
        }),
      ];
    default:
      return [
        newEvent({
          ...base,
          type: 'habit.completed',
          payload: {
            name: labelRu,
            duration: event.payload.durationMin ?? defaultTokenDuration(tokenId),
            notes: 'token-bridge',
          },
        }),
      ];
  }
}

export function expandDomainEvent(event: DomainEvent): DomainEvent[] {
  if (event.type === 'token.logged') {
    return [event, ...buildTokenCompanions(event)];
  }

  return [event];
}
