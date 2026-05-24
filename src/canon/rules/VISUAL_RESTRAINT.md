# Visual Restraint Rules
## Personal State OS — Visual Discipline

> Visual restraint is not minimalism.
> It is the precision use of every visual element.
> Nothing is decorative unless it is also functional.
> Nothing is loud unless it is also critical.

---

## 1. Color Discipline

### Permitted

- Neutral backgrounds (system background, surface, card)
- Semantic state colors at muted saturation (HSL values from token system)
- Brand accent used sparingly: primary actions, active states, key indicators
- Adaptive tinting at low opacity (≤ 8% of base color)

### Forbidden

- Oversaturated UI colors (`saturation > 70` for large surfaces)
- Multiple competing accent colors on the same screen
- Color as the only differentiator between states (accessibility violation)
- Decorative color gradients on surfaces or backgrounds
- Dark-mode neon or glow effects
- Color changes to communicate urgency (use copy instead)

### Semantic Color Rules

State colors are only used to communicate physiological state.
They are **never** used for decoration or branding purposes.

```
Recovery  → HSL(158, 50%, 42%) — calm green, muted
Readiness → HSL(200, 48%, 45%) — calm blue, muted
Warning   → HSL(36, 60%, 48%)  — warm amber, NOT red, NOT orange
Improving → HSL(158, 45%, 44%) — variant of recovery
Declining → HSL(348, 45%, 50%) — muted rose, NOT alarm red
Neutral   → HSL(220, 8%, 52%)  — near-gray, no hue dominance
```

---

## 2. Surface Discipline

### Permitted

- Flat surfaces with subtle elevation (shadow scale: 0–4)
- Light neutral tinting for surface differentiation
- Glass morphism only when it communicates depth with purpose

### Forbidden

- Glowing surfaces
- Animated gradients on surfaces
- High-contrast surface stacking (more than 3 elevation levels visible simultaneously)
- Floating elements with excessive shadow
- Blur effects for decoration (only for modal overlays)

---

## 3. Typography Discipline

### Permitted

- 7-level type scale: display, hero, title, section, body, secondary, caption, micro
- Weight variation: 400 (body), 500 (emphasis), 600 (section/title), 700 (hero/display)
- Responsive fluid sizing via `clamp()` for display-level text

### Forbidden

- More than 3 type sizes visible simultaneously in a single component
- Bold text used for decoration (only for semantic emphasis)
- Italic text in UI elements (only in quoted content)
- All-caps beyond micro/caption level
- Font size below 11px (micro) for any user-facing content
- Custom fonts outside the defined font families

---

## 4. Motion Discipline

### Permitted

- Entrance animations: fade-in-up with subtle translate (design token presets)
- Exit animations: fade-out, shrink, or slide-out
- Stagger animations for lists (delay: 40–100ms per item)
- Transition animations between states (duration: 250–600ms)
- Motion that communicates state changes

### Forbidden

- **Animation overload**: more than 3 simultaneous animations
- **Looping animations** on content that is already visible
- **Bounce/spring** animations that feel playful or gamified
- **Animations on text** (no typewriter effects, no text shimmer)
- **Motion as decoration**: any animation that serves no communication purpose
- **Rapid animations** on depleted/fragile states (durationScale must be honored)

### Motion Scale Compliance

All motion must use the design token motion system:
- `instant` (80ms) — micro-interactions
- `fast` (150ms) — quick responses
- `base` (250ms) — standard transitions
- `slow` (400ms) — thoughtful transitions
- `calm` (600ms) — spacious, peaceful transitions

---

## 5. Icon Discipline

### Permitted

- Icons from `lucide-react` only (canonical icon set)
- Size: 14px (compact), 16px (default), 20px (prominent), 24px (featured)
- Stroke width: consistent per size tier

### Forbidden

- Custom inline SVG icons that could be replaced by lucide icons
- Filled icon variants mixed with stroke variants in the same view
- Decorative icons (icons that serve no semantic purpose)
- Icons without accessible labels
- Icon overload: more than 5 distinct icons in a single card

---

## 6. Elevation Discipline

### Permitted

| Level | Shadow                              | Use Case                    |
|-------|-------------------------------------|-----------------------------|
| 0     | none                                | Flat surfaces, backgrounds  |
| 1     | `0 1px 2px rgba(0,0,0,0.04)`        | Subtle card separation      |
| 2     | `0 2px 8px rgba(0,0,0,0.06)`        | Cards, interactive elements |
| 3     | `0 4px 16px rgba(0,0,0,0.08)`       | Sheets, overlays            |
| 4     | `0 8px 32px rgba(0,0,0,0.10)`       | Modals, full-screen overlays|

### Forbidden

- Custom shadow values outside the elevation scale
- Multiple elevation levels in a single component
- Drop shadows used for decoration
- Elevation stacking beyond 3 visible levels simultaneously

---

## 7. Density Discipline

### Forbidden Surface Patterns

- **Dashboard clutter**: more than 5 data points visible above the fold
- **Floating chaos**: elements that visually compete without hierarchy
- **Oversaturated UI**: multiple accent colors simultaneously
- **Busy backgrounds**: pattern, noise, or texture on primary surfaces
- **Badge overload**: more than 2 badges visible simultaneously on any screen

### Required

- Sufficient whitespace around primary content (min 24px horizontal margin)
- Clear visual breathing room between sections (min 24px)
- Consistent grid alignment (no orphaned or misaligned elements)
