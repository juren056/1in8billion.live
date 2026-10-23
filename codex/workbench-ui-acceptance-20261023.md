# Life workbench UI · v1.27.0

Implements the approved operating-layout, story-action and choice-card refinement across clear blue, travel journal, editorial and cinema themes.

## Delivered

- Brand link returns to the language-specific homepage; the static fallback is a real homepage link. Returning preserves the local life.
- Desktop playback and music controls share the right rail with existing people information. Tablet uses a two-part rail. Mobile has a compact fixed playback control and an expanded settings state; no duplicate controls or simulation timers are created.
- Conflicting legacy layout moves are filtered. A guarded presentation-only observer restores the command bar if an older adapter reparents it. Original DOM IDs and event controllers are retained.
- Feed actions have explicit button surfaces, spacing, direction indicators and bookmark state. Narrative prose has an intentional reading scale, more line spacing and category-specific emoji accents; heavy events are not given celebratory accents.
- Waiting decisions, the latest story, prior context, choice options and result actions have a shared readable hierarchy. Theme tokens govern foreground/background colors. Journal/editorial refinements retain their existing visual worlds. Dialog entrance motion respects reduced-motion preferences.
- Public navigation has increased spacing and readable labels; game navigation remains separate.

## Verified

`npm run verify`: 120 passed, zero failed. Includes all 226 canonical pages, asset budgets, existing nine-locale narrative contracts, legacy routing, mortality and premium snapshot checks. No new game rules, record migrations, payment configuration or analytics collection changes.

CUA actual browser checks: paused and resumed a v6 Japan test life; switched manual choices on; sought the age-4 toy decision with an age-3 prelude; deferred and reopened the pending card; chose help and saw relationships +2; clicked the brand and found the same age-4 continuation on the homepage; restored it and toggled a bookmark to aria-pressed=true.

Desktop all four themes were switched in the actual browser. Mobile 390×844 checked all four themes: content width and scroll width were 375px, with the original playback controls inside the dock. Expand/collapse exposed playback and music settings. Button foreground/background pairs were recorded from the DOM. No complete nine-language visual matrix or real Stripe transaction is claimed.

Local evidence: audit/workbench-ui/mobile-checks.json, night-desktop.png, night-moment-mobile.png. These are synthetic QA records, not customer testimonials. Temporary viewport override was reset.

Baseline/rollback: f1de8a4dfa51e108158aa6696a8a4b94ed2bf281. Git deployment and exact production release checks follow the local acceptance.
