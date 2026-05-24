export interface SensitivityWeight {
  domain: string;
  weight: number; // 0–1
  direction: 'positive' | 'negative' | 'bidirectional';
  confidence: number;
  evidenceCount: number;
}

export interface RecoveryProfile {
  avgRecoveryLagDays: number;
  recoveryConsistency: number; // 0–1
  interventionEffectiveness: number; // 0–1
}

export interface PersonalSignature {
  /** 0–1: degree to which hydration levels correlate with outcomes for this user */
  hydrationSensitivity: number;
  sleepSensitivity: number;
  caffeineImpact: number;
  nutritionSensitivity: number;
  recoveryLagDays: number;
  overloadResilience: number;
  interventionResponsiveness: number;
  dominantFactors: SensitivityWeight[];
  recoveryProfile: RecoveryProfile;
  confidence: number;
  evidenceCount: number;
}
