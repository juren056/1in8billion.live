# Audience-led narrative expansion · v1.26.0

## Scope and priority

Authenticated GA4 and Search Console country reports for this site were inspected on 2026-10-23. Country/region demand informed the next four packs: France, Taiwan, Hong Kong and Singapore. Detailed account identifiers, traffic counts and screenshots remain in local private analysis, outside this public repository.

Existing Japan, China, United States, India, Brazil and Nigeria packs remain available. Ten settings now have ten local daily scenes and three local adaptations each; the other 162 birthplace settings use the shared narrative pool. These are original fictional possibilities, not claims about every resident's culture. The local adaptations reuse three tested branch prototypes; they are not thirty independent story systems.

Visitor location is neither nationality nor a chosen birthplace. No IP routing, additional location collection, automatic birthplace assignment or new public SEO routes were introduced. GA4 revenue fields alone are not evidence of actual Stripe order volume.

## Implementation

- Four new packs add 40 daily scenes and 12 local adaptations, bringing v6 to 260 daily scenes and 42 shared/local story definitions.
- Local scenes connect reading, creative attempts, school objects and recorded family relationships. Decisions require actual prior history and eligible living contacts. Follow-up events occur two and five years after the relevant choice when life permits.
- The nine locale dictionaries contain 992 matching keys each. French decision and follow-up copy received an additional editorial pass. Other translated prose is not claimed to have native editorial sign-off.
- New lives use rules version 6. Frozen v4/v5 engines and content are unchanged; existing lives and replay versions keep their previous rules. Card snapshots and book layouts accept v6 chapter records.
- Production analytics and payment configuration are unchanged. The local preview server suppresses analytics so further development checks do not add production telemetry.

## Verification and limitations

`npm run verify`: 120 tests passed, 0 failed. The build checks 172 birthplace records, 226 canonical pages and asset budgets. New narrative tests cover all 100 local daily scenes, all 126 branches, ten local packs plus the shared fallback, deterministic paired histories, eligibility, refresh, duplicate resolution, deceased contacts and end-of-life guards. These are synthetic narrative tests, not a claim of 190,080 real full-engine simulations.

CUA browser checks exercised France in French, Taiwan in Traditional Chinese, and Hong Kong/Singapore in English. France and Singapore reached age 61 with completed endings; Taiwan's manual choice paused at age 15, showed age-14 context, applied knowledge +3 and happiness -1, and continued into its local scenes. Hong Kong's reading notebook and Taiwan's classroom journal appeared with actual recorded contacts. Singapore's completed snapshot contained 99 events and generated a 26-page book preview labelled replay-v6. All six PNG card previews were individually awaited until their Singapore image labels updated. At the 390px browser viewport the document content width and scroll width were both 375px, with no unresolved person/activity/age/place placeholders. Temporary viewport override was reset.

Local UI proof: `audit/story-v6/cua-sgp-keepsake-mobile.png` (private working evidence, not committed). Only the local preview was exercised for these content checks; production billing health is checked separately. Earlier v5 browser, PDF and legacy golden suites are historical evidence; their large matrices were not rerun or relabelled as v6 results.

Release rollback target: `cb5db79339807a3f898774474d4fc48da3052303`. Live release and billing-health checks must pass after Git deployment. No real charge is submitted during acceptance.
