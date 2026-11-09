#!/usr/bin/env python3
"""Sync static navigation/footer across all HTML pages. Run from repository root.

Only replaces marked shared regions after the first migration. Page targets remain ordinary links; navigation.js handles disclosure behavior.
"""
from pathlib import Path
import re
from html import escape

ROOT = Path(__file__).resolve().parents[1]
GROUPS = [
    ('CAD Lab', 'about', 'lab', [('Introduction','lab/introduction.html'),('Motto & Logo','lab/motto.html')]),
    ('People', 'people', 'people', [('Professor','people/professor.html'),('Members','people/members.html'),('Alumni','people/alumni.html')]),
    ('Publications', 'publications', 'publications', [('International Journal Papers','publications/international.html'),('Korean Journal Papers','publications/korean.html'),('Articles','publications/articles.html'),('Patents','publications/patents.html'),('Korean Industrial Standards','publications/standards.html')]),
    ('Research', 'research', 'research', [('Ongoing Projects','research/ongoing.html'),('Closed Projects','research/completed.html')]),
]

def header(page):
    prefix = '' if page == 'index.html' else '../'
    def link(label, target):
        current = ' aria-current="page"' if target == page else ''
        return f'<a href="{prefix}{target}"{current}>{escape(label)}</a>'
    chunks = [link('Home','index.html')]
    for label, anchor, key, children in GROUPS:
        active = ' current-section' if any(target == page for _, target in children) else ''
        chunks.append(f'''<div class="nav-group{active}">
          {link(label, 'index.html#'+anchor)} <button class="submenu-toggle" type="button" aria-label="Toggle {label} submenu" aria-expanded="false" aria-controls="{key}-submenu">▾</button>
          <div class="dropdown" id="{key}-submenu">
            {chr(10).join(link(name, target) for name,target in children)}
          </div>
        </div>''')
    chunks.extend([link('Contact','lab/contact.html')])
    return f'''<!-- shared-header:start -->
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="header">
    <div class="wrap nav">
      <a class="brand" href="{prefix}index.html" aria-label="CADLAB home"><img src="{prefix}assets/cadlab-logo.jpg" alt="CADLAB — Computer-Aided Design Laboratory" width="1500" height="234" fetchpriority="high"></a>
      <button type="button" id="menuButton" class="menu" aria-label="Toggle navigation" aria-expanded="false" aria-controls="navigation">☰</button>
      <nav id="navigation" aria-label="Main navigation">
        {chr(10).join(chunks)}
      </nav>
    </div>
  </header>
  <!-- shared-header:end -->'''

def footer(prefix, context):
    return f'''<!-- shared-footer:start -->
  <footer class="site-footer">
    <div class="wrap footerrow">
      <div><a class="footer-logo" href="{prefix}index.html" aria-label="CADLAB home"><img src="{prefix}assets/cadlab-logo.jpg" alt="CADLAB — Computer-Aided Design Laboratory" width="1500" height="234" loading="lazy"></a><p>CAD/CAM Laboratory · Research &amp; Innovation</p></div>
      <div><a href="{prefix}index.html">Home</a> · <a href="{prefix}lab/contact.html">Contact</a><p>© <span data-year>2026</span> CADLAB. All rights reserved.</p><small class="footer-context">{context}</small></div>
    </div>
  </footer>
  <!-- shared-footer:end -->'''

for path in sorted(ROOT.rglob('*.html')):
    if '.git' in path.parts: continue
    page = path.relative_to(ROOT).as_posix()
    source = path.read_text()
    prefix = '' if page == 'index.html' else '../'
    # Preserve page-specific attribution labels when replacing the old footer.
    existing = re.search(r'<small class="footer-context">(.*?)</small>',source,re.S)
    old_footer = re.search(r'<footer\b.*?</footer>',source,re.S)
    if existing: context = existing[1]
    elif page == 'index.html': context = 'Content published subject to laboratory verification and approval.'
    elif old_footer: context = re.sub(r'<[^>]+>', '', old_footer[0]).strip()
    else: context = 'CADLAB · Historical Archive'
    if '<!-- shared-header:start -->' in source:
        source = re.sub(r'<!-- shared-header:start -->.*?<!-- shared-header:end -->',lambda _:header(page),source,flags=re.S)
    else:
        source = re.sub(r'\s*<a class="skip-link".*?</a>', '', source, count=1, flags=re.S)
        source = re.sub(r'<header\b.*?</header>',lambda _:header(page),source,count=1,flags=re.S)
    if '<!-- shared-footer:start -->' in source:
        source = re.sub(r'<!-- shared-footer:start -->.*?<!-- shared-footer:end -->',lambda _:footer(prefix,context),source,flags=re.S)
    elif old_footer: source = re.sub(r'<footer\b.*?</footer>',lambda _:footer(prefix,context),source,count=1,flags=re.S)
    else: source = source.replace('</body>',footer(prefix,context)+'</body>')
    if not re.search(r'<main\b[^>]*\bid=',source): source = source.replace('<main','<main id="main"',1)
    if not re.search(r'<body\b[^>]*\bclass=',source):
        page_class = 'home-page' if page == 'index.html' else 'subpage page-'+path.stem
        source = source.replace('<body',f'<body class="{page_class}"',1)
    source = re.sub(r'<style>.*?</style>', '',source,flags=re.S)
    if 'assets/styles.css' not in source: source = source.replace('</head>',f'<link rel="stylesheet" href="{prefix}assets/styles.css">\n</head>')
    if page != 'index.html' and 'assets/pages.css' not in source: source = source.replace('</head>',f'<link rel="stylesheet" href="{prefix}assets/pages.css">\n</head>')
    if 'assets/navigation.js' not in source: source = source.replace('</body>',f'<script src="{prefix}assets/navigation.js" defer></script>\n</body>')
    path.write_text(source)
