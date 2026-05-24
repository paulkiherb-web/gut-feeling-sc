# Feature Integration Checklist
## Personal State OS — Pre-Ship Verification

> Every new feature must pass this checklist before shipping.
> This is not a suggestion. It is a gate.
> A feature that fails any category must be revised, not shipped.

---

## How to Use This Checklist

For each new feature, work through every category below.
Mark each item:
- `✓ Pass` — requirement is met
- `✗ Fail` — requirement is not met (feature is blocked)
- `N/A` — requirement does not apply to this feature (document why)

A feature may only ship when all applicable items are `✓ Pass`.

---

## Category 1: Cognitive Load

- [ ] **1.1** The feature does not add more than 1 new priority above the fold
- [ ] **1.2** The feature does not require the user to make more than 1 decision at once
- [ ] **1.3** If the feature adds content, the content is ordered by editorial priority
- [ ] **1.4** The feature does not introduce a new onboarding flow into the primary experience
- [ ] **1.5** The feature does not require explanation to operate (self-evident, or documented in progressive disclosure)

---

## Category 2: Adaptive Compatibility

- [ ] **2.1** The feature's content participates in the adaptive density system
- [ ] **2.2** Content counts are sourced from adaptive profiles, not hardcoded
- [ ] **2.3** The feature is suppressed or reduced in depleted/fragile/overloaded states
- [ ] **2.4** The feature does not bypass `AdaptiveSurfaceLayer` or `useAdaptiveExperience`
- [ ] **2.5** The feature is tested in all 7 adaptive states
- [ ] **2.6** The feature does not cause layout shifts during state transitions

---

## Category 3: State Coherence

- [ ] **3.1** Any state communication uses canonical state colors only
- [ ] **3.2** Any risk or warning copy uses observational/advising tone (not alarm)
- [ ] **3.3** Any positive state copy uses neutral/observational tone (not celebratory)
- [ ] **3.4** State indicators use the canonical `stateColors` token system
- [ ] **3.5** The feature does not introduce new state color values

---

## Category 4: Design Token Usage

- [ ] **4.1** All spacing values are from the canonical spacing scale
- [ ] **4.2** All typography uses the 8-level typographic scale
- [ ] **4.3** All motion uses canonical motion duration tokens and easing presets
- [ ] **4.4** All colors are from the design token system or semantic state colors
- [ ] **4.5** No arbitrary CSS values (no `gap-[13px]`, no `mt-7`, no `#7B5EA7`)
- [ ] **4.6** Elevation uses only the canonical 0–4 shadow scale

---

## Category 5: Emotional Restraint

- [ ] **5.1** No copy contains wellness language or motivational clichés
- [ ] **5.2** No copy contains fake empathy patterns
- [ ] **5.3** No copy contains AI/ML hype language
- [ ] **5.4** No emoji in system-generated copy or recommendation text
- [ ] **5.5** Positive outcomes are framed observationally, not as celebrations
- [ ] **5.6** Negative outcomes are framed observationally, not as alarms

---

## Category 6: Mobile Readability

- [ ] **6.1** The feature is designed for 375px minimum viewport width
- [ ] **6.2** All text meets minimum font size (11px / micro)
- [ ] **6.3** All interactive targets meet 44×44px minimum touch target
- [ ] **6.4** The feature is readable in both light and dark mode
- [ ] **6.5** Content is not clipped or overflowing at 375px width
- [ ] **6.6** Horizontal scroll is not introduced (except intentional carousels)

---

## Category 7: Scanner Preservation

- [ ] **7.1** The feature does not add content to the scanner surface
- [ ] **7.2** The feature does not introduce analytics to the scanner surface
- [ ] **7.3** The feature does not add CTAs to the scanner surface (remains ≤ 2)
- [ ] **7.4** If the feature affects scanner behavior, the full scanner checklist is passed
  → See: `accessibility/SCANNER_PROTECTION.md`

---

## Category 8: Canonical Hierarchy

- [ ] **8.1** The feature has exactly one primary element per screen view
- [ ] **8.2** Supporting elements are visually subordinate to primary
- [ ] **8.3** No section exists with fewer than 2 items
- [ ] **8.4** No card contains more than 1 CTA
- [ ] **8.5** No screen contains more than 1 primary-weight CTA
- [ ] **8.6** Navigation structure is unchanged

---

## Category 9: Component Compliance

- [ ] **9.1** The feature uses existing components before creating new ones
- [ ] **9.2** Any new component has passed `COMPONENT_CERTIFICATION.md`
- [ ] **9.3** Components follow the canonical anatomy (no improvised structures)
- [ ] **9.4** Component naming is semantic (not appearance-based)

---

## Category 10: Visual Restraint

- [ ] **10.1** No new decorative gradients introduced
- [ ] **10.2** No glowing or neon surfaces
- [ ] **10.3** No oversaturated colors (saturation > 70 for surfaces)
- [ ] **10.4** No animation overload (max 3 simultaneous animations)
- [ ] **10.5** No looping decorative animations
- [ ] **10.6** No dashboard-style clutter above the fold

---

## Sign-Off Format

```
Feature:     [Feature name]
Reviewer:    [Name]
Date:        [Date]
Canon docs:  [Which canon sections were reviewed]

Results:
  Cognitive Load:        [ ] PASS  [ ] FAIL  [ ] N/A
  Adaptive Compatibility:[ ] PASS  [ ] FAIL  [ ] N/A
  State Coherence:       [ ] PASS  [ ] FAIL  [ ] N/A
  Design Token Usage:    [ ] PASS  [ ] FAIL  [ ] N/A
  Emotional Restraint:   [ ] PASS  [ ] FAIL  [ ] N/A
  Mobile Readability:    [ ] PASS  [ ] FAIL  [ ] N/A
  Scanner Preservation:  [ ] PASS  [ ] FAIL  [ ] N/A
  Canonical Hierarchy:   [ ] PASS  [ ] FAIL  [ ] N/A
  Component Compliance:  [ ] PASS  [ ] FAIL  [ ] N/A
  Visual Restraint:      [ ] PASS  [ ] FAIL  [ ] N/A

Decision: [ ] APPROVED  [ ] BLOCKED — revision required
Notes:
```
