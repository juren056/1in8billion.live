# Author support: a coffee letter

Recorded 29 October 2026. Scope: locally implemented end-of-life invitation, standalone support page and existing-Stripe support integration. This surface brief extends the incumbent system; it does not refresh or replace `PRODUCT.md`, `DESIGN.md` or `.impeccable/design.json`.

## Overview

After a completed fictional life, the creator offers a warm, optional invitation: send free encouragement or buy a coffee. The retained direction is the cream-paper letter with caramel accents and a simple outlined coffee cup. The proposed photo/postcard replacement was canceled before wiring; no new photographic asset belongs to the shipped surface. Research images in the audit directory are not product assets.

The user explicitly permits the popup to have its own appearance across website themes. Its quiet letter treatment is local to this invitation. The standalone page continues the existing four website themes and separates the personal letter from the payment controls. This supports the product's independent-project voice without requiring a global palette or theme replacement.

## Colors

The popup scopes existing semantic property names to its own dialog element:

| Role | Property | Value |
| --- | --- | --- |
| Cream paper | `--t-paper` | `#fffaf2` |
| Letter ink | `--t-ink` | `#382c23` |
| Muted prose | `--t-muted` | `#75614f` |
| Caramel action | `--t-action` | `#95502c` |
| Action text | `--t-on-action` | `#fffaf2` |
| Quiet border | `--t-line` | `#ddcdb8` |
| Encouragement surface | `--t-soft` | `#f2e7d6` |

These are component-local tokens, not new root tokens. The page inherits clear blue, travel journal, modern editorial or cinematic night through the existing theme shell. Appearance does not change support amounts or payment meaning.

## Typography

Headings use the existing `LifeDisplay` serif stack with Microsoft YaHei and Georgia fallbacks. Controls and letter text use Segoe UI, Microsoft YaHei, Noto Sans and sans-serif fallbacks. The modal heading is 30px, reducing to 26px on mobile; its letter is 16px with a 1.9 line height, reducing to 15px with a 1.95 line height. Localized text remains text rather than image lettering. Chinese page titles receive deliberate phrase breaks.

## Layout

The dialog is centered, up to 500px wide with 16px viewport gutters and a viewport-bounded scrolling height. Its actions stack vertically. The page uses an 1100px maximum reading/payment spread, with a 72px desktop gap and a single column below 760px. Letter content precedes payment controls on mobile. Preset amounts remain a three-column row.

## Elevation & Depth

The cream dialog uses a dark translucent backdrop and a diffuse shadow (`0 28px 100px #130d0a66`) to establish a focused letter surface. The payment panel uses the current theme's paper and border rather than introducing another global material. The dialog arrives with a short 300ms opacity/12px translation animation; reduced-motion preference disables it.

## Shapes

The dialog has softly rounded corners (20px). The payment panel uses 16px corners; primary actions use 10px, and amount fields/presets use 8px. The coffee cup sits in a circular warm-toned medallion within the popup. No photograph is required for the composition.

## Components

### End-of-life invitation

A final inline invitation provides a persistent manual opener. Automatic presentation requires a newly completed life observed alive during the session, the final invitation reaching the viewport, a three-second timer with an interaction-idle check, a visible document and the seven-day local cooldown. Education mode is excluded. It does not open over another dialog or modal. Opening/closing stamps the local cooldown; manual reopening remains available.

The native `dialog` has a labeled heading, a clear close control, Escape dismissal, a return-to-life action and focus restoration to the opener. Initial focus lands on close. Free encouragement acknowledges locally and disables its button after activation. No free-text message is sent to the creator by this control. Focus outlines and polite status feedback remain visible and readable.

### Standalone support page

Ten locale variants provide the creator letter, USD 3/5/10 presets, a custom amount field, Stripe action and free encouragement. Custom amounts accept exact decimal values with up to two places within USD 0.50–999,999.99; they are not restricted to preset amounts. Selection is indicated with `aria-pressed`; invalid values focus the field with `aria-invalid`. Submission disables the form during the request, reports failure and permits retry. Routes are utility pages marked `noindex,follow`.

### Payment and return state

This is voluntary one-time creator support, with no subscription and no Life Keepsake Pack entitlement. The existing Stripe integration creates a separate `author_coffee_v1` product session. The server converts decimal strings to integer cents, signs checkout receipts and verifies provider session amount, currency, mode and product metadata. Return-page confirmation requires the stored signed receipt and server verification; a success redirect alone does not establish payment. Pending, canceled, refunded/disputed and retry states retain explicit copy. The integration's configured enablement and Stripe mode determine availability; this document does not establish live enablement.

## Do's and Don'ts

- Do preserve the free, optional encouragement path and an obvious way back to the completed life.
- Do keep the popup's cream/caramel palette local and let the page inherit all four incumbent themes.
- Do keep support separate from keepsake purchase and fulfillment.
- Don't revive the canceled photo/postcard direction or promote research photographs into production assets.
- Don't treat encouragement acknowledgment as delivered correspondence or a redirect as confirmed payment.
- Don't infer deployment or charging success from local UI acceptance.

## Evidence and acceptance boundary

Compared the existing product commitments, root design tokens and sidecar narrative before documenting this extension. Their earlier locale counts, deployment descriptions and other pre-existing drift were not repaired in this task.

Implementation inspected: `author-support.js`, `author-support.css`, `author-support-copy.js`, `scripts/build-author-support.mjs` and `src/author-support.js`. These establish the scoped palette, native dialog behavior, localized pages, exact amount parsing and signed/provider-verified support flow.

`audit/author-support-20261029/verification.json` records local verification at `http://127.0.0.1:4186`: 12 modal combinations (320/390/1440px across blue/journal/editorial/night), ten locale forms, form validation, idempotent retry and server-verified return, with no recorded errors. These are local verification results; payment-return checks do not claim a real charge. The task handoff additionally records 145 passing tests, including four support-backend tests, and an independent finish verdict of **SHIP at presentation scope**. Those handoff results are recorded as supplied evidence, not a new test run by this documenter.

The initial release was subsequently deployed and its real Stripe checkout and unpaid return verified; see codex/author-support-acceptance-20261029.md. No actual charge was submitted by the agent.

User refinement on 29 October: the inline encouragement section now leads the ending, before the keepsake offer. It is a compact theme-colored banner with a cup icon, title/description and coffee button. Desktop uses a horizontal reading order; mobile wraps the button to a full-width row. The original cream popup is retained. Rendering an ending explicitly restores the banner as the first child so later ending renderers cannot push it below the offer. Education mode hides it. Local browser acceptance confirms the first-child position and twelve viewport/theme combinations without page errors; screenshots use top-invitation-* filenames.
