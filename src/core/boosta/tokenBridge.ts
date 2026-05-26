// Bridges a Boosta token into a core `token.logged` DomainEvent and dispatches it
// through the unified event dispatcher so it participates in scorecard/recommendations.

import { eventDispatcher } from '@/core/services/events/eventDispatcher';
import { boostaTokenMeta, type BoostaTokenType } from '@/components/tokens/boostaTokenMeta';
import { newEvent, type TokenLoggedPayload } from '@/core/store/types/events';

const MOVEMENT_TOKENS = new Set<BoostaTokenType>([
  'run', 'walk', 'swim', 'bike', 'ski',
  'morning_charge', 'cardio', 'hiit', 'strength', 'yoga', 'stretch',
  'physical_work',
]);

const REST_TOKENS = new Set<BoostaTokenType>([
  'sleep', 'rest', 'meditation', 'reading', 'sex',
]);

export function extractTokenSignals(tokenType: BoostaTokenType, now = new Date()): TokenLoggedPayload['signals'] {
  const hour = now.getHours();
  const meta = boostaTokenMeta[tokenType];
  const label = (meta?.labelRu ?? tokenType).toLowerCase();

  return {
    hasAlcohol: tokenType === 'alcohol' || /алкогол|пиво|вино|водк/.test(label),
    hasCaffeine: tokenType === 'coffee' || /кофе|кофеин|энерго/.test(label),
    hasSugar: false,
    hasHeavyMeal: false,
    hasProtein: false,
    hasVeggies: false,
    isEvening: hour >= 18,
    isLate: hour >= 20,
    isMovement: MOVEMENT_TOKENS.has(tokenType),
    isRest: REST_TOKENS.has(tokenType),
  };
}

export function dispatchTokenLogged(
  tokenType: BoostaTokenType,
  options: { intensity?: 'low' | 'medium' | 'high'; durationMin?: number; notes?: string } = {},
): void {
  const meta = boostaTokenMeta[tokenType];
  if (!meta) return;
  try {
    eventDispatcher.dispatchEvent(
      newEvent({
        type: 'token.logged',
        source: 'home',
        payload: {
          tokenId: tokenType,
          labelRu: meta.labelRu,
          category: meta.group,
          signals: extractTokenSignals(tokenType),
          intensity: options.intensity,
          durationMin: options.durationMin,
          notes: options.notes,
        },
      }),
    );
  } catch (e) {
    // Non-blocking — boosta store still holds the event.
    console.warn('dispatchTokenLogged failed', e);
  }
}
