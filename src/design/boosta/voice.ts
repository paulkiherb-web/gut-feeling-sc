export const ghostVoice = {
  onboarding: {
    greet:    'Привет. Я — твоя другая версия.',
    quiet:    'Я буду рядом. Тихо.',
    promise:  'Я не буду тебя учить. Я буду рядом.',
  },
  mirror: {
    morningSilent: '',
    morningSeen:   'Видел. Молчу.',
    afterChoice:   'Окей. Знай только что я выбрал бы воду.',
    pattern:       'Третья. Я бы остановился — но решай ты.',
    encourage:     'Видел. Это было настоящее.',
    pause:         'Окей. Пауза так пауза. Я здесь когда вернёшься.',
  },
  inline: {
    aligned:  'В курсе',
    drift:    'Ушёл в сторону',
    neutral:  'Нейтрально',
    boost:    'Дало заряд',
    cost:     'Стоит зарядa',
  },
} as const;
