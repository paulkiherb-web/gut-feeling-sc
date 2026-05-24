# TECH_DEBT_BASELINE — Sprint 2

All TypeScript errors listed below are **pre-existing** (present before Sprint 1 and Sprint 2).
Sprint 2 introduced **zero new TypeScript errors**.

## Pre-existing Errors (35 total)

### src/components/home/DriftSignalsCard.tsx (5 errors)
- `medium` not in `Record<DriftUrgency, string>` — DriftUrgency type mismatch
- `deteriorating` not in `Record<DriftDirection, ReactNode>` / `Record<DriftDirection, string>` — DriftDirection type mismatch
- Comparison `'low'|'moderate'` vs `'medium'` — enum value drift
- `domain` / `title` not on `DriftSignal` type — interface out of sync with usage

### src/components/home/LongitudinalInsightsCard.tsx (3 errors)
- `category` not on `LongitudinalInsight` — property removed or renamed
- `confidenceLabel` not on `LongitudinalInsight` (should be `confidenceLevel`)

### src/components/home/PersonalPatternsCard.tsx (2 errors)
- `activeDays` not on `PersonalSignature`
- `title` not on `RecurringPattern`

### src/core/capture/buildEventContext.ts (2 errors)
- `hydration` not on `Scorecard` (Scorecard has: energy, recovery, sleep, nutrition, readiness, goalAlignment)
- `probability` not on `Prediction`

### src/core/capture/capturePipeline.ts (7 errors)
- All: `Expected 1 arguments, but got 2` — function signature changed, callers not updated

### src/core/capture/scanner/buildScanImpact.ts (1 error)
- `hydration` not in `Partial<Scorecard>` — same Scorecard mismatch as above

### src/core/domain/ai/buildAIContext.ts (7 errors)
- `title` not on `RecurringPattern`
- `factor` not on `SensitivityWeight`
- `domain` / `title` not on `DriftSignal`
- `lagDays` / `effectivenessScore` not on `RecoveryProfile`
- `activeDays` not on `PersonalSignature`

### src/core/domain/state/buildPredictions.ts (1 error)
- `type: string` not assignable to `PredictionType` — string literal narrowing missing

### src/design/index.ts (1 error)
- `TypographyLevel` re-exported twice (duplicate export from `./tokens`)

### src/pages/Assistant.tsx (5 errors)
- `title` not on `RecurringPattern`
- `factor` not on `SensitivityWeight`
- `domain` / `title` not on `DriftSignal`
- `lagDays` not on `RecoveryProfile`

### src/pages/Scanner.tsx (1 error)
- `calories` not on `ScanResult`

---

## Root Cause Summary

The majority of errors stem from type interface evolution where:
1. `DriftSignal`, `RecurringPattern`, `PersonalSignature`, `SensitivityWeight`, `RecoveryProfile`, `LongitudinalInsight` types were updated but consuming components were not.
2. `Scorecard` never had a `hydration` field — callers assume it does.
3. `capturePipeline.ts` callers pass 2 args where functions now take 1.
4. `buildPredictions.ts` needs `as PredictionType` cast.
5. `design/index.ts` has a barrel export collision.

---

## Policy

- These errors existed before Sprint 1.
- They are **not introduced or worsened** by Sprint 1 or Sprint 2 changes.
- Fix these in a dedicated **TypeScript cleanup sprint** — not while adding product features.
- Sprint 3 candidate: align interfaces in `src/core/store/types/` with all consumers.
