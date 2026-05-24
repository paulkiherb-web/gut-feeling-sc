export type CausalEdgeType =
  | 'direct'
  | 'delayed'
  | 'compounding'
  | 'recovery-lag';

export interface CausalEdge {
  from: string;
  to: string;
  type: CausalEdgeType;
  /** Nominal delay in hours between cause and effect */
  delayHours: number;
  /** 0–1, directional strength */
  weight: number;
  /** 0–1 */
  confidence: number;
  evidenceCount: number;
}

export interface CausalChain {
  id: string;
  /** Human-readable steps in causal order */
  steps: string[];
  edges: CausalEdge[];
  /** Product of edge confidences */
  totalConfidence: number;
  occurrences: number;
  description: string;
  lastSeenAt: string;
}
