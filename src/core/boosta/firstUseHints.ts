const HINT_KEY = 'boosta_hints_seen';

export function isHintSeen(hintId: string): boolean {
  try {
    const seen = JSON.parse(localStorage.getItem(HINT_KEY) || '{}');
    return !!seen[hintId];
  } catch { return false; }
}

export function markHintSeen(hintId: string): void {
  try {
    const seen = JSON.parse(localStorage.getItem(HINT_KEY) || '{}');
    seen[hintId] = true;
    localStorage.setItem(HINT_KEY, JSON.stringify(seen));
  } catch {}
}

export const HINTS: Record<string, string> = {
  token_picker:  'Жетоны — быстрый способ записать любое событие дня. Камера распознаёт их как еду.',
  ghost_whisper: 'Это голос твоей лучшей версии. Он говорит редко — но точно.',
  dual_battery:  'Левая батарейка — ты сейчас. Правая — ты при лучших решениях.',
  course_pick:   'Курс определяет как Лучший Я оценивает твои выборы сегодня.',
  history:       'История накапливается после 7 дней. Паттерны появятся сами.',
};
