# Home and simulator advertising — 30 October 2026

Supersedes the earlier article-only opt-in layout at the user's explicit request: advertise on home and simulator, remove the custom question, and increase inventory while retaining the game experience. This is a scoped direct non-personalized rollout, not unrestricted worldwide serving.

Home: one placement after the hero and one after birthplace discovery. Simulator: one separate region after the game boundary, with 160px top/bottom spacing. Dialogs and non-story panels hide the zone. Long guides/country articles: two placements maximum; shorter articles retain one. Inventory: 218 static placements across 123 localized pages, including ten home documents with separate home/game view slots. No automatic ad refresh by year, new life or view return. SDK loads once; slots submit only once when visible and active.

No custom permission card is shown. Existing 180-day advertising denials and GPC are honored. A disable/enable control remains. EEA, UK, Switzerland, Russia and unknown geography remain excluded because certified CMP coverage is still unverified; removing the question does not override that boundary. Non-personalized and restricted-data-processing flags remain. No game's RNG, stored lives, files, payment or engine state is changed.

Local acceptance: real start/automatic-play entry, two home slots, one simulator slot, shared SDK, measured 160px separation, four themes at mobile/desktop widths, no overflow, private-view/dialog hiding, no repeated submission when returning to the game, previous denials, protected-region rejection and direct article loading all passed without page errors. Network is mocked: zero real ad requests or clicks. Screenshot fixtures explicitly say TEST AD PLACEMENT, not proof of live fill.

Official placement guidance refreshed: https://support.google.com/adsense/answer/2768340 ; https://support.google.com/adsense/answer/1346295 . Google recommends at least 150px separation from a game; the implemented separation is 160px. Visual detector flags inherited 12px neutral ad labels and 8px control radius as advisory values outside the old design document; these preserve the incumbent advertising/control style rather than change global tokens.

The complete checklist reuses the prior account/content evidence for unchanged items and updates affected controls; unknown traffic/account-audience facts remain unknown.

