---
name: 1in8billion.live
description: Locally implemented four-theme A/B/C production-build candidate with historical baseline
colors:
  legacy-page: "#edf5f8"
  legacy-paper: "#ffffff"
  legacy-navigation: "#061b32"
  legacy-ink: "#102d45"
  legacy-muted: "#526c7d"
  legacy-action: "#086f87"
  legacy-line: "#c5d9e3"
  blue-page: "#eff7fe"
  blue-paper: "#fff"
  blue-ink: "#112b48"
  blue-muted: "#405d78"
  blue-action: "#075bd6"
  blue-on-action: "#fff"
  blue-line: "#b7cbdc"
  blue-soft: "#dcecfb"
  blue-focus: "#075bd6"
  journal-page: "#f4ede0"
  journal-paper: "#fffaf0"
  journal-ink: "#2d362e"
  journal-muted: "#5c6254"
  journal-action: "#214e45"
  journal-on-action: "#fff"
  journal-line: "#c9bc9f"
  journal-soft: "#e9dfcb"
  journal-focus: "#196a64"
  editorial-page: "#f8fafb"
  editorial-paper: "#fff"
  editorial-ink: "#182b3a"
  editorial-muted: "#4a5b69"
  editorial-action: "#1258b7"
  editorial-on-action: "#fff"
  editorial-line: "#bdc9d1"
  editorial-soft: "#e9eef2"
  editorial-focus: "#1258b7"
  night-page: "#071522"
  night-paper: "#102536"
  night-ink: "#f7f4eb"
  night-muted: "#b7cad9"
  night-action: "#f1c46c"
  night-on-action: "#172333"
  night-line: "#526b7d"
  night-soft: "#20384a"
  night-focus: "#f5cf86"
typography:
  display:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(42px, 5vw, 76px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-.025em"
  headline:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(27px, 3vw, 40px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.015em"
  body:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "18px"
    lineHeight: 1.65
  label:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 650
  workspace-title:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(24px, 3vw, 34px)"
    fontWeight: 600
    lineHeight: 1.2
  current-event:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "20px"
    lineHeight: 1.6
  reading-title:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(34px, 4.5vw, 64px)"
    fontWeight: 600
    lineHeight: 1.18
  reading-title-editorial:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(36px, 5vw, 72px)"
    fontWeight: 600
    lineHeight: 1.18
  reading-body:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
  reading-lead:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "19px"
    lineHeight: 1.7
  reading-lead-mobile:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "17px"
    lineHeight: 1.7
  reading-h2:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(25px, 2.5vw, 34px)"
    lineHeight: 1.18
  reading-h3:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "20px"
    lineHeight: 1.18
  tool-result:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.5
  calculator-output:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "clamp(24px, 3vw, 36px)"
    fontWeight: 600
  guide-card-title:
    fontFamily: "LifeDisplay, Georgia, serif"
    fontSize: "26px"
    lineHeight: 1.18
  contents-link:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  contents-heading:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "15px"
  reading-table:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
  reading-caption:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "13px"
  metric-compact:
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif"
    fontSize: "13px"
rounded:
  metric-track: "3px"
  surface: "14px"
  action: "9px"
  button: "10px"
  thumbnail: "6px"
  journal-paper: "4px"
  workspace-control: "10px"
  decision-option: "12px"
  workspace-record: "14px"
  current-event: "16px"
  decision-stage: "18px"
  workspace-panel: "20px"
  workspace-dialog: "24px"
  pending-return: "100px"
spacing:
  control-gap: "9px"
  action-gap: "12px"
  mobile-gap: "16px"
  card-inset: "22px"
  section-inset: "24px"
  hero-gap: "36px"
components:
  button-primary:
    backgroundColor: "{colors.blue-action}"
    textColor: "{colors.blue-on-action}"
    rounded: "{rounded.action}"
    padding: "13px 23px"
  button-text:
    textColor: "{colors.blue-ink}"
    backgroundColor: "transparent"
  input-country:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.action}"
    padding: "10px 12px"
  navigation:
    textColor: "{colors.blue-ink}"
    padding: "10px 0"
  appearance-choice:
    backgroundColor: "{colors.blue-page}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.button}"
    padding: "6px"
  sample-card:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.surface}"
    padding: "0 0 24px"
  start-panel:
    backgroundColor: "{colors.blue-paper}"
    rounded: "{rounded.surface}"
    padding: "18px"
  playback-action:
    backgroundColor: "{colors.blue-action}"
    textColor: "{colors.blue-on-action}"
    rounded: "{rounded.workspace-control}"
    padding: "10px 14px"
  current-event:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.current-event}"
    padding: "22px 24px"
  pending-decision:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.decision-stage}"
    padding: "26px"
  decision-option:
    backgroundColor: "{colors.blue-page}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.decision-option}"
    padding: "18px"
  pending-return:
    backgroundColor: "{colors.blue-action}"
    textColor: "{colors.blue-on-action}"
    rounded: "{rounded.pending-return}"
    padding: "16px 24px"
  studio-controls:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.workspace-panel}"
    padding: "26px"
  studio-template:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.workspace-record}"
    padding: "10px"
  order-design:
    backgroundColor: "{colors.blue-paper}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.current-event}"
    padding: "24px"
