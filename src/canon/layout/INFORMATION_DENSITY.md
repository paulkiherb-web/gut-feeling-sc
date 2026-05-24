# Information Density Rules
## Personal State OS — What Fits on Screen and When

> The screen is not a dashboard.
> It is a surface that shows the right amount of information
> for this user, at this moment, in this state.
> Density is not fixed — it is adaptive.

---

## 1. Core Density Principle

**No screen should require the user to process more information
than they are currently capable of absorbing.**

This is not a subjective preference. It is calibrated to the user's
physiological state via the Adaptive Experience Layer.

When the user is depleted, the screen shows almost nothing.
When the user is optimized, the screen shows rich context.
In between, density scales proportionally.

---

## 2. Maximum Simultaneous Priorities

A "priority" is any element that claims the user's attention.

| Context                | Maximum Priorities |
|------------------------|--------------------|
| Above the fold (hero)  | 1                  |
| Above the fold (total) | 3                  |
| Full screen (standard) | 5                  |
| Full screen (rich)     | 7                  |

**Rule:** If a screen has more than 3 elements claiming attention above the fold,
it violates the density constitution. This must be resolved before shipping.

---

## 3. Maximum Cards Above Fold

| Adaptive State | Max Cards Above Fold |
|----------------|----------------------|
| depleted       | 1                    |
| fragile        | 1                    |
| overloaded     | 1                    |
| recovering     | 2                    |
| stable         | 2–3                  |
| focused        | 3                    |
| optimized      | 3                    |

"Above fold" is defined as the visible viewport without scrolling on a
375px-wide, 812px-tall reference device (iPhone 14-class).

---

## 4. Maximum Content Per Section

| Content Type            | Standard | Reduced | Minimal |
|-------------------------|----------|---------|---------|
| Recommendations         | 3        | 2       | 1       |
| Insights                | 4–5      | 2       | 1       |
| Predictions             | 2–3      | 1–2     | 1       |
| List items visible      | 4        | 3       | 2       |
| Secondary cards visible | 4        | 2       | 0       |

---

## 5. Typography Hierarchy Limits

A single screen must not use more than **4 type levels simultaneously**.
The canonical ordering (from most to least prominent):

```
hero     → maximum 1 instance per screen
title    → maximum 2 instances per screen
section  → maximum 5 instances per screen (one per section header)
body     → no limit (primary content)
secondary→ no limit (supporting content)
caption  → no limit (metadata, labels)
micro    → no limit (system/status indicators)
```

**Forbidden:** Using display-level typography (clamp 32–40px) for anything
other than the primary state number or hero metric.

---

## 6. Spacing Minimums

These values may not be reduced, regardless of density constraints.
Density is reduced by removing content, not by compressing spacing.

| Context                     | Minimum Spacing |
|-----------------------------|-----------------|
| Horizontal screen margin    | 16px (24px preferred) |
| Between cards               | 12px            |
| Between sections            | 24px (spacious: 32px) |
| Card internal padding       | 16px            |
| Between section header and content | 8px      |
| Bottom nav clearance        | 20px            |

**Rule:** Spacing is never the solution to an overcrowded screen.
Remove content, not breathing room.

---

## 7. Data Point Density Limits

A single card may not contain more than:

| Data Type              | Maximum Per Card |
|------------------------|------------------|
| Numeric metrics        | 3                |
| Text paragraphs        | 2                |
| Icon-label pairs       | 4                |
| Action links           | 2                |
| Visual charts/graphs   | 1                |
| Progress bars          | 2                |

A single screen may not contain more than:

| Data Type              | Maximum Per Screen |
|------------------------|--------------------|
| Charts/graphs visible  | 2 (adaptive max)   |
| Progress bars visible  | 3                  |
| Numeric metrics total  | 8 (standard state) |

---

## 8. Density by Adaptive State

These are the enforceable density profiles from the Adaptive Experience Layer:

| State      | Level    | Max Recommendations | Max Insights | Max Predictions | Secondary Cards |
|------------|----------|---------------------|--------------|-----------------|-----------------|
| depleted   | minimal  | 1                   | 1            | 1               | Hidden          |
| fragile    | reduced  | 1                   | 2            | 1               | Hidden          |
| overloaded | minimal  | 1                   | 1            | 2               | Hidden          |
| recovering | reduced  | 2                   | 2            | 2               | Shown           |
| stable     | standard | 3                   | 4            | 2               | Shown           |
| focused    | standard | 3                   | 5            | 3               | Shown           |
| optimized  | rich     | 4                   | 6            | 3               | Shown           |

---

## 9. Density Anti-patterns

### Forbidden
- **Above-fold density creep**: adding "just one more card" above the fold
- **Section explosion**: more than 5 named sections on a single scrollable screen
- **Metric hoarding**: showing all available data points without editorial filtering
- **Persistent low-state density**: fixing high density regardless of user state
- **Filler content**: placeholders, empty states, or "coming soon" taking screen space
- **Compressed spacing**: reducing gaps to fit more content (always remove content instead)

### Required
- **Editorial selection**: always choose the most important content, not all content
- **Progressive disclosure**: deep data behind drawers, sheets, or "see more" expansions
- **State-responsive rendering**: density must respond to the current adaptive state
