# State Communication Rules
## Personal State OS — How Each State is Communicated

> States are physiological conditions, not emotional judgments.
> The interface communicates state as information, not as evaluation.
> The system never alarms, panics, or celebrates.
> It informs, calmly and precisely.

---

## 1. Core Principle

**Every UI state in this product is communicated through:**
1. A calm, precise label
2. A muted semantic color (from the canonical state color system)
3. Supporting context — never alarm or hype

**Never communicated through:**
- Loud colors or high-saturation alerts
- Alarm or panic language
- Celebratory animations or feedback
- Comparative language ("You're better than 80% of users")

---

## 2. State Communication Grammar

### Recovery State

| Situation            | Label                        | Color               | Tone          |
|----------------------|------------------------------|---------------------|---------------|
| Good recovery        | "Recovery: high"             | HSL(158, 50%, 42%)  | Neutral       |
| Average recovery     | "Recovery: moderate"         | HSL(220, 8%, 52%)   | Neutral       |
| Low recovery         | "Recovery lower than average"| HSL(36, 60%, 48%)   | Observational |
| Very low recovery    | "Recovery: significantly below range" | HSL(348, 45%, 50%) | Direct |

**Rules:**
- Warning state **never** uses red
- Warning state uses warm amber (`HSL(36, 60%, 48%)`)
- Declining state uses muted rose (`HSL(348, 45%, 50%)`) — NOT alarm red
- Never use "critical", "danger", "alarm" in recovery communication

---

### Readiness State

| Situation             | Label                           | Tone           |
|-----------------------|---------------------------------|----------------|
| High readiness (85+)  | "Readiness is high"             | Observational  |
| Good readiness (70-84)| "Readiness: within range"       | Neutral        |
| Moderate (55-69)      | "Readiness is moderate"         | Neutral        |
| Low readiness (<55)   | "Readiness below typical range" | Observational  |
| Very low (<30)        | "Readiness significantly reduced" | Direct       |

**Rules:**
- High readiness is never framed as "peak", "amazing", or "optimal" in copy
- Low readiness is never framed as "bad", "terrible", or "alarming"
- Scores are shown as integers only

---

### Prediction and Risk

| Risk Level  | Label Pattern                                | Color                  | Tone          |
|-------------|----------------------------------------------|------------------------|---------------|
| low         | "At current trajectory, no action needed."   | HSL(220, 8%, 52%)      | Informational |
| moderate    | "Consider [action] over the next [period]."  | HSL(36, 60%, 48%)      | Advising      |
| high        | "Elevated risk if current pattern continues."| HSL(348, 45%, 50%)     | Direct        |

**Rules:**
- Predictions are presented as observations, not warnings
- "Risk" is never framed as a threat — always as a probability
- Specific timeframes are always given when predictions are shown
- No escalating language for high risk ("URGENT", "ACT NOW")

---

### Trajectory State

| Direction  | Label               | Secondary Context                        |
|------------|---------------------|------------------------------------------|
| improving  | "Improving"         | "Over the last N days"                   |
| stable     | "Stable"            | "Within typical range"                   |
| declining  | "Declining"         | "Below average for the past N days"      |

**Rules:**
- "Improving" is not "Great news!" — it is a direction label
- "Declining" is not alarming — it is a factual observation
- Trajectory always shows a timeframe context

---

### Optimized State

| Situation    | Communication                                 |
|--------------|-----------------------------------------------|
| Peak state   | "Readiness is high. Full context available."  |
| High energy  | "Energy reserves support extended activity."  |

**Rules:**
- Optimized state **never** becomes gamified
- No badges, trophies, or achievement notifications for peak state
- No "streak" language
- No "personal record" framing
- Optimized state is information, not reward

---

## 3. State Color Usage Rules

State colors are used exclusively for physiological state communication.
They are never used for:
- Navigation highlights
- Promotional banners
- Decorative accents
- Brand expression

| State       | Color                    | Use Case                                  |
|-------------|--------------------------|-------------------------------------------|
| recovery    | HSL(158, 50%, 42%)       | Recovery metric indicators                |
| readiness   | HSL(200, 48%, 45%)       | Readiness metric indicators               |
| warning     | HSL(36, 60%, 48%)        | Moderate risk, below-threshold warnings   |
| improving   | HSL(158, 45%, 44%)       | Positive trajectory indicators            |
| declining   | HSL(348, 45%, 50%)       | Negative trajectory, elevated risk        |
| neutral     | HSL(220, 8%, 52%)        | Stable / baseline / no-signal             |

---

## 4. System State Communication

### Empty State (No Data Yet)
```
Label:    "No data yet."
Context:  "Start logging to see your state."
CTA:      "Log now" (single action)
Tone:     Neutral, no pressure
```

**Forbidden for empty state:**
- "Let's get started!" (motivational framing)
- "You haven't logged anything yet 😔" (fake empathy + emoji)
- Decorative illustrations suggesting "potential" or aspiration

### Error State
```
Label:    "Something went wrong."
Context:  "Could not load [specific data type]."
CTA:      "Try again" (single action)
Tone:     Matter-of-fact, no apology theater
```

### Loading State
```
Use:      Skeleton screens (no loading spinners on primary content)
Duration: If loading exceeds 1.5s, show skeleton
Tone:     No progress messages, no "Please wait..."
```

---

## 5. Forbidden State Communication Patterns

| Pattern                          | Why Forbidden                                  |
|----------------------------------|------------------------------------------------|
| "You're in danger zone!"         | Alarm language — never appropriate             |
| "Amazing — you hit your goal!"   | Gamification framing                           |
| Red for any recoverable situation| Creates unnecessary alarm                      |
| Progress bars for state scores   | Implies there is a "full bar" to achieve       |
| Percentage comparisons to others | Comparison creates unhealthy framing           |
| Unlocking states through streaks | Gamification of physiological data             |
