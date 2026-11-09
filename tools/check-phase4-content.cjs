const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base='b450917c0a17f6b4a7902b98af1c4eb05b6caa0c';
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8'});
const pages=git('ls-files','*.html').trim().split('\n');
const clean=s=>s.replace(/\r\n/g,'\n');
for(const file of pages.filter(p=>p!=='index.html')){
 const current=clean(fs.readFileSync(file,'utf8')),before=git('show',`${base}:${file}`);
 const main=s=>s.match(/<main[\s\S]*?<\/main>/)[0];
 const approved=s=>s.replace(/<p class="catalogue-note">[\s\S]*?<\/p>/g,'').replace(/<nav class="year-nav"[\s\S]*?<\/nav>/g,'').replace(/<p class="summary">[\s\S]*?<\/p>/g,'');
 let expected=main(before);
 if(file==='publications/international.html') expected=approved(expected);
 if(file==='research/ongoing.html') expected=expected.replace(/<p class="notice">[\s\S]*?<\/p>/g,'');
 if(file==='people/professor.html') expected=expected.replace(/<p class="notice">양정삼 교수의[\s\S]*?<\/p>/g,'');
 if(file==='people/members.html') expected=expected.replace(/<p class="(?:notice|catalogue-note)">[\s\S]*?<\/p>/g,'').replace(/（旧网站记录）/g,'');
 if(file==='people/alumni.html') expected=expected.replace(/<p class="notice">졸업 및 소속 정보는[\s\S]*?<\/p>/g,'');
 if(file==='people/professor.html') expected=expected.replace(/<p class="[^"]*">Current Ajou University appointment[\s\S]*?<\/p>/g,'');
 if(file==='lab/motto.html') expected=expected.replace('— Charles Mingus, an artist and member of Oasis (attribution as displayed on the original laboratory page)','— Charles Mingus, an artist and member of Oasis').replace(/<p class="note">Historical transcription:[\s\S]*?<\/p>/g,'');
 if(file==='lab/contact.html') expected=expected.replace(/<a class="button secondary"[^>]*>팔달관 지도에서 보기 ↗<\/a>/g,'').replace(/<p class="note">주의: 캠퍼스[\s\S]*?<\/p>/g,'');
 if(file==='research/completed.html') expected=expected.replace(/<p class="(?:notice|intro)">[\s\S]*?<\/p>/g,'');
 if(file==='publications/standards.html') expected=expected.replace(/<p class="(?:catalogue-note|intro|notice)">[\s\S]*?<\/p>/g,'').replace(/<nav class="year-nav"[\s\S]*?<\/nav>/g,'');
 if(file==='publications/patents.html') expected=expected.replace(/<p class="catalogue-note">[\s\S]*?<\/p>/g,'').replace(/<p class="intro">7 records[\s\S]*?<\/p>/g,'').replace(/<nav class="year-nav" aria-label="patents years">[\s\S]*?<\/nav>/g,'');
 if(file==='publications/articles.html') expected=expected.replace(/<p class="catalogue-note">[\s\S]*?<\/p>/g,'').replace(/<nav class="year-nav"[\s\S]*?<\/nav>/g,'').replace(/<p[^>]*>11 articles and technical writings[\s\S]*?<\/p>/g,'');
 if(file==='publications/korean.html') expected=expected.replace(/<p class="catalogue-note">[\s\S]*?<\/p>/g,'').replace(/<nav class="year-nav"[\s\S]*?<\/nav>/g,'').replace('<span class="count">29 papers · 2002–2024</span>','');
 if(file==='lab/introduction.html') expected=expected.replace('<p class="intro">The CAD Lab is an interdepartmental laboratory in the School of Engineering with four major goals:</p>\n','');
 if(file==='lab/introduction.html') expected=expected.replace(/<p class="note">Historical website record:[\s\S]*?<\/p>\n/g,'');
 const actual=file==='lab/introduction.html'?main(current).replace(/<span class="goal-ko" lang="ko">[^<]*<\/span>/g,''):main(current);
 assert.equal(actual,expected,`${file}: unexpected main content change`);
}
const load=s=>{const sandbox={window:{}};require('node:vm').runInNewContext(s,sandbox);return JSON.parse(JSON.stringify(sandbox.window.CADLAB_CONTENT));};
const currentData=load(fs.readFileSync('assets/content.js','utf8')),beforeData=load(git('show',`${base}:assets/content.js`));
currentData.about=beforeData.about;
// The user approved rewriting the homepage People, Publications and Projects summaries.
for(let i=0;i<3;i++) currentData.people[i].description=beforeData.people[i].description;
for(let i=0;i<5;i++) currentData.publications[i].detail=beforeData.publications[i].detail;
for(let i=0;i<2;i++) currentData.projects[i].description=beforeData.projects[i].description;
for(const group of ['research','people']) for(const item of currentData[group]) delete item.descriptionKo;
assert.deepEqual(currentData,beforeData,'Unexpected homepage data change');
assert.equal(git('diff',base,'--','.github/maintenance/phase3/'),'','Source records changed');
console.log('PASS: all detailed records unchanged; only approved summaries and page presentation removals differ.');
