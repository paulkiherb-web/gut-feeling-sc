export interface PremiumLimits {
  aiScansPerDay: number;       // Infinity = unlimited
  eventsPerDay: number;
  historyDays: number;
  maxBonds: number;
  canCreateTeams: boolean;
  highResStoryShare: boolean;
  aiPatternAnalysis: boolean;
}

export const FREE_LIMITS: PremiumLimits = {
  aiScansPerDay: 5,
  eventsPerDay: 10,
  historyDays: 7,
  maxBonds: 1,
  canCreateTeams: false,
  highResStoryShare: false,
  aiPatternAnalysis: false,
};

export const PREMIUM_LIMITS: PremiumLimits = {
  aiScansPerDay: Infinity,
  eventsPerDay: Infinity,
  historyDays: 36500,
  maxBonds: 5,
  canCreateTeams: true,
  highResStoryShare: true,
  aiPatternAnalysis: true,
};

export function getLimitsFor(isPremium: boolean): PremiumLimits {
  return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
}