---

# Design System: 1in8billion.live

## Overview

**Creative North Star: "A birthplace becomes a story worth keeping"**

A birthplace becomes a story worth keeping. The locally implemented A/B/C world pairs scenic original artwork with readable life stories, real start controls and actual collectible specimens. Clear blue (default), travel journal, modern editorial and cinema at dusk are four distinct compositions within one product. Batch B extends this world into real birth, playback, decision, ending, studio and order surfaces; Batch C carries it through reading pages, comparison and odds tools, country discovery, callbacks and 404.

This is the current local normal production-build candidate, with all four themes and A/B/C surfaces implemented. THEME_PREVIEW now adds only noindex sample studies/prototypes; the shared shell and reading/tool body migration run in normal builds. Exact-Git deployment and production-domain acceptance remain pending, including C04 new-UI/old-paid-order export verification. Historical production v1.16.9 and earlier opt-in/nonactive preview evidence do not establish this candidate as deployed. Batch B local UI and actual Stripe TEST delivery retain their scoped acceptance; live charging remains closed. Direction is code-led from the approved reference world; no generated-comp approval or concept seed is claimed. The existing keepsake system remains independently documented below.

**Key Characteristics:**
- Four scenic worlds with stable product meaning.
- Locally hosted display lettering and readable local UI stacks.
- Real sample facts, visible controls and expanded core content.
- Symbolic gouache life stages, readable operating surfaces and work-first studio previews.
- Quiet expanded reading rooms and native data tools across all four themes.

### Historical production design record · before A/B/C

This historical record describes the previous visual world, not the current A/B/C candidate. The first visit earned a quick fictional life, then introduced country comparisons and model explanations. In-game UI prioritizes the current age, event, pause and speed controls. Article pages prioritize reading.

- Base: #edf5f8. Reading surfaces: #ffffff. Navigation: #061b32. Text: #102d45. Secondary text: #526c7d. Action: #086f87. Borders: #c5d9e3.
- Georgia and local Mincho fallback for story headings; Segoe UI / local sans-serif for controls, explanations and numbers. Use tabular numeric alignment for comparisons.
- Desktop: one global header, left-aligned introduction and start controls, right-hand birth distribution; sample stories and comparison beneath. Mobile: start first, then distribution and samples.
- One dominant start action; an unfinished save promotes Continue. Country/era/speed choices and content sections are expanded by default, with grouping and page anchors for scanning.
- World dot texture is original CSS. All sample outcomes come from the actual engine; no invented testimonials or visitor counts. Screenshots show disposable local runs.
- Separate game navigation appears only while operating the game. Keep existing tools accessible without presenting them before first play.
- No consent banner is added. Preserve localStorage keys, numeric model inputs and replay-v1 simulation behavior. Text presentation may improve independently from the rule version.

References: current observations of 1in8b.app/en (world and life preview), in8b.com (play plus weight comparison), 1in8billion.app (localized explanation and coherent regions). Layout principles are adapted; their text, media, code and affiliation claims are not copied.

