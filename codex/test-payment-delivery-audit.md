# Test checkout and delivery audit · 2026-10-21

Scope: user confirmed a test-mode Stripe setup and requested rechecking delivery/content and opening payment. This release enables a **readiness-gated test checkout UI**, never live charging. Server continues to accept only Stripe test keys, non-live price/session/events and the fixed one-time USD 2.99 price.

## Corrected delivery gaps

- The six-style studio previously had no checkout action. It now offers clearly labelled, nine-language **test** checkout only for a saved completed local life and only when server health reports checkout=true/testOnly=true. Samples remain non-purchasable.
- Pre-checkout export/font/storage checks remain. Life commitment goes to the server; life text, personal title and note do not. Selected template, title, note, palette, ratio, paper and print preference stay with local order credentials before navigation.
- Stripe return keeps exports hidden until the server verifies the bound order/claim/snapshot commitment and returns paid entitlement. A success URL, local order flag or UI state never grants payment.
- Paid-test delivery now includes six selectable current card templates and all three ratios, as well as the selected-style A4/Letter PDF. Previous three poster exports remain available. Template/ratio changes and order status persist locally; malformed unrelated saved orders do not suppress valid orders.
- Failed/canceled/expired orders are distinct from paid. An explicitly retried expired/canceled checkout can get a new request ID; pending requests reuse the existing ID. Closing new checkout does not disable fulfillment for prior orders.
- Callback customization is masked for session recording; no test action emits a real purchase event.

## Configuration evidence and activation boundary

The refreshed authenticated Cloudflare production Settings table showed only PUBLIC_ORIGIN and the three KEEPSAKE switches; ORDERS had no binding. Secret values were not copied into code, commands, files or reports. The public health endpoint returned preview=true, checkout=false, testOnly=true. Runtime Stripe Secret/Price/Webhook/Order Signing and D1 readiness are therefore **not verified**. A suggested/unsaved dashboard configuration is not evidence of deployment.

Required configuration: test-only ORDERS D1 database with `migrations/0001_keepsake.sql` applied; STRIPE_SECRET_KEY as a Secret; active one-time USD299cents STRIPE_PRICE_ID; STRIPE_WEBHOOK_SECRET as a Secret; stable high-entropy ORDER_SIGNING_SECRET as a Secret. Webhook destination: `https://1in8billion.live/api/stripe/webhook`, with supported completed/async/expired/refund/dispute events. Add the actual D1 binding to Wrangler so Git deploys preserve it. Only then enable KEEPSAKE_CHECKOUT_ENABLED=true and retain fulfillment=true. Do not replace an existing signing secret or drop an order database if any orders already exist.

Wrangler now uses `keep_vars:true`; checkout/fulfillment switches are managed in the runtime dashboard and are not hard-coded back to false/true on every Git release. Missing checkout switch still means closed. Server test-key, bound-database, price, webhook and signing checks remain mandatory. No private key or fabricated D1 ID belongs in source control. Cloudflare configuration reference: https://developers.cloudflare.com/workers/wrangler/configuration/ .

## Acceptance status

`npm run verify` covers SQLite-backed D1 and **simulated** provider checks: amount/price, signature, environment, claim binding, idempotency, repeats/late events, refund/dispute, rate limits and independent stop-new switch. Browser simulations verify the local-life checkout entry, design/language persistence, no personal text posted, unpaid return lock, pending retry, refreshed entitlement and actual PDF/current card/three legacy poster downloads. Font/storage/in-app-browser failures stop session creation. These do **not** establish Stripe sandbox end-to-end payment or webhook delivery.

A real Stripe sandbox receipt, matching D1 paid row, verified webhook and return download remain pending the missing configuration. Live charging remains closed; seller/tax/refund/download rules and live-mode integration are separate requirements. Official fulfillment source: https://docs.stripe.com/checkout/fulfillment.md?payment-ui=stripe-hosted .
