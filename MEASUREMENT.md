# Measurement contract — v1.2.0

Analytics remains enabled on page load, as requested. Existing GA4 property and stream are retained. `page_location` excludes query strings and fragments. Interaction parameters are allowlisted to language, play_mode, mode, action and page_type; do not add names, story text, notes, family records or replay seeds.

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
