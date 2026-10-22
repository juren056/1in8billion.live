# Production keepsake purchase experience — 2026-10-22

Scope: Simplified Chinese production, default blue theme, fresh isolated Chrome context, desktop 1440×1000 and mobile viewport 390×844. Analytics requests blocked. Started a new life through the birth dialog; advanced the simulation programmatically to inspect completion and the actual own-life purchase flow. This is not evidence of a full naturally paced playthrough, measured conversion rates, all themes/locales, or paid fulfillment. No payment details entered and no payment submitted. No production code/config changed.

## Observations

- Homepage has a keepsake navigation item, but the main in-body preview link appeared at document Y≈6918. Hero uses keepsake imagery without price or a purchase-oriented action.
- Completion emphasizes the free PNG and replay options. Premium preview button appeared at Y≈1415, below the initial ending composition.
- Own-life studio displays US$2.99 and six styles, three image ratios and A4/Letter PDF. Actual purchase button appeared at Y≈2023 desktop / 2797 mobile. Measurements are approximate for tested viewport/content.
- Download-demo PNG is solid blue; purchase is a less prominent pale button below customization and demo export controls. There is no persistent mobile purchase control in the tested studio viewport.
- Own-life preview is correctly personalized but remains watermarked as demo. Country sample selector still says completed example/Japan while preview shows the own-life country, creating source ambiguity.
- Artwork thumbnails are very small and generic compared with the requested emotionally expressive card references. Default movie-poster own-life preview is dominated by a late-life portrait and sparse event lines; visual value needs to be demonstrated with actual personal moments and multiple finished deliverables.
- Live health: checkout=true, testOnly=false, mode=live, amount=299, currency=usd. This is a one-time purchase per life, not a recurring subscription.
- First observed purchase attempt showed generic unable-to-open-checkout error. A separate new-life attempt succeeded (checkout API 200) and reached Stripe live checkout. Root cause of the first failure is undetermined; do not describe it as a confirmed server outage. The diagnostic script's later dynamic-import error on checkout.stripe.com was an audit-script wrong-origin import, not a product defect.
- Stripe checkout displayed merchant name Marcus, product Life Keepsake Pack — one completed life, US$2.99, Alipay and card, and live-mode notice. Brand mismatch warrants merchant-account review using truthful business details.
- Repeated copy asks users to check Stripe payment mode and emphasizes browser-local recovery. This exposes implementation concerns without giving a concise, reassuring delivery/recovery explanation.

## Recommended order

1. Reliability and trust: reproduce intermittent preflight/checkout failures with stage-specific errors; reconcile truthful checkout merchant branding; review recovery/support before scaling sales.
2. Discoverability: prominent homepage product action and price; personalized ending preview alongside a clear purchase-oriented action; sticky price/purchase control on mobile and visible desktop purchase summary. Keep free play/basic image discoverable.
3. Desire and value: lead with the current user's finished artifact, visibly compare free/basic versus purchased outputs, show card + inner pages + printable PDF using real records, curate templates for substantially different compositions. Do not invent life facts or popularity claims.
4. Simplify: select recommended style and defaults, make optional customization secondary, distinguish own life from examples, explain once-only payment and exact delivery/recovery conditions. Preserve truthful local-storage limitations.
5. Measure the full funnel: eligible completed lives → offer seen → own-life preview ready → checkout click → session created → verified payment → first authorized download. Segment language/device/source; separate test/synthetic traffic. Use measured cohort results before claiming conversion improvements or changing pricing.

## Acceptance targets

- On studio desktop/mobile, price and primary purchase control are visible without searching through customization; mobile control does not obscure content.
- Completion shows actual personal artifact and paid value before peripheral statistics.
- New/returning, sample/own-life, cancelled/failed payment and paid recovery states have clear next actions.
- Live checkout opens reliably for diverse supported life records; error stages are distinguishable. Payment settlement and fulfillment require separate authorized transaction evidence.
- Review all four themes and nine locales for final implementation, without modifying model rules, existing dates, saves, free access or telemetry identity.

Evidence: `audit/keepsake-conversion-20261022/` screenshots and probe scripts. Raw observations include ephemeral checkout session links and must not be published as a public artifact.
