# Measurement contract — v1.2.0

v1.3.0 adds `release` to all events and coarse `run_type` to game events (new, replay, resumed), plus `comparison_download` after a real CSV download. Register release/run_type/metric_name/metric_rating as event-scoped custom dimensions and metric_value as a standard custom metric to compare versions in GA4 explorations. Filter by metric_name before averaging: CLS is a unitless score; LCP/INP/TTFB are milliseconds. Never sum mixed metric types into a performance score. Definitions take processing time and do not backfill missing historical parameters.

`web_vital` is reported by the official self-hosted web-vitals 6.2.3 standard build after critical work. Parameters: metric_name, metric_rating, metric_value and metric_delta. Only real browser observations are reported. No selectors or attribution payloads are collected. The browser may not report INP until a qualifying interaction/visibility change; absent is not zero. Distinguish these first-party observations from Google's population-level CrUX/GSC field data.

Analytics remains enabled on page load, as requested. Existing GA4 property and stream are retained. `page_location` preserves only safe utm_source/utm_medium/utm_campaign/utm_content/utm_term/utm_id labels (100 characters each) and excludes other queries and all fragments. Internal navigation receives no marketing UTM. v1.4.0 adds coarse content_game_click/explore_click path events and odds_used; eligible replay links use player/share/replay campaign labels while the seed stays in the stripped fragment. Interaction parameters are allowlisted to language, play_mode, mode, action and page_type; do not add names, story text, notes, family records or replay seeds.

| Event | Actual trigger |
| --- | --- |
| home_view | One document load on a supported game homepage, not content routes |
| content_view | One document load on a non-game route |
| start_click | User chooses random or selected-country start |
| birth_generated | A birth card was actually generated |
| life_started | A new life actually starts; replay starts also emit replay_started |
| first_event_reached | First advancing year in this active run, once per start |
| life_completed | Existing engine ends the life |
| life_resumed | An unfinished local save is explicitly resumed |
| share_replay | Clipboard copy succeeded for an eligible automatic run |
| share_image_download | A real image download was initiated |
| replay_started | Recipient explicitly starts a compatible replay |
| replay_invitation_view | A compatible invitation appears, once per fragment per document; no seed is sent |
| compare_used | Country, draw mode or swap changes the comparison |
| comparison_shared | Comparison clipboard copy succeeded |

Use GA4 user/session funnels rather than dividing unrelated event totals. Segment new quick/manual runs, resumed lives and replay starts separately. Suggested funnel: home_view → start_click → life_started → first_event_reached → life_completed → share_replay or share_image_download. Replay activation: replay_invitation_view → replay_started. Do not count an image download or clipboard copy as a social post or another recipient's visit.

2026-10-20 baseline: GSC Performance for this domain reports processing/no query data. GA4 Realtime shows this domain's pages and events; some are operator validation visits. There is no defensible organic conversion-rate baseline yet. Gather a clean comparable interval after release, annotate this release, and inspect user/session funnels before choosing another layout or adding query-targeted pages. No growth percentages are claimed.

Local browser resource checks record decoded bytes and local timings in audit/local-performance.json. Those are not production Core Web Vitals or field measurements. Production LCP/INP/CLS remain to be measured with sufficient traffic or a documented lab run.
