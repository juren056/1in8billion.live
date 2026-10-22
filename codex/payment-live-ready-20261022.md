# Payment live-ready acceptance · 2026-10-22 · v1.19.0

User scope: enable all website payment flows so live Stripe credentials can replace sandbox credentials. Existing rules, save formats, dates, model data, themes, analytics and default-expanded content are preserved.

Implemented:
- Worker accepts sk_test_ and sk_live_; rejects malformed configuration and provider/session/webhook environment mismatches.
- Checkout enabled in versioned config. Server-defined inline USD299 pricing removes the test Price ID dependency. Single completed life, one-time quantity one; browser amounts never set the charge.
- Existing D1 and signing secret remain; test/live request hashes separate checkout orders, while old test receipts retain test-labelled access. Session environment determines receipt mode.
- Nine-language purchase controls follow server health; generic public policy and server-confirmed order controls no longer claim all sales are closed/test-only. No consent prompt or analytics-provider changes.
- Verified paid events, ownership, line amounts/currency/type/quantity, idempotency and refunds/disputes remain enforced. No new checkout when delivery is disabled. Personal life text is not sent to payment endpoints.
- Six templates, three image ratios and A4/Letter PDF delivery preserved. Samples remain demo-only. No cloud recovery is promised.

Validation:
- npm run verify: build, 172-country invariants, 226 canonical/SEO routes, unchanged asset budgets, unit suite (76 tests after the final delivery-switch guard).
- tests/payment-live-ready-browser.cjs: 18 locale/mode combinations; sample disabled / own life enabled; test/live redirect; local design/claim restoration; actual personalized PNG generation after simulated verified payment; refunded download lock; no page errors.
- tests/test-purchase-browser.cjs: disabled readiness, saved design/language, no personal note in checkout POST, callback locked without entitlement.
- tests/premium-callback-browser.cjs: pending retry, query cleanup, bound claims, reload and nine-language return controls; actual PDF, card and three poster files generated under simulated entitlement.
- QA telemetry blocked. Browser evidence/logs are local-only in audit/payment-live-ready*. Real Stripe settlement has not been executed by these tests.

Switch instructions: premium-keepsake/PAYMENT_SETUP.md. User must replace BOTH the Secret Key and the LIVE webhook signing Secret in Cloudflare and deploy config. Price ID / publishable key are not required. Keep ORDERS and ORDER_SIGNING_SECRET. Live account capability and a signed live webhook delivery remain external acceptance; do not interpret health configuration detection as a real paid transaction.

Prior production rollback: Git 9efa8d795e6083e4d22b89d430e734ed8224f2fd; Worker d95ebae8-9eba-4f9e-8500-de27b0c49e50, deployment 51946db4-eb4b-4129-b591-d9f012729759. Preserve payment-capable runtime and database during rollback.
