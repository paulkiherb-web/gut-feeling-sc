import type { SensitivityWeight } from './types';

/**
 * From the list of sensitivity weights, extract the top 3 most impactful domains
 * as "dominant factors" for this user.
 */
export const buildDominantFactors = (weights: SensitivityWeight[]): SensitivityWeight[] => {
  return weights
    .filter((w) => w.weight >= 0.2 && w.confidence >= 0.1)
    .slice(0, 3);
};
