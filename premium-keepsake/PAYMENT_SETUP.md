# Payment mode switching · v1.19.0 · 2026-10-22

This file supersedes the historical test-only setup. Checkout is enabled in wrangler.jsonc; the Worker accepts Stripe test and live Secret Keys and advertises the actual mode at `/api/keepsake/health`. Nine-language checkout UI follows that mode. Never paste secrets into chat or Git.

## Switch to real payments

In Cloudflare → 1in8billion-live → Production → Settings, replace these **Secret** values together and deploy the configuration:

- `STRIPE_SECRET_KEY`: the activated Stripe account's `sk_live_…` key.
- `STRIPE_WEBHOOK_SECRET`: the `whsec_…` signing secret of the **live** webhook destination.

The live webhook URL is `https://1in8billion.live/api/stripe/webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`.

No publishable key or Price ID is required: hosted Stripe Checkout uses server-defined inline pricing, USD 299 cents, quantity one, one-time payment for one completed life. Any legacy `STRIPE_PRICE_ID` variable is ignored. The Stripe account must support live charges; the checkout response itself must match the key's environment. The webhook signing secret cannot be verified until Stripe sends a signed event; merely changing the API key is insufficient for paid-file delivery.

Preserve `ORDER_SIGNING_SECRET`, `ORDERS` D1 and `PUBLIC_ORIGIN`. Do not reset the database or signing secret. Existing test receipts remain labelled test after switching; live and test requests have separate order hashes. Orders are identified by their immutable Stripe Session environment. No migration is needed. Old test-paid orders retain their own test-labelled download entitlement and never become real purchases.

## Delivery and storage

The browser persists a completed life and claim credentials before leaving for Stripe. Only a server-verified paid session unlocks personalized files. Redirects and client-side flags do not grant access. Delivery includes six styles, three HD PNG ratios and A4/Letter PDF. Samples remain demos and cannot be purchased. Recovery is limited to the browser storing the life and claim; there is no cloud/cross-device recovery. Clearing site data can remove recovery access. Support: support@1in8billion.live.

The server verifies signed webhook timestamp, payment environment, session ownership/product metadata, USD 299 total, single one-time USD 299 line item and quantity, then writes order status atomically with event deduplication. Refunds/disputes disable further delivery. Failed/expired/pending payments do not unlock downloads.

## Acceptance and incident response

`npm run verify` runs SQLite/D1 and simulated-provider tests including test/live success, test/live mismatch, idempotency, forged callbacks, wrong amounts, cancellation, expiry, refund/dispute and bound claims. `tests/payment-live-ready-browser.cjs` tests nine languages and simulated hosted checkout/delivery. Mocks are not a real Stripe transaction. No real payment is made by these tests.

After configuration, `/api/keepsake/health` should report `checkout:true, mode:"live", testOnly:false`. Verify the live webhook's Stripe dashboard delivery status before relying on unattended fulfillment. Preserve the last payment-capable Worker version and D1. Pause only new orders with `KEEPSAKE_CHECKOUT_ENABLED=false`; leave `KEEPSAKE_FULFILLMENT_ENABLED` enabled for existing paid orders. Do not roll back to a pre-payment Worker or drop/recreate D1.

Stripe reference: https://docs.stripe.com/api/checkout/sessions/create
