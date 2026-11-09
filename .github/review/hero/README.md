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

## Patents page

Removed the requested catalogue note, seven-record introduction and patents year-navigation bar. All seven patent/software records, headings and the software year navigation outside the selected area remain unchanged. Five-width checks passed; screenshots refreshed and the content guard permits exactly these removals.

## Standards page

Removed the requested catalogue note, year navigation, six-record statistics paragraph and gray notice. Standard heading, year groups and all six standard records remain unchanged. Five-width checks passed; screenshots refreshed, and the content guard permits exactly these removals.

## Ongoing projects page

Removed the two selected gray notices. The page heading, project title, funding agency, planned period and status remain unchanged. Five-width checks passed; screenshots refreshed. The content guard permits only the two notice removals.

## Closed projects page

Removed the selected status notice and introductory paragraph. All year groups and 26 project records remain unchanged. Five-width checks passed; screenshots refreshed. The content guard allows only the two paragraph removals.

## Contact map controls

Removed only the selected Paldal Hall map-search button and campus walking-route notice. Map iframe and walking-directions link remain unchanged. Five-width checks passed. Local map screenshots use an empty external-resource response, so Google map rendering is outside this local check.

## Motto page

Removed the selected parenthetical note from the second attribution and the historical-transcription notice. Quotes, remaining attribution text and the first attribution remain unchanged. Five-width checks passed; screenshots refreshed.

## Navigation Contact deduplication

Removed Contact from the CAD Lab submenu on all 15 HTML pages. The top-level Contact link is retained. Updated the shared layout generator to prevent the duplicate from returning. Static checks cover all page headers; browser checks verify two CAD Lab submenu entries and one top-level Contact at five widths, with desktop/mobile menu screenshots.

## Logo home navigation

The existing header Logo is already a homepage link on all 15 pages. Added real-click browser coverage at 390 and 1440 px: clicking the Logo image from every page returned to index.html (30 checks passed). No product code change was needed.

## Restored facilities image and About layout

Added an AI-restored version of the supplied three-panel facilities photo (2120 × 742), exported as a high-quality JPEG. Restoration improves noise, sharpness and exposure while retaining the triptych composition; it is not a new documentary source. The original input remains on the user's Desktop. The group photo is capped at 480 px and the facilities image spans both columns below the introduction, with matching 8 px corners and 36 px row spacing (28 px on mobile). Both images retain their natural aspect ratios without cropping. Browser checks verify loading, proportions and no overlap at five widths. About section screenshots hide the sticky header only during capture to avoid overlay artifacts.

## Bilingual Research and People cards

Added Korean descriptions beneath the existing English in all three Research areas cards and three Our people cards. English, titles, links and records are preserved. Korean paragraphs use lang=ko with consistent 12 px spacing and Korean word wrapping. Five-width bilingual checks and existing regressions passed; Research/People screenshots refreshed.

## Expanded English introduction

Removed the selected Location & contact link. Expanded the English About paragraph from the existing Korean introduction: geometric modeling, product-development information integration, manufacturing PLM, commercial C3PE application development and industry–university collaboration. Korean copy and detailed records remain unchanged. Updated both the HTML fallback and dynamic content source; five-width checks and existing regressions passed.

## Group photo balance

Increased the group photo cap from 480 to its native 513 px width and centered it vertically in the space below the left heading, balancing the expanded bilingual introduction. Mobile uses normal document flow with centered proportional imagery. Five-width checks and 30 Logo navigation checks passed; About screenshots refreshed.

## Compact homepage Hero

Constrained the Hero to 1240 px with centered outer margins and subtle rounded corners, reduced desktop minimum height to 490 px, tightened copy padding and capped the diagram at 440 px. Inner text aligns closely with the main content column. Mobile uses 18 px outer margins and reduced padding. Full image framing and text preserved. Five-width checks and 30 Logo navigation checks passed; screenshots refreshed.

## Bilingual laboratory goals

Removed the selected introductory sentence above Four major goals. Added Korean translations beneath each of the four original English goals, retaining numbering and all other content. Korean text uses lang=ko and consistent spacing. Five-width browser checks, 30 Logo clicks and record protection passed; goal screenshots refreshed.
