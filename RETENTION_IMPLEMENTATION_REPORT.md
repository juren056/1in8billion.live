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

Deployment revision and production evidence are appended after acceptance. Batches 2 and 3 remain in progress.
