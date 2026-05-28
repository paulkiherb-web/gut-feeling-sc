import type { TokenLoggedEvent } from '../types/events';

const MOVEMENT_TOKENS = new Set([
  'run',
  'walk',
  'swim',
  'bike',
  'ski',
  'morning_charge',
  'cardio',
  'hiit',
  'strength',
  'yoga',
  'stretch',
  'physical_work',
]);

const RECOVERY_TOKENS = new Set([
  'sleep',
  'rest',
  'meditation',
  'reading',
  'sex',
  'yoga',
  'stretch',
  'walk',
]);

const SUBSTANCE_TOKENS = new Set(['water', 'coffee', 'alcohol', 'smoking', 'medicine']);

export function defaultTokenDuration(tokenId: string): number {
  if (tokenId === 'walk') return 15;
  if (tokenId === 'run' || tokenId === 'cardio' || tokenId === 'bike') return 25;
  if (tokenId === 'hiit' || tokenId === 'strength') return 35;
  if (tokenId === 'yoga' || tokenId === 'stretch' || tokenId === 'meditation') return 12;
  if (tokenId === 'reading' || tokenId === 'rest') return 20;
  if (tokenId === 'desk' || tokenId === 'media' || tokenId === 'physical_work') return 45;
  return 10;
}

function isEveningToken(event: TokenLoggedEvent): boolean {
  return Boolean(event.payload.signals?.isEvening);
}

function isLateToken(event: TokenLoggedEvent): boolean {
  return Boolean(event.payload.signals?.isLate);
}

export function scoreTokenForEnergy(event: TokenLoggedEvent): number {
  const tokenId = event.payload.tokenId;

  if (tokenId === 'water') return 76;
  if (tokenId === 'sleep') return 82;
  if (MOVEMENT_TOKENS.has(tokenId)) return tokenId === 'walk' ? 74 : 84;
  if (tokenId === 'coffee') return isEveningToken(event) ? 42 : 78;
  if (tokenId === 'alcohol') return 22;
  if (tokenId === 'smoking') return 28;
  if (tokenId === 'stress') return 30;
  if (tokenId === 'media') return isLateToken(event) ? 36 : 48;
  if (tokenId === 'desk') return 50;
  if (RECOVERY_TOKENS.has(tokenId)) return 66;
  if (SUBSTANCE_TOKENS.has(tokenId)) return 58;
  return 56;
}

export function scoreTokenForRecovery(event: TokenLoggedEvent): number {
  const tokenId = event.payload.tokenId;

  if (tokenId === 'sleep') return 90;
  if (tokenId === 'medicine') return 76;
  if (tokenId === 'stress') return 24;
  if (tokenId === 'alcohol') return 18;
  if (tokenId === 'smoking') return 20;
  if (MOVEMENT_TOKENS.has(tokenId)) {
    return tokenId === 'hiit' ? 62 : tokenId === 'run' || tokenId === 'strength' ? 72 : 78;
  }
  if (RECOVERY_TOKENS.has(tokenId)) return 84;
  if (tokenId === 'media') return isLateToken(event) ? 34 : 48;
  if (tokenId === 'desk') return 46;
  if (tokenId === 'coffee') return isEveningToken(event) ? 42 : 60;
  return 56;
}

export function scoreTokenForSleep(event: TokenLoggedEvent): number {
  const tokenId = event.payload.tokenId;

  if (tokenId === 'sleep') return 94;
  if (tokenId === 'meditation' || tokenId === 'reading' || tokenId === 'rest') return 84;
  if (tokenId === 'walk' || tokenId === 'stretch' || tokenId === 'yoga') return 76;
  if (tokenId === 'alcohol') return isEveningToken(event) ? 18 : 42;
  if (tokenId === 'coffee') return isEveningToken(event) ? 20 : 62;
  if (tokenId === 'media') return isLateToken(event) ? 24 : 52;
  if (tokenId === 'stress') return 28;
  if (tokenId === 'smoking') return 30;
  if (tokenId === 'run' || tokenId === 'hiit' || tokenId === 'cardio') return 58;
  return 60;
}

export function scoreTokenForAlignment(event: TokenLoggedEvent): number {
  const tokenId = event.payload.tokenId;

  if (tokenId === 'alcohol' || tokenId === 'smoking' || tokenId === 'stress') return 24;
  if (tokenId === 'coffee') return isEveningToken(event) ? 42 : 64;
  if (tokenId === 'media' || tokenId === 'desk') return 48;
  if (tokenId === 'water' || tokenId === 'medicine') return 78;
  if (MOVEMENT_TOKENS.has(tokenId)) return 84;
  if (RECOVERY_TOKENS.has(tokenId)) return 80;
  return 60;
}
