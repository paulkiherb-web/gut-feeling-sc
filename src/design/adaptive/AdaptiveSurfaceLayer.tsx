/**
 * ADAPTIVE EXPERIENCE LAYER — Surface Layer
 *
 * Wraps a surface (typically Home page content) with subtle adaptive adjustments.
 * This is the lowest-level integration point — a thin wrapper that sets
 * semantic data attributes and section gap scaling.
 *
 * Applied changes:
 *   - Section gap scaling via space-y class (tight → spacious)
 *   - data-adaptive-state attribute for CSS targeting if needed
 *   - data-focus-mode attribute when contextual focus mode is active
 *
 * What is NEVER changed by this component:
 *   - Colors or opacity
 *   - Card structure or sizing
 *   - Brand identity
 *   - Scanner experience
 *   - Typography scale
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAdaptiveContext } from './AdaptiveContext';
import { getSectionGapClass } from './layout/AdaptiveDensity';

interface AdaptiveSurfaceLayerProps {
  children: ReactNode;
  className?: string;
}

export function AdaptiveSurfaceLayer({
  children,
  className,
}: AdaptiveSurfaceLayerProps) {
  const { profile } = useAdaptiveContext();
  const gapClass = getSectionGapClass(profile.density.spacingScale);

  return (
    <div
      data-adaptive-state={profile.state}
      data-focus-mode={profile.focusModeActive ? 'active' : undefined}
      className={cn(gapClass, className)}
    >
      {children}
    </div>
  );
}
