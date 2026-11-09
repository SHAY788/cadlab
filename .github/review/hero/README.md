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

People and Publications summaries now use direct descriptive wording, removing introductory calls to action such as Explore, Discover, Read and Meet. Five-width checks passed and screenshots refreshed.

## Projects presentation

Removed the requested Projects heading paragraph. Rewrote both summaries as direct professional descriptions: the ongoing project summary reflects its source topic of AI demand forecasting and intelligent design for customized manufacturing; the closed portfolio retains its 26-project count. Detailed project pages and records remain unchanged. Five-width checks passed and project screenshots were reviewed.

## International journal page

Removed the entire requested catalogue note, year-navigation bar and introductory statistics paragraph from publications/international.html. All 44 papers and year headings remain unchanged. The content guard compares the full page against the baseline with exactly these three removals allowed. Five-width checks passed, confirming 44 entries and no overflow; screenshots refreshed.

## Korean journal page

Removed the requested top catalogue note, year-navigation bar and 29-paper statistics label. The Journal Publications heading and all 29 papers remain unchanged. Five-width checks passed; screenshots refreshed. The content guard permits exactly these removals.

## Articles page

Removed the requested catalogue note, year navigation and introductory 11-article paragraph. Title, year groups and all 11 articles remain unchanged. Five-width checks passed and screenshots refreshed; the content guard permits exactly these three removals.