| ID | Status | Evidence and next action |
| --- | --- | --- |
| ADS-ELIG-01 | Pass | User explicitly confirmed account holder is at least 18. |
| ADS-ELIG-02 | Pass | Existing account used; no duplicate account created. |
| ADS-ELIG-03 | Pass | Dashboard approval verified; current public article inventory reviewed against official policy. Approval does not guarantee all future content. |
| ADS-ELIG-04 | N/A | Independent Cloudflare website, not hosted YouTube/Blogger flow. |
| ADS-OWN-01 | Pass | Repository, build and production deployment access. |
| ADS-OWN-02 | Pass | User's existing website and authorized deployment. |
| ADS-OWN-03 | Pass | Working browser game; prior mobile/desktop Chromium acceptance. |
| ADS-SITE-01 | Pass | Dashboard 1in8billion.live: ready; ads.txt authorized. One real responsive unit created: 9459958473. |
| ADS-SITE-02 | Pass | Dashboard supplies exact account meta tag; build includes it. |
| ADS-TXT-01 | Pass | Correct DIRECT seller line generated for dashboard publisher ID; verify live. |
| ADS-TXT-02 | Pass | ads.txt added by build, not temporary manual dist edit. |
| ADS-CONTENT-01 | Pass | Working life simulation, interactive comparison and original explanatory guides. |
| ADS-CONTENT-02 | Pass | MIT adaptation disclosed; interactive added value; photo sources/license listed. |
| ADS-CONTENT-03 | Pass | Representative guides/country/method pages have public task explanations and model context. Google may judge value differently. |
| ADS-CONTENT-04 | Pass | Working production simulator, free exports and public explanatory content. No under-construction inventory. |
| ADS-CONTENT-05 | Pass | Density bounded to two home placements, one external simulator placement and at most two on substantial articles. 218 static placements across 123 routes; hidden views never request ads. |
| ADS-CONTENT-06 | Pass | Ten supported primary languages; actual translated game content. |
| ADS-CONTENT-07 | N/A | No public UGC/comment wall; imported family information stays local. |
| ADS-CONTENT-08 | Pass | SEO check across 258 routes; distinct task/country content and transparent limitations. |
| ADS-UX-01 | Pass | Prior 28 viewport/theme and ten-language generator checks; navigation accessible. |
| ADS-UX-02 | Pass | Play, Compare, Countries, Guides and Keepsake navigation; usable game start. |
| ADS-UX-03 | Pass | Actual play/download/payment actions; no fake ads/buttons or unrelated redirect. |
| ADS-UX-04 | Pass | Source and previous real-browser flows show user-initiated overlays/downloads only. |
| ADS-UX-05 | Pass | Public About/Contact/Privacy/Terms/Sources and support address. |
| ADS-UX-06 | Pass | Neutral localized ad label, no question card, no deceptive navigation or advert-like play/download controls. |
| ADS-CRAWL-01 | Pass | Production browser pages and curl home/guide/robots return public content/200. |
| ADS-CRAWL-02 | Pass | robots allows all, tested Google user agents 200, and Google ownership verification succeeded. Default Python 403 remains a client-specific observation; cannot infer universal crawler access. |
| ADS-CRAWL-03 | Pass | Public static GET HTML; POST reserved for actual payment operations. |
| ADS-CRAWL-04 | Pass | Tested canonical domain opens directly; explicit legacy redirects. |
| ADS-CRAWL-05 | Pass | Stable public paths and canonical tags; private inputs stripped from analytics URLs. |
| ADS-CRAWL-06 | Pass | HTTPS public production responds; no long-term uptime guarantee inferred. |
| ADS-CRAWL-07 | Pass | robots sitemap and 258-route canonical/internal-link tests. |
| ADS-PROG-01 | Unknown | Owner traffic/click history not audited. Automated verification intercepts Google advertising requests; no real ad clicking or synthetic impression loops. |
| ADS-PROG-02 | Pass | No copy rewarding/soliciting ad clicks. |
| ADS-PROG-03 | Pass | Neutral Advertisement label in ten languages; no support/click/reward language around ads. |
| ADS-PROG-04 | Unknown | No current GA4 source audit in this application; owner traffic acquisition remains unverified. |
| ADS-PROG-05 | Pass | One shared official SDK per document, independent once-only visible units, NPA/RDP. No year-based or automatic refresh. |
| ADS-PROG-06 | Pass | Public home and article inventory plus a separate zone outside the browser simulator. No ads in dialogs, memoir editing, family-tree view, support or payment screens. |
| ADS-PROG-07 | N/A | Browser website, no native WebView monetization. |
| ADS-PUB-01 | Pass | Fictional game/guides; no illegal service, download or illegal activity instruction identified. |
| ADS-PUB-02 | Pass | MIT license retained, real-photo attribution and Pexels license documented, own symbolic art provenance. |
| ADS-PUB-03 | Pass | Heavy fictional events are non-graphic; no encouragement/instructions/praise of self-harm or violence identified. |
| ADS-PUB-04 | Pass | No animal cruelty or endangered-species sales. |
| ADS-PUB-05 | Pass | Independent identity, engine adaptation and model limitations disclosed. |
| ADS-PUB-06 | Pass | No deceptive income claims; free exports; voluntary creator support explicitly separate. |
| ADS-PUB-07 | Pass | No cheating/cracking/spyware/document-forgery features. |
| ADS-PUB-08 | Pass | No sexual services or child sexual content in inspected catalog/media. |
| ADS-PUB-09 | Pass | Publisher ID copied from account dashboard; fixed domain/seller mapping. |
| ADS-PUB-10 | Pass | Simulator ad measured 160px below the game boundary; no floating overlay or game-blocking countdown. Ads hide for dialogs and non-story/private panels. |
| ADS-PUB-11 | Pass | Working game and substantial home/article content precede placements. Noindex and low-content utility pages excluded. |
| ADS-PUB-12 | Pass | Intersection, visible document and active view checks; ins is created only immediately before its own push so a pending offscreen unit cannot consume another placement request. |
| ADS-PUB-13 | Pass | Statistical limitations explicit; no individual medical/financial prediction claims in current model explanations. |
| ADS-PUB-14 | Pass | Symbolic/game imagery and real-photo sources documented; no manipulated public-event evidence. |
| ADS-PUB-15 | Pass | Inspected fictional childhood/education/relationship catalog has no exploitation or sexualized-minor imagery. |
| ADS-PUB-16 | Pass | No active-crisis exploitation inventory; fictional hardship not presented as current reporting. |
| ADS-REST-01 | Pass | No sexual products/advice/services identified. |
| ADS-REST-02 | Pass | Non-graphic illness/death/conflict themes; no graphic media identified. Reassess future ad context. |
| ADS-REST-03 | Pass | No weapon sales or construction/acquisition instruction. |
| ADS-REST-04 | Pass | No tobacco/drug sale or production instruction. |
| ADS-REST-05 | Pass | No alcohol sales or irresponsible-drinking promotion identified. |
| ADS-REST-06 | Pass | Free fictional game and free keepsakes. No paid chance, wager or prize; optional coffee support is independent. |
| ADS-REST-07 | Pass | No pharmacy/prescription/unapproved-drug offers. |
| ADS-REST-08 | Pass | Responsive normal-flow placements; no video/sticky/fullscreen ads; 160px game separation and no ad/content overlay. |
| ADS-PRIV-01 | Pass | Privacy updated to direct NPA/RDP serving in eligible regions, no custom question, opt-out retention, exclusions and per-placement visibility. |
| ADS-PRIV-02 | Pass | Google and third-party cookie/beacon/device disclosures; non-personalized does not mean cookie-free. |
| ADS-PRIV-03 | Pass | No engine values, names, notes or religious/health traits read for targeting; private/query/fragment URLs and private game panels excluded. |
| ADS-PRIV-04 | N/A | No ads in EEA/UK/Switzerland pending certified CMP verification. Google embedded manager returns ERR_CONNECTION_CLOSED; custom opt-in is not described as certified. Broader analytics consent is outside this ad release. |
| ADS-PRIV-05 | N/A | No precise geolocation collection; Permissions-Policy geolocation=(). |
| ADS-PRIV-06 | Unknown | Inventory is country analysis and operating guides, not child-directed play screens. Owner-wide child audience designation not independently confirmed; no age-based targeting added. |
| ADS-PRIV-07 | Pass | No custom Google-domain cookie manipulation/proxy in inspected scripts. |
| ADS-PRIV-08 | Pass | Non-personalized and restricted-data-processing flags; no fictional health/religion/family/name inputs, no ad audience lists. |
| ADS-PRIV-09 | N/A | Does not advertise or retarget housing/employment/credit offers. |
| ADS-PRIV-10 | N/A | No personalized ads. Existing visitor denials and GPC retained; per-placement advertising disable/re-enable control. Protected CMP regions remain blocked. |

Completeness: 73 reference IDs; 73 rows; missing IDs: none.

Release: v1.37.0, source 12b6221, Cloudflare version 08833e99-22df-478b-b07f-ea720823c0e7. All 150 unit tests passed, with zero failures; data/SEO/asset checks passed. Critical payloads: home 459,755 bytes (unchanged), comparison 114,747 bytes (unchanged), quick-play guide 23,551 bytes (within its existing budget). The game initializes ad layout only after its workspace is ready; heavier ad code/CSS and SDK remain viewport-triggered. Production HTTP confirms visible-direct-v2 and NPA/RDP flags. Ad fill and revenue are not asserted.

Final production browser acceptance passed: home two slots, simulator one, 160px gap, shared SDK, direct loading without the custom prompt, no refresh on view return, private panel/dialog exclusion, previous opt-out preservation and protected-region blocking. No page errors. All advertising requests were mocked; no real impressions or clicks were generated. Receipt: audit/game-ads-20261030/verification.json (production base).