### Historical keepsake studio extension · 21 October 2026

At this earlier extension stage, the blue/navy site shell and existing game, reading and free-memory interfaces were preserved. The artifact capabilities and independence rules below continue in the current A/B/C candidate. The user's six pinned collectible styles apply to exported artifacts: clean modern, cinematic poster, editorial magazine, journal scrapbook, minimal data and archive certificate. The supplied showcases set the quality bar for materially distinct, selectable work; their invented people, places and life facts are not content sources.

The studio pairs a substantial specimen with sample/local-life selection, six thumbnail choices, controlled blue/sage/amber palettes and optional title/note fields. Bodoni Moda and Oswald are self-hosted display faces; Noto provides export text and CJK coverage. These artifact faces extend, rather than replace, the existing page typography. Desktop keeps specimen and controls together; mobile stacks the specimen above a horizontally scrolling style strip and offers links to style and customization controls.

All life facts remain sourced from the completed snapshot and its events. Title/note edits stay ephemeral, are masked for session recording, and never alter the saved life; the note is visibly identified as personal writing. Symbolic sea/garden artwork is separately disclosed as neither a photograph nor a recorded place. Every card retains a localized fictional-simulation/non-forecast footer, independently of the demo watermark. Free game, basic PNG, replay and local saves remain available. Current studio downloads are marked demos; live payments remain closed.

HD artifacts support portrait 2160 × 3840, square 2880 × 2880 and landscape 3840 × 2160. The selected design becomes the PDF cover; the multipage book supports A4/Letter and light print-friendly body pages without recoloring the cover. Existing book preview and three legacy poster interfaces remain separate capabilities.

The scoped token/component record and source map are in [codex/keepsake-design.md](codex/keepsake-design.md). Artwork prompts, font licenses and thumbnail provenance are recorded in [codex/keepsake-assets.md](codex/keepsake-assets.md), with files under `public-assets/keepsake/`, `vendor/keepsake/` and `vendor/premium/`.

Finish evidence: the initial [finish review](audit/keepsake-20261021/finish-review.md) recorded `fix`; the final [scoped finish verdict](audit/keepsake-20261021/finish-review-final.md) records `ship` after closing all seven findings and the compact-layout followups. [PDF acceptance](audit/keepsake-20261021/pdf-acceptance.json) records six actual books with 19/17/19/5/19/5 pages, correct A4/Letter page sizes, preserved source/page numbering and eighteen accepted first/middle/final-page renders under `audit/keepsake-20261021/pdf-render/`. This is completed scoped design/export acceptance, not a claim that production has been deployed.

## Colors

### Primary

The frontmatter records the actual semantic colors from theme-system.css. Clear blue uses a clean blue action; journal uses deep green; editorial uses precise blue; night uses warm gold against navy. Action text has its own on-action token; night requires dark action lettering.

### Neutral

Each theme has page, paper, ink, muted, line and soft roles. The focus role remains explicit. Legacy-prefixed tokens preserve the historical production palette; blue/journal/editorial/night-prefixed tokens describe the current locally implemented A/B/C candidate. For runtime use, resolve the selected theme through isolated --t-page, --t-paper, --t-ink, --t-muted, --t-action, --t-on-action, --t-line, --t-soft and --t-focus variables. The shell maps existing body variables into these roles only inside data-design-system.

**The Independent Appearance Rule.** Website appearance never selects an export template or recolors PNG/PDF artifacts.

No separate success/warning/error color-token system is claimed by A/B. Waiting and order states use explicit text and existing semantic roles. The root --t-scene URLs are retained implementation tokens, while active hero artwork is selected as an image by the theme builder and site-theme.js. Batch B reuses the same four palettes without adding a competing page palette.

## Typography

LifeDisplay is the locally hosted Bodoni Moda variable face (400–900) at vendor/keepsake/BodoniModa.ttf, reused under its existing font license. Display and brand lettering use LifeDisplay with Georgia/serif fallback. UI and localized text use Segoe UI, Microsoft YaHei and the browser sans-serif fallback; Batch A adds no remote UI/CJK font download. This preserves local-script rendering rather than claiming the Latin display face covers all scripts.

