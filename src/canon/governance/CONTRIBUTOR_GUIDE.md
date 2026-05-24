# External Contributor Guide
## Personal State OS — Onboarding for New Designers and Engineers

> If you're new to this codebase, this document is your starting point.
> Before writing a single line of code or a single component,
> read this guide. It will save you hours of revision.
> This product has strong opinions about how it works.
> They are documented here.

---

## 1. What This Product Is

A **Personal State OS** — a calm, intelligent mobile application that helps
users understand and manage their physiological state.

Core user actions:
- Check their current state (energy, sleep, recovery, readiness)
- Scan food to understand how it aligns with their goals
- Review predictions and recommendations for today
- Log physiological data points

Core product qualities:
- **Calm** — never alarming, never reactive
- **Intelligent** — inference without announcement
- **Precise** — specific language, no vagueness
- **Adaptive** — interface responds to user's biological state
- **Premium** — quality felt, not displayed

---

## 2. The Design System

The product uses a custom design system in `src/design/`.

### What You Must Use

| System               | Location                  | Purpose                                 |
|----------------------|---------------------------|-----------------------------------------|
| Design tokens        | `src/design/tokens/`      | Spacing, typography, colors, motion     |
| Typography scale     | `src/design/typography/`  | Text sizing and hierarchy               |
| Motion presets       | `src/design/motion/`      | Animation curves and durations          |
| Component primitives | `src/design/primitives/`  | Surface, Text                           |
| Layout components    | `src/design/layout/`      | ContentBlock, SectionSpacing, GroupBlock|
| Adaptive layer       | `src/design/adaptive/`    | State-aware experience system           |
| Design components    | `src/design/components/`  | Reusable premium primitives             |

### What You Must Never Do

- Add arbitrary spacing values (e.g., `mt-7`, `p-3.5`, `gap-[13px]`)
- Add custom colors not in the token system
- Add custom font sizes outside the typographic scale
- Create animations outside the motion preset system
- Add Tailwind utility classes that bypass design tokens

---

## 3. Visual Grammar Quick Reference

### Spacing

Use only: `4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px`
(`spacing[1]` through `spacing[24]` in the token system)

### Typography Levels

| Level     | Use For                              |
|-----------|--------------------------------------|
| display   | Hero metrics (state numbers)         |
| hero      | Primary section titles               |
| title     | Card titles, screen headings         |
| section   | Section group headers                |
| body      | Primary content text                 |
| secondary | Supporting information               |
| caption   | Metadata, labels, timestamps         |
| micro     | Status indicators, tags, micro-copy  |

### State Colors

Never introduce new colors. Use only:
- `recovery` — calm green
- `readiness` — calm blue
- `warning` — warm amber (never red for warnings)
- `improving` — recovery variant
- `declining` — muted rose (never alarm red)
- `neutral` — near-gray

### Motion

Never write custom `transition` or `animation` CSS.
Use Framer Motion with the canonical motion presets from `src/design/motion/`.

---

## 4. Component Philosophy

Before building a new component:

1. **Check `src/design/components/`** — does something close exist?
2. **Check `src/components/`** — does a product component fit?
3. **Can an existing component be extended with a new variant?**
4. **Only if no existing pattern fits** → follow `COMPONENT_CERTIFICATION.md`

Components in this product are:
- **Purposeful**: they solve a specific, defined problem
- **Constrained**: they have documented limits (see `CANONICAL_COMPONENTS.md`)
- **Named semantically**: name reflects purpose, not appearance
- **Token-compliant**: they use only design system tokens

---

## 5. Interaction Philosophy

### DO

- Use single-tap as the primary interaction
- Use swipe-to-dismiss for sheets and drawers
- Use `useAdaptiveExperience()` to read the current adaptive state
- Suppress secondary actions in low-readiness states
- Apply `AdaptiveSurfaceLayer` to state-sensitive backgrounds

### DO NOT

- Auto-play any media
- Use push notifications within the user's first session
- Add haptic feedback for non-critical events
- Create modals triggered by system events (only user intent)
- Add animations for decoration

---

## 6. Writing Copy

**Read `content/CONTENT_TONE.md` before writing any user-facing text.**

Quick rules:
- Tone: composed, concise, intelligent, calm, precise
- Never: wellness clichés, motivational language, AI hype, fake empathy
- CTA: verb-first, max 3 words for primary, no exclamation marks
- Numbers: integers for scores, specific values (no "approximately")
- Negative states: observational language, never alarm

---

## 7. Adaptive Experience Integration

When building a new component that may appear on the Home screen:

```tsx
import { useAdaptiveExperience } from '@/design/adaptive';

function MyComponent() {
  const {
    focusModeActive,
    showSection,
    filterPredictions,
    secondaryOpacity,
  } = useAdaptiveExperience();

  // Respect density limits
  // Suppress in low-state when appropriate
  // Never hard-code content counts
}
```

**All content counts must come from the adaptive profile — never hardcoded.**

---

## 8. Before You Ship

Run through `governance/FEATURE_CHECKLIST.md` for every new feature.
Run through `governance/COMPONENT_CERTIFICATION.md` for every new component.

For anything touching the scanner: run `accessibility/SCANNER_PROTECTION.md` checklist.

---

## 9. Code Organization

```
src/
├── canon/          ← Product governance (READ FIRST)
├── core/           ← Business logic, state, services
│   ├── domain/     ← Domain models
│   ├── store/      ← Zustand state management
│   ├── hooks/      ← Shared business hooks
│   └── services/   ← External service integrations
├── design/         ← Design system (tokens, components, adaptive)
├── components/     ← Product-level components
│   ├── home/       ← Home screen cards
│   ├── state/      ← State-related components
│   └── ui/         ← Shadcn/Radix primitives (do not modify)
├── pages/          ← Route-level components
├── hooks/          ← Cross-cutting UI hooks
└── types/          ← Shared TypeScript types
```

**`components/ui/` is a vendor layer.** Do not modify it directly.
Build in `components/` or `design/components/` instead.
