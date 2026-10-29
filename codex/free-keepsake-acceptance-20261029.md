# Free keepsakes — 29 October 2026

User requested removal of keepsake charging. Personal keepsake PNG and PDF exports now download directly without checkout. Six designs, three image ratios and A4/Letter paper settings remain. Personal exports do not receive the sample watermark; sample exports remain labeled as demonstrations.

Home, ending, studio, product metadata and ten-language free labels remove the US$2.99 offer. The purchase panel is no longer installed. The public checkout endpoint returns HTTP 410 and free=true even if an old deployment variable still enables checkout. Health reports free=true, checkout=false and amount=0. Existing signed historical order fulfillment/webhooks remain available; isolated historical-payment regression tests exercise that older handler separately. Creator coffee support remains optional and uses its separate Stripe endpoint.

Browser acceptance with a genuinely completed life: six designs render; a 2880×2880 PNG and both A4/Letter PDFs download with keepsake filenames; no keepsake API requests occur. Ten localized studios expose no purchase button or 2.99 price. Four themes retain enabled export controls. No page errors. Receipt and screenshot: audit/free-keepsake-20261029/verification.json and free-download-390.png. No real payment was submitted.

Release v1.35.0, source f9f5e60, Cloudflare version 3d1c4e4b-2dcc-4dd8-a373-caf0864c0769. All 147 unit tests passed and existing SEO/asset checks passed. Production health confirms free=true, checkout=false, amount=0; the retired checkout endpoint refuses new purchases. Creator support health remains enabled in live mode. PDF parsing confirms both downloaded books contain 26 pages with the respective A4 (595.28×841.89 points) and Letter (612×792 points) page dimensions. The downloaded PNG was visually checked without a sample watermark.

Final production browser acceptance also passed: actual completed-life exports, all six design previews, ten localized studio pages, no keepsake API/checkout requests and no page errors. The verification.json base now records the production domain. Twenty built home/studio routes have no remaining 2.99 price in public markup.
