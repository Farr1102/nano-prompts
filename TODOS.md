# TODOs

## Landed (plan-eng-review follow-up)

- Safe JSON-LD embedding via `serializeJsonLdForScript` (`src/lib/json-ld.ts`).
- Single source for site origin: `getSiteBaseUrl()` (`src/lib/site.ts`).
- Removed misleading `dateModified` on per-item `CreativeWork` (was feed-level `updatedAt`).
- Vitest + tests for `site` and `json-ld` (`npm test`).

## Deferred

- **Playwright (or similar) SEO smoke:** assert rendered HTML has valid `application/ld+json`, `link rel="canonical"`, and `alternate` hreflang on a few routes. **Depends on:** stable preview URL or scripted local `next start`.
