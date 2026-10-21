# Batch A theme design record · 22 October 2026

This is the implemented local preview record for A01–A05 in [the redesign plan](cinematic-redesign-plan-20261021.md). It supplements the token-bearing root [DESIGN.md](../DESIGN.md) and its schemaVersion 2 [.impeccable/design.json](../.impeccable/design.json). The working production baseline is v1.16.9. Batch A is opt-in through `THEME_PREVIEW=1`; `scripts/build-theme-local.mjs` rejects CI/Cloudflare deployment contexts. No deployment, full redesign completion, or B/C production migration is established here.

## Implemented source map

| Layer | Source | Actual scope |
| --- | --- | --- |
| Preview entry | `scripts/build-theme-local.mjs`, `scripts/build.mjs` | Local static build opt-in; regular build remains separate |
| Theme palette and home | `theme-system.css` | Isolated `--t-*` roles; four home compositions, real content and responsive treatment |
| Shared shell | `theme-shell.css`, `scripts/build-theme-preview.mjs` | Small generated palette prefix plus shell for nonhome; full `theme-system.css` for home/gallery. Other bodies explicitly remain C pending |
| First paint and preference | `theme-init.js`, `site-theme.js` | Blue fallback, early stored preference, four validated IDs, `1in8b:appearance:v1`, storage failure fallback, selection state/status and cross-tab changes |
| Labels | `theme-copy.js`, `scripts/build-theme-preview.mjs`, `scripts/build-design-gallery.mjs` | Nine page-locale sets; the head receives only the current page’s `window.ThemeLabels`, with no all-locale browser import |
| Start adapter/dock | `scripts/build-theme-preview.mjs`, `home-start-dock.js` | Existing country selector/action moved before initialization; no duplicate start engine. Home module owns start-label readiness, disabled-state synchronization, artwork retry and dock. Random start remains distinct; dock delegates continue/start and yields to visible hero, active game, modal or typing |
| Studies | `scripts/build-design-gallery.mjs`, `design-preview.js` | `__design` noindex gallery: home, birth, life, ending, studio, compare; completed samples and real card renderer |
| Source of truth | `content/premium-samples.json`, `premium-keepsake/` | Completed-life facts and six independent artifact templates |

`site-theme.js` owns shared appearance/navigation behavior and imports the home module only when the start dock exists. Legacy home CSS (`launch.css`, `content.css`, `experience.css`, `experience-upgrade.css`) is print-loaded then enabled, with noscript fallback; nonhome uses the small shell and print-loads launch CSS. Obsolete topnav/topright containers are hidden by first-paint preview CSS. Explicit desktop header order, flex allocation and minimum height stabilize brand, locale, appearance and navigation before delayed legacy CSS arrives.

The theme selector changes page presentation only. It does not select a keepsake template, recolor exports, start a simulation or trigger checkout. Existing record/engine/replay/month/ordering/payment requirements remain binding. Full invariance and journey acceptance belongs to the relevant implementation evidence, not this prose.

## Tokens and components

`DESIGN.md` frontmatter preserves the legacy production palette and enumerates each effective theme's page, paper, ink, muted, action, on-action, line, soft and focus values. Runtime resolves the selected set through `--t-*`; the frontmatter's blue component defaults are panel examples, not a mandate to paint other themes blue. Existing body variables are bridged only within preview scope. No complete semantic success/error/warning family has been implemented or invented for this batch.

Display is `LifeDisplay` (Bodoni Moda, existing local TTF, 400–900); UI is the local Segoe UI/Microsoft YaHei/sans-serif stack. The sidecar records actual shadows and responsive thresholds; synthesized OKLCH tonal ramps are marked as panel metadata and are not CSS source tokens. Its seven self-contained component snippets cover primary/text actions, country field, navigation, selected appearance tile, sample card and start panel. They use isolated `ds-` classes and `--t-*` with blue fallbacks. No external icon runtime or theme asset fetch is required for component tiles.

The four desktop structures are distinct: blue's scene/stack beside the start area; journal's wide paper start strip; editorial's title/story, right-side start column and lower three-specimen exhibition; night's focused upper-right form and smaller stack. At 760px they share a readable task-first flow. Core content and settings stay expanded by default; mobile navigation and appearance remain purposeful utility popovers.

## References and assets

The user-pinned references establish composition and material direction. They grant no right to copy media, source, people, labels or popularity figures:

| Theme | Reference file from the plan |
| --- | --- |
| Blue | `codex-clipboard-ad67689f-e5e6-4f65-8859-b9cd5ec1929d.png` |
| Journal | `codex-clipboard-4411b868-675b-4fbc-849c-4643ded31772.png` |
| Editorial | `codex-clipboard-e3c5fc03-174a-4a4a-9662-0db3d117b573.png` |
| Night | `codex-clipboard-a5f1f384-27a5-433c-9c5f-0e42b84b5662.png` |

