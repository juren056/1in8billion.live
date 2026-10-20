# Retention implementation

Approved direction: retain the blue brand and add warm original pixel scenes. Execute the three batches in RETENTION_EXPERIENCE_PLAN.md. Baseline: 00b216917f7dbd116fe166e4582e6bcdb8fa34a4 (v1.4.0), preserved at codex/baseline-v1.4-retention. Origin/main was fetched and matched. Historical dirty reports/audit files are retained separately.

## Batch 1 — v1.5.0

- Add a static four-language three-step explanation and an original pixel-scene preview. Preserve all 62 canonical routes and the main start/resume path.
- Lazy presentation bootstrap waits for the existing game to be ready. Scene, copy and audio modules are separate from simulation. Canvas artwork is original, with five stage/environment variants plus an ending-memory variant. Age portraits, a short skippable birth entrance, reduced-motion and background/pause behavior are supported.
- Birth card introduction uses actual country/year/place-type/household-quartile fields. Missing fields are explicitly unknown. It remains a fictional model character.
- One global original procedural ambient composition, with a repeating 32-beat, four-chord phrase, user-triggered AudioContext, pause, mute, volume, separate optional event sounds, explicit error state and background pause. Saved preferences do not auto-start sound. Original placeholder/single-tone entry points route to the same player. No competitor audio was downloaded.
- Desktop separates a compact identity/control panel from scene and current events. Mobile shows identity/controls then scene/actions. Existing family/trajectory/model/log detail DOM remains available under a disclosure rather than being deleted.
- New manual-action labels are translated for all four supported languages. The original action policy remains; automatic replay eligibility is not broadened.

Validation: npm run verify (62 routes, 16 Node tests, source-data/hreflang/SEO/asset budgets), tests/retention-browser.cjs (fresh Chrome, four languages, real running AudioContext with active scheduled nodes, volume/mute/pause/background, birth skip, mobile/desktop and reduced motion), tests/release-browser.cjs (all 12 full-outcome digests), tests/p1-browser.cjs (identical actual full life across independent narrow/desktop contexts with extra rendering). No numeric weights, seed policy or save keys changed.

Initial visual pass identified the legacy full certificate pushing the scene below the fold. One correction batch created the two-region desktop layout and compact phone identity panel. Captures: audit/retention-home-mobile.png, audit/retention-life-mobile.png, audit/retention-life-desktop.png.

Critical static assets remain within the existing budget. Optional presentation CSS/modules are deferred and are additional bytes, not claimed removed bytes. The final report will list those separately. No field CWV or retention uplift is claimed.

Batch-specific deployment and acceptance evidence follow below.


Batch 1 fix-list review: independent reviewer scored both audio first-interaction and finance-language findings resolved. Fresh-context regression tests cover each first audio setting, plus finance ages 18/25/35/50 across four languages. Commit 4b0e2b8 was pushed to main after a proxy TLS failure; a direct OpenSSL connection succeeded. Cloudflare production verification follows the build.

## Batch 2 — v1.6.0

Original keepsake room and portrait use the actual life state. Up to three memory objects (birth plus the latest two distinct recorded milestone types) link to the exact event; short lives do not gain invented family or careers. The biography uses recorded birthplace/year/age and cause. Trajectory plots preserve actual stored five-year samples and gaps, with an accessible numeric table; the pre-existing double-normalization of the assets display is fixed without changing simulation values. PNG download uses original local canvas artwork and factual memory labels. Replay retains v1 eligibility; new lives require the birth confirmation. Legacy controls and full records remain available in a disclosure. Four-language browser tests verify actual full endings, downloads, again events, short-life/missing-chart states, mobile overflow. Existing 12 proof outcomes are checked again after all extensions load.


Batch 2 independent read-only review returned ship, conditional on the final proof suite. All 12 actual complete-outcome digests passed after the keepsake modules loaded. Commit a501a25 pushed successfully and the production release endpoint returned a501a251a951e5cf632f812b357b4cead1941c15.

## Batch 3 — v1.7.0

