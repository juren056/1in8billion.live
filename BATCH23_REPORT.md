# Batches 2 and 3 — v1.3.0

Execution date: 20 October 2026. Previous production: 29d5909 (v1.2.0). Existing routes, numeric inputs, local save keys, replay-v1 rules and default GA4 loading are retained.

## Batch 2: tools and content

- Preserve the existing four-language comparison layout and add a real CSV export of the active countries and mode. CSV contains units, missing values and unverified-year/model limitations; spreadsheet formula prefixes are escaped. One pure comparison core validates exports against the same denominators as the interface.
- Direct source-field links from life expectancy, schooling and PPP; contextual next actions to draw-mode and replay guides. Every task guide adds sibling links and a BreadcrumbList that matches visible navigation.
- Upgrade all 12 published sample checks from age-only to a digest of age, character, complete state, event log, cause, death age and country. Public proof records and the model experiment explain exactly what was checked. No user profile/storage is used when creating samples.
- Preserve the 49 useful routes. No duplicate sample/detail permutations are added just to increase the page count.

## Batch 3: trust and extension

- Every inherited numeric/model field is enumerated with present/missing counts, unit status, an immutable source-snapshot reference and its first direct code-use reference when available. All 172 country records have their own source location and per-field year status in /data/provenance.json. Original values are downloadable at /data/source-snapshot.json; the canonical JSON hash is tested against the source.
- Unknown observation years remain null. This proves which game input is used, not the statistical year or independent accuracy of national observations.
- Recheck GSC Performance: processing, no queries available. Query-led expansion is therefore deferred; no invented keywords, traffic numbers or ranking claims.
- Use the unmodified standard distribution of GoogleChrome/web-vitals 6.2.3, self-hosted with license/notice. After critical page work, collect LCP/CLS/INP/TTFB via web_vital events, with metric name/rating/value/delta and release version. No selector, replay seed, story, name or sensitive URL is sent. Metrics without a valid browser observation are not fabricated as zero.
- Events now carry release and coarse run_type so new, replay and resumed lives can be segmented. GA4 custom definitions are verified separately below. No organic conversion-rate baseline is claimed.
- GEDCOM and world coordinates load when family/tree/shelf tools are opened, instead of on every first visit. Real browser tests verify that the tools still open with both dependencies.
- Capture a source-verified v1.2.0 asset baseline and controlled local lab measurements. Enforce first-party critical asset budgets in npm run verify. The homepage critical decoded payload changes from 464,232 to about 449 KB; deferred Web Vitals adds 8,967 decoded bytes separately. These are explicit asset measurements, not production transfer sizes or a field CWV claim. Comparison/guide payloads grow modestly for export, links and measurement.

## Validation

- Ten Node tests, complete route/fragment/reciprocal-hreflang checks, positive normalized weights and asset-budget checks.
- Browser checks cover actual CSV download, source deep link, mobile overflow, optional-tool loading, native Web Vitals event values/version, context links and existing full-life replay invariance.
- Actual 12 sample digests match the engine across fresh contexts. Local performance harness uses Chrome, 390×844, no throttling, three runs per route and stubbed external analytics. INP can remain null in a short lab run; lab medians are not field percentiles.

## External acceptance

GA4 property 559735136 now has five event-scoped dimensions (release, run_type, play_mode, metric_name, metric_rating) and one standard metric (metric_value), saved and verified in the actual administration table. These definitions need processing time and do not backfill earlier parameters. Evidence: audit/batch23-ga4-dimensions.jpg and audit/batch23-ga4-metric.jpg.

Pending production revision and online CSV/source/proof/vitals checks. GSC query status was directly observed as processing; the existing Sitemap URL is retained.
