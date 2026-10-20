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

The bundled data is inherited game input with unverified observation years. It is disclosed as model weights; country fact pages remain withheld. See DATA_SOURCES.md. MIT notices remain, no original-site image/code was imported during this launch, and the historical demo is not deployed.

Historical first-launch evidence is in IMPLEMENTATION_REPORT.md and LIVE_CHECKS.json. The current v1.2.0 optimization record is OPTIMIZATION_REPORT.md; it supersedes earlier browser-connectivity and page-count notes.

GA4 production public measurement configuration: site.config.json (G-NKD2PNDL3P), overridden by GA4_MEASUREMENT_ID when set. Tags load automatically on page load, without consent buttons. Property 559735136, stream 16163903474. GSC domain ownership is DNS verified. The sitemap now has 49 routes; GSC query performance is still processing as observed on 20 October. Backend indexing counts must be checked separately.

## v1.2.0 experience and content

Homepage: Quick default, progressive country settings, promoted local save and actual sample replay links. Comparison pages preserve countries and mode across copied URLs and equivalent-language navigation. Four-language task guides, original real-UI screenshots, source-field metadata and a reproducible sampler experiment are built statically. Numeric model inputs and Auto replay rules remain unchanged; corrected labels can change displayed story wording.

Run browser task checks with PLAYWRIGHT_MODULE pointing at an installed Playwright module: `node tests/experience-browser.cjs`, `node tests/p1-browser.cjs`, and `node tests/release-browser.cjs`. Use fresh local browser contexts; these checks never use an existing user's profile. The last command captures documentation images, so rebuild afterward. `node scripts/generate-samples.cjs` regenerates the published sample records from the running local engine. `node scripts/model-experiment.mjs` records the actual sampler experiment. See MEASUREMENT.md and DESIGN.md for the measurement contract and design choices.
