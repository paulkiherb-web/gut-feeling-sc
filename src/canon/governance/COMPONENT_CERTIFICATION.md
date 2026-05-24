# Component Certification Flow
## Personal State OS — How New Components Are Approved

> Components are not created to satisfy a feature request.
> Components are created to fill a documented, recurring pattern
> that cannot be satisfied by anything that already exists.
>
> Every component in this product must be certified before it
> can be used in production.

---

## Step 1: Reuse Evaluation (Required)

Before proposing a new component, document your answers to:

1. Does an existing component in `src/design/components/` satisfy this need?
2. Does an existing product component in `src/components/` satisfy this need?
3. Can an existing component be extended with a new **variant** to satisfy this need?
4. Can two existing components be composed to satisfy this need?

**If any answer is YES — use or extend the existing component.**
**A new component is only justified if all answers are NO.**

Document your findings in the component proposal.

---

## Step 2: Pattern Documentation

Before building the component, document:

```markdown
## Component Proposal: [ComponentName]

### Problem
What interaction/presentation problem does this solve?
Why can't existing components solve it?

### Use Case
Where specifically will this component be used?
(Screen, context, frequency)

### Reuse Evaluation
- [ ] Checked src/design/components/ — no match
- [ ] Checked src/components/ — no match
- [ ] Checked variant extension — not applicable
- [ ] Checked composition — not applicable

### Constraints
- When to use:
- When NOT to use:
- Max content density:
- Max CTA count:
- Forbidden patterns:

### Token Compliance
- Spacing: [which tokens]
- Typography: [which levels]
- Motion: [which presets]
- Colors: [which tokens]
```

---

## Step 3: Naming Standards

Component names must follow these rules:

| Rule                          | Example                              |
|-------------------------------|--------------------------------------|
| PascalCase for component name | `ReadinessInsightCard`               |
| Semantic, not appearance-based| ✓ `StateHeroCard`, ✗ `BigBlueCard`   |
| Describes purpose, not look   | ✓ `NextBestActionCard`, ✗ `ActionBlock` |
| No abbreviations              | ✓ `RecoveryTrajectoryCard`, ✗ `RecTrajCard` |
| No "New" prefix               | ✗ `NewInsightCard` (will be stale)   |
| No version numbers            | ✗ `InsightCard2`                     |

### File Naming

```
ComponentName.tsx       ← Component file
ComponentName.test.tsx  ← Test file (if applicable)
```

### Export Convention

```ts
// Named export only — no default exports from design system components
export function ComponentName() { ... }
```

---

## Step 4: Token Compliance Check

Before submitting for review, verify:

- [ ] **Spacing**: all values from canonical spacing scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)
- [ ] **Typography**: all levels from the 8-level typographic scale
- [ ] **Colors**: only from design tokens or semantic state colors
- [ ] **Motion**: only from `src/design/motion/` presets, respects `durationScale`
- [ ] **Elevation**: only from the 0–4 shadow scale
- [ ] **Border radius**: only from canonical radius scale (xs, sm, md, lg, xl, 2xl, pill)
- [ ] **No hardcoded values**: no `#7B5EA7`, no `16.5px`, no `0.3s ease`

---

## Step 5: Adaptive Compatibility

If the component will appear on the Home screen or any adaptive surface:

- [ ] The component respects `useAdaptiveExperience()` for content counts
- [ ] The component is suppressible in low-state profiles
- [ ] The component does not cause layout shifts during state transitions
- [ ] The component is tested in all 7 adaptive states
- [ ] Content inside the component never exceeds adaptive density limits

---

## Step 6: Density Documentation

Add to `src/canon/patterns/CANONICAL_COMPONENTS.md`:

```markdown
## [ComponentName]

### Purpose
[One sentence]

### When to Use
- [condition]

### When NOT to Use
- [condition]

### Constraints
| Property | Limit |
| ...      | ...   |
```

Also add to `src/canon/patterns/componentRules.ts`:
- Add component type to `ComponentType` union
- Add entry to `COMPONENT_RULES` with all constraints

---

## Step 7: Review Criteria

A component is certified when it meets:

| Criterion                     | Requirement                                   |
|-------------------------------|-----------------------------------------------|
| Reuse evaluation complete     | All 4 reuse questions answered with NO        |
| Pattern documentation filed   | Proposal document complete                    |
| Name compliance               | Follows semantic naming standards             |
| Token compliance              | All design tokens used, no arbitrary values   |
| Adaptive compatibility        | Tested in all 7 states if on adaptive surface |
| Density documented            | CANONICAL_COMPONENTS.md updated               |
| TS rules added                | componentRules.ts updated                     |
| Forbidden patterns checked    | No forbidden patterns in implementation       |

---

## Extension Rules

When extending an existing component with a new variant:

1. Add the variant to the existing component file
2. Name the variant descriptively (e.g., `variant="compact"`)
3. Document the variant's use case and constraints
4. Ensure the variant does not override the base component's constraints
5. Update `componentRules.ts` with the new variant entry

**Forbidden extension patterns:**
- Overriding parent spacing via the variant
- Adding a new color that bypasses the token system via the variant
- Creating a variant that violates the parent component's CTA limit
- Creating so many variants that the component becomes a catch-all
