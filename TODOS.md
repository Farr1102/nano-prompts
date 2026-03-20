# TODOs

## Landed (plan-eng-review follow-up)

- Safe JSON-LD embedding via `serializeJsonLdForScript` (`src/lib/json-ld.ts`).
- Single source for site origin: `getSiteBaseUrl()` (`src/lib/site.ts`).
- Removed misleading `dateModified` on per-item `CreativeWork` (was feed-level `updatedAt`).
- Vitest + tests for `site` and `json-ld` (`npm test`).

## Deferred

- **Playwright (or similar) SEO smoke:** assert rendered HTML has valid `application/ld+json`, `link rel="canonical"`, and `alternate` hreflang on a few routes. **Depends on:** stable preview URL or scripted local `next start`.

## QA follow-up (2026-03-20)

- **ISSUE-001** — Prompt cards: single `aria-label` + `aria-hidden` on visual subtree; thumbnails use `next/image` when host allowlisted (avoids `alt` + heading duplicate name).
- **ISSUE-002** — Tag chips: `aria-pressed` + `title` / `filterByTag` for short labels.
- **Performance** — Expanded `remotePatterns`; list uses optimized images + `fetchPriority="low"`; modal + detail page use `next/image` when optimizable.
