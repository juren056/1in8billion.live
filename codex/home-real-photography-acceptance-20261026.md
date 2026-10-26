# Homepage real-photography acceptance — 2026-10-26

## Delivered

- Eight-photo reflective-question carousel with authored copy in all ten public locales.
- Twelve theme-specific real-life memory photographs: three each for clear blue, travel journal, modern editorial and cinema at dusk.
- Twelve theme-specific real-photo hero scenes plus twelve mobile art-directed crops.
- Local AVIF delivery, public Pexels provenance, motion pause controls, swipe/keyboard-operable controls, visibility-aware playback and reduced-motion behavior.
- Appearance-picker thumbnails now preview the same real-photography direction rather than the retired generated theme artwork.

## Truth and uniqueness gates

- 32 primary photographs have unique local filenames, source URLs and SHA-256 hashes.
- Repeated homepage countries retain separate landmark photographs between country cards and completed-life samples.
- Photography is illustrative only. It does not depict the player, a simulated character, or evidence of a simulated event.

## Verification

- `npm run build`
- `node --test tests/home-entry-layout.test.mjs tests/home-photography.test.mjs`
- Browser automation at 1440×1000 and 390×844 across all four appearances, including theme switching, local image selection, question navigation, pause state, mobile crop selection and console/page errors.
- Visual inspection of all four desktop themes plus night mobile and desktop/mobile reflection views.
- Impeccable deterministic scan: one actionable layout-animation warning was removed; remaining findings were advisory values already represented by intentional theme materials or existing documented component roles.

Evidence lives under `audit/home-photography/browser/` and source preparation is reproducible through `scripts/prepare-home-real-photos.py`.
