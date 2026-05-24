export type DriftDirection =
  | 'toward-overload'
  | 'toward-recovery'
  | 'stable'
  | 'recovering'
  | 'collapsing';

export type DriftUrgency = 'low' | 'moderate' | 'high';

export interface DriftSignal {
  id: string;
  type:
    | 'overload-trajectory'
    | 'recovery-collapse'
    | 'positive-momentum'
    | 'state-drift';
  direction: DriftDirection;
  urgency: DriftUrgency;
  description: string;
  confidence: number;
  trendWindowDays: number;
  detectedAt: string;
  signals: string[];
}
