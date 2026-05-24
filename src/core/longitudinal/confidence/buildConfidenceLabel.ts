import type { ConfidenceLevel } from './types';

export const buildConfidenceLabel = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'uncertain': return 'Insufficient data';
    case 'emerging': return 'Emerging signal';
    case 'inferred': return 'Inferred';
    case 'probable': return 'Probable';
    case 'measured': return 'Measured';
    case 'strong': return 'Strong evidence';
  }
};

/** Phrase prefix that matches the confidence level for canon-compliant language */
export const confidencePhrase = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'uncertain': return 'There is insufficient data to assess';
    case 'emerging': return 'An early signal suggests';
    case 'inferred': return 'Available patterns suggest';
    case 'probable': return 'Patterns consistently indicate';
    case 'measured': return 'Observed data indicates';
    case 'strong': return 'Strong patterns indicate';
  }
};
