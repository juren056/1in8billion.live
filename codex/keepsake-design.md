---
name: 1in8billion.live keepsake studio extension
description: Six collectible treatments of one completed fictional life, inside the incumbent blue shell.
colors:
  shell-action: "#086f87"
  shell-ink: "#102d45"
  shell-muted: "#38586b"
  shell-field: "#ffffff"
  shell-field-border: "#9bb7c5"
  shell-choice: "#e2edf2"
  shell-stage: "#dce8ee"
  blue-accent: "#076f91"
  blue-wash: "#e5f1f7"
  sage-accent: "#28634f"
  sage-wash: "#eaf2e9"
  amber-accent: "#80551c"
  amber-wash: "#fbefda"
  modern-paper: "#fbfdff"
  cinematic-paper: "#020b17"
  cinematic-ink: "#fff9ef"
  cinematic-secondary: "#f8e8cb"
  cinematic-rule: "#edc791"
  editorial-paper: "#fffdf7"
  journal-paper: "#f6eedb"
  journal-ink: "#57442e"
  archive-paper: "#f2f0e7"
typography:
  studio-title:
    fontFamily: "KeepsakeDisplay, Georgia, serif"
    fontSize: "31px"
    fontWeight: 600
    lineHeight: 1.15
  studio-field:
    fontFamily: "var(--sans, 'Segoe UI', sans-serif)"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  artifact-display:
    fontFamily: "KeepsakeDisplay, Georgia, NotoKeepsake, serif"
    fontWeight: 600
  artifact-condensed:
    fontFamily: "KeepsakeCondensed, NotoKeepsake, sans-serif"
    fontWeight: 600
  artifact-body:
    fontFamily: 'NotoKeepsake, "Segoe UI", sans-serif'
    fontWeight: 400
    lineHeight: 1.22
rounded:
  field: "6px"
  choice: "8px"
spacing:
  field-block: "10px 12px"
  choice-gap: "10px"
  options-gap: "12px"
  studio-gap: "clamp(28px, 4vw, 64px)"
components:
  studio-field:
    backgroundColor: "{colors.shell-field}"
    textColor: "{colors.shell-ink}"
    typography: "{typography.studio-field}"
    rounded: "{rounded.field}"
    padding: "{spacing.field-block}"
  template-choice:
    backgroundColor: "{colors.shell-choice}"
    textColor: "{colors.shell-ink}"
    rounded: "{rounded.choice}"
    padding: "7px"
  template-choice-selected:
    backgroundColor: "{colors.shell-field}"
    textColor: "{colors.shell-ink}"
    rounded: "{rounded.choice}"
    padding: "7px"
  studio-primary:
    backgroundColor: "{colors.shell-action}"
    textColor: "{colors.shell-field}"
    width: "100%"
---

# Keepsake studio design record

## Overview

**Creative North Star: "One completed life, six collectible treatments."** This is the existing surface contract's thesis, scoped to the keepsake extension. The blue site remains the operating shell; the artifact carries the cinematic, editorial, journal, analytical or archival personality. The six directions were pinned by the user, so this record describes the implemented extension rather than replacing the site's visual world.

The two supplied showcase images set a quality bar for distinct materials, substantial artwork, strong typography and visible selection. Their invented example biographies, places and decorative country claims are not implemented facts. The artwork in this build is an original anonymous sea and watercolor garden, with factual text drawn separately.

**Key Characteristics:**

- One source snapshot, six distinct compositions and three output shapes.
- A substantial specimen beside readable controls, then mobile specimen/scrolling choices.
- Self-hosted display lettering, recorded facts and clearly separated personal writing.
- Transparent demo status, mandatory fiction disclosure and closed live checkout.

This source record is dated 2026-10-21. The initial [finish review](../audit/keepsake-20261021/finish-review.md) recorded `fix`; the final [scoped finish verdict](../audit/keepsake-20261021/finish-review-final.md) records `ship`. All seven findings and the compact-layout followups are closed. [PDF acceptance](../audit/keepsake-20261021/pdf-acceptance.json) records six actual books with 19/17/19/5/19/5 pages, correct A4/Letter sizes on every page, preserved source/page numbering and eighteen accepted first/middle/final-page renders in `audit/keepsake-20261021/pdf-render/`. This completes scoped design/export acceptance; production deployment is a separate step and is not claimed here.

## Colors

### Primary

The shell keeps the incumbent cool blue page/navy navigation documented in root DESIGN.md. `shell-action` marks the PNG action; `blue-accent` marks selection and keyboard focus. `shell-stage` surrounds the specimen, and `shell-choice` groups the thumbnail choices. Artifact palettes do not recolor the global shell.

The controlled `blue`, `sage` and `amber` pairs are defined in `templates/drawing.js`. They supply accent rules, pale fields and metric bars. They are restricted design choices, not arbitrary colors or complete recolorings of artwork. Cinematic changes its translucent tint while retaining its navy depth and warm text/rules; journal and archive retain their paper grounds.

### Neutral

