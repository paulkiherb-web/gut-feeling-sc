# Scanner Protection — Canonical Experience
## Personal State OS — The Sacred Scan Surface

> The scanner is the most direct, highest-intent surface in the product.
> The user picks up their phone to scan something.
> That is the only thing that should happen.
>
> Every distraction, every analytics overlay, every upsell,
> every ambient content injection is a violation of this surface.

---

## 1. Scanner UX Constitution

The scanner experience is a **protected, canonical surface**.
It has one purpose: fast, clear, accurate food scanning.

**This is absolute.** No feature may compromise scanner clarity.

### What the Scanner IS

- A fast, frictionless capture surface
- A clear verdict display (green / yellow / red)
- A focused, goal-aware contextual note
- A single, clear next action

### What the Scanner is NOT

- A dashboard
- An analytics surface
- A content feed
- A recommendation engine
- A upsell opportunity
- A tutorial surface

---

## 2. Scanner Display Rules

### Verdict Display

| Verdict | Label                  | Color               | Copy Style    |
|---------|------------------------|---------------------|---------------|
| green   | Goal-aligned label     | HSL(158, 50%, 42%)  | Concise       |
| yellow  | Contextual caution     | HSL(36, 60%, 48%)   | Specific      |
| red     | Clear alternative path | HSL(348, 45%, 50%)  | Direct        |

**Rules:**
- Verdict must be visible within 400ms of scan result arriving
- Verdict color must not animate or pulse
- Verdict text must be maximum 2 lines
- Supporting context maximum 3 lines

### Contextual Prompt

The scanner shows ONE contextual prompt tied to the user's goal.
The prompt must:
- Be specific to the scanned item
- Reference the user's actual current goal
- Offer a clear single action
- Be written in calm, precise language

The prompt must NOT:
- Upsell premium features
- Show social proof ("90% of users love this!")
- Compare the user to others
- Use gamification language ("Earn points!")
- Show unrelated recommendations

---

## 3. What Must NEVER Appear on the Scanner Surface

| Forbidden Element              | Reason                                       |
|--------------------------------|----------------------------------------------|
| Analytics dashboard overlay    | Breaks scanner focus                         |
| Multiple competing actions     | Cognitive overload at moment of intent       |
| Recommendation feed            | Irrelevant to scan intent                    |
| Progress bars or streaks       | Gamification on a clinical surface           |
| AI/ML feature labels           | Interrupts the result review moment          |
| In-screen notifications        | Disrupts the verdict review                  |
| Promotional banners            | Violates intent purity                       |
| State adaptation complexity    | Scanner must remain visually stable          |
| Auto-play educational content  | Never auto-interrupt the scan result         |
| More than 2 CTAs               | Maximum: one primary + one secondary         |

---

## 4. Scanner Information Architecture

```
┌─────────────────────────────────────────────────┐
│  [Back / Close]               [Bookmarks]        │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Scan viewfinder / image preview]               │
│                                                  │
├─────────────────────────────────────────────────┤
│  [Verdict pill — green/yellow/red]               │
│  [Item name — 1 line]                            │
│  [Contextual note — max 2 lines]                 │
│                                                  │
│  [Goal-aware prompt — max 3 lines]               │
│                                                  │
│  [Primary CTA — 1 only]                          │
│  [Secondary CTA — optional, text only]           │
└─────────────────────────────────────────────────┘
```

### What Must Never Be Added to This Architecture

- Additional cards or sections below the CTA
- Analytics breakdowns
- Nutritional deep-dives (accessible via secondary CTA only)
- Feature discovery banners
- State-adaptive content injections
- Suggestions for other features

---

## 5. Scanner Analytics Rules

Analytics data from scanner interactions is collected silently.
It must NEVER be surfaced back to the user on the scanner screen.

Analytics belong in:
- The History page
- The Health profile
- The Day mode summary

Scanner analytics must NEVER appear as:
- Post-scan summaries on the scanner surface
- "Your scan history" on the verdict screen
- Score overlays on the camera viewfinder
- Pattern recognition prompts during scanning

---

## 6. Scanner Performance Standards

| Metric                      | Requirement                   |
|-----------------------------|-------------------------------|
| Camera activation           | < 300ms after tap              |
| Scan result display         | < 400ms after capture          |
| Verdict color render        | Immediate with result          |
| Navigation back             | Instant (< 150ms)              |
| File upload alternative     | Always available               |

---

## 7. Scanner Noise Prohibition

"Scanner noise" is any element that is not directly related to
the current scan action and its immediate result.

### Zero-Tolerance Rules

1. **No scanner noise.** Zero exceptions.
2. **No onboarding prompts on the scanner surface.**
3. **No feature announcements via scanner screen.**
4. **No A/B testing of scanner layout without explicit canon review.**
5. **Any change to the scanner surface must pass the scanner constitution checklist.**

### Scanner Constitution Checklist (Required Before Any Scanner Change)

Before shipping any change to the scanner surface, answer:

- [ ] Does this change preserve single-purpose focus?
- [ ] Does this change avoid adding competing visual elements?
- [ ] Does this change avoid any form of analytics display?
- [ ] Does this change avoid gamification patterns?
- [ ] Does this change avoid motivational language?
- [ ] Does the CTA count remain ≤ 2 (one primary, one secondary)?
- [ ] Does the verdict remain the visually dominant element?
- [ ] Is the verdict visible within 400ms of result arrival?

**If any answer is "no" — the change is blocked.**