- Add an accurate local collection alongside the existing saves: counts cover the existing last-50 summary records; richer memory/chart details cover at most 20 new completed lives, and six recent records are visible. Older summaries remain unchanged and explain their missing details. Actual stored completions/distinct countries unlock the three local discoveries; there are no global player counts or fabricated streaks. Unfinished saves retain their existing priority and resume data.
- A version-v1 UTC daily invitation selects a stable country from the unchanged annual birth weights and uses a separate deterministic date hash. It consumes no engine random numbers. The same date gives the same automatic replay invitation. Starting is explicit and retains the existing replacement explanation. Invitations carry daily/share attribution and v1 fragment settings; copy failures expose the actual URL. Completion labels require a locally recorded eligible matching daily run.
- New collection write failures retain game completion and show visible feedback. Existing storage keys and old record shapes are preserved. No account, synchronization, public life pages or leaderboard is added.
- Add static four-language guide explanations for optional sound, motion, factual memories, PNG/replay distinctions, local limits and daily UTC behavior. Update existing quick-play/replay/Auto/speed pages, privacy disclosure and real localized screenshots. Preserve all 62 routes and existing canonical/hreflang/source disclosures.
- Audio initialization is shared even under concurrent requests, duplicate starts share one pending operation, and pause cancels a pending start. A game-load failure stops the optional presentation readiness polling after a bounded timeout. The original game failure/retry path remains usable.

Browser evidence: return-browser compares two independent actual daily full lives at 390/1440px, including stats, log, name, family and stored trajectory; extra presentation renders in the second run do not alter the result. It verifies clipboard, explicit invitation start, matching completion, single-record retention, earned badges, unchanged legacy summaries, unfinished-save resume and visible storage-write failure. Edge coverage verifies concurrent audio initialization, actual AudioContext failure/retry and no duplicate score, plus four-language static introductions/help with JavaScript disabled.

One mechanical UI detector scan over the changed surfaces returned []. Raster origin metadata is embedded; final public-assets scan reports 19 rasters, zero missing. This is not field performance or an inference about user retention.


Final fix batch from independent review: presentation-only Music controls are now exempt from the original manual-policy invalidation guard; genuine manual controls retain it. Return tests explicitly use playback, mute/unmute, volume and event sounds during each daily run before completing, and still verify replay eligibility and daily completion. Backgrounding cancels a pending audio resume via a generation guard; a delayed-resume regression verifies that no scheduler starts. The error/retry test exposed a synchronously failed AudioContext promise remaining cached; pending promises now clear after assignment via an outer finally, so retry succeeds. All four birth guide screenshots were recaptured with reduced motion after full rendering. The gameplay capture now intentionally uses the actual age18 state, not a manually relabeled fixture.

Final static checks: npm run verify passes 62 canonical routes, 172 country inputs, all hreflang/local links, existing critical resource limits and 16 Node tests. Critical decoded asset totals: home453702B, compare109573B, quick guide14740B. Deferred presentation modules/CSS add61964B decoded, approximately25078B summed per-file gzip estimates; music is procedural and has no remote media download. These estimates do not measure CDN transfer or field CWV. Existing experience, batch23 and growth browser suites passed, including actual Web Vitals event release1.7.0 (not a field threshold claim). New retention/keepsake/return/edge suites pass; original 12 full-outcome proofs and independent360/1440 seed tests PASSED again after the last replay guard fix. The second seeded run also had actual audio playing and additional renders.


Independent finish outcome: Batch1 fix-list ship (both findings resolved), Batch2 ship at its reviewed scope, Batch3 fix-list ship (all four findings resolved; no further recapture required). Reviewer returns are read-only independent source/screenshot reviews; executable tests were run by the implementation task. No remaining item from those review lists is asserted as a guarantee about unrelated legacy dialogs.


## Approved UX follow-up — batch1 v1.7.2

User approved the subsequent three-batch UX plan. The sample replay block was offscreen by~2500px on a390px phone. Replace it with a deferred native dialog: centered desktop, mobile bottom sheet, explicit Cancel/Start, unfinished-progress warning, modal focus and Escape/back behavior. Native URL settings and same seed flow stay intact; no life is prepared until confirmation. Sample/daily/archive/share entry links on the same localized route use one entry handler. Opening/cancelling pauses then restores the current run without writing storage or changing replay eligibility. Confirmation focuses and scrolls the actual game view. New low-cardinality replay_entry_click/prompt_visible/confirm/cancel events use action for the entry source; old offscreen invitation-view semantics are retired for this release.

Validation: replay-entry-browser passes4langs390/1440, checks button bounds BEFORE auto-scroll, native focus/Tab/Escape/back, explicit start and unchanged full unfinished life/localStorage after cancellation. All12actualcomplete-outcome digests pass after the new layer loads. npmverify62routes/16tests/resourcebudgets pass. No historical reports or user dirty changes are included in this release.
