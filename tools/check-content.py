#!/usr/bin/env python3
"""Guard the laboratory's 2026-11-02 confirmation without broadening its scope."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit,unquote
from collections import Counter
import argparse,re,json,hashlib,subprocess
parser=argparse.ArgumentParser();parser.add_argument('--baseline',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1];base=Path(args.baseline).resolve();maint=root/'.github/maintenance/phase3'
def main(s):return re.search(r'<main\b[^>]*>(.*?)</main>',s,re.S)[1]
def plain(s):return re.sub(r'\s+',' ',unescape(re.sub('<[^>]*>',' ',s))).strip()
def records(rel,s):
 body=main(s)
 if rel=='people/professor.html':return re.findall(r'<section class="intro">.*?</section>|<dl class="entries">.*?</dl>',body,re.S)
 if rel in ['publications/international.html','publications/korean.html']:return re.findall(r'<li\b.*?</li>',body,re.S)
 if rel=='publications/articles.html':return re.findall(r'<li>.*?</li>',body,re.S)
 return re.findall(r'<article\b.*?</article>',body,re.S)
def field(rec,tag,cls=None):
 pattern='<'+tag+(r' class="'+cls+'"' if cls else r'\b[^>]*')+r'>(.*?)</'+tag+'>'
 m=re.search(pattern,rec,re.S);return plain(m[1]) if m else None
def fields(rec):return {k:field(rec,'p',k) for k in ['role','email'] }|{'name':field(rec,'h3')}
def project_fields(rec):return {'name':field(rec,'h3'),'agency':field(rec,'p','agency'),'period':field(rec,'p','period')}
manifest=json.loads((maint/'source-records.json').read_text())
for xs in manifest['records'].values():
 for x in xs:assert hashlib.sha256(x['html'].encode()).hexdigest()==x['sha256']
# All 97 source output records and 27 alumni cards remain unchanged.
counts={}
for rel in ['publications/international.html','publications/korean.html','publications/articles.html','publications/patents.html','publications/standards.html','people/alumni.html','people/professor.html']:
 old=records(rel,(base/rel).read_text());new=records(rel,(root/rel).read_text());assert Counter(old)==Counter(new),('Original fields changed',rel);counts[rel]=len(new)
assert [counts['publications/'+x+'.html'] for x in ['international','korean','articles','patents','standards']]==[44,29,11,7,6]
alumni=records('people/alumni.html',(root/'people/alumni.html').read_text())
def graduation(card):return tuple(map(int,re.search(r'\b((?:19|20)\d{2})\.(\d{2})\b',re.search(r'<p class="degree">(.*?)</p>',card,re.S)[1]).groups()))
assert len(alumni)==27 and alumni==sorted(alumni,key=graduation,reverse=True)
member_cards=records('people/members.html',(root/'people/members.html').read_text());members=[fields(r) for r in member_cards]
assert len(members)==5 and [x['name'] for x in members]==['송인호','김영준','여인웅','박진성','김도균']
assert members[:3]==[fields(r) for r in records('people/members.html',(base/'people/members.html').read_text())]
assert members[3]['role']=='석사과정' and members[4]['role']=='학부 4학년 · 연구실 인턴'
assert '2026년 2월 연구실 합류' in member_cards[3] and '2026년 3월 석사과정 시작' in member_cards[3]
assert all('person-photo-placeholder' in r and '>PHOTO<' in r for r in member_cards)
assert not any(x in member_cards[3] for x in ['1학기','2학기'])
register=json.loads((maint/'project-register.json').read_text());assert len(register)==27
assert len({x['id'] for x in register})==27
assert sum(len(x['historical_occurrences']) for x in register)==29
actual={}
for rel in ['research/ongoing.html','research/completed.html']:
 rs=records(rel,(root/rel).read_text());assert len(rs)==(1 if 'ongoing' in rel else 26)
 for rec in rs:
  ident=re.search(r'\bid="(P\d{3})"',rec)[1];assert ident not in actual;actual[ident]=(rel,rec)
for item in register:
 ident=item['id'];rel,rec=actual[ident];assert item['current_page']==rel
 assert item['confirmed_on']=='2026-11-02'
 expected_state='ongoing_or_extended' if ident=='P002' else 'closed';assert item['status']==expected_state
 assert item['actual_completion_date']==('2025.12' if ident=='P001' else None)
 assert item['actual_start_date'] is None
 # Historical occurrences exactly match the frozen raw snapshot, including removed duplicates.
 for occ in item['historical_occurrences']:
  raw=manifest['records'][occ['page']][occ['position']-1]['html'];f=project_fields(raw)
  assert item['name']==f['name'] and occ['agency_original']==f['agency'] and occ['period_original']==f['period']
 selected=next(o for o in item['historical_occurrences'] if o['page']==rel);f=project_fields(rec)
 assert f=={'name':item['name'],'agency':selected['agency_original'],'period':selected['period_original']}
 status=field(rec,'p','project-status');assert status and ('진행 중 또는 연장' in status if ident=='P002' else '정식 종료' in status)
 if ident=='P001':assert '2025.12' in status
 else:assert '미상' in status and '2025.12' not in status
assert not (maint/'member-editorial-history.md').exists(),'Internal note still in current public tree'
# Original images and common chrome remain untouched.
for p in (base/'assets').rglob('*'):
 if p.is_file() and p.suffix.lower() in ['.jpg','.svg','.png']:assert p.read_bytes()==(root/p.relative_to(base)).read_bytes()
assert (base/'lab/assets/cadlab-original-logo.jpg').read_bytes()==(root/'lab/assets/cadlab-original-logo.jpg').read_bytes()
assert (base/'assets/navigation.js').read_bytes()==(root/'assets/navigation.js').read_bytes()
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
refs=0;pages=list(root.rglob('*.html'));assert len(pages)==15
for p in pages:
 s=p.read_text();b=(base/p.relative_to(root)).read_text();c=Check();c.feed(s);assert not c.stack;assert len(c.ids)==len(set(c.ids))
 for tag in ['header','footer']:assert re.search(fr'<{tag}\b.*?</{tag}>',s,re.S)[0]==re.search(fr'<{tag}\b.*?</{tag}>',b,re.S)[0]
 for ref in c.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=p.parent/unquote(u.path) if u.path else p;assert target.exists(),(p,ref)
  if u.fragment:assert re.search(r'\bid=[\"\']'+re.escape(u.fragment)+r'[\"\']',target.read_text()),(p,ref)
  refs+=1
vm="const fs=require('fs'),vm=require('vm');let c={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c);console.log(JSON.stringify(c.window.CADLAB_CONTENT));"
a=json.loads(subprocess.check_output(['node','-e',vm,str(base/'assets/content.js')],text=True));b=json.loads(subprocess.check_output(['node','-e',vm,str(root/'assets/content.js')],text=True))
for key in ['about','research','news']:assert a[key]==b[key]
for group in ['people','publications','projects']:
 for item in b[group]:assert (root/item['href']).is_file()
assert all(x['confirmed_on']=='2026-11-02' for x in json.loads((maint/'publication-audit.json').read_text()))
print(json.dumps({'status':'PASS','pages':15,'local_references':refs,'members':5,'alumni':27,'publication_counts':[44,29,11,7,6],'publications_total':97,'ongoing':1,'closed':26,'unique_projects':27,'historical_project_occurrences':29,'internal_note_in_current_tree':False},indent=2))
