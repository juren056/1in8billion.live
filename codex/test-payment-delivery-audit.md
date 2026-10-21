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

## Provisioning after explicit user authorization · v1.16.5

Created dedicated `1in8billion-keepsake-test` D1, ID `4a38f0a0-81ca-4c68-8c9e-fec415638941`; applied `0001_keepsake.sql` remotely and verified all three business tables. Bound it as ORDERS in Wrangler. Generated ORDER_SIGNING_SECRET from 32 random bytes and sent it directly to Cloudflare stdin without printing or saving its value. Preserve this secret for existing claims.

Created the sandbox-only product `prod_VTu8xV9JkcmmpA` and its active one-time USD 2.99 price `price_1USwKVLYvwXgXyhf16vQk4uH`, recorded as the public STRIPE_PRICE_ID setting. Test checkout switch is enabled in the runtime dashboard; complete server test configuration is still required before health can advertise checkout availability.

Inspected existing sandbox webhook `we_1USvSMLYvwXgXyhfSafSXP1m`. Its URL was incorrectly `http://1in8billion.live//api/stripe/webhook`; corrected the same endpoint to `https://1in8billion.live/api/stripe/webhook` and renamed it `1in8billion keepsake TEST`, preserving its signing secret and all seven required events. The corrected endpoint and active status were verified in the Stripe UI; local proof `audit/stripe-webhook-corrected.jpg`.

Wrangler's initial active Secret list was empty, despite the user's prior entry; after provisioning it contained the newly generated ORDER_SIGNING_SECRET. STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must actually be saved/deployed as Secrets on this Worker before a genuine sandbox Checkout can be created. No secret values were requested in chat or copied from browser authentication state.


## Genuine Stripe sandbox acceptance · v1.16.6 · 2026-10-21

This section supersedes the historical missing-configuration and pending-sandbox statements above. The user deployed both Stripe Secrets. Active Secret names and public health were verified; health returns preview=true, checkout=true, testOnly=true. No secret values were read or recorded.

A completed 68-year USA life was replayed through the production Chinese UI and opened from its ending. The studio selection was editorial-magazine, 1:1, Letter, print-friendly, with a Chinese custom title and a clearly labelled personal note. A real Stripe TEST Checkout was created for USD 2.99. Merchant cancellation returned a pending order with downloads locked. Returning to the same session created no duplicate order. The Stripe decline test card visibly failed; replacing it with the official successful sandbox card completed payment without real funds or saving payment details.

Webhook event evt_1USwkYLYvwXgXyhfzpDBw2sM was processed at 2026-10-21T10:28:03.259Z. Dedicated test D1 order 880e15fa-9095-4569-b3e4-bb03ec647feb is paid, amount_total=299, currency=usd, with payment intent recorded and fulfillment_ready_at set. This is actual Stripe sandbox evidence, distinct from mocked automated tests.

The return page restored editorial-magazine and 1:1, and authorized exports. Real Chrome downloads: PNG 2880×2880 (453344 bytes), PDF 15 pages / Letter 612×792 points (13883239 bytes). Rendered cover preserves Ramos Avery, Chinese custom title/note, 2026-10–2094-10 and fictional/symbolic disclaimers, without DEMO watermark. The last page retains sources. Files and UI screenshots are local audit artifacts, not committed private order credentials.

Acceptance discovered misleading preview-only copy and English callback guidance. Updated nine-language purchase status/FAQ to distinguish sandbox checkout and non-purchasable examples; localized callback controls and added a same-browser return-to-keepsake link preserving the local record. Server paid entitlement remains the only download authorization. Reload and Git-deploy persistence are checked after publication. Cancellation, decline, paid/webhook and downloads were exercised against Stripe; refund/dispute, async and duplicate event edge cases remain covered by provider simulations, not claimed as real sandbox transactions.

Validation: build, 226-page SEO, immutable data validation and asset budget pass; all 68 tests pass sequentially (an initial parallel run encountered Windows memory/spawn exhaustion); callback actual PDF/card/poster simulation, readiness-gated checkout UI and font/storage/in-app failure browser suites pass. Live charging remains closed. Seller identity, tax/refund rules and separate live-mode authorization/configuration are still required for real sales.
