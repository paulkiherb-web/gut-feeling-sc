import { useBoostaStore } from '@/core/store/slices/boostaSlice';

export interface SocialUnlockState {
  profileVisible: boolean;
  canMarry: boolean;
  canTakeParole: boolean;
  canShareStory: boolean;
  canJoinTeam: boolean;
  canCreateTeam: boolean;
}

export function getSocialUnlockState(daysActive: number, eventsTotal: number): SocialUnlockState {
  return {
    profileVisible: daysActive >= 7,
    canMarry:       daysActive >= 14 && eventsTotal >= 20,
    canTakeParole:  daysActive >= 30 && eventsTotal >= 50,
    canShareStory:  daysActive >= 3 && eventsTotal >= 5,
    canJoinTeam:    daysActive >= 7,
    canCreateTeam:  daysActive >= 21,
  };
}

const REQ: Record<keyof SocialUnlockState, { days: number; events: number; label: string }> = {
  profileVisible: { days: 7,  events: 0,  label: 'Профиль откроется' },
  canMarry:       { days: 14, events: 20, label: 'Можно жениться' },
  canTakeParole:  { days: 30, events: 50, label: 'Можно брать на поруки' },
  canShareStory:  { days: 3,  events: 5,  label: 'Можно делиться историями' },
  canJoinTeam:    { days: 7,  events: 0,  label: 'Можно вступать в команды' },
  canCreateTeam:  { days: 21, events: 0,  label: 'Можно создавать команды' },
};

export function unlockHint(feature: keyof SocialUnlockState, daysActive: number, eventsTotal: number): string {
  const r = REQ[feature];
  const daysLeft = Math.max(0, r.days - daysActive);
  const evLeft = Math.max(0, r.events - eventsTotal);
  if (daysLeft === 0 && evLeft === 0) return '';
  const parts: string[] = [];
  if (daysLeft) parts.push(`через ${daysLeft} дн.`);
  if (evLeft)   parts.push(`ещё ${evLeft} событий`);
  return `Доступно ${parts.join(' и ')}. Сначала научимся жить со своим зеркалом.`;
}

export function useSocialUnlock(): SocialUnlockState & { daysActive: number; eventsTotal: number } {
  const events = useBoostaStore((s) => s.events);

  let daysActive = 0;
  try {
    const raw = localStorage.getItem('boosta_first_seen_at');
    if (raw) {
      const start = Number(raw);
      const ms = Date.now() - start;
      daysActive = Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
    } else {
      localStorage.setItem('boosta_first_seen_at', String(Date.now()));
      daysActive = 1;
    }
  } catch {
    daysActive = 1;
  }

  const eventsTotal = events.length;
  return { ...getSocialUnlockState(daysActive, eventsTotal), daysActive, eventsTotal };
}