Frontmatter display describes the desktop hero; mobile uses 44px, with editorial at 40px. Section headlines use the headline role; navigation is 14px/600 and brand is 23px/700 in the home system (22px in the shell, 20px on mobile). Hero body copy uses the body role and reduces to 16px on mobile. Current reading-system body text is 16px/1.7; the earlier article 1.8 line-height belongs to the historical baseline. Dates and comparison tables use tabular numbers. Keepsake Bodoni Moda/Oswald/Noto remain artifact typography, separate from page body text.

Batch B uses the workspace-title role for operating headings and current-event for the active narrative; the latter reduces to 18px on mobile. Identity and control labels stay compact, while the certificate age uses display lettering (54px desktop, 32px mobile). These are documented roles extracted from product-workspaces.css, not additional CSS custom properties.

Batch C Read/Operate roles are intentional, separate from the home and B workspace ramps, and extracted from reading-system.css:

| Role | Implemented size and treatment |
| --- | --- |
| Reading title | LifeDisplay, 600, clamp(34px, 4.5vw, 64px), line-height 1.18, letter-spacing -.025em; editorial uses clamp(36px, 5vw, 72px). |
| Reading lead | Local UI, 19px/1.7; 17px at 650px and below. |
| Reading h2 / h3 | h2 LifeDisplay clamp(25px, 2.5vw, 34px); h3 local UI 20px; both line-height 1.18. |
| Tool result / calculator | Comparison answer local UI 22px/1.5, weight 600; odds output LifeDisplay clamp(24px, 3vw, 36px), weight 600. |
| Guide card | LifeDisplay h2 26px. |
| Contents | Local UI links 14px/1.5; contents heading 15px. |
| Table / caption | Tabular table 14px; table and guide-image captions 13px (model-chart caption remains 14px). |
| Compact metric | Mobile metric value 13px at 650px and below; desktop value 15px. |

These role differences reconcile the supplied detector advisories by documenting the actual source; they are not a request to flatten titles, results and data to one ramp.

## Layout

Current home has a 1376px main container with 28px horizontal padding, reducing to 20px at 760px. Desktop hero uses 1.08fr/.92fr columns, a 36px gap and 55px/44px padding. Blue keeps scene and specimen stack beside the start area. Journal uses a horizontal start strip across the paper composition. Editorial separates title/story from a right start column and exhibits three specimens below. Night places a focused form above a smaller right specimen stack. These compositions have their own heights and spacing; a palette swap alone is insufficient.

At 1100px header and hero spacing tighten; 760px stacks the hero into task-first order and exposes one mobile menu control. The menu expands into two columns. Sample cards form three columns on desktop and an 85%-width horizontal snap strip on mobile. Country exploration uses three columns, then two. The studio showcase and sample study canvas use two columns, then one. Above 1600px the hero expands into wider margins. The dock respects safe-area bottom spacing and hides while the hero, game, modal or input task takes priority.

Country/era/speed settings and narrative/content sections remain expanded by default. The deliberately closed mobile navigation and appearance popover are utility controls, not hidden core content. The six gallery views are preview-only explicit noindex sample studies with a real-experience exit; normal production builds omit study/prototype routes and preview-wide noindex.

Home/gallery load the full theme-system stylesheet; nonhome receives a compact generated palette-plus-shell stylesheet. Native page labels are injected into the head without importing the all-locale bundle. Legacy home CSS loads asynchronously through print media with noscript fallback. First-paint rules hide obsolete header containers; desktop order/flex and minimum height stabilize the shared header under delayed CSS. Shared appearance/navigation stays in site-theme.js; home start readiness, artwork retry and dock remain in home-start-dock.js.

Batch B life and ending views use a 1360px maximum container and responsive horizontal insets. Desktop life pairs a narrow identity column with a wider story column (minimum 220px/.65fr and 0/1.75fr, 32px gap). The symbolic stage leads the story, then the current event and playback controls; history stays expanded. At 760px the identity becomes static and the layout stacks. Birth dialogs keep a scrollable body inside a viewport-bounded card and a fixed-in-card action row.

