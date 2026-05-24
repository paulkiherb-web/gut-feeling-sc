# Legacy Cleanup Notes — Sprint 2

## Context

Sprint 2 goal: remove old "day / intensive / stack / protocol" entities from the
main user path without deleting files or breaking existing data contracts.

Central logic from Sprint 1:
> Course → day route → real life → gap → soft return

---

## What is KEPT (no changes)

| Entity | Location | Reason |
|---|---|---|
| Scanner | `src/pages/Scanner.tsx` | Core product, LLM analysis |
| Scanner result contract | `src/types/profile.ts ScanResult` | LLM/Lovable contract |
| `useLegacyBootstrap` | `src/core/hooks/useLegacyBootstrap.ts` | Migrates old scan records from localStorage |
| `useProfile` | `src/hooks/useProfile.ts` | Personal data + `greenred_profile` / `greenred_onboarded` keys |
| `ThemeContext` / `I18nContext` | `src/contexts/` | Visual theme + multilang |
| `History` | `src/pages/History.tsx` | Scan history |
| `HealthProfile` | `src/pages/HealthProfile.tsx` | Profile editor |
| `Assistant` | `src/pages/Assistant.tsx` | AI context helper |
| `Feed` | `src/pages/Feed.tsx` | Content feed |
| `Auth` / `Paywall` | `src/pages/Auth.tsx` etc. | Auth flow |
| `useDayReminders` | `src/hooks/useDayReminders.ts` | Notification system, only fires when `notificationsEnabled` |
| `src/components/day/*` | DailyStateCard, DailyHydrationCard etc. | Kept on disk, marked `@legacy`, available for future course integration |
| `src/pages/DayMode.tsx` | Physical file kept | Soft-hidden behind LegacyRedirect |
| `src/pages/Intensive.tsx` | Physical file kept | Soft-hidden behind LegacyRedirect |
| `GOALS` / `Goal` type | `src/types/profile.ts` | Used by Onboarding + profile sync |

---

## What is DISABLED from the main user path

| Entity | How disabled |
|---|---|
| Route `/day` | Replaced with `<LegacyRedirect />` |
| Route `/health` | Replaced with `<LegacyRedirect />` |
| Route `/intensive` | Replaced with `<LegacyRedirect />` |
| BottomNav tab → `/intensive` | Removed tab; replaced with a Profile tab in main tabs |
| BottomNav "More" → `/day` | Removed from more-items list |
| `Onboarding` redirect to `/intensive` | Changed to `/home` |
| Hardcoded RU-only strings in Home scan CTA | Replaced with `t('home.scan.cta')` / `t('home.scan.sub')` |
| Inline `lang ===` check for secondary label | Replaced with `t('home.secondary.label')` |

---

## What is MOVED / ADAPTED into Course

| Old entity | New home | Notes |
|---|---|---|
| Onboarding `goal` field | Maps to `CourseKey` via `GOAL_TO_COURSE_MAP` | User can change course inside app |
| Protocol/stack suggestions | `buildCourseProtocol.ts` | Returns morning/day/evening/sleep suggestions per course; no supplement dominance |

---

## What was NOT touched intentionally

- Any Supabase migration file
- `src/integrations/supabase/`
- `src/pages/Scanner.tsx`
- `src/core/capture/` (LLM pipeline)
- `src/core/store/types/events.ts` (DomainEvent contracts)
- `src/hooks/useProfile.ts` localStorage keys (`greenred_profile`, `greenred_onboarded`)
- `src/components/day/*` files (kept on disk, marked `@legacy`, not rendered in main path)
- `src/pages/DayMode.tsx` and `src/pages/Intensive.tsx` (kept on disk)
- `useDayReminders` PLAN array (kept; fires only on user opt-in via `notificationsEnabled`)
- `ThemeContext` (visual theme settings)
- `I18nContext` (multilingual support)

---

## Sprint 2 additions

- `PROFILE_STORAGE_KEY` and `PROFILE_ONBOARDED_KEY` exported from `useProfile.ts` (testability)
- `src/test/sprint2-cleanup.test.tsx` — 20 new tests covering routing constants, LegacyRedirect render, BottomNav paths, course protocol coverage
- i18n keys added: `home.scan.cta`, `home.scan.sub` (both ru + en)

---

## What requires a third sprint

- Full Onboarding redesign around Course (currently goal still collected as old Goal type,
  then mapped; a proper course-first onboarding would remove the Goal step)
