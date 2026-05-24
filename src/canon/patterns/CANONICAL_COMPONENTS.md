# Canonical Component Rules
## Personal State OS — Component Grammar

> Every component in this product has a defined purpose, context, and limits.
> If you can achieve the same result with an existing component,
> you must use the existing component.
> Components are not created to satisfy feature requests — they are created
> to fill a gap that cannot be covered by existing patterns.

---

## 1. Cards

### Purpose
Cards are the primary container for discrete pieces of information
that have their own identity and context.

### When to Use
- Displaying a complete, self-contained insight, recommendation, or state signal
- Grouping related metrics that belong to a single topic
- Providing a navigable entry point to a detail view

### When NOT to Use
- For simple text paragraphs (use body text in a section)
- For single metrics that belong to a parent context (use inline metric display)
- For navigation items (use list items or buttons)
- Inside other cards (nested card pattern is forbidden)

### Constraints

| Property          | Limit                  |
|-------------------|------------------------|
| Primary metrics   | 1                      |
| Supporting metrics| 2                      |
| CTAs              | 1                      |
| Status indicators | 1 (pill)               |
| Title length      | 1 line max             |
| Body text         | 3 lines before collapse|
| Nesting           | Forbidden              |

### Variants

| Variant  | Width       | Padding       | Use Case                          |
|----------|-------------|---------------|-----------------------------------|
| Hero     | Full-width  | 24px all      | Primary state signal (1 per view) |
| Feature  | Full-width  | 20px all      | Feed items, insights              |
| List     | Full-width  | 16px all      | Dense lists, compact feeds        |
| Compact  | Flex/partial| 12px all      | Inline summaries, highlights      |

---

## 2. Pills

### Purpose
Pills communicate a singular attribute, status, or category label.
They are read-only semantic indicators — not interactive by default.

### When to Use
- State labels (recovery, readiness, warning, etc.)
- Category tags on cards
- Impact level indicators
- Time context labels ("Today", "This week")

### When NOT to Use
- As navigation tabs (use a tab component)
- As primary CTAs (use buttons)
- For more than 3 pills on a single card
- For text longer than 2–3 words

### Constraints

| Property     | Limit           |
|--------------|-----------------|
| Text length  | 3 words max     |
| Per card     | 1 max (hero context), 2 max (feature context) |
| Variants     | Default, state-colored, subtle |
| Interaction  | None by default; tap-to-filter only when part of a filter group |

---

## 3. State Indicators

### Purpose
State indicators visually communicate the current physiological
or performance state using the canonical state color system.

### When to Use
- On the hero card to communicate current state
- In list items when state contrast is needed
- As a leading element in cards that are state-derived

### When NOT to Use
- For decoration (all state indicators must communicate real data)
- Multiple state indicators on the same component
- Without a corresponding text label (accessibility)

### Constraints

| Property          | Rule                                              |
|-------------------|---------------------------------------------------|
| Color system      | Only canonical `stateColors` tokens               |
| Saturation        | Never exceed `s: 60` for large surfaces           |
| Icons allowed     | Yes, from lucide-react, stroke-only               |
| Animation         | Subtle pulse only for active/critical states      |
| Animated states   | Only `warning` level and above, never decorative  |

---

## 4. Buttons

### Purpose
Buttons are interaction triggers for the user's primary and secondary actions.

### When to Use
- Any user action that triggers a navigation or data mutation
- Primary CTA at the bottom of a form or decision screen
- Secondary actions in card footers

### When NOT to Use
- For navigation that feels more like a link (use text link + arrow)
- Inside cards unless it is the single CTA for that card
- As visual separators or section dividers

### Constraints

| Property           | Primary          | Secondary        | Tertiary         |
|--------------------|------------------|------------------|------------------|
| Label word count   | 1–3 words        | 1–4 words        | 1–5 words        |
| Must be verb-first | Yes              | Yes              | Recommended      |
| Per screen max     | 1                | 2                | Unlimited        |
| Min touch target   | 44×44px          | 44×44px          | 44×44px          |
| Width              | Full or auto     | Auto             | Auto             |

---

## 5. Lists

### Purpose
Lists display ordered or unordered collections of related items
at a consistent visual weight.

### When to Use
- Showing multiple recommendations at the same priority level
- Displaying options for a selection
- Enumerating items in an educational or informational context

### When NOT to Use
- When items have different priority levels (use cards with hierarchy)
- When the list has only 1 item (use a card or inline text)
- When items require individual CTAs (use cards instead)

### Constraints

| Property              | Limit                         |
|-----------------------|-------------------------------|
| Items above fold      | Adaptive (see density rules)  |
| Text per item         | 2 lines max                   |
| Secondary text        | 1 line max                    |
| Trailing action       | 1 icon per item max           |
| Item min height       | 44px (touch target)           |

---

## 6. Sections

### Purpose
Sections are named groupings of related content that share
a single semantic purpose on the screen.

### When to Use
- Grouping 2+ cards or items that share a theme
- Providing navigational context for a set of content
- Separating distinct purposes on a scrollable screen

### When NOT to Use
- For a single item (no orphan sections)
- Purely decoratively (section headers must be functional)
- When the content has no clear thematic relationship

### Constraints

| Property           | Rule                                        |
|--------------------|---------------------------------------------|
| Header type        | Section level typography only               |
| Per screen max     | 5 named sections max (adaptive)             |
| Minimum items      | 2 items per section                         |
| Action in header   | 1 max ("See all" or equivalent)             |
| Gap above section  | 32px min (token: spacing[8])                |

---

## 7. Adaptive Surfaces

### Purpose
Adaptive surfaces are background containers that receive adaptive
tinting and breathing adjustments based on the user's current state.

### When to Use
- As the background container for the Home screen
- As a containing surface for state-sensitive content

### When NOT to Use
- Inside cards (nested adaptive surfaces are forbidden)
- For decorative purposes
- With high-opacity tinting (max 8% background tint)

### Constraints

| Property            | Rule                                                 |
|---------------------|------------------------------------------------------|
| Max tint opacity    | 8% of semantic state color                           |
| Transitions         | Must use `calm` or `slow` motion tokens              |
| State-change animation | Max 600ms, no jarring layout shifts              |
| Card content inside | Must remain visually stable during tint transitions  |
| Nesting             | No adaptive surface inside adaptive surface          |
