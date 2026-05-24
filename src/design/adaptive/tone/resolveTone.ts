/**
 * ADAPTIVE EXPERIENCE LAYER — Tone System
 *
 * Tone Philosophy:
 *   All registers share the same fundamental character:
 *     - composed:    never reactive, never alarmed
 *     - precise:     exact words, no hedging, no filler
 *     - reassuring:  stable signal, not reassuring in a coddling sense
 *     - intelligent: assumes the user is capable and informed
 *
 *   What changes across registers:
 *     - Verbosity (terse / concise / standard)
 *     - Whether rationale is surfaced
 *
 *   What NEVER changes:
 *     - No emotional warmth
 *     - No motivational framing
 *     - No wellness language
 *     - No fake positivity
 *     - No chatty phrasing
 */

import type { AdaptiveExperienceState, AdaptiveToneProfile } from '../state/AdaptiveStateModel';

// ─── Tone String Definitions ──────────────────────────────────────────────────

export interface ToneStrings {
  /** Label prefix for the next best action slot */
  nextActionLabel: string;
  /** Recovery priority notice — shown when state warrants reduced load */
  recoveryPriorityMessage: string | null;
  /** Headline when contextual focus mode is active */
  focusModeHeadline: string;
  /** Short label describing the current adaptive state (used in debug/dev only) */
  stateLabel: string;
}

const TONE_MAP: Record<AdaptiveExperienceState, ToneStrings> = {
  depleted: {
    nextActionLabel: 'Приоритет восстановления',
    recoveryPriorityMessage: 'Текущее состояние требует снижения нагрузки.',
    focusModeHeadline: 'Ключевые факторы',
    stateLabel: 'Истощение',
  },
  fragile: {
    nextActionLabel: 'Ключевое действие',
    recoveryPriorityMessage: 'Состояние нестабильно. Дополнительная нагрузка нецелесообразна.',
    focusModeHeadline: 'Критический контекст',
    stateLabel: 'Нестабильно',
  },
  overloaded: {
    nextActionLabel: 'Первоочередное действие',
    recoveryPriorityMessage: 'Высокая нагрузка. Один приоритет.',
    focusModeHeadline: 'Критические факторы',
    stateLabel: 'Перегрузка',
  },
  recovering: {
    nextActionLabel: 'Следующий шаг',
    recoveryPriorityMessage: 'Состояние улучшается. Поддержи динамику без дополнительного стресса.',
    focusModeHeadline: 'Контекст состояния',
    stateLabel: 'Восстановление',
  },
  stable: {
    nextActionLabel: 'Следующий шаг',
    recoveryPriorityMessage: null,
    focusModeHeadline: 'Обзор состояния',
    stateLabel: 'Стабильно',
  },
  focused: {
    nextActionLabel: 'Следующий шаг',
    recoveryPriorityMessage: null,
    focusModeHeadline: 'Обзор состояния',
    stateLabel: 'Сфокусировано',
  },
  optimized: {
    nextActionLabel: 'Следующий шаг',
    recoveryPriorityMessage: null,
    focusModeHeadline: 'Обзор состояния',
    stateLabel: 'Оптимально',
  },
};

// ─── Resolver Functions ───────────────────────────────────────────────────────

/** Returns the tone strings for a given adaptive state */
export function resolveTone(state: AdaptiveExperienceState): ToneStrings {
  return TONE_MAP[state];
}

/**
 * Whether to show the recovery priority notice.
 * Only shown when the state warrants it AND the tone profile permits rationale.
 */
export function shouldShowRecoveryNotice(
  state: AdaptiveExperienceState,
  profile: AdaptiveToneProfile,
): boolean {
  const lowLoadStates: AdaptiveExperienceState[] = [
    'depleted',
    'fragile',
    'overloaded',
    'recovering',
  ];
  return profile.showRationale && lowLoadStates.includes(state);
}