`shell-field`, `shell-ink`, `shell-muted` and `shell-field-border` keep controls readable. Modern uses cool paper; editorial uses near-white paper; journal uses warm cream and brown text; minimal data uses white; archive uses muted documentary paper. Cinematic uses light text over the darkened sea. These grounds belong to the exported object, not a new website background.

**The Shell and Artifact Rule.** Preserve the blue shell while honoring each selected artifact's own material and contrast.

## Typography

Display type is self-hosted Bodoni Moda (`KeepsakeDisplay`, `vendor/keepsake/BodoniModa.ttf`); condensed display is self-hosted Oswald (`KeepsakeCondensed`, `vendor/keepsake/Oswald.ttf`). Artifact factual copy uses the existing Noto Keepsake font (`vendor/premium/KeepsakeSans-Regular.ttf`) with local sans fallback. Font licenses sit beside their respective assets. No external font stylesheet is loaded.

The studio inherits the existing page H1 and controls. Its H2 uses the scoped `studio-title` role, reducing to 28px on mobile. Canvas type is expressed in a 1080-unit logical width and scaled to the output dimensions; the display size varies by template and shape, rather than becoming a global web heading scale. The drawing helper's default title is 104 units for portrait or 72 for wide compositions; templates supply their own condensed/editorial alternatives. Body layout uses the recorded 1.22 line-height, word-aware wrapping with CJK character support, size reduction and bounded ellipsis.

HD rendering loads the full Noto font for export; preview uses available local/fallback text faces. PDF body pages retain the existing book-style PDF fonts (Times/Helvetica) and fall back to embedded Noto where those fonts cannot encode the text. Bodoni/Oswald on the selected PDF cover are rasterized with the card; they are not newly applied to every PDF body page.

**The Facts Stay Readable Rule.** Decorative display lettering never licenses invented content, clipped factual text or missing export disclosures. Inspect the actual rendered shape when assessing fit.

## Layout

The studio container caps at 1300px. Desktop uses two columns (`.9fr` specimen / `1.1fr` controls), the scoped fluid gap, and a specimen sticky at 110px. The neutral stage has 20px padding and a 360px minimum height; its displayed artifact is bounded by 660px height. The six choices form three columns. Final thumbnail rules use `object-fit: contain` so the specimen is not cropped.

At 760px and below, the studio becomes one column, the specimen stops sticking, stage padding becomes 16px, and the displayed artifact caps at 510px. Thumbnail choices become 126px-wide horizontally scrolling buttons with proximity snap. Visible links jump to the styles and customization controls. Two-column option pairs remain compact beneath the edit fields.

The registry supports portrait `9:16` (2160 × 3840), square `1:1` (2880 × 2880) and landscape `16:9` (3840 × 2160). Each uses its own composition on the same logical width. The PDF cover always uses the selected template's portrait composition, independently of the PNG shape selector. Clean/cinematic/editorial map to the editorial book body, journal to warm, and minimal/archive to archive.

PDF assembly uses A4 pages (595.28 × 841.89 points). Letter output preserves the original PDF document and resizes every existing page to 612 × 792 points with `setSize`, then centers its scaled content using `scaleContent` and `translateContent`. This avoids re-importing the document and re-parsing its large CJK font; output must preserve `buildDocument(...).pages.length`. Print-friendly is checked by default: body pages use white/light paper with readable margins; the selected illustrated cover stays intact on a white page. Turning this off restores the existing book paper treatment. It does not create a monochrome cover or change the recorded facts. Focused page-count and rendered first/middle/final-page acceptance is required separately from this source description.

## Elevation & Depth

The artifact stage uses a soft specimen shadow (`0 14px 28px #061b3229`) to separate the object from the blue-gray ground. Other studio grouping relies on fields, borders and spacing. Cinematic depth comes from the original sea plus transparent tint and gradient; journal material comes from the watercolor and a slightly rotated paper/photo frame. These are native to the user-pinned artifact directions.

The stage background transition is `.2s ease-out` and is disabled for reduced-motion preference. This extension adds no required animation sequence.

## Shapes

Text fields use the scoped field radius and a one-pixel border. Thumbnail choices use the scoped choice radius and a two-pixel selection border. Focus uses a three-pixel blue outline with a three-pixel offset. The exported art itself uses rectangular portrait, square and landscape formats. Archive and data structures use thin rules; the scrapbook's tilted frame is a template-specific material device, not a new site-wide card shape.

## Components

### Specimen and style choices

`studio-markup.js`, `studio.css` and `studio.js` provide a canvas/image specimen, localized caption, live status, retry button and six real thumbnail buttons using `aria-pressed`. Initial selection is cinematic poster. JPN/USA/IND samples come from completed sample snapshots; the local-life action appears when a local snapshot reference is available. The recommendation explains its recorded-data reason and never overrides the user's selection.

### Six artifact roles

