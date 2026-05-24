# LONGITUDINAL INTELLIGENCE — CANON REFERENCE

## What It Is

The longitudinal intelligence layer is a **personal pattern detection system** that operates over extended event history (typically 14–90 days). It detects recurring behavioral signals, estimates the directionality of physiological state, and surfaces restrained observations about what appears to correlate with a user's wellbeing over time.

It is **not** a medical system. It is **not** a predictive diagnostic. It is an observational layer that helps users notice patterns they might not notice themselves.

---

## What It Is NOT

- **Not a diagnosis engine.** It never names diseases, disorders, or conditions.
- **Not a causal proof system.** Associations are probabilistic, not deterministic.
- **Not a clinical decision support tool.** It does not replace medical advice.
- **Not a prediction oracle.** It observes drift; it does not forecast futures.
- **Not a certainty machine.** All outputs are bounded by evidence count and consistency.

---

## Architecture

### Subsystems

| Module | Purpose |
|---|---|
| `timeline/` | Builds normalized chronological event timeline with temporal windows |
| `patterns/` | Detects recurring behavioral patterns with recurrence thresholds |
| `causality/` | Infers probable multi-step behavioral/physiological chains |
| `signatures/` | Builds personal sensitivity profile (what affects THIS user most) |
| `confidence/` | Evidence-gated confidence scoring system |
| `drift/` | Directional state trajectory detection |
| `insights/` | Canon-compliant human-readable observational outputs |
| `safety/` | Forbidden-phrase validator applied to all outputs |
| `engine/` | Master orchestrator with module-level memoization |

### Data Flow

```
EventLog → DailyBuckets → DayProxy[]
         → Timeline (temporal windows, state shifts)
         → Patterns (recurring behavioral correlations)
         → Causality (multi-hop causal chains)
         → Signatures (sensitivity weights per domain)
         → Drift (directional trajectory)
         → Confidence (evidence scoring per output)
         → Insights (validated, hedged human text)
         → LongitudinalModel (master output)
```

---

## Confidence Philosophy

Confidence is **earned through evidence**, not assumed.

### Levels

| Level | Meaning |
|---|---|
| `uncertain` | < 3 data points, pattern is speculative |
| `emerging` | 3–5 occurrences, early signal |
| `inferred` | 6–9 occurrences, moderate pattern |
| `probable` | 10–14 occurrences, consistent pattern |
| `measured` | 15+ occurrences, well-established pattern |
| `strong` | 20+ occurrences with high recurrence consistency |

### Rules

- Confidence scores are **bounded** — patterns max at 0.95, chains at 0.90, insights at 0.97
- Confidence is **decayed** over time (half-life: 21 days)
- Confidence is only reported if the underlying evidence gate passes (`MIN_EVENTS = 10`, `MIN_ACTIVE_DAYS = 5`)
- Confidence labels appear alongside all output claims

---

## Anti-Hallucination Rules

1. **No outputs below minimum evidence threshold.** The engine returns an empty model if `isDataSufficient = false`.
2. **No causal language.** Never use "causes", "is causing", "leads to" with certainty. Use "appears associated with", "tends to follow", "may precede".
3. **No deterministic prediction.** Never say "will happen", "definitely", "guaranteed".
4. **No medical framing.** Never use: diagnosis, symptoms, disease, disorder, condition, therapy, prescri*, clinically, medically, treatment, cure.
5. **Safety module applied to every insight, pattern, and chain.** `validateLongitudinalClaims()` runs on all text before inclusion.
6. **All pattern thresholds enforced.** Weak = min 3 occurrences. Moderate = min 6. Strong = min 10.
7. **No emotional language.** The system does not say "you should feel X" or "this is bad for you."

---

## Causal Restraint Philosophy

The system detects **temporal co-occurrence**, not causality. When two events consistently appear in sequence within a temporal window, this is noted as a "probable association" — not a causal proof.

The system explicitly avoids:
- Reverse causality attribution
- Confound blindness (multiple factors changing simultaneously)
- Overfitting on small samples
- Recency bias in rolling averages

All causal chain edges have explicit:
- Temporal window constraints
- Minimum co-occurrence threshold
- Confidence ceiling
- Evidence count

---

## Prediction Boundaries

Drift detection is **directional momentum observation**, not prediction. It answers:
- "Has readiness been declining over the past N days?"
- "Is recovery consistency increasing?"

It does **not** answer:
- "Will you crash tomorrow?"
- "This trajectory means you will develop X."

Early warning language is carefully hedged:
- ✅ "Recovery consistency has been declining over recent observations."
- ❌ "You are heading toward burnout."

---

## Evidence Requirements

| Output type | Minimum events | Minimum active days |
|---|---|---|
| Any model output | 10 | 5 |
| `weak` pattern | 3 occurrences | — |
| `moderate` pattern | 6 occurrences | — |
| `strong` pattern | 10 occurrences | — |
| Causal chain | 4 co-occurrences | — |
| Drift signal | 3 consecutive days | — |
| Insight | Depends on source pattern/chain confidence | — |

---

## Output Language Guidelines

All insight text must comply with CONTENT_TONE canon rules:

- No emotional intensifiers
- No certainty inflation ("clearly", "definitely", "always", "never")
- No medical framing
- Hedging required: "appears", "tends to", "may", "often precedes", "is associated with"
- Confidence label must accompany all claims
- Third-person observational stance

### Acceptable phrasing

- "Late caffeine intake appears associated with reduced sleep consistency in this profile."
- "Hydration above 1800ml/day tends to precede higher next-day readiness scores."
- "Recovery pattern variability has increased over recent observations."

### Forbidden phrasing

- "Caffeine is causing your sleep problems."
- "You will feel worse if you keep doing this."
- "This confirms you have poor recovery."
- "You should stop drinking coffee."

---

## Integration Points

### Store (`appStore.ts`)
- `state.longitudinal: LongitudinalModel | null`
- Computed by `computeDerivedState()` on every `rebuildState()` call
- Memoized — no recomputation if event log is unchanged
- Not persisted (derived state, like `stateSnapshot`)

### AI Context (`buildAIContext.ts`)
- Longitudinal model injected as optional `longitudinal` field
- Injection guarded by `isDataSufficient` flag
- Injection wrapped in try/catch — non-critical, rollback-safe

### Home UI (`Home.tsx`)
- `DriftSignalsCard` — trajectory signals (urgency: high/medium only)
- `LongitudinalInsightsCard` — top longitudinal observations
- `PersonalPatternsCard` — top recurring patterns (moderate/strong only)
- All 3 cards: hidden in `focusModeActive`, gated by `showSection()`

---

## Performance Notes

- Event log cap: 1500 events (enforced by store)
- Algorithm complexity: O(n) on event count for most operations
- Memoization key: `{eventCount}:{lastEventId}:{lastEventCreatedAt}`
- All computations are synchronous and pure functional
- No React dependencies inside the engine

---

*This document is part of the product canon. All longitudinal system modifications must preserve the restraint principles above.*