Legacy competitor observations remain recorded in DESIGN.md solely as layout reference, without copied media/code or affiliation. The existing circular brand mark remains the shell identity.

Seven original `image_gen` scenes were generated on 2026-10-22 and prepared by `scripts/prepare-theme-assets.mjs`. All 21 full/mobile/thumbnail raster derivatives carry exact-prompt sidecars at `public-assets/themes/{filename}.webp.json`; [content/theme-art-provenance.json](../content/theme-art-provenance.json) retains the seven prompt texts. The full/mobile/thumbnail derivatives are resize/WebP compression only, with widths 1536/768/320 and quality settings 78/75/70. They are symbolic travel scenery, not proof of a life event or a specific person's recorded location.

| Scene ID | Source PNG |
| --- | --- |
| blue | `exec-d7df9202-c390-46fb-a1cd-328896e71f5d.png` |
| journal | `exec-d0edf68c-4b31-49d8-a49d-6068f3da6694.png` |
| editorial | `exec-05675d67-b37e-4ef6-9a43-b1dab8812315.png` |
| night | `exec-b3b52932-6d88-4e8e-98ef-e25381812955.png` |
| canada | `exec-e72fbcd8-939f-472f-9e3f-c99fcbebbecb.png` |
| india | `exec-4c7b0681-48be-4095-9101-8db39e7bb287.png` |
| china | `exec-d1af35b6-c72e-4ffb-9cbe-829c873c254a.png` |

The asset-preparation source directory is configurable via `THEME_IMAGE_DIR`; the checked-in recipe records generated-image IDs and restores the prompt metadata for derivatives. [asset-provenance-scan.json](../audit/theme-batch-a/asset-provenance-scan.json) records 21 rasters and zero missing sidecars. This documentation does not claim an independent rights audit. The hero selects the active theme/viewport artwork, with lazy imagery below; theme thumbnails are small derivatives. Country exploration can link six countries, but completed sample studies use actual JPN/USA/IND records: six scene links are not six completed-country samples.

Bodoni Moda is already self-hosted at `vendor/keepsake/BodoniModa.ttf`, with `BodoniModa-OFL.txt`. No new UI/CJK webfont family is introduced. Existing Oswald, Noto export coverage, symbolic keepsake artwork, six demo specimen thumbnails and their licensing/provenance remain documented in [keepsake-assets.md](keepsake-assets.md). All six thumbnails derive from the same actual English JPN sample; they are six designs, not six customer testimonials. The design-gallery studio calls the actual `renderCard` implementation on its selected completed sample.

## Scoped evidence and limits

[finish-verdict.md](../audit/theme-batch-a/finish-verdict.md) records **ship** only for local Batch A and resolution of F1–F6. It accepts corrected theme contrast/shell, mobile navigation, meaningful sample studies, four compositions, clear random/country start labels and honest coverage. It does not authorize deployment or accept the full site.

The verdict reviewed English/Simplified Chinese home captures across four themes and 390/1440 widths, the twelve refreshed six-state study captures and two menu captures. The refreshed `browser-report.json` records 180 layouts: nine locales × four themes × widths 360/390/768/1440/1920, with zero listed failures/errors. This broader layout coverage does not imply independent visual or native-language review of every locale. `study-report.json` records twelve ready, overflow-free study layouts with no listed errors. `route-coverage.json` records 226 routes while distinguishing shared shell, implemented home and deferred inner bodies. `study-coverage.json` distinguishes completed-sample prototypes from production migration.

[final-tests.log](../audit/theme-batch-a/final-tests.log) records all original 72 tests passing; the parent build thread reports the preserved 226-route SEO baseline. This documenter inspected the saved evidence and did not rerun product tests or browser checks. The final saved [loading-report.json](../audit/theme-batch-a/loading-report.json), produced by `scripts/qa-theme-loading.cjs`, records local Chrome CPU 4× with optional legacy CSS delayed two seconds. Blue/night at 390/1440 yield CLS 0.0014–0.0070 and LCP 0.316–0.976 seconds, within that script’s local thresholds. These four cases are neither public Core Web Vitals nor public Lighthouse scores, and do not establish every route/theme loading performance. Historical production scores are not substituted for preview evidence.

`PRODUCT.md` still names v1.14.2 and describes themes as planned; those release/implementation statements are stale relative to this local implementation and the v1.16.9 production baseline. It has intentionally not been edited in this documentation scope. The older redesign plan likewise describes its planning-time state; its scope/constraints remain useful, while actual Batch A evidence is in the files linked above. Production game/decision/collection/studio/order/error journeys and inner-page bodies remain B/C work.
