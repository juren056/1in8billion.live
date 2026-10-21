# Microsoft Clarity · v1.14.2

Project supplied by user: z10y02dkut. User explicitly requested no visitor consent prompt and no disruption to existing analytics.

- Shared page head installs the supplied asynchronous loader once. The exact project ID is validated in site.config.json. A duplicate-script guard avoids multiple copies; Clarity retains its separate global/queue.
- No banner, analytics gate, forced consent grant or changes to GA4 initialization, dataLayer, gtag, siteEvent, GA4 ID or safe URL/event filtering. scripts/analytics.js and analytics-url.js are unchanged.
- Vendor regional/project settings are left unchanged. Loading a tag does not assert that every region/session produces a cookie-based recording.
- Recording masks cover personal game views, family trees, local collections, private note/feedback/birth dialogs and personalized keepsake previews. These attributes affect Clarity recording, not visible content or GA4 events.
- All public pages receive the shared loader; nonindexable checkout-return and404 pages remain outside tracking. Privacy pages explain behavior metrics, heatmaps, replay, cookies, masking and Microsoft privacy documentation in the page language.

Verification:

- npm run verify:53 automated tests,172-country checks,226-route SEO/sitemap, existing critical-asset budgets passed.
- tests/clarity-browser.cjs:13 representative pages across nine locales plus comparison/guide/keepsake/privacy; exactly one Clarity request and one GA4 config, existing game-start event, no added consent UI, no script errors.
- The browser suite stubs third-party scripts to avoid fake GA4 traffic or session recordings. VM tests verify duplicate install behavior and unchanged GA4 function/queue references and commands.
- Current HTTP probes of the vendor project tag returned204 with an empty body (proxy and direct connection). This does not establish receipt of recordings; project dashboard/network verification is recorded separately after publication. The project ID was not guessed or changed.

Original SVG/PNG favicon, simulation rules, dates/statistical inputs, storage keys and playback are unchanged. Release uses the existing Git→Cloudflare pipeline. Current external evidence is in audit/clarity-install/.

Official implementation references:
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking
- https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure
