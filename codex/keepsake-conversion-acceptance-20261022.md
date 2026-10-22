# Keepsake purchase funnel acceptance — v1.22.0

Approved scope: implement the 2026-10-22 conversion review, preserve free play, existing prices, simulated rules/data/calendar, saves, four website themes and nine languages. No recurring subscription or cloud-storage promise added.

## Delivered

- Homepage has a priced keepsake link in the hero and the main product showcase immediately after the hero, before long galleries.
- Completion presents an actual record-derived preview and a clear US$2.99 keepsake action. The older enhancement no longer relocates it into a secondary section. Snapshot navigation remains local and private.
- The studio puts its purchase summary before customization. On mobile the actual purchase control stays at the bottom, with price, once-only wording, delivery conditions and order recovery. Reading a modal hides this bar.
- Free demo exports remain available with secondary emphasis. Own-life identity and examples are distinct. Users can inspect the book’s actual pages and record/page counts before buying.
- Six template thumbnails now use six actual committed sample records. The cinematic composition separates its scene, character and recorded moments; it no longer crops the whole card around an enlarged portrait. All facts still come from the same immutable snapshot.
- Nine native-language value, once-only, delivery, sample and error states. Browser-local recovery limitations remain visible; implementation-oriented payment-mode wording has been removed from live sales notices.
- Checkout preflights the selected design’s actual PDF, retries a transient font/art load once, and blocks undeliverable records. Provider calls time out, retries keep their request ID, and existing orders must pass a fresh credential-storage write check.
- Stage-specific file/storage/browser/provider feedback replaces the single generic error. No names, notes, story records or credentials enter funnel events.
- Stripe session brand display and product label use 1in8billion.live. Session-specific styling does not mutate the account’s legal identity, terms or receipts. Official parameter reference: https://docs.stripe.com/api/checkout/sessions/create?query=branding_settings

## Measurement

Existing `life_completed` → `keepsake_offer_view` → new `keepsake_preview_click` → `keepsake_preview_ready` → `keepsake_checkout_step` (`live_click`, `live_session_created`, stage errors) → `keepsake_payment_verified` → existing `keepsake_download_success`.

Payment verification events require a successful server response, paid status and an export token, and deduplicate locally per order. Test/live/unknown are distinguished. No conversion uplift or real payment settlement is claimed by these tests. Actual cohorts must be observed after release; synthetic browser traffic blocks GA/GTM/Clarity requests.

## Local acceptance evidence

All logs below are under `audit/keepsake-conversion-20261022/` unless noted.

| Verification | Result |
| --- | --- |
| `npm run verify` | 86/86 tests; 172 country records valid; 226 canonical/indexable pages pass SEO; critical asset budgets pass |
| `tests/keepsake-conversion-browser.cjs` | 72 combinations: 9 languages × 4 themes × mobile/desktop; buy control visible and hit-testable; contrast ≥4.5; no horizontal overflow; sample/own separation; 18 template ratios; book preview; actual ending-to-studio handoff |
| `tests/keepsake-record-preflight-browser.cjs` | 12 actual model-generated country records, including short lives; selected-design PDF preflight succeeds without creating an order |
| `tests/keepsake-checkout-failures-browser.cjs` | First font request 503 recovers before checkout; provider retry reuses request/commitment; read-only storage and unsupported PDF block checkout; safe stage events |
| `tests/payment-live-ready-browser.cjs` | 18 language/mode states; test/live isolation, sample lock, local order recovery, actual PNG under mocked authorization, refund lock |
| `tests/rebirth-keepsake-browser.cjs` | 18 previews, preserved visual identity; actual PNG and PDF under mocked authorization; refund removes downloads |
| `tests/premium-callback-browser.cjs` | Pending polling, bound claim, reload, actual PDF/card/legacy PNG exports; no payment granted by callback URL |
| `tests/keepsake-recovery-browser.cjs` | Sample outage, font failure and missing snapshot recover through visible controls |

Initial audit observed one checkout failure followed by a successful checkout for a different life. Its exact historical root cause was not captured and is not asserted here. Reproducible storage/retry weaknesses were fixed; staged diagnostics now distinguish future failures.

## Release gate

Local verification passed. Production acceptance must separately confirm the exact Git revision/version, deployed assets, nine-language public routes, live health and a new unpaid Stripe session with site branding. No real charge, paid live webhook or live paid fulfillment has been exercised by this task. The final deployment receipt is recorded separately after publishing.
