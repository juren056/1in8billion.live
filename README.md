# v1.13.1 calendar verification follow-up

Replay invitation dates now match all three eras (1990 / legacy 2024 / 2080), and intentional historical/future year-only records are distinguished from old now-mode records. Local completed memories display the full birth-to-ending range. Nine-language and cross-timezone regressions cover the corrections; see CALENDAR_RELEASE_REPORT.md.

# v1.13.0 real-time birth calendar

New real-time births use the device-local current year and month, frozen when the birth card is generated. Annual simulation advances one year at a time; the ending uses the actual simulated lifespan, not average life expectancy. Replay v2 includes YYYYMM and daily invitations use the UTC month. Saved v1 runs keep their original 2024 baseline with no invented month; historical 1990 and future 2080 modes stay year-only. Statistical observation years, source editions, model weights and legacy storage keys are unchanged. Birth cards, current dates, family records, endings, free PNG, premium PNG/PDF, examples and localized guides use this shared calendar contract. See CALENDAR_RELEASE_REPORT.md.

## Historical v1.12.0 release
v1.12.0 user journey and discoverability release

Nine public languages and 226 canonical routes. This release fixes birth-card actions on small screens, preserves public comparison inputs across language changes, clarifies game guidance and model population units, and links every gameplay explanation from global navigation. Reading sections stay open by default. The keepsake preview has persistent download/close controls and page navigation, and uses lightweight poster previews without loading the full export font. PDF and full-resolution poster exports retain their original fonts and dimensions. Live payments remain closed.

Acceptance: `npm run verify`, `node tests/task-acceptance-browser.cjs`, `node tests/task-recovery-browser.cjs`, `PROOF_ONLY=1 node tests/release-browser.cjs`, and the existing playback and 27-PDF acceptance checks. Browser checks block Google tags so synthetic sessions do not become traffic. `first_event_visible` reports the first actual recorded event visible in the current life, once per life and document, with no names or story text. Continue using release, locale, device, entry page and run type to compare cohorts; no traffic uplift is claimed.

The previous production commit is 55f0a962d8ac2f8673c7082a321195b627ecb826. Model inputs, 1990/2024/2080 eras, Replay v1, storage keys and GA4 G-NKD2PNDL3P are preserved. Historical reports below describe their own releases.

# v1.4.0 growth release

62 indexable routes: 13 quality additions and 8 primary page upgrades from the 49-route v1.3 baseline. See SEO_GROWTH_REPORT.md for staged releases, GA4 evidence and limits. Run the default build for all P0-A/P0-B pages; GROWTH_STAGE=A reproduces the 52-route first-batch selection. P1 expansion still requires GSC evidence.

# 1in8billion.live

P1 release v1.1.0: 33 indexable pages, four localized country comparison tools, three pair pages, four practical guides, and deterministic Auto replay v1. See P1_REPORT.md for evidence and limitations. Replay engine/data changes must introduce a new version or preserve the v1 contract. Resumed or legacy saves remain usable but cannot be shared reproducibly because transient decision state is not fully serialized.

Browser verification: run the dev server, then `node tests/p1-browser.cjs` with Playwright and Chrome installed. PLAYWRIGHT_MODULE can point to a bundled Playwright module. Standard Node/SEO checks: `npm run verify`.

Independent free browser life simulator. Vanilla HTML/CSS/JS with static English, Japanese, Korean and Traditional Chinese guides. Adapted from rollroyces/born-somewhere under the retained MIT LICENSE; see ATTRIBUTIONS.md.

## Develop and verify

Node 22+: `npm run verify`, then `npm run dev` (http://127.0.0.1:4186).
Build: `npm run build`; output: `dist/` only. Historical zu-pu and internal reports are excluded.

## Deployment

Existing Cloudflare Worker: `1in8billion-live`; domain: https://1in8billion.live/ . Git production branch: main. Deploy command: `npx wrangler deploy`; wrangler.jsonc runs `npm run verify` before deploying assets. No framework migration or account backend is needed.

Optional build variables: GA4_MEASUREMENT_ID (real G- ID), GSC_VERIFICATION (real HTML verification value). Analytics loads automatically on page load. Never put secrets in browser code. GSC/GA4 external setup and reception require their own verification.

Progress uses legacy localStorage keys for compatibility. Quick mode enables auto decisions. Compatible Quick play lives offer a seeded replay v1 with fixed automatic choices. Manual changes invalidate replay eligibility. Saving on one device is not cloud backup.

## Data and provenance

The bundled data is inherited game input with unverified observation years. It is disclosed as model weights; country profiles explicitly describe game-model shares, not verified official statistics. See DATA_SOURCES.md. MIT notices remain, no original-site image/code was imported during this launch, and the historical demo is not deployed.

Historical first-launch evidence is in IMPLEMENTATION_REPORT.md and LIVE_CHECKS.json. The current v1.2.0 optimization record is OPTIMIZATION_REPORT.md; it supersedes earlier browser-connectivity and page-count notes.

GA4 production public measurement configuration: site.config.json (G-NKD2PNDL3P), overridden by GA4_MEASUREMENT_ID when set. Tags load automatically on page load, without consent buttons. Property 559735136, stream 16163903474. GSC domain ownership is DNS verified. The sitemap now has 49 routes; GSC query performance is still processing as observed on 20 October. Backend indexing counts must be checked separately.

## v1.2.0 experience and content

v1.3.0 completes the tools/content and trust/performance follow-up: comparison CSV, field-source deep links, context links, full-outcome sample proofs, complete inherited-input provenance, deferred optional tools, asset budgets and official Web Vitals with release/run cohorts. See BATCH23_REPORT.md. `npm run check:assets` checks comparable first-party critical payloads; `node tests/performance-lab.cjs` records controlled local diagnostics. Neither is a production field CWV pass claim.

Homepage: Quick default, progressive country settings, promoted local save and actual sample replay links. Comparison pages preserve countries and mode across copied URLs and equivalent-language navigation. Four-language task guides, original real-UI screenshots, source-field metadata and a reproducible sampler experiment are built statically. Numeric model inputs and Auto replay rules remain unchanged; corrected labels can change displayed story wording.

Run browser task checks with PLAYWRIGHT_MODULE pointing at an installed Playwright module: `node tests/experience-browser.cjs`, `node tests/p1-browser.cjs`, and `node tests/release-browser.cjs`. Use fresh local browser contexts; these checks never use an existing user's profile. The last command captures documentation images, so rebuild afterward. `node scripts/generate-samples.cjs` regenerates the published sample records from the running local engine. `node scripts/model-experiment.mjs` records the actual sampler experiment. See MEASUREMENT.md and DESIGN.md for the measurement contract and design choices.
