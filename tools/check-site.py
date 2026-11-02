from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,subprocess
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--baseline',required=True,help='Path to an exported baseline checkout')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1];base=Path(args.baseline).resolve()
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[];self.imgs=[];self.stack=[];self.errors=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  for key in ['href','src']:
   if key in a:self.refs.append(a[key])
  if t=='img':self.imgs.append(a['src'])
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(t)
 def handle_endtag(self,t):
  if not self.stack or self.stack[-1]!=t:self.errors.append((t,self.stack[-3:]))
  else:self.stack.pop()
 def handle_startendtag(self,t,a):
  self.handle_starttag(t,a)
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.handle_endtag(t)
count=0;pages=list(root.rglob('*.html'))
for p in pages:
 rel=p.relative_to(root);s=p.read_text();b=(base/rel).read_text();check=Page();check.feed(s)
 assert not check.errors and not check.stack,(rel,check.errors,check.stack)
 assert len(check.ids)==len(set(check.ids)),rel
 assert '<style>' not in s,rel
 assert re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S)[1]==re.search(r'<main\b[^>]*>(.*?)</main>',b,re.S)[1],('Main content changed',rel)
 if rel.as_posix()!='index.html':
  assert re.findall(r'<section class="hero".*?</section>',s,re.S)==re.findall(r'<section class="hero".*?</section>',b,re.S),('Hero content changed',rel)
 assert re.findall(r'<script>(.*?)</script>',s,re.S)==re.findall(r'<script>(.*?)</script>',b,re.S),('Inline records changed',rel)
 for u in check.refs:
  url=urlsplit(u)
  if url.scheme or url.netloc:continue
  target=(p.parent/unquote(url.path)) if url.path else p
  assert target.exists(),(rel,u)
  if url.fragment:assert re.search(r'\bid=[\"\']'+re.escape(url.fragment)+r'[\"\']',target.read_text()),(rel,u)
  count+=1
 for name in ['Home','CAD Lab','People','Publications','Research','News','Archive','Contact']:assert name in re.search(r'<nav.*?</nav>',s,re.S)[0]
 assert 'cadlab-logo.jpg' in s
for p in base.rglob('*'):
 if p.is_file() and (p.suffix.lower() in ['.jpg','.svg'] or p.name=='content.js'):
  assert p.read_bytes()==(root/p.relative_to(base)).read_bytes(),p
before=subprocess.check_output(['git','diff'],cwd=root)
subprocess.run(['python','tools/sync-layout.py'],cwd=root,check=True)
assert subprocess.check_output(['git','diff'],cwd=root)==before,'Layout generator not idempotent'
print(f'PASS: {len(pages)} HTML pages; balanced tags; unique IDs; {count} local links/assets/anchors; byte-identical main content, subpage heroes and inline data; unchanged image assets/content.js; idempotent layout generator')
