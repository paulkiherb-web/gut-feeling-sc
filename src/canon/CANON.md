# Product Canonization Layer
## Personal State OS — Single Source of Product Truth

> This is not a redesign.
> This is not a new UI.
>
> This is the **operational design governance system** that ensures
> the product never degrades, new developers never break UX,
> future designers understand the product grammar,
> and every new feature automatically remains coherent.

---

## What This Is

The `canon/` directory is the **single authoritative reference** for all
design, content, interaction, and architecture decisions in this product.

It encodes:
- **Why** the product looks and behaves the way it does
- **What** is permitted and what is forbidden
- **How** new features must be evaluated before shipping
- **Where** the product cannot compromise

All contributors — engineers, designers, product managers — are expected
to read the relevant canon documents before making significant changes.

---

## Architecture

```
src/canon/
│
├── CANON.md                          ← This file. Start here.
├── index.ts                          ← Barrel export (programmatic access)
│
├── principles/                       ← WHY this product is designed this way
│   ├── PRODUCT_PRINCIPLES.md         ← 8 core product principles
│   ├── productPrinciples.ts          ← Machine-readable principle manifest
│   └── index.ts
│
├── rules/                            ← WHAT is permitted and forbidden
│   ├── UX_CONSTITUTION.md            ← Law of the interface
│   ├── VISUAL_RESTRAINT.md           ← Visual discipline rules
│   ├── uxConstitution.ts             ← Machine-readable rule set
│   └── index.ts
│
├── patterns/                         ← HOW components behave
│   ├── CANONICAL_COMPONENTS.md       ← Component grammar
│   ├── componentRules.ts             ← Typed component constraints
│   └── index.ts
│
├── layout/                           ← Information density governance
│   ├── INFORMATION_DENSITY.md        ← What fits on screen and when
│   ├── densityRules.ts               ← Numeric density constants
│   └── index.ts
│
├── content/                          ← Language and tone governance
│   ├── CONTENT_TONE.md               ← Voice, register, forbidden patterns
│   ├── tonePrinciples.ts             ← Machine-readable tone rules
│   └── index.ts
│
├── states/                           ← State communication grammar
│   ├── STATE_COMMUNICATION.md        ← How each state is communicated
│   ├── stateCommunication.ts         ← State-to-presentation mapping
│   └── index.ts
│
├── accessibility/                    ← Protected experiences
│   ├── SCANNER_PROTECTION.md         ← Scanner UX constitution
│   ├── scannerProtection.ts          ← Scanner rules (machine-readable)
│   └── index.ts
│
└── governance/                       ← Process and anti-drift
    ├── DESIGN_DECISION_MATRIX.md     ← IF/THEN decision framework
    ├── ADAPTIVE_GOVERNANCE.md        ← Adaptive layer rules
    ├── CONTRIBUTOR_GUIDE.md          ← Onboarding for new contributors
    ├── FEATURE_CHECKLIST.md          ← Pre-ship checklist
    ├── COMPONENT_CERTIFICATION.md    ← How new components are approved
    ├── ANTI_DRIFT.md                 ← Consistency and drift prevention
    ├── decisionMatrix.ts             ← Machine-readable decision rules
    └── index.ts
```

---

## Quick Navigation

| I want to...                              | Go to                                     |
|-------------------------------------------|-------------------------------------------|
| Understand why this product looks calm    | `principles/PRODUCT_PRINCIPLES.md`        |
| Know what I can and cannot build          | `rules/UX_CONSTITUTION.md`                |
| Build a new component correctly           | `patterns/CANONICAL_COMPONENTS.md`        |
| Know how much info to show on screen      | `layout/INFORMATION_DENSITY.md`           |
| Write copy for a feature                  | `content/CONTENT_TONE.md`                 |
| Handle a new UI state                     | `states/STATE_COMMUNICATION.md`           |
| Understand how adaptation works           | `governance/ADAPTIVE_GOVERNANCE.md`       |
| Onboard as a new contributor              | `governance/CONTRIBUTOR_GUIDE.md`         |
| Ship a new feature                        | `governance/FEATURE_CHECKLIST.md`         |
| Create a new component                    | `governance/COMPONENT_CERTIFICATION.md`   |
| Audit the product for design drift        | `governance/ANTI_DRIFT.md`                |
| Understand scanner rules                  | `accessibility/SCANNER_PROTECTION.md`     |
| Make an adaptive interface decision       | `governance/DESIGN_DECISION_MATRIX.md`    |

---

## Product Identity (One Sentence)

> A calm, intelligent Personal State OS that helps the user understand and
> manage their physiological state — without alarm, without gamification,
> without noise.

---

## Core Invariants

These never change. No feature overrides them.

1. **The interface must never alarm the user unnecessarily.**
2. **The scanner experience must always be fast, clean, and singular.**
3. **Information density must always adapt to the user's current state.**
4. **Tone must always be composed, precise, and intelligent.**
5. **No feature can compete with the primary state signal.**
6. **The adaptive layer must never feel like a UI glitch.**
7. **Every CTA must be deserved — not volume-maximized.**
8. **Visual identity must remain editorially restrained at all times.**
