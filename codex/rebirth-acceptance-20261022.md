# Rebirth experience · three-batch acceptance · 2026-10-22 · v1.20.0

User approved the three-batch plan: homepage birth distribution, 48 original scenes plus 24 character age assets and 12 complete cases per language, then a more meaningful rebirth reveal with sound/skip/cancel, first-arrival guidance and keepsake continuity. Automatic Git deployment remains authorized after acceptance.

## Batch 1 — completed

Homepage integrates the existing visit estimate with an eight-country birth-share ranking and the remaining covered countries. Static native-language headings, proportions and working links survive without JavaScript. All values derive from the existing 172-country annual weights. Largest-remainder allocation reconciles each country count with the global estimate; updates use a shared clock event and do not sample or change game randomness. Counts are explicitly estimates, not real birth registration or visitor totals. Country names link to the matching odds selection; separate start controls open the selected birthplace directly when the game is ready, with a working navigation fallback.

Nine-language controls replace English reveal fallback. Birth details stay expanded with a clearer information grouping; the redundant legacy motion button is removed after revelation.

Evidence: audit/rebirth-acceptance-20261022/batch1.json, final browser.json, tests/rebirth.test.mjs.

## Batch 2 — completed

72 distinct original optimized images: 8 environment families × 6 scene chapters = 48 scenes; 6 character identities × 4 age categories = 24 transparent character assets. An additional 48 thumbnails are delivery derivatives and are not counted as original images. All 72 files were decoded, hash checked and visually reviewed in contact sheets; all character files have transparency. Actor poses that implied unrecorded parenthood were replaced. One already-safe original schoolgirl asset was retained after a replacement prompt was rejected; the final contact sheet confirms no child-carrying pose outside infant assets. No competitor imagery was copied.

Stable presentation choices never call the engine RNG. Only current/needed artwork loads, with near-stage prefetch. Newborns are shown through nursery settings and their portrait, not a walking child on the floor. School scenes require recorded schooling or education state. A localized retry control handles scene failures.

Added 36 actual completed sample runs to the 12 existing base-language records: 48 verified base records, expanded to 108 public snapshots across nine languages, 12 distinct country cases per locale. Existing complete-state outcome digests are retained; new runs include matching digests and event counts. Presentation identity was verified by replaying the same recorded seed and month; names must match before visual metadata is added. All recorded events and dates remain unchanged by that presentation metadata. Mobile galleries scroll horizontally; public samples remain non-purchasable.

Evidence: public-assets/rebirth/manifest.json, content/life-samples.json, content/premium-samples.json, audit/rebirth-acceptance-20261022/art-final.json, scenes-contact.jpg, people-final.jpg, sample-generation.log, visual-proofs.log.

## Batch 3 — completed

Reveal transitions from a symbolic globe to the selected environment and then the actual character identity. First full reveal is approximately 3.3 seconds; repeats are shorter; skip/cancel and reduced-motion paths are supported. Sound controls show actual on/off playback state. Timers, focus and audio are cleaned up on cancellation. Animation does not pick extra countries or modify the prepared character.

After confirming, the player starts paused with a clear continuation cue. Resuming retains the existing 5-second reading pace and independent automatic-decision setting. An ending journey strip uses actual age/recorded schooling and work events; it does not invent missing milestones. New keepsakes carry optional presentation IDs so the recorded character and environment continue into illustrated designs. Legacy snapshots remain valid; existing private rows, claim secrets and paid commitments are not rewritten. Six styles, three ratios, payment mode switching, server entitlement and refund locks remain active. Journal wide/square image height leaves the branding footer on readable paper.

Evidence: tests/rebirth-experience-browser.cjs; tests/rebirth-keepsake-browser.cjs; existing playback, checkout and birth-reveal regression tests.

## Verification

- npm run verify: 81 tests; unchanged 172-country model invariants; 226 canonical public routes, sitemap and asset-budget checks.
- Browser: 9 locales, 4 themes at 360/1440 widths, sample reader without game mutation, exact prepared identity, first pause, direct country start, repeated reroll, cancellation, reduced motion, all 72 image decodes and outage/retry. No page errors. The outage fixture was corrected to run before priming decoded-image cache, so it exercises a real failed request rather than a cached success.
- Keepsake: 18 actual studio style/ratio previews, persisted presentation identity, actual 2880-square PNG and 16-page Letter PDF under simulated paid entitlement, refund lock. The generated PDF cover and images were visually inspected; PDF page dimensions checked. This is not a new Stripe transaction.
- Playback: explicit first-arrival pause followed by real 5-second pacing, reading pause, policy independence, manual step, 20-second decision wait, resume/legacy saves, modal focus, full fast-forward equality, four legacy languages at mobile/desktop sizes.
- Compatibility: repeated reveal/skip/cancel in normal and reduced motion; missing music module and renderer-failure recovery.
- All synthetic browser telemetry blocked. No real purchase was submitted. Stripe server code, credentials, source demographic data and model rules were not changed.

Prior production rollback: Git 7d27bf09e9b2b17b400a68e20b604c72448f490a, Worker 43145f2a-14f3-4918-a0db-90379b7bbf6a, deployment 32862ec7-6ab7-4253-94bf-f425c97acee2. Preserve D1 and payment Secrets during rollback. Deployment receipt is recorded separately after the single Git release.
