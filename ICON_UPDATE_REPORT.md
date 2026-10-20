# Circular icon update — 2026-10-20

Scope: user requested circular icon artwork, complete icon assets and GSC follow-up. Preserve the established dot-globe plus cyan1 identity and blue brand. Extend the existing code-native SVG; no new raster/image generation is needed.

## Files and validation

- Circular master: public-assets/icon-master.svg, reused by public-assets/brand.svg in the header and modern browser favicon. Exterior corners are transparent.
- Eleven vector-derived RGBA PNG sizes:16,32,48,64,96,128,180(Apple touch),192,256,512,1024(master).
- favicon.ico contains seven genuine sizes16,32,48,64,96,128,256. All corners checked transparent, center opaque.
- Stable existing ICO/96PNG URLs are retained. ICO size/type declarations corrected; scalable SVG and explicit180px Apple declaration added. Manifest uses the same circle as SVG/192/512 any-purpose icons, with no misleading maskable claim.
- Icon/manifest response headers revalidate cache so browser/CDN can update. Small-size preview: audit/round-icon-preview.png; native deterministic renderer: scripts/render-icons.cjs. All new PNGs embed vector origin metadata.
- Build/static gates:62routes,16Node tests, unchanged numeric country inputs, canonical/hreflang and critical resource budget checks. No simulation or storage logic changes.

## Publish and search

Release v1.7.1 through the existing Git→Cloudflare build chain; prior baseline838295d(v1.7.0). Production acceptance and GSC request result saved separately after release to avoid a redundant deployment only for evidence.

GSC read before release: correct domain property1in8billion.live; homepage URL inspection says indexed on Google. Sitemap statusSuccess, last read20October2026,62discovered pages. The index overview is still processing;62discovered does not establish62indexed. The homepage request after release is for recrawl of changed icon declarations. Google determines the recrawl and favicon display time; no speed guarantee or repeated automated submissions.

Official references checked20October2026:
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