The studio uses a 1440px maximum product container. A large selected artifact leads beside the control column (1.15fr/.85fr); the compact six-template selector lives inside controls as a three-column grid. On mobile the artifact precedes those controls. The ratio selector has its own full row so dimensions remain readable. The order workspace is a centered 960px maximum paper surface, with stacked download actions on mobile. These B compositions are source-backed task patterns; they do not replace the A home compositions.

Batch C reading pages use a 1240px maximum container with 64px 40px 80px padding. Expanded contents sit in a sticky 210px rail with a 56px gap and article text up to 73ch; at 900px the rail becomes 170px with a 28px gap. At 650px contents stack above the article, with 30px 20px 48px page padding. Real tables scroll horizontally within focusable wrappers rather than overflowing the page. Country grids move from three to two columns; guide cards move from two to one. Full navigation and nine language paths also apply to callbacks and 404.

## Elevation & Depth

Paper and soft surfaces carry most structure. Primary actions and sample cards are flat. The start panel has a soft ambient shadow (0 10px 30px #0d294014); appearance popover and dock float above the page; specimen stacks use pronounced, rotated paper shadows. Night strengthens specimen depth against dusk; journal uses paper borders. Hero artwork receives a page-color gradient to protect legibility. Reduced-motion preference disables theme animation, transition and smooth scrolling.

Batch B identity cards and current events remain flat with thin semantic borders. Sound/speed popovers use a small ambient shadow, dialogs use a deeper shadow over a blurred navy scrim, and the fixed pending-choice return action carries its own lift. Birth shuffle is short-cycle, cancelable and disabled for reduced motion; the static stage actor has no idle animation. Exact B shadow and motion values are in the sidecar.

## Shapes

The surface radius is reused for cards, panels and studies; actions/fields use the smaller control radius. Journal deliberately introduces near-square paper and a 4px start strip; editorial removes hero/start-panel rounding. Night retains a rounded dark stage. These are material distinctions grounded in the current CSS, not an instruction to round every element alike.

Batch B extends this with component-specific control, option, record, event, decision/stage, panel and dialog radii in the frontmatter (10/12/14/16/18/20/24px). The 100px capsule is intentional for the persistent pending-choice return action; it is not a default button shape. Portraits remain circular, and small studio thumbnail images retain their source 8px corner treatment. These extracted component tokens document literal CSS values without claiming a new runtime radius-variable system.

Batch C metric tracks intentionally use a 3px radius on a 10px-high bar. Reading table wrappers and model-note surfaces use 12px; comparison controls and the odds calculator use 16px. These role-specific literal values coexist with the home/B shape vocabulary.

## Components

- **Start actions and country panel:** one random-start action and one labelled country-select/action pair. The builder relocates the real country control rather than adding another engine start. Continue and the dock delegate to existing controls. Primary actions have a 48px minimum height; general buttons/navigation use 44px, fields 46px. Disabled buttons show .55 opacity and wait cursor. Focus is a 3px role-colored outline with 4px offset. No extra hover motion is added by the primary action rule.
- **Global shell:** existing round brand icon, locale control, current-page marker, native Appearance details and one mobile Menu toggle. Theme choices show four small artwork thumbnails with pressed state; selection and Escape restore summary focus. Local labels come from the page locale in theme-copy.js; the gallery labels come from build-design-gallery.mjs. This is authored nine-locale copy, not proof of linguistic review by nine native speakers.
- **Sample card and keepsake showcase:** actual completed-life facts sit under symbolic scenery. Real six-template thumbnails and rendered studio specimens establish the artifact quality; scenery does not prove a recorded place. Core sections remain visible rather than becoming disclosure panels.
- **Design studies:** home enters a sample or exits to the real home; birth has reveal/confirm; life has current age/date/event, accumulated history and real sample Play/Pause; ending links replay and studio; studio selects six templates and renders a large actual specimen with failure/retry; compare selects two completed samples and labels their values. Event controls appear only for life and timers stop on transitions. These are read-only sample interactions, not production game, checkout or delivery migration.

**The Stable Meaning Rule.** Theme changes alter presentation; start, continue, saved lives, simulation streams and order meaning stay stable.

### Batch C reading and tool surfaces

The same four semantic palettes apply to expanded guides, sources, policy, comparison, odds, country directory and country detail bodies. Native controls retain their IDs and source data; tables use tabular numbers and focusable contained scrolling. The shared shell uses data-design-system, including callbacks and 404. The documented reading system does not change engine randomness, inherited statistical inputs, device-local birth calendar semantics, compatible saves/replays or private records. Nine authored locales remain supported without claiming nine native-speaker reviews. Exact-Git deployment and production acceptance are still open; genuine sandbox server authorization remains the only evidenced payment/fulfillment scope.

### Batch B operating surfaces

- **Birth dialog:** one resource rank, explanation and original birth narrative; visible cancel/reroll/start. Its header, body and action row share the selected paper material, including navy in night. Shuffle can be skipped or canceled without stale callbacks.
- **Playback and decisions:** real playback controls use the existing controller. Waiting is stated in text and outlined; decision options show actual effects. Setting a choice aside exposes a persistent capsule action. Reopening restores the pending question and focus; neither action resolves it or advances simulation time. The model remains paused until an actual choice permits progress.
- **Life artwork and ending:** original character and six-scene gouache atlases are symbolic illustrations, not player photographs or recorded residences. Scene choice follows actual age/employment/ending state; character variation derives from a stable identity hash independently of engine RNG. Visibility-based image loading and revision checks avoid obsolete painting. Missing images leave text/actions usable; free PNG waits for art readiness. Original prompts and output origins are in content/life-art-provenance.json.
- **Studio:** the selected large work precedes its compact six-template selector. All six native renderers, three PNG ratios and A4/Letter PDF remain actual capabilities; title/note edits do not rewrite completed-life facts. Website appearance remains independent from the artifact design. Nine authored locale entries cover operational and commerce copy; this is not a claim of native proofreading in every language.
- **Order and delivery:** readable state text distinguishes pending, paid, canceled, refunded, disputed, expired, support, query error and local recovery. Pending checks retry; a failed check never unlocks exports. Every paid export requires fresh server authorization. The return route also offers the associated local studio entry. UI mock captures demonstrate layout only; actual sandbox delivery is separately evidenced.

**The Recorded Life Rule.** Symbolic scenery and personal writing never supply missing facts for a completed record.

Sources, asset provenance and scoped evidence for A are recorded in [codex/theme-batch-a-design.md](codex/theme-batch-a-design.md). B direction is in [.impeccable/surfaces/theme-batch-b.md](.impeccable/surfaces/theme-batch-b.md); implementation sources are product-workspaces.css, game-workspace.js, modern-life-art.js, life-scene.js, playback.js, premium-keepsake/checkout-return.js and premium-keepsake/order-state-copy.js. The schemaVersion 2 sidecar carries live-bound component snippets and implementation metadata; its default component tiles use blue fallbacks and are not a second application stylesheet.

The [Batch B acceptance record](codex/theme-batch-b-acceptance-20261022.md) distinguishes local checks, UI mocks and actual Stripe TEST payment/webhook/authorized PNG/PDF delivery, including old paid-test-order recovery. The independent [finish verdict](audit/theme-batch-b/finish-verdict.md) ships the scored fixes 1–8 and evidenced scope; it does not approve the full website or production activation. The acceptance addendum records a later nonactive candidate refresh and actual authorized download. Live charging remains closed; C04 still requires new-UI/old-order verification on the final production domain.

## Do's and Don'ts

### Do:
- Do keep story facts tied to actual sample or completed-life events.
- Do retain readable local-script controls, visible focus and expanded core content.
- Do adapt composition by theme while preserving mobile task order.
- Do keep pending decisions paused when set aside, and give the selected studio work first-viewport authority.

### Don't:
- Don't describe locally implemented A/B/C or nonactive version-preview acceptance as exact-Git deployment, production-domain acceptance or live payment approval.
- Don't copy reference screenshots, invented people, popularity claims or competitor media into the product.
- Don't couple website themes to the six keepsake export templates.
- Don't treat order UI mocks, redirect success or a client-side paid label as export authorization.
