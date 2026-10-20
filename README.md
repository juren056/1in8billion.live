# 1in8billion.live

Independent free browser life simulator. Vanilla HTML/CSS/JS with static English, Japanese, Korean and Traditional Chinese guides. Adapted from rollroyces/born-somewhere under the retained MIT LICENSE; see ATTRIBUTIONS.md.

## Develop and verify

Node 22+: `npm run verify`, then `npm run dev` (http://127.0.0.1:4186).
Build: `npm run build`; output: `dist/` only. Historical zu-pu and internal reports are excluded.

## Deployment

Existing Cloudflare Worker: `1in8billion-live`; domain: https://1in8billion.live/ . Git production branch: main. Deploy command: `npx wrangler deploy`; wrangler.jsonc runs `npm run verify` before deploying assets. No framework migration or account backend is needed.

Optional build variables: GA4_MEASUREMENT_ID (real G- ID), GSC_VERIFICATION (real HTML verification value). Analytics is opt-in. Never put secrets in browser code. GSC/GA4 external setup and reception require their own verification.

Progress uses legacy localStorage keys for compatibility. Quick mode enables auto decisions. Sharing uses the system share sheet or copies the website URL, not a deterministic replay. Saving on one device is not cloud backup.

## Data and provenance

The bundled data is inherited game input with unverified observation years. It is disclosed as model weights; country fact pages remain withheld. See DATA_SOURCES.md. MIT notices remain, no original-site image/code was imported during this launch, and the historical demo is not deployed.
