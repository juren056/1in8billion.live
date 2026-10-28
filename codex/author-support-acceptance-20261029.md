# Creator support — 29 October 2026

User requested an encouragement/coffee invitation after a completed life, then a standalone support page with arbitrary custom amounts via existing Stripe. Final steering explicitly retains the previous cream/caramel thank-you-letter popup. The proposed photo/postcard replacement was canceled before wiring; no new photo assets ship.

## Delivered

- Warm standalone popup, readable coffee-brown copy on cream paper, cup icon, primary coffee link, free encouragement and clear close/return.
- At the end of a newly completed life, reaching the final invitation starts a three-second idle timer. It never opens over an existing modal or outside the ending. Dismissal/open is remembered locally for seven days; explicit reopening remains available. Education mode excludes invitation.
- Independent support page in ten languages, four website themes, USD3/5/10 presets and custom decimal USD amount. All payments are optional and one-time, with no subscription or keepsake entitlement.
- Server derives exact cents, validates amount/origin/request IDs, rate-limits and uses Stripe idempotency. Amount range is USD0.50–999,999.99 within the chosen processor/currency interface; processor/account limits can additionally apply.
- Anonymous signed checkout receipt stored in browser. Thanks URL alone is never payment proof: return checks actual Stripe session, product, currency, amount and paid/refund/dispute state. Existing keepsake claims and order tables are not reused. Signed creator-support webhook events are acknowledged separately.
- Privacy/terms disclose support and local state. Support/return utility pages are noindex and receive no AdSense scripts. No fake public donor counters or supporter wall.

## Verification

145 total unit tests passed, including four new creator-support cases and existing payment regression. Targeted eleven payment-safeguard tests also pass after final backend changes. SEO validation covers existing 258 indexable routes; critical budgets unchanged.

Browser acceptance: twelve popup viewport/theme combinations and ten support-page locales pass with no page errors. Invalid small amounts are blocked; comma decimal normalized; retry keeps request ID; free encouragement confirmation, escape close, manual reopen and server-verified pending/paid return states pass. Stripe responses in this local browser test are mocked, never described as a live settled payment.

Independent finish review: SHIP at reviewed presentation scope after correcting Chinese support-page heading to phrase-aware lines. Screenshots: audit/author-support-20261029/. Production release and live checkout acceptance recorded after deployment below. No charge has been submitted by the agent.

Primary references: https://docs.stripe.com/api/checkout/sessions/create and https://docs.stripe.com/currencies. Layout inspiration: https://buymeacoffee.com/ and https://ko-fi.com/; no third-party branding, testimonials or supporter counts copied.
