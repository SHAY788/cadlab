# Hero image replacement

Uses the user's supplied 1448 × 1086 restored product information diagram without modifying its pixels. The original reference's misspelled “lifcyle” is corrected to “lifecycle” in this supplied restoration. Other diagram labels correspond to the reference; historical terminology is retained.

The image fills the existing right column, keeps its natural aspect ratio, and stacks beneath the unchanged copy and buttons on mobile. No cropping or additional visible controls. Dense diagram labels become small at phone width; the full-resolution asset remains available through the browser's image controls and zoom.

Validation: `node tools/check-hero.cjs after` passed at 360, 390, 768, 1024 and 1440 px (image loaded, natural aspect ratio, no horizontal overflow, no page errors, unchanged Hero copy). `node tools/check-phase4-content.cjs` passed: 14 inner-page main contents and Phase 3 source data unchanged. `git diff --check` passed.

Screenshots: `before-WIDTH.png` and `after-WIDTH.png` for all five viewport widths. Reviewed desktop 1440 and mobile 390 screenshots visually.

Run the browser check with Playwright installed (or `PLAYWRIGHT_MODULE` pointing to its module), and Chrome at the default Windows path (or set `CHROME_PATH`). External resources are excluded from this local Hero check.
