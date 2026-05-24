# Design Drift Prevention System
## Personal State OS — Anti-Drift, Anti-Duplication, Anti-Randomization

> Design drift is the silent degradation of a product.
> It happens one "small exception" at a time.
> This document defines the rules that prevent drift
> and the checks that detect it when it occurs.

---

## What is Design Drift?

Design drift is the accumulation of small deviations from the product's
canonical design language that, individually, seem harmless but
collectively destroy coherence.

**Manifestations of drift:**
- 15 slightly different card styles instead of 4 canonical variants
- 8 different spacing values where the token system defines 12 canonical ones
- Copy that subtly adopts a more casual or more alarming tone
- State colors used decoratively instead of semantically
- New colors introduced for "just this one feature"
- Animation timing that doesn't match the motion system
- Components duplicated with tiny variations instead of using variants

---

## 1. Anti-Duplication Rules

### Component Duplication

Before creating any component, a reuse evaluation is mandatory.
(See `COMPONENT_CERTIFICATION.md` Step 1)

**Forbidden duplication patterns:**
- Creating a new card component when only a new variant is needed
- Creating a new button when only a new label is needed
- Creating a new pill when the existing pill covers the use case
- Copying a component to "customize it quickly"
- Building "just for this screen" one-off components

**Audit signal**: If more than 3 components in the codebase serve the same visual purpose
with minor variations, they must be consolidated.

### Style Duplication

**Forbidden:**
- Inline `style={{}}` that duplicates values from design tokens
- Tailwind classes that bypass design tokens (`text-[15px]` when `body` token is 15px)
- Repeated `className` patterns that should be a design component

---

## 2. Anti-Randomization Rules

### Spacing Randomization

The following spacing values indicate drift and must be refactored:

```
p-3.5   → use p-3 (12px) or p-4 (16px)
mt-7    → use mt-6 (24px) or mt-8 (32px)
gap-5   → use gap-4 (16px) or gap-6 (24px)
gap-[13px] → not a canonical value — refactor immediately
```

**Rule**: Any spacing value not in the canonical scale is drift.
Refactor to the nearest canonical value.

### Color Randomization

**Forbidden:**
- Hardcoded hex colors outside the token system
- Tailwind color utilities not derived from theme tokens (`text-blue-500`)
- HSL values not from the `stateColors` token system for state communication
- New accent colors introduced without going through governance

**Audit signal**: Any `#` character in component files (outside comments) is a flag.

### Typography Randomization

**Forbidden:**
- Font sizes not in the typographic scale (`text-[17px]`, `text-base` without semantic meaning)
- Font weights not in the semantic set (400, 500, 600, 700)
- Letter spacing values not matching the scale

### Motion Randomization

**Forbidden:**
- `transition: 'all 0.3s ease'` CSS transitions
- Framer Motion `duration` values not from the `motionDuration` token
- Custom easing arrays not from the `motionEasing` token
- `animate` props with hardcoded timing without adaptive state respect

---

## 3. Semantic Naming Rules

### Component Naming

All components must follow the semantic naming standard from `COMPONENT_CERTIFICATION.md`.

**Forbidden naming patterns:**

| Pattern              | Example             | Reason                                        |
|----------------------|---------------------|-----------------------------------------------|
| Appearance-based     | `BigBlueCard`       | Appearance changes; purpose doesn't           |
| Position-based       | `TopSection`        | Position is not semantic                      |
| Technology-based     | `FlexCard`          | Implementation detail                         |
| Vague               | `InfoBlock`         | Undefined purpose                             |
| Temporal             | `NewCard`, `Card2`  | Implies predecessor exists; creates confusion |

### CSS Variable and Token Naming

Tokens are already named semantically in the design system.
When adding new CSS variables, follow the pattern:

```css
/* ✓ Good: semantic, context-aware */
--color-state-recovery: ...;
--spacing-section-gap: ...;

/* ✗ Bad: appearance or value-based */
--color-green-medium: ...;
--spacing-32: ...;
```

### Hook Naming

Hooks must follow `useNounVerb` or `useNoun` pattern:

```ts
// ✓ Good
useAdaptiveExperience()
useStateSnapshot()
useScores()

// ✗ Bad
useGetData()
useHandle()
useThing()
```

---

## 4. Consistency Verification Checklist

Run this audit on any significant new feature or after any refactoring sprint:

### Spacing Audit

```bash
# Find potential non-canonical Tailwind spacing
grep -r "gap-\|p-\|m-\|py-\|px-\|my-\|mx-" src/components/ --include="*.tsx"
# Review results for values outside [1,2,3,4,5,6,8,10,12,16,20,24]
```

### Color Audit

```bash
# Find hardcoded colors
grep -r "#[0-9A-Fa-f]\{3,6\}" src/components/ src/pages/ --include="*.tsx"
# All results should be in tokens — anything else is drift
```

### Motion Audit

```bash
# Find potential hardcoded motion
grep -r "transition:\|duration:" src/components/ src/pages/ --include="*.tsx"
# All results should reference design token values
```

---

## 5. Drift Response Protocol

When drift is detected:

| Severity | Definition                                   | Response                        |
|----------|----------------------------------------------|---------------------------------|
| Low      | 1–2 non-canonical values in a single file    | Fix in next PR targeting the file |
| Medium   | Repeated pattern across 3+ components       | Dedicated refactoring task within 2 sprints |
| High     | New component type duplicating existing ones | Block new work; consolidate first |
| Critical | Systematic deviation from core principles    | Canon review session required   |

---

## 6. Canon Maintenance

The canon itself must not drift.

**Rules for updating canon documents:**
- Any change to a canon document must be reviewed as significant
- Changes to `UX_CONSTITUTION.md` or `PRODUCT_PRINCIPLES.md` require explicit team consensus
- No single contributor may change core invariants unilaterally
- All canon changes must be documented with a rationale
- Changes to `SCANNER_PROTECTION.md` are subject to the highest scrutiny

**Canon documents are living documents** — they should evolve as the product grows.
But evolution must be intentional, not accidental.
