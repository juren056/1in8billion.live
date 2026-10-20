# Experience expansion design finish — 2026-10-21

## Scope and disposition

Documentation complete for the nine-item experience expansion specified in `EXPERIENCE_SURFACE.md`. The implementation extends the incumbent blue paper/pixel identity. `DESIGN.md`, `PRODUCT.md`, `.impeccable` artifacts and historical reports are preserved. No replacement visual identity, new global token scale or design-system migration is proposed here. Root `DESIGN.md` was not regenerated, so its paired token frontmatter/sidecar regeneration workflow does not apply to this scoped finish note.

**Reported context drift:** `PRODUCT.md` still describes four public languages and the earlier baseline. Current source supports nine: en, ja, ko, zh-TW, zh-CN, es, pt-BR, fr and de. This mismatch is reported without repairing the preserved product document.

## Inherited system and extension patterns

The extension retains the incumbent pale blue ground (`#edf5f8`), dark navigation (`#061b32`), blue ink (`#102d45`), teal actions (`#086f87`) and pale borders (`#c5d9e3`). Story headings inherit Georgia/Mincho serif treatment; controls and explanatory text inherit the existing sans stack. Pixel artwork remains confined to fictional character/room imagery. Book-specific cream/brown variants are export treatments, not a new site-wide palette.

- **Navigation:** One consistent header exposes Play, Compare, Countries, Guides, Keepsake and Language. Below 760px, the explicit Menu button reveals the navigation; destinations remain available. Escape closes the menu and returns focus. Static navigation remains visible without the JavaScript enhancement.
- **Reading and records:** Article prose is constrained to approximately 72 characters with generous line height. Tables use tabular numbers, aligned numeric cells, alternating light rows and a scrolling wrapper. Local records retain disclosure controls and readable padded bodies. Content disclosures start open; language, speed and music menus retain operational menu behavior.
- **Elapsed-time counter:** The three-column desktop strip becomes stacked rows on phones. Labels distinguish estimated births, visit seconds and available countries. The estimate uses elapsed time and inherited annual birth weights; it is neither visitors nor a live world feed. Unverified observation years remain disclosed; no unsupported death estimate is introduced.
- **Birth reveal and music:** A brief portrait/country reveal has skip and sound controls, preserves explicit birth confirmation and bypasses motion under reduced-motion preference. Its display sequencing is independent of simulation RNG. The selector exposes eight original compositions, including China, through the existing audio controls; these are authored music, not claims of cultural authenticity.
- **Ending keepsake:** The offer appears inside the identity/biography region with a clear preview action, closed-payment notice and explicit preservation of the ordinary free PNG. It does not replace replay or new-life actions.
- **Three book treatments:** Life magazine uses a serif hierarchy and teal rule; Personal archive uses sans headings, white paper and structured factual rows; Warm memories uses cream paper and italic serif expression. Preview and PDF/poster renderers carry the selected style. Semantic profile facts, prose and timeline replace arbitrary equal text chunks; export wrapping measures text width, with glyph-capable font fallback. These artifact variants preserve recorded life content and model disclosures.

## Evidence checked

Read the current product/design/surface contract and the Impeccable document reference. Inspected `experience-upgrade.css`, `experience-media.css`, `experience-upgrade.js`, `locale-runtime.js`, `scripts/build-expansion.mjs`, `premium-keepsake/book-styles.js`, `preview.js` and `render-pdf.js`; compared the incumbent `launch.css` tokens and checked `country-music.js` compositions.

Reviewed the 36-entry `audit/expansion/captures.json` manifest. Direct visual comparison sampled French desktop home and expanded phone navigation, Portuguese phone home, Simplified Chinese phone ending, and all three English desktop book previews. These captures preserve the established blue hierarchy while showing translated wrapping, the corrected brand, visible keepsake offer and distinct book styles. This documenter pass did not claim independent inspection of every capture or PDF page.

`audit/expansion/browser.json` records 18 successful nine-language/390–1440px flows with navigation, initially open content, counter and unchanged 2024 model year. `books.json` records nine actual PDF exports across English, Simplified Chinese and Spanish and all three styles, with no errors. `locale-navigation.json` records locale-preserving navigation. Coordinating validation reports 28 Node tests, 226 SEO routes and the original asset budgets passing; this documentation pass did not rerun them or the detector.

`audit/expansion/finish-review.md` gives **ship** for the four scored fixes, all resolved: Portuguese brand/header, semantic book flow and export wrapping, localized ratio/mode/breadcrumb/country labels, and French birth-weighting wording. That is a bounded fix-list disposition, not blanket certification of every inherited surface.

## Preservation and limits

Preserve model/calendar years and numeric statistics, Replay v1 outcomes, local-storage compatibility, existing free exports and closed checkout. New locale files are static machine-assisted translations with reviewed core controls; the evidence is not native-speaker certification. Real Safari remains unverified, and no GA backend ingestion check was performed. Screenshots and local tests do not establish field CWV, retention uplift, current demographic accuracy or production-wide browser equivalence.
