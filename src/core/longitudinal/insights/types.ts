import type { ConfidenceLevel } from '../confidence/types';

export interface LongitudinalInsight {
  id: string;
  kind: 'pattern' | 'causal' | 'trend' | 'drift' | 'signature';
  title: string;
  body: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  signals: string[];
  createdAt: string;
}
