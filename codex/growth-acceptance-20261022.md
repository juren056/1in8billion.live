# v1.18.0 growth execution — local acceptance

Implements the approved order: trust/quality, activation, return, keepsake value, measurement and acquisition safeguards. Preserves the four visual themes with blue default, expanded content, model statistics/RNG, frozen birth calendar and replay streams, saved record formats, GA4/Clarity identity and sandbox-only commerce.

## Implemented

- Critical modal copy reads the display locale directly. Owned modal fields no longer get reset to bare engine keys or translated backward. Simplified Chinese finance/spending/cancel vocabulary is authored; replay confirmation and record management use the display language.
- Explicit end/restart labels and cancellation-safe termination confirmation. Existing one-record deletion confirmation reused, with no duplicate confirmation.
- Latest story draws from actual narrative records, including family events. Completed-life label no longer prints a separate stale embedded count. Archive management uses recorded birth/end months where available, without inventing missing historical months.
- Country and odds search now explain no matches and provide reset. Odds filters its table as well as options and hides stale result/play links while no match exists. Comparison copied-state expires when inputs change.
- Complete recorded sample reader is separate from replay and does not start or overwrite a life. Visible homepage shortcut and clickable educational mode. Main game order is identity/story/current controls before scenery and optional strategies; nothing is collapsed by default.
- Inline first-run guide can be completed without a popup; existing records persist. “Another life in this country” now actually prepares the same birthplace before confirmation; another-place action remains separate.
- Six square keepsake layouts present more of the actual milestone record, with adaptive journal positioning. No invented career/city/outcome fields. Long and sparse data retain existing source facts and disclosures.
- Privacy-safe first meaningful interaction and guide begin/complete events; first visible event deduplicated across two existing observers; the existing first-year reset on each new life is retained. Natural completion distinguished from deliberate player ending. Existing events and analytics configuration remain.

## Verification

- `npm run verify`: build, 172-country data checks, 226-page SEO and sitemap/static-link checks, critical asset budgets, 73 unit tests passed. Home critical asset total 454,375 B; threshold preserved rather than raised.
- `tests/growth-execution-browser.cjs`: nine locales, actual selected birth, focus/spend dialogs, cancel termination, finance defer/return, year controls through a complete life, sample reading and both search recoveries. No browser page errors.
- `tests/growth-finish-browser.cjs`: 48 en/zh-CN × 390/820/1440 × four-theme home/life states; no page horizontal overflow; story/action/scenery order; one inline guide; observed tutorial begin/complete; first meaningful interaction exactly once; same-country restart and comparison copy invalidation. Test corrected two asynchronous assertions (birth animation and clipboard); neither was reported as a broken product action.
- Existing twelve advertised replay outcome digests still match, with existing guide screenshots preserved (`PROOF_ONLY=1`).
- Keepsake studio regression: 18 locale/viewport combinations, 54 style/sample/ratio previews, 18 real HD PNGs and four PDFs, edited Chinese title, sparse newborn record, original snapshots unchanged, no markup execution. No browser page errors.
- Additional PDF matrix: all six templates × A4/Letter, long Chinese/Japanese/Korean title and note, 12 actual exports. Every page's media box and page count checked; every page rendered with Poppler; visual contact sheets reviewed. Full-font Python text extraction was too expensive and stopped; it is not counted as a passing text-extraction test. Geometry/render review and source-data regressions are the actual evidence.
- Simulated checkout: sample lock, closed configuration, committed own snapshot, design/language preservation, no private prose posted, no entitlement before server confirmation. Simulated callback: pending/retry, bound claim, reload, PDF/image downloads, no real purchase analytics. These are NOT new Stripe sandbox transactions; live charging stays closed.
- Single focused Impeccable detector pass: 9 advisory design-system differences, 0 primary failures. Existing palette/type/radius advisories and the explicit secondary 15px button label/backdrop are not treated as functional failures. Real desktop/mobile captures provide the visual evidence.

## Search and analytics

Existing signed-in GA4 and GSC reviewed through CUA; private acquisition figures remain in local-only notes. GSC indexing/performance data is still processing, so query-targeted expansion or ranking lifts cannot be claimed. Existing sitemap shows Success/226 discovered; discovered is distinct from indexed. Canonical public route set is unchanged, and sitemap is rebuilt/checked without fabricated lastmod. No redundant resubmission needed.

New browser QA blocks Google Analytics, GTM and Clarity. dataLayer assertions prove client events, not receipt of newly deployed events in GA4. No A/B winner, real revenue, statistically meaningful conversion lift, external novice study, screen-reader certification, or real-device/weak-network certification is claimed.

## Release

Git-triggered deployment and exact production acceptance follow this local gate. Previous stable production revision d0046379857393728d1d819867c2e60ae51d89c9, Cloudflare version 12f03e09-b303-4ce8-81b6-bbb406b3dfd0 (100%) was observed before release; backend configuration is unchanged. Local screenshots, exported files, manifests and browser reports: audit/growth-execution-20261022/. Historical unrelated dirty reports are excluded from this commit.
