import type { CourseKey, CourseDomain } from './types';

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

/** Action types dispatched when user picks a response to a scan course impact */
export type ScanCourseActionType =
  | 'scan.course.accepted'
  | 'scan.course.already_consumed'
  | 'scan.course.smoothed'
  | 'scan.course.replaced'
  | 'scan.course.noted';

export interface ScanCourseActionPayload {
  scanId?: string;
  activeCourse: CourseKey;
  impactStatus: ScanImpactStatus;
  affectedDomains: CourseDomain[];
  selectedAction: ScanCourseActionType;
  timestamp: string;
}
