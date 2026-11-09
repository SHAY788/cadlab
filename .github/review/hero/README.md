# Hero image replacement

Uses the user's supplied 1448 × 1086 restored product information diagram without modifying its pixels. The original reference's misspelled “lifcyle” is corrected to “lifecycle” in this supplied restoration. Other diagram labels correspond to the reference; historical terminology is retained.

The image fills the existing right column, keeps its natural aspect ratio, and stacks beneath the copy on mobile. The headline is “CAD is the future.” and both Hero buttons are removed as requested. No cropping or additional visible controls. Dense diagram labels become small at phone width; the full-resolution asset remains available through the browser's image controls and zoom.

Validation: `node tools/check-hero.cjs after` passed at 360, 390, 768, 1024 and 1440 px (image loaded, natural aspect ratio, no horizontal overflow, no page errors, requested headline, removed buttons, unchanged supporting copy). `node tools/check-phase4-content.cjs` passed: 14 inner-page main contents and Phase 3 source data unchanged. `git diff --check` passed.

Screenshots: `before-WIDTH.png` and `after-WIDTH.png` for all five viewport widths. Reviewed desktop 1440 and mobile 390 screenshots visually.

Run the browser check with Playwright installed (or `PLAYWRIGHT_MODULE` pointing to its module), and Chrome at the default Windows path (or set `CHROME_PATH`). External resources are excluded from this local Hero check.

## Laboratory photo

Adds the user's original `img-cad.gif` as `assets/cadlab-group.gif` below the Korean laboratory name in the left About column. Original pixels and full framing are preserved; the image scales proportionally to the column and stacks above the introduction on mobile. No caption or changes to the existing introduction. Five-width checks passed for image loading, source dimensions (513 × 342), aspect ratio and no overflow. `about-WIDTH.png` contains section screenshots; desktop 1440 and mobile 390 were visually reviewed.

## Section heading cleanup

Removed the two requested description paragraphs beside Research areas and Our people. All six cards and source records are preserved. Five-width checks confirm both paragraphs are absent and each section retains three cards. Desktop and mobile section screenshots are included.

## Professional People summaries

Rewrites the three homepage People card descriptions for public-facing presentation. Removes verification dates and internal record-maintenance caveats. Professor, Members and Alumni detail pages and all underlying records remain unchanged. The content guard permits only these three approved summary descriptions to differ from its original baseline; all other homepage data remains protected. Five-width layout checks passed and People screenshots were refreshed.

## Hero lower strips removed

Removed the entire Hero bottom divider, CADLAB / RESEARCH & INNOVATION text, scroll prompt and OUR FOCUS strip as requested. The About section now follows the Hero directly. Five-width checks passed and Hero screenshots were refreshed.

Removed the requested historical-context note at the end of the homepage About introduction. The remaining introduction and photo are preserved. Five-width checks passed; About screenshots refreshed.

## Publications presentation

Removed the requested Publications heading description and rewrote all five category summaries as professional public-facing copy. Titles, links, detailed pages and all 97 output records remain unchanged. Five-width browser checks passed; desktop and mobile Publications screenshots were visually reviewed. The content guard allows only the approved People and Publications summary fields to differ.