- EN localisation of all course texts (currently Russian only)
- Legacy `src/components/day/*` — decide which cards to embed inside CourseRouteMap/CourseTodayCard
- `useDayReminders` → replace static PLAN with course-aware reminder suggestions
- `buildCourseProtocol.ts` supplement suggestions (currently returns empty for supplements;
  proper integration needs pharmacy/supplement domain work)
- Remove `/day` and `/intensive` page files once no user has a bookmark to them
- Fix 35 pre-existing TypeScript errors (see TECH_DEBT_BASELINE.md)

## Context

Sprint 2 goal: remove old "day / intensive / stack / protocol" entities from the
main user path without deleting files or breaking existing data contracts.

Central logic from Sprint 1:
> Course → day route → real life → gap → soft return

---

## What is KEPT (no changes)

| Entity | Location | Reason |
|---|---|---|
| Scanner | `src/pages/Scanner.tsx` | Core product, LLM analysis |
| Scanner result contract | `src/types/profile.ts ScanResult` | LLM/Lovable contract |
| `useLegacyBootstrap` | `src/core/hooks/useLegacyBootstrap.ts` | Migrates old scan records from localStorage |
| `useProfile` | `src/hooks/useProfile.ts` | Personal data + `greenred_profile` / `greenred_onboarded` keys |
| `ThemeContext` / `I18nContext` | `src/contexts/` | Visual theme + multilang |
| `History` | `src/pages/History.tsx` | Scan history |
| `HealthProfile` | `src/pages/HealthProfile.tsx` | Profile editor |
| `Assistant` | `src/pages/Assistant.tsx` | AI context helper |
| `Feed` | `src/pages/Feed.tsx` | Content feed |
| `Auth` / `Paywall` | `src/pages/Auth.tsx` etc. | Auth flow |
| `useDayReminders` | `src/hooks/useDayReminders.ts` | Notification system, only fires when `notificationsEnabled` |
| `src/components/day/*` | DailyStateCard, DailyHydrationCard etc. | Kept on disk, available for future course integration |
| `src/pages/DayMode.tsx` | Physical file kept | Soft-hidden behind LegacyRedirect |
| `src/pages/Intensive.tsx` | Physical file kept | Soft-hidden behind LegacyRedirect |
| `GOALS` / `Goal` type | `src/types/profile.ts` | Used by Onboarding + profile sync |

---

## What is DISABLED from the main user path

| Entity | How disabled |
|---|---|
| Route `/day` | Replaced with `<LegacyRedirect />` |
| Route `/health` | Replaced with `<LegacyRedirect />` |
| Route `/intensive` | Replaced with `<LegacyRedirect />` |
| BottomNav tab → `/intensive` | Removed tab; replaced with a Profile tab in main tabs |
| BottomNav "More" → `/day` | Removed from more-items list |
| `Onboarding` redirect to `/intensive` | Changed to `/home` |

---

## What is MOVED / ADAPTED into Course

| Old entity | New home | Notes |
|---|---|---|
| Onboarding `goal` field | Maps to `CourseKey` via `GOAL_TO_COURSE_MAP` | User can change course inside app |
| Protocol/stack suggestions | `buildCourseProtocol.ts` | Returns morning/day/evening/sleep suggestions per course; no supplement dominance |

---

## What was NOT touched intentionally

- Any Supabase migration file
- `src/integrations/supabase/`
- `src/pages/Scanner.tsx`
- `src/core/capture/` (LLM pipeline)
- `src/core/store/types/events.ts` (DomainEvent contracts)
- `src/hooks/useProfile.ts` localStorage keys (`greenred_profile`, `greenred_onboarded`)
- `src/components/day/*` files (kept on disk, not rendered in main path)
- `src/pages/DayMode.tsx` and `src/pages/Intensive.tsx` (kept on disk)
- `useDayReminders` PLAN array (kept; fires only on user opt-in)

---

## What requires a third sprint

- Full Onboarding redesign around Course (currently goal still collected as old Goal type,
  then mapped; a proper course-first onboarding would remove the Goal step)
- EN localisation of all course texts (currently Russian only)
- Legacy `src/components/day/*` — decide which cards to embed inside CourseRouteMap/CourseTodayCard
- `useDayReminders` → replace static PLAN with course-aware reminder suggestions
- `buildCourseProtocol.ts` supplement suggestions (currently returns empty for supplements;
  proper integration needs pharmacy/supplement domain work)
- Remove `/day` and `/intensive` page files once no user has a bookmark to them
