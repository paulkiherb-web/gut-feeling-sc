# Design Decision Matrix
## Personal State OS — IF/THEN Decision Framework

> When faced with a design decision, consult this matrix first.
> If the situation is covered, the matrix decides.
> If the situation is not covered, apply the product principles
> and document the new decision pattern here.

---

## Matrix Structure

Each entry follows:
```
IF   [condition]
AND  [optional additional condition]
THEN [required response]
NOT  [forbidden response]
```

---

## 1. User State Decisions

---

### MATRIX-001: User is depleted

```
IF   user readiness < 30
OR   recovery < 30 AND sleep quality < 40

THEN
  — Reduce recommendations to 1
  — Reduce insights to 1
  — Reduce predictions to 1
  — Hide secondary cards entirely
  — Disable competing CTAs
  — Use terse tone register
  — Increase section spacing by 1.25×
  — Use still/slow motion profile
  — Show no urgency badges
  — Show no impact chips

NOT
  — Show full recommendation feed
  — Show congratulatory messages
  — Use standard density
  — Show competing actions
```

---

### MATRIX-002: User is overloaded

```
IF   stress load > 75
OR   weighted risk load ≥ 2.5

THEN
  — Activate focus mode (simplify Home to essential context only)
  — Reduce recommendations to 1
  — Reduce insights to 1
  — Allow maximum 2 predictions (critical ones only)
  — Show single priority signal
  — Suppress secondary actions
  — Use terse register
  — Allow urgency badges (risk communication only)
  — Hide impact chips

NOT
  — Show multiple competing priorities
  — Add motivational content to "help" the user
  — Show feature discovery banners
  — Show new onboarding elements
```

---

### MATRIX-003: User is fragile

```
IF   readiness < 45
AND  (sleep quality < 55 OR stress load > 60)

THEN
  — Quiet the interface: reduced density
  — Max 1 recommendation
  — Max 2 insights
  — Max 1 prediction
  — Disable competing CTAs
  — Use quiet action intensity
  — Use calm motion (1.4× duration)
  — Use concise register

NOT
  — Show full density
  — Show impact chips or urgency framing
  — Present multiple actions
```

---

### MATRIX-004: User is recovering

```
IF   readiness < 60
AND  trajectory is improving

THEN
  — Supportive context (not motivational)
  — Max 2 recommendations
  — Max 2 insights
  — Max 2 predictions
  — Allow secondary cards
  — Show urgency badges if relevant
  — Show impact chips
  — Use concise register with rationale

NOT
  — "Keep going!" or motivational framing
  — Dense interface that creates pressure
  — Comparative statements to previous performance
```

---

### MATRIX-005: Prediction risk is critical

```
IF   high-risk predictions ≥ 2
OR   high-risk predictions ≥ 1 AND readiness < 50

THEN
  — Activate focus mode regardless of base state
  — Simplify Home surface to one priority
  — Elevate the single most critical prediction
  — Suppress all secondary actions
  — Use terse/direct copy

NOT
  — Alarm language ("CRITICAL", "DANGER")
  — Red color for non-alarm situations
  — Multiple competing risk messages simultaneously
```

---

### MATRIX-006: User is optimized

```
IF   readiness ≥ 85
AND  trajectory improving
AND  trajectory momentum is not weak

THEN
  — Enable rich density (max 4 recommendations, 6 insights, 3 predictions)
  — Show full contextual richness
  — Enable directive action intensity
  — Use slightly faster motion (0.85× duration)
  — Use standard register with rationale and impact

NOT
  — Show badges/trophies/celebrations
  — Use "streak" language
  — Gamify the optimized state
  — Present comparison to other users
  — Use "peak performance" hype language
```

---

## 2. Content Decisions

---

### MATRIX-007: New recommendation needs a CTA

```
IF   a recommendation card requires a user action

THEN
  — Determine current adaptive state
  — Check CTA_BY_STATE for permitted count and intensity
  — Use verb-first copy (max 3 words)
  — Use canonical button variant for the intensity level

NOT
  — Add CTA if state forbids competing actions
  — Use exclamation marks
  — Show more than 1 CTA on the card
```

---

### MATRIX-008: Copy needs to communicate negative state

```
IF   content must convey declining state, low recovery, or risk

THEN
  — Use observational or direct tone (never alarm)
  — Reference specific data ("below your 7-day average")
  — Use muted state colors only (not alarm red)
  — Include a practical, calm next step

NOT
  — Use alarm language ("CRITICAL", "DANGER", "WARNING:")
  — Use red color (#ef4444 or similar alarm red)
  — Leave the user without a practical response
  — Use emotional language ("unfortunately", "we're concerned")
```

---

### MATRIX-009: New feature adds content to Home screen

```
IF   a new feature adds cards or content to the Home screen

THEN
  — Audit current density for each adaptive state
  — Ensure max cards above fold is not exceeded
  — Ensure content respects density profiles
  — Apply adaptive suppression to new content
  — Document which density level the content appears at

NOT
  — Add content that bypasses the adaptive density system
  — Force content visibility regardless of user state
  — Add a section header for a single item
```

---

## 3. Visual Decisions

---

### MATRIX-010: Choosing animation for a new interaction

```
IF   a new interaction requires an animation

THEN
  — Select from canonical motion token set
  — Apply state-appropriate durationScale
  — Ensure animation communicates something (not decoration)
  — Test in depleted state (durationScale 1.6×)

NOT
  — Use bounce or spring curves
  — Create looping animations
  — Animate text content
  — Add more than 3 simultaneous animations
```

---

### MATRIX-011: New component needs a color

```
IF   a new component requires a color decision

THEN
  — Check if semantic state color applies
  — Use only canonical stateColors or brand token
  — Check saturation limit (max s:60 for large surfaces)
  — Verify color is not the only differentiator (accessibility)

NOT
  — Introduce a new accent color
  — Use saturation above 70 for surfaces
  — Use decorative color gradients
  — Use red for anything that isn't a destructive action
```

---

## 4. Architecture Decisions

---

### MATRIX-012: New component vs. extending existing

```
IF   a new UI need arises

THEN
  — Check if an existing component satisfies the need
  — Check if an existing component can be extended (new variant)
  — Only create new component if no existing pattern fits
  — If creating: follow component certification flow
  → See: governance/COMPONENT_CERTIFICATION.md

NOT
  — Create a new component without checking existing patterns
  — Duplicate existing components with minor modifications
  — Build "one-off" components for a single feature
```
