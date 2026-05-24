export type CourseKey =
  | 'energy'
  | 'sleep'
  | 'weight_loss'
  | 'muscle_gain'
  | 'digestion'
  | 'calm'
  | 'focus';

export type CourseStrictness = 'soft' | 'balanced' | 'focused';

export interface CourseState {
  activeCourse: CourseKey;
  startedAt: string;
  strictness: CourseStrictness;
  desiredPaceDays: number;
  updatedAt: string;
}

export type CourseDomain =
  | 'food'
  | 'sleep'
  | 'movement'
  | 'hydration'
  | 'alcohol'
  | 'caffeine'
  | 'recovery';

export type CoursePhase = 'morning' | 'day' | 'evening' | 'sleep';

export interface CourseAnchor {
  id: string;
  title: string;
  description: string;
  domain: CourseDomain;
  weight: number;
  phase: CoursePhase;
  optional: boolean;
}

export interface IdealPath {
  course: CourseKey;
  dayParts: {
    morning: CourseAnchor[];
    day: CourseAnchor[];
    evening: CourseAnchor[];
    sleep: CourseAnchor[];
  };
  minimumPath: CourseAnchor[];
  normalPath: CourseAnchor[];
  bestPath: CourseAnchor[];
}

export interface RealPath {
  completedAnchors: string[];
  missedAnchors: string[];
  riskySignals: string[];
  supportiveSignals: string[];
  inferredSignals: string[];
}

export type CourseGapStatus =
  | 'inside_corridor'
  | 'slightly_out'
  | 'far_out'
  | 'unknown';

export interface CourseGap {
  status: CourseGapStatus;
  gapScore: number;
  headline: string;
  explanation: string;
  strongestDrift: string | null;
  easiestReturn: {
    title: string;
    description: string;
    domain: CourseDomain;
    effort: 'low' | 'medium';
  } | null;
  estimatedPace: {
    bestDays: number;
    currentDays: number;
    improvedDays: number;
  };
  confidence: 'low' | 'medium' | 'high';
}

export type CourseRouteNodeType = 'main' | 'branch' | 'return';

export type CourseRouteNodeStatus =
  | 'completed'
  | 'current'
  | 'locked'
  | 'available'
  | 'drifted'
  | 'return_available';

export interface CourseRouteNode {
  id: string;
  title: string;
  description: string;
  phase: CoursePhase;
  type: CourseRouteNodeType;
  status: CourseRouteNodeStatus;
  anchorId?: string;
  x: number;
  y: number;
}

export interface CourseRoute {
  course: CourseKey;
  nodes: CourseRouteNode[];
  currentNodeId: string | null;
  headline: string;
  explanation: string;
}
