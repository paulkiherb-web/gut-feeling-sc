export type ConfidenceLevel =
  | 'uncertain'
  | 'emerging'
  | 'inferred'
  | 'probable'
  | 'measured'
  | 'strong';

export interface ConfidenceScore {
  /** 0–1 */
  value: number;
  level: ConfidenceLevel;
  label: string;
  evidenceCount: number;
  /** 0–1 */
  consistency: number;
  /** 0–1 */
  recency: number;
  explanation: string;
}

export interface ConfidenceSummary {
  overall: ConfidenceLevel;
  patternConfidence: number;
  causalConfidence: number;
  signatureConfidence: number;
  evidenceCount: number;
  dataSpanDays: number;
}
