# Adaptive UX Governance
## Personal State OS — Rules for the Adaptive Experience Layer

> The adaptive layer is one of the most sophisticated parts of this product.
> It must also be the most disciplined.
> Adaptation that is visible, jarring, or arbitrary destroys user trust.
> Adaptation that is silent, calibrated, and purposeful builds it.

---

## 1. Core Adaptive Principle

**The interface adapts to the user's biological state — silently.**

The user should never notice the mechanism of adaptation.
They should only feel that the interface fits their current moment.

### What Adaptation Means

Adaptation is the controlled adjustment of:
- Information density (how much is shown)
- Action intensity (how assertively actions are presented)
- Motion profile (how quickly elements move)
- Tone register (how verbosely content is written)
- Section breathing (how spacious the layout feels)

### What Adaptation Does NOT Mean

- Removing features (features persist, they become quieter)
- Changing visual identity (colors, typography, brand remain stable)
- Redesigning screens (layout structure remains stable)
- Changing navigation (routes and destinations remain constant)
- Reacting to emotions (adaptation is physiological, not emotional)

---

## 2. What Must Remain Stable

These elements **never adapt**. They are the anchors of the experience.

| Element                | Why It's Stable                                     |
|------------------------|-----------------------------------------------------|
| Bottom navigation      | Navigation must always be predictable               |
| Screen routes          | Destinations never change based on state            |
| Typography scale       | Type hierarchy is fixed by design tokens            |
| Brand colors           | Brand identity is constant                          |
| Icon set               | lucide-react icons never change                     |
| Card structure         | Card anatomy is fixed (title, body, CTA pattern)    |
| State color semantics  | Colors mean the same thing in all states            |
| Scanner experience     | Scanner is immune to adaptive changes               |

---

## 3. What Can Adapt

| Dimension          | What Changes                                       | Magnitude      |
|--------------------|----------------------------------------------------|----------------|
| Density            | Content counts (cards, insights, predictions)      | Significant    |
| Secondary content  | Whether secondary cards and sections are shown     | On/Off         |
| CTA intensity      | Visual weight of call-to-action elements           | 4 levels       |
| Motion duration    | Speed of all transitions (durationScale)           | 0.85×–1.6×     |
| Stagger delay      | Delay between staggered list items                 | 45ms–100ms     |
| Section spacing    | Vertical gap between major sections                | 1.0×–1.25×     |
| Tone register      | Verbosity level of copy                            | 3 levels       |
| Rationale display  | Whether "why now" context is shown                 | On/Off         |
| Impact display     | Whether effect projections are shown               | On/Off         |
| Focus mode         | Whether Home is in simplified single-priority mode | On/Off         |

---

## 4. What Must Never Adapt

| Forbidden Adaptation          | Why Forbidden                                     |
|-------------------------------|---------------------------------------------------|
| Scanner layout changes        | Scanner is a protected canonical surface          |
| Navigation structure changes  | Navigation must be predictable                    |
| Typography scale changes       | Creates visual instability                        |
| Brand color changes            | Destroys brand coherence                          |
| Card structure reordering      | Breaks spatial memory                             |
| Feature availability changes  | Features never disappear based on state           |
| Core settings access           | System access must be constant                    |
| User data visibility           | User's own data is always accessible              |

---

## 5. Maximum Adaptation Intensity

Adaptation is conservative. It does not over-react to transient signals.

### Resolution Thresholds

Adaptive state only changes when **sustained** signal patterns are present,
not transient fluctuations.

| State Transition        | Minimum Signal Duration | Notes                              |
|-------------------------|------------------------|------------------------------------|
| stable → depleted       | Current snapshot       | Immediate: severe low is urgent    |
| stable → overloaded     | Current snapshot       | Immediate: high risk is urgent     |
| stable → fragile        | Current snapshot       | Conservative thresholds apply      |
| any → recovering        | Current snapshot       | Trajectory-based                   |
| recovering → stable     | Trajectory improving   | Must show improvement              |
| stable → optimized      | Current snapshot       | Readiness ≥ 85 + good momentum     |

### Motion Adaptation Limits

| State      | Duration Scale | Minimum Duration for Base Transition |
|------------|----------------|--------------------------------------|
| depleted   | 1.6×           | 400ms (base 250ms × 1.6)             |
| fragile    | 1.4×           | 350ms                                |
| overloaded | 1.3×           | 325ms                                |
| recovering | 1.2×           | 300ms                                |
| stable     | 1.0×           | 250ms                                |
| focused    | 1.0×           | 250ms                                |
| optimized  | 0.85×          | 212ms (not below 200ms)              |

**Motion must never be below 200ms for any transition.**

---

## 6. Adaptation Transition Rules

### How State Transitions Work

- State transitions are **smooth and invisible** — users don't see the transition
- Layout shifts are **forbidden** during state transitions
- Color changes during state transition: only surface tint adjustments (≤8% opacity)
- Content count changes: only visible on **next render**, not mid-view

### Forbidden Transition Behaviors

- Layout reflow during state change
- Sudden appearance/disappearance of cards already on screen
- Color pulse or glow on state change
- Text that rewrites itself due to register change mid-view
- "Loading" indicators for adaptive state resolution (synchronous = instant)

---

## 7. Adding to the Adaptive System

When adding a new adaptable dimension to the system:

1. **Define the dimension**: what changes, at what range?
2. **Map it to all 7 states**: depleted, fragile, overloaded, recovering, stable, focused, optimized
3. **Set conservative thresholds**: adaptation must not feel volatile
4. **Add to `AdaptiveStateModel.ts`**: define the type
5. **Add to `resolveAdaptiveState.ts`**: add to all 7 PROFILES
6. **Add to the stable invariants list** if this should never adapt
7. **Test the transition**: verify it's invisible to the user
8. **Document in this file**: add the dimension to "What Can Adapt" table

---

## 8. Adaptive Layer Anti-patterns

| Anti-pattern                           | Why Forbidden                                 |
|----------------------------------------|-----------------------------------------------|
| Adaptation that causes layout jumps    | Breaks spatial memory, creates alarm          |
| Adaptation that removes navigation     | Navigation is a constant anchor               |
| Adaptation triggered by single signal  | Must use sustained patterns, not one reading  |
| Adaptation that feels like a bug       | Must always feel intentional                  |
| Emotional adaptation ("app is happy")  | Only physiological adaptation is permitted    |
| Competitive adaptation ("push harder") | Adaptation supports, never pressures          |
| Adaptation that reveals its mechanism  | The mechanism is always invisible             |
