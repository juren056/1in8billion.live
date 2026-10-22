# Tables, continuation and character identity — v1.21.2

Requested scope: execute the three approved batches in order. Preserve simulation rules, country data, calendar rules, nine languages, four appearances, existing saves, expanded reading sections, analytics and payment configuration.

## Delivered

1. Shared table presentation on every built route. Surfaces, rows, headers, labels, numeric cells and links use the selected appearance. Comparison results have native-language text instead of requiring colored dots. Wide tables have keyboard-accessible horizontal scrolling and a visible overflow hint; two-column tables fit mobile layouts. German long titles and narrow birth-distribution rows were corrected after browser inspection.
2. One validated current-save state drives the homepage and floating dock. Active saves show country and age alongside a separate rebirth action; completed saves open the existing life memory; invalid saves show a recovery explanation. Preview/cancel leaves the current save unchanged. Restoration waits for the existing playback controller and preserves pauses and pending decisions. The floating dock follows visibility of the actual launch actions, excluding the sticky header.
3. Twenty-eight character identities, four ages each: 112 transparent person sprites, plus the existing 48 scenes. Twenty-two new original age-progression sheets were generated with the built-in Imagegen tool and sliced into 88 derivatives. Country candidate groups cover all 172 countries and support multiple appearances; they are fictional art direction, not demographic estimates. New lives record a versioned visual identity. Old unversioned selection and existing explicit identity IDs remain unchanged. History records now retain identity and sex, so the same person survives completion and reload.

## Corrections found during acceptance

- Production latency exposed a late-loading reveal dependency in character assignment. The core birth/start UI now marks new lives before optional modules run; the registered presentation selector records the identity immediately when available, with first-draw completion as fallback. Legacy saves remain unmarked and retain original behavior. The initial pause and arrival event also moved to the core birth-confirmation handler; late UI receives its onboarding cue without starting the clock. Delayed-module coverage checks a real 5.5-second reading pause.

- Completed-life restoration initially called playback rendering for unbuilt live-game controls. Playback now skips that work outside the live view for a completed life. The continuation suite records page errors and fails on any error.
- A generated sheet's figure spacing did not exactly follow quarter boundaries. The importer finds transparent gaps and checks full figure bounds; it never replaces the six legacy identities. All final sprites were decoded and reviewed.
- Running several image-heavy browsers together produced resource/screenshot failures. Relevant suites were rerun serially; those resource failures are not counted as passes.

## Evidence

Evidence folder: `audit/table-resume-identity-20261022/` (local QA files, intentionally not published as site content).

- `verify-patch-final.log`: complete build, 172-country data invariants, 226-page SEO/sitemap checks, critical asset budgets and 85 passing Node tests.
- `tables-final.log`, `tables.json`: 976 passing combinations across all 118 static table pages and four dynamic table states, four themes, desktop/mobile; computed text/background contrast at least 4.5:1 and no document overflow.
- `dock-errors-final.log`, `dock.json`: 22 continuation scenarios, nine languages, four themes, save cancellation, completed/invalid/legacy/pending-decision states, no page errors.
- `deferred-character.log`, `deferred-character.json`: birth before the reveal module loads still records the same country-appropriate identity.
- `characters-patch-final.log`, `characters.json`: 12 country journeys, 48 age portraits, visual persistence through reload and history, no page errors.
- `rebirth-final.log`, `rebirth/browser.json`: nine locales, four-theme mobile/desktop flows, reduced motion, failed-image recovery and all 160 image decodes.
- `playback-final.log`: reading pause, five-second pace, decision waiting, full state equality for fast-forward, restoration and four original languages.
- `keepsake.log`: 18 real style/ratio previews, actual PNG and PDF files under mocked payment entitlement, refund lock. No real financial transaction.
- `legacy-patch-final.log`: all three original poster exports retain the recorded character and contain no loading placeholder.
- `art-check.json`: 160 production asset decodes; all 24 legacy person assets match their Git originals byte-for-byte.

Generated assets: `public-assets/rebirth/people/{identity}-{baby|young|adult|elder}.webp`. Inventory: `public-assets/rebirth/manifest.json`. Importer: `scripts/import-character-sheets.py`.

Artwork prompt pattern: one transparent four-age sheet of a single fictional identity; left-to-right swaddled baby alone, child, adult and elder; consistent face, complexion and hair texture; ordinary modest contemporary clothing, full bodies, no text, scenery, flags, ceremonial stereotypes or extra people. Individual identity appearance descriptions and exact prompts/source receipts are retained locally in `generated-sources-final.json`; generated masters stay in the Imagegen output directory.

Production release receipt is recorded separately after the Git-triggered deployment is verified. Payment mode and provider secrets are outside this change.