| Registry ID | Material and visual role | Recorded-content treatment |
|---|---|---|
| `clean-modern` | Bright cool paper, pale controlled color field and watercolor plate; everyday sharing | Strong title/name, compact chronology and selected moments |
| `cinematic-poster` | Full sea artwork, deep navy fade, warm amber/ivory and condensed lettering; atmospheric collectible | Title/name and clear light factual groups over the darkened art |
| `editorial-magazine` | Bold controlled-color country block, restrained paper and strong serif/condensed contrast; framed print | Edited title when supplied, name and country/date facts kept distinct; sea plate in portrait |
| `journal-scrapbook` | Warm cream, watercolor and angled paper/photo frame; intimate collection | Title/name and real small moments, with separately labeled personal note |
| `minimal-data` | White paper, condensed lettering and controlled-accent bar charts; analytical view | Last recorded health/knowledge/relationship values with their recorded age; missing metrics show fallback, not invented scores |
| `archive-certificate` | Muted paper, structural rules and clear beginning/ending fields; personal record | Snapshot dates, selected events and recorded cause when present; no invented city or credentials |

All six render through the shared helper and registry. The adapter prioritizes and deduplicates recorded milestones; it supplies up to five featured entries, while compact cards display up to three selected moments. The full book/source preview retains the broader event record. Country/name absence uses the localized recorded-data fallback; missing month retains the year. The adapter leaves unsupported city data absent. Model values are simulation state, not observations about a real person.

### Local editing and exports

The title field is limited to 100 characters and note to 200 by markup and adapter. Palette is restricted to the three named pairs. Edits live in fields and in-memory rendering arguments; they do not modify snapshots, local saves, replay rules or simulation inputs. Reset clears title/note; it does not reset style, palette or output selectors. Personal writing is labeled as a note, not presented as an event. The studio and edit fields carry Clarity masking; action analytics send language/action categories rather than the text.

Edits debounce repaint by 150ms; style/ratio/palette selection repaints immediately. Loading or export disables the appropriate controls; stale preview revisions are discarded. Rendering errors expose localized retry/status feedback. Keyboard focus, field labels and `aria-busy` remain present through the workflow.

**The Recorded Life Rule.** The title, note and design may change; the completed snapshot's facts remain fixed. No template can invent a city, education, work, family member, death cause or unsupported metric to fill a slot.

Every card footer includes localized fictional simulation / not a personal forecast wording, including `demo: false`. Every art-bearing composition also identifies the sea/garden as symbolic artwork, not a photograph or recorded place. This footer is independent of the diagonal demo marker and must remain readable and separate from the note. PDF body pages retain their model/non-prediction footer; the selected cover carries the card disclosure.

The current studio always requests `demo: true` for preview and PNG/PDF download. Its controls explicitly state that live payments are closed and unmarked personal exports require verified payment. An internal `demo: false` rendering option is not a payment entitlement or live purchase flow. The existing free memory image, game/replay/local saves, original book preview and three legacy poster interfaces remain available through their existing paths. They are separate from this six-template studio.

### Source and provenance map

The implemented sources are `premium-keepsake/studio.css`, `studio-markup.js`, `studio.js`, `template-copy.js`, `template-data.js`, `render-card.js`, `templates/index.js`, `templates/drawing.js`, each of the six renderer modules, `render-pdf.js`, `book-styles.js`, and `scripts/build-keepsake-studio.mjs`. The build generates localized studio pages at the existing keepsake URLs, including FAQ purchase, page-count, scope and free-content topics. Scope copy excludes video, accounts, public memorials and cloud storage.

[keepsake-assets.md](keepsake-assets.md) records the original artwork prompts, embedded PNG provenance, sample-thumbnail source and self-hosted font licenses. Shipping artwork lives in `public-assets/keepsake/`; six thumbnails are style specimens generated from the same actual English JPN sample in `content/premium-samples.json`, not different customer stories. The user plans/style brief and showcase images are direction evidence; the snapshot/sample data remains the factual source.

The applicable surface contract is `.impeccable/surfaces/premium-keepsake-preview-js.md`; review/screens/export evidence lives in `audit/keepsake-20261021/`. This ordinary extension intentionally leaves the incumbent root design prose and `.impeccable` files intact. Pre-existing documentation drift: root DESIGN.md uses the previous compact prose format rather than the current canonical token schema, and PRODUCT.md's recorded release revision predates this work. Neither is silently repaired or promoted into a new visual rule here.

## Do's and Don'ts

- **Do** preserve the incumbent blue operating shell and the six user-pinned artifact directions.
- **Do** use actual completed-life facts, localized fallbacks and recorded metric labels/ages.
- **Do** preserve readable fiction/non-forecast and symbolic-art disclosures in every applicable export shape, independently of watermark state.
- **Do** verify page preservation, shape dimensions, long localized text and footer separation on rendered output before closing acceptance.
- **Don't** reuse the supplied showcases' invented facts, people or places as evidence of the simulated life.
- **Don't** describe demo downloads, an internal watermark flag or planned pricing as live payment fulfillment.
- **Don't** turn this scoped artifact system into a replacement for global game/article typography or palettes.
- **Don't** canonize a visual/export defect as a reusable design rule. The scored findings in this build are closed by the final scoped `ship` verdict and focused rendered PDF acceptance cited above.
