# UX Constitution
## Personal State OS — Law of the Interface

> This document governs all interaction, hierarchy, spacing, CTA,
> and card decisions in the product.
> When in doubt, consult this document.
> When this document conflicts with a feature request, this document wins.

---

## Article I — Permitted Interactions

### 1.1 — Interactions that are always permitted

- Single-tap to navigate to a detail view
- Swipe-to-dismiss for sheets and drawers
- Pull-to-refresh on data surfaces
- Tap-to-expand for collapsed secondary information
- Long-press for contextual actions (when clearly afforded)
- Scroll to reveal additional content below the fold
- Single toggle to switch between views or states

### 1.2 — Interactions that require explicit justification

- Multi-step flows (must be justified by data complexity)
- Modal interruptions (must be triggered by user intent, not system events)
- Swipe gestures beyond dismiss (must have visible affordance)
- Inline editing (must not disrupt surrounding content)
- Drag-and-drop (only for explicit user organization tasks)

### 1.3 — Interactions that are never permitted

- Auto-playing audio or video
- Haptic feedback for non-critical events
- Push notification prompts within the first session
- Interrupting a user mid-task with promotions
- Hiding primary navigation behind a gesture
- Requiring multi-tap to access core functionality

---

## Article II — Hierarchy Rules

### 2.1 — Screen Hierarchy (mandatory)

Every screen must have exactly this hierarchy:

```
Level 1 (Hero):    One primary signal or action             — always visible
Level 2 (Support): Contextual information supporting Level 1 — below fold allowed
Level 3 (Context): Background information and secondary data — collapsed by default
Level 4 (System):  Navigation, status, settings              — persistent chrome
```

### 2.2 — Hierarchy Enforcement

- Only one element may occupy Level 1 at any time
- Level 2 elements may not have the same visual weight as Level 1
- Level 3 elements must be visually quieter than Level 2
- Hierarchy must not be overridden by feature priority requests

### 2.3 — Hierarchy in Adaptive States

| Adaptive State | Level 1        | Level 2           | Level 3      |
|----------------|----------------|-------------------|--------------|
| depleted       | State hero     | One recommendation | Hidden       |
| fragile        | State hero     | One insight        | Hidden       |
| overloaded     | State hero     | One priority       | Hidden       |
| recovering     | State hero     | Two recommendations| Accessible   |
| stable         | State hero     | Full feed          | Accessible   |
| focused        | State hero     | Full feed          | Accessible   |
| optimized      | State hero     | Rich feed          | Accessible   |

---

## Article III — Spacing Rules

### 3.1 — Canonical Spacing Values

Spacing must only use values from the design token spacing scale:

```
4px   — micro gaps (icon-to-label, badge padding)
8px   — tight spacing (within-component, dense lists)
12px  — compact spacing (card internal, tight groups)
16px  — standard spacing (default component padding)
20px  — comfortable spacing (section elements)
24px  — section spacing (between related groups)
32px  — section gap (between unrelated sections)
40px  — large section gap (major divisions)
48px  — generous spacing (hero areas)
64px  — spacious (full-bleed section margins)
```

### 3.2 — Spacing Anti-patterns

- No arbitrary spacing values (e.g., `p-3.5`, `mt-7`, `gap-[13px]`)
- No negative margins to compensate for wrong spacing upstream
- No spacing that collapses on small screens without intent

### 3.3 — Adaptive Spacing Multipliers

When the adaptive state is `spacious`, multiply section gaps by 1.15–1.25.
Never multiply internal card spacing — only between-section gaps.

---

## Article IV — CTA Rules

### 4.1 — CTA Hierarchy

Every screen may contain:
- **Maximum 1** primary CTA (high visual weight)
- **Maximum 2** secondary CTAs (medium visual weight, only when state allows)
- **Unlimited** tertiary actions (text links, icon buttons, no fill)

### 4.2 — CTA Appearance Rules

| CTA Type    | Appearance              | When to Use                    |
|-------------|-------------------------|--------------------------------|
| Primary     | Filled, brand accent    | The single most important next action |
| Secondary   | Outlined or ghost       | Alternative or supporting action |
| Tertiary    | Text only or icon       | Navigation, reference, low-stakes |
| Destructive | Filled red/warning      | Permanent data deletion only   |

### 4.3 — CTA Copy Rules

- Maximum **3 words** for primary CTA labels
- Must be **verb-first**: "Scan now", "View details", "Add to plan"
- Must not contain: exclamation marks, ellipsis in primary CTAs, "Click"
- Must not be generic: "OK", "Submit", "Continue" without context
- Must describe the outcome, not the mechanism

### 4.4 — CTA Suppression by State

| Adaptive State    | Competing CTAs | Urgency Badges | Impact Chips |
|-------------------|----------------|----------------|--------------|
| depleted          | Forbidden       | Hidden         | Hidden       |
| fragile           | Forbidden       | Hidden         | Hidden       |
| overloaded        | Forbidden       | Shown          | Hidden       |
| recovering        | Forbidden       | Shown          | Shown        |
| stable            | Allowed (max 2) | Shown          | Shown        |
| focused           | Allowed (max 2) | Shown          | Shown        |
| optimized         | Allowed (max 3) | Shown          | Shown        |

---

## Article V — Card Rules

### 5.1 — Card Anatomy

Every card must follow this structure:

```
┌─────────────────────────────────────┐
│ [Optional: state indicator pill]    │  ← max 1 pill per card
│                                     │
│ Primary label                       │  ← max 1 line
│ Secondary context                   │  ← max 2 lines
│                                     │
│ [Optional: metric / value display]  │  ← max 1 primary metric
│                                     │
│ [Optional: CTA]                     │  ← max 1 CTA per card
└─────────────────────────────────────┘
```

### 5.2 — Card Density Rules

- Maximum **1 primary metric** per card
- Maximum **2 supporting metrics** per card
- Maximum **1 CTA** per card
- Maximum **1 status indicator** per card
- Card body text: maximum **3 lines** before truncation or collapse
- Card title: maximum **1 line** (truncate with ellipsis if needed)

### 5.3 — Card Hierarchy Rules

- **Hero card**: Full width, prominent spacing, single per view
- **Feature card**: Full width, standard padding, supports feed context
- **List card**: Full width, compact padding, used in repeated lists
- **Compact card**: Partial width or pill-style, high-density contexts only

### 5.4 — Card Anti-patterns

- No card with more than one primary CTA
- No card with more than 3 competing visual elements
- No cards inside cards (nested card pattern is forbidden)
- No cards with decorative images unrelated to content
- No cards that auto-expand or animate without user intent

---

## Article VI — Navigation Rules

### 6.1 — Primary Navigation

- Maximum **5 tabs** in bottom navigation
- Active state must be clearly distinguished from inactive
- Navigation labels must be **1 word** maximum
- Navigation icons must be from the canonical icon set (lucide-react)

### 6.2 — Navigation Hierarchy

- Bottom nav is for primary destinations only
- Secondary destinations use in-page navigation or contextual links
- Deep navigation (3+ levels) must use a sheet or drawer pattern
- Back navigation must always be available in any drill-down

### 6.3 — Navigation Anti-patterns

- No hamburger menus
- No floating action buttons competing with bottom nav
- No navigation that changes position between screens
- No hidden navigation patterns
