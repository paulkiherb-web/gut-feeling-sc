import type { DayProxy } from '../timeline/types';
import type { DriftSignal } from './types';
import { buildId } from '../../store/calculators/_helpers';

const WINDOW_DAYS = 7;
const RECOVERY_THRESHOLD = 60;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Detect when recovery quality is becoming inconsistent or eroding.
 * Fires when: recent good-recovery days are fewer than earlier periods.
 */
export const detectRecoveryCollapse = (proxies: DayProxy[]): DriftSignal | null => {
  if (proxies.length < WINDOW_DAYS * 2) return null;

  const earlierWindow = proxies.slice(-(WINDOW_DAYS * 2), -WINDOW_DAYS);
  const recentWindow = proxies.slice(-WINDOW_DAYS);

  const earlierGoodDays = earlierWindow.filter((p) => p.readinessProxy >= RECOVERY_THRESHOLD).length;
  const recentGoodDays = recentWindow.filter((p) => p.readinessProxy >= RECOVERY_THRESHOLD).length;

  const collapse = earlierGoodDays > 0 && recentGoodDays < earlierGoodDays * 0.5;
  if (!collapse) return null;

  const collapseRatio = 1 - recentGoodDays / Math.max(earlierGoodDays, 1);
  const urgency = collapseRatio > 0.7 ? 'high' : collapseRatio > 0.4 ? 'moderate' : 'low';
  const confidence = clamp01(collapseRatio * 0.8);

  return {
    id: buildId('drift'),
    type: 'recovery-collapse',
    direction: 'collapsing',
    urgency,
    description: 'Recent recovery variability is increasing — fewer days of stable readiness compared to the prior period.',
    confidence,
    trendWindowDays: WINDOW_DAYS,
    detectedAt: new Date().toISOString(),
    signals: ['recovery-days-declining', 'readiness-instability'],
  };
};
