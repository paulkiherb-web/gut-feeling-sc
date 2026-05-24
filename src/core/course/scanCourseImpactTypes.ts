import type { CourseKey, CourseDomain } from './types';

export type { CourseDomain };

export type ScanImpactStatus =
  | 'supports_course'
  | 'neutral'
  | 'slightly_drifts'
  | 'strongly_drifts'
  | 'unknown';

export type ScanRouteEffect =
  | 'stay_in_corridor'
  | 'open_drift_branch'
  | 'open_return_path'
  | 'needs_more_context';

export interface ScanCourseImpact {
  course: CourseKey;
  status: ScanImpactStatus;
  headline: string;
  explanation: string;
  affectedDomains: CourseDomain[];
  routeEffect: ScanRouteEffect;
  easiestReturn: {
    title: string;
    description: string;
    effort: 'low' | 'medium';
  } | null;
  confidence: 'low' | 'medium' | 'high';
}

/** Short action key used in i18n, ACTIONS list, and event payloads */
export type ScanCourseActionType =
  | 'accepted'
  | 'already_consumed'
  | 'smoothed'
  | 'replaced'
  | 'noted';

export interface ScanCourseActionPayload {
  scanId?: string;
  activeCourse: CourseKey;
  impactStatus: ScanImpactStatus;
  affectedDomains: CourseDomain[];
  selectedAction: ScanCourseActionType;
  timestamp: string;
}
