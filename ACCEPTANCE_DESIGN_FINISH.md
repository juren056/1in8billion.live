# v1.11.1 acceptance design finish — 2026-10-21

## Scope and disposition

Scoped documentation is complete for the post-acceptance corrections in `ACCEPTANCE_20261021.md`: safe keepsake timeline pagination, build-time localized public demos and the Traditional Chinese style selector. This is a corrective extension of the existing blue paper/pixel world. The nine experience enhancements remain the governing contract in `EXPERIENCE_SURFACE.md`; this note does not introduce a new visual direction or certify the whole site.

`DESIGN.md`, `PRODUCT.md`, `.impeccable` artifacts and historical reports are preserved. The root design system is not regenerated, so no replacement token frontmatter or paired sidecar is required. The known `PRODUCT.md` four-language/earlier-baseline description remains reported drift; it was not repaired as a side effect of this correction.

## Preserved visual language and corrected patterns

The pale blue interface, dark blue navigation, teal actions, readable serif/sans hierarchy and original pixel cover artwork remain inherited. Editorial blue/ivory, archive blue/white and warm brown/cream stay artifact-specific styles. No global palette, type family, component system or style ID changed.

- **Timeline pagination:** `premium-keepsake/build-document.js` estimates CJK glyphs conservatively and includes paragraph gaps in a 520pt vertical budget. Complete timeline paragraphs move onto subsequent pages in their original order. This corrects the dense Japanese page that previously crossed the footer; it does not discard events to fit the old page count. Preview counts derive from the same document pages.
- **Public demos:** `scripts/build-expansion.mjs` produces localized public sample snapshots during the build. The five added-language dictionaries supply the previously missing event phrases. Public examples therefore do not rely on a runtime dictionary arriving before preview opens. Private saved content is not sent to translation services or rewritten by this build step.
- **Traditional Chinese selector:** `book-styles.js` supplies “紀念冊設計”, “人生畫報”, “私人檔案” and “溫暖回憶”; `preview.js` changes their displayed text while keeping the existing selector, three IDs and layout.

## Evidence inspected

Read the acceptance report, current surface contract, product/design documents and Impeccable document reference. Checked the corrected pagination, build-time sample generation and selector-copy paths in the four source modules against those reports. The acceptance evidence records three public samples in each of nine languages, 27 total, including the eight formerly English event phrases in the five added-language dictionaries.

Directly compared `before-ja-page6.png` with `after-ja-page6-editorial.png` in `audit/acceptance-20261021/`. The former visibly collides with its footer and continues beyond the page; the corrected page leaves clear footer space while retaining the established type, rules and paper treatment. Inspected the final `preview-zh-tw-390.png`: “紀念冊設計” and the selected “溫暖回憶” option are legible, and the original room/character illustration remains present. This retry documenter pass sampled those three images rather than independently inspecting every PDF page. The independent finish review records opening all 15 captures listed in `review-captures.json` individually; that broader inspection is attributed to the reviewer.

The supplied evidence records:

- `pdf-geometry.json`: 27 actual nine-language/three-style PDFs, no geometry failures or per-file issues; minimum recorded body position is 180pt. The acceptance report records agreement between preview and exported page counts.
- `extended.json` and `.log`: 27 PDF exports, 81 poster renders, eight real nonzero audio signals including China, muted peak zero and no errors.
- `style-selectors.json`: nine localized selectors, each with three successful style changes.
- `final-verify.log`: 30 passing Node tests, 226 SEO pages, country-data validation and original critical asset budgets passing.
- `regression.log`: all 12 actual Replay outcomes match; real five-second pacing, twenty-second choice waiting, pause/resume, legacy storage, modal behavior and font/storage failure paths pass.

`finish-review.md` passed the scoped pagination/content-preservation and static-demo corrections but requested the selector localization. `finish-verdict.md` then marks that sole material fix resolved with **ship**. Its verdict expressly remains limited to that fix and preserves the original review's scope limits. This documentation pass did not rerun tests or the detector.

## Limits and invariants

Preserve years/statistics, Replay v1, storage compatibility, free play and ordinary free exports. Real payments remain closed. The evidence does not establish comprehensive native-language review, music aesthetic approval, real Safari-device acceptance, GA backend ingestion, GSC indexing, field CWV or retention uplift. Publication/deployment confirmation is a separate operational step; this note records the reviewed correction and its evidence.
