# Keepsake local payment integration

Production remains preview-only. User confirmed there is no Stripe test environment. No live key is accepted by this Worker. Do not flip checkout merely because the price was approved.

## Run without credentials

`npm run verify` includes SQLite-backed D1 and simulated Stripe provider tests. With the static preview server running on 127.0.0.1:4186 and PLAYWRIGHT_MODULE set, run `node tests/premium-callback-browser.cjs`, `node tests/premium-failure-browser.cjs`, and `node tests/premium-local-browser.cjs`. Callback tests stub entitlement locally and produce explicitly test-only files; they are not Stripe sandbox transactions.

## Later sandbox setup (not performed)

Create a separate test D1 database and bind it as ORDERS. Apply migrations/0001_keepsake.sql to that database. Add a d1_databases binding using its actual database_id, never a fabricated ID. Configure STRIPE_SECRET_KEY (sk_test_), STRIPE_PRICE_ID (active, one_time, USD299cents), STRIPE_WEBHOOK_SECRET and a high-entropy ORDER_SIGNING_SECRET using Cloudflare secrets. Never commit secrets or send them in chat. Maintain stable ORDER_SIGNING_SECRET across deployments: rotating it without a migration can invalidate anonymous claims.

Point a Stripe snapshot webhook to /api/stripe/webhook, subscribing to checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded, charge.dispute.created and charge.dispute.closed. Only after configuring the test deployment can KEEPSAKE_CHECKOUT_ENABLED=true be used there. Use a separate origin/test database; PUBLIC_ORIGIN must exactly match it. Create a completed local snapshot then call createTestCheckout(localId) in a test harness. Persisted order/claim credentials must be read back before navigation to the returned Checkout URL.

Actually verify paid, canceled/failed, asynchronous completion, duplicate/out-of-order webhook, refund/dispute and returning downloads. A redirect alone never unlocks files. Pending status retries at most eight times, then offers manual check/support. Cancellation does not create another checkout; free browser saves remain available from Continue free. The claim supports the same browser only, not account/cloud/cross-device recovery. The saved-order picker avoids choosing a different order silently.

## Boundaries before any live release

B is BLOCKED until real Stripe sandbox receipts pass. C is BLOCKED until seller identity, refund/tax/download validity rules, processor availability and separate explicit live approval are supplied. Public support email is support@1in8billion.live. Current callback UI is English-only and test-labelled. Production purchase/begin_checkout analytics and live purchase deduplication require actual test-order verification before implementation/activation; no intent event is called purchase. Cross-device order recovery is not offered. Client-side export is not DRM.

## Incident and rollback

Pause new orders with KEEPSAKE_CHECKOUT_ENABLED=false while leaving KEEPSAKE_FULFILLMENT_ENABLED=true. Keep the Worker, ORDERS binding and payment secrets usable for prior paid orders. Never drop/recreate an order database during code rollback. Before any real sale, persist the last known good payment-capable Cloudflare version. Baseline6f54de32905f03db5f98d41c0eb8bd7d194be8dc predates payment support, so it is only a safe full rollback while zero payments exist. After sales, use a forward fix or the last payment-capable deployment and preserve D1.

Official references checked 2026-10-20: https://docs.stripe.com/webhooks , https://docs.stripe.com/checkout/fulfillment , https://developers.cloudflare.com/workers/static-assets/ .
