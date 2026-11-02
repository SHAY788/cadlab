#!/usr/bin/env python3
"""Phase 3 preservation check. Run with --baseline pointing to a main export."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit,unquote
from collections import Counter
import argparse,re,json,hashlib,subprocess
parser=argparse.ArgumentParser();parser.add_argument('--baseline',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1];base=Path(args.baseline).resolve()
def main(s):return re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S)[1]
def raw_records(rel,s):
 body=main(s)
 if rel=='people/professor.html':return re.findall(r'<section class="intro">.*?</section>|<dl class="entries">.*?</dl>',body,re.S)
 if rel in ['publications/international.html','publications/korean.html']:return re.findall(r'<li\b.*?</li>',body,re.S)
 return re.findall(r'<article\b.*?</article>',body,re.S)
def plain(s):return re.sub(r'\s+',' ',unescape(re.sub('<[^>]*>',' ',s))).strip()
manifest=json.loads((root/'.github/maintenance/phase3/source-records.json').read_text())
counts={}
for rel,expected in manifest['records'].items():
 old=raw_records(rel,(base/rel).read_text());new=raw_records(rel,(root/rel).read_text())
 assert old==[x['html'] for x in expected],('Snapshot mismatch',rel)
 if rel=='people/members.html':new=[re.sub(r'<div class="person-photo-placeholder".*?</div>','',x,flags=re.S) for x in new]
 assert Counter(old)==Counter(new),('Original record changed',rel)
 if rel.startswith(('research/','publications/')):assert old==new,('Source record moved/reordered',rel)
 if rel=='people/alumni.html':
  def graduation(card):return tuple(map(int,re.search(r'\b((?:19|20)\d{2})\.(\d{2})\b',re.search(r'<p class="degree">(.*?)</p>',card,re.S)[1]).groups()))
  assert new==sorted(old,key=graduation,reverse=True),'Unstable alumni date sorting'
 for rec in expected:assert hashlib.sha256(rec['html'].encode()).hexdigest()==rec['sha256']
 counts[rel]=len(new)
articles=json.loads((root/'.github/maintenance/phase3/articles-source.json').read_text())
old_script=re.search(r'const articles=(\[.*?\]);',(base/'publications/articles.html').read_text(),re.S)[1]
assert json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify('+old_script+'))'],text=True))==articles
new=(root/'publications/articles.html').read_text();lis=re.findall(r'<li>(.*?)</li>',main(new),re.S)
assert [(plain(re.search(r'<p class="title">(.*?)</p>',x,re.S)[1]),plain(re.search(r'<p class="source">(.*?)</p>',x,re.S)[1])) for x in lis]==[(x['title'],x['source']) for x in articles]
assert len(articles)==11
# Verify explicit graduation sorting with stable ties.
s=(root/'people/alumni.html').read_text();order=[]
for match in re.finditer(r'<h2 class="year" id="year-(\d{4})">.*?<div class="cards">(.*?)(?=<h2 class="year"|\s*</main>)',s,re.S):
 year=int(match[1])
 for card in re.findall(r'<article\b.*?</article>',match[2],re.S):
  degree=re.search(r'<p class="degree">(.*?)</p>',card,re.S)[1];month=int(re.search(str(year)+r'\.(\d{2})',degree)[1]);order.append((year,month))
assert len(order)==27 and order==sorted(order,reverse=True)
ops=json.loads(json.dumps({'note':re.search(r'<p class="note">(.*?)</p>',main((base/'people/members.html').read_text()),re.S)[1]}))['note']
assert ops in (root/'.github/maintenance/phase3/member-editorial-history.md').read_text()
assert ops not in main((root/'people/members.html').read_text())
# All original assets and shared chrome are preserved.
for p in base.rglob('*'):
 if p.is_file() and p.suffix.lower() in ['.jpg','.svg','.png']:assert p.read_bytes()==(root/p.relative_to(base)).read_bytes(),p
assert (base/'assets/navigation.js').read_bytes()==(root/'assets/navigation.js').read_bytes()
for css in ['assets/styles.css','assets/pages.css']:assert (root/css).read_text().startswith((base/css).read_text())
class Check(HTMLParser):
 def __init__(self):super().__init__();self.stack=[];self.ids=[];self.refs=[]
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  for key in ['href','src']:
   if key in a:self.refs.append(a[key])
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(t)
 def handle_endtag(self,t):assert self.stack and self.stack.pop()==t,('Unbalanced HTML',t)
 def handle_startendtag(self,t,a):
  self.handle_starttag(t,a)
  if t not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.handle_endtag(t)
refs=0
pages=list(root.rglob('*.html'));assert len(pages)==15
for p in pages:
 s=p.read_text();b=(base/p.relative_to(root)).read_text();check=Check();check.feed(s);assert not check.stack;assert len(check.ids)==len(set(check.ids))
 for tag in ['header','footer']:assert re.search(fr'<{tag}\b.*?</{tag}>',s,re.S)[0]==re.search(fr'<{tag}\b.*?</{tag}>',b,re.S)[0],('Chrome changed',p)
 for ref in check.refs:
  url=urlsplit(ref)
  if url.scheme or url.netloc:continue
  target=p.parent/unquote(url.path) if url.path else p
  assert target.exists(),(p,ref)
  if url.fragment:assert re.search(r'\bid=[\"\']'+re.escape(url.fragment)+r'[\"\']',target.read_text()),(p,ref)
  refs+=1
# Editorial changes do not invent news, research areas, or an affiliation.
vm="const fs=require('fs'),vm=require('vm');let ctx={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),ctx);console.log(JSON.stringify(ctx.window.CADLAB_CONTENT));"
a=json.loads(subprocess.check_output(['node','-e',vm,str(base/'assets/content.js')],text=True));b=json.loads(subprocess.check_output(['node','-e',vm,str(root/'assets/content.js')],text=True))
for key in ['about','research','news']:assert a[key]==b[key]
for group in ['people','publications','projects']:
 for item in b[group]:assert (root/item['href']).is_file()
# Original project positions and wording are recorded independently per occurrence.
register=json.loads((root/'.github/maintenance/phase3/project-register.json').read_text());assert len(register)==27 and len({p['id'] for p in register})==27
assert sum(len(p['occurrences']) for p in register)==29
assert sum(len(p['occurrences'])>1 for p in register)==2
for item in register:
 assert item['actual_completion_date'] is None
 for occ in item['occurrences']:
  rec=raw_records(occ['page'],(base/occ['page']).read_text())[occ['position']-1]
  assert item['name']==plain(re.search('<h3>(.*?)</h3>',rec,re.S)[1])
  for key,cls in [('agency_original','agency'),('period_original','period')]:assert occ[key]==plain(re.search(r'<p class="'+cls+r'">(.*?)</p>',rec,re.S)[1])
print(json.dumps({'status':'PASS','pages':15,'local_references':refs,'record_counts':counts,'articles':11,'projects_unique':27,'project_occurrences':29,'duplicates_pending':2},ensure_ascii=False,indent=2))
