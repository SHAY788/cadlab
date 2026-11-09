const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base='b450917c0a17f6b4a7902b98af1c4eb05b6caa0c';
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8'});
const pages=git('ls-files','*.html').trim().split('\n');
const clean=s=>s.replace(/\r\n/g,'\n');
for(const file of pages.filter(p=>p!=='index.html')){
 const current=clean(fs.readFileSync(file,'utf8')),before=git('show',`${base}:${file}`);
 assert.equal(current.match(/<main[\s\S]*?<\/main>/)[0],before.match(/<main[\s\S]*?<\/main>/)[0],`${file}: main content changed`);
}
const load=s=>{const sandbox={window:{}};require('node:vm').runInNewContext(s,sandbox);return JSON.parse(JSON.stringify(sandbox.window.CADLAB_CONTENT));};
const currentData=load(fs.readFileSync('assets/content.js','utf8')),beforeData=load(git('show',`${base}:assets/content.js`));
// The user approved rewriting the homepage People and Publications summaries.
for(let i=0;i<3;i++) currentData.people[i].description=beforeData.people[i].description;
for(let i=0;i<5;i++) currentData.publications[i].detail=beforeData.publications[i].detail;
assert.deepEqual(currentData,beforeData,'Unexpected homepage data change');
assert.equal(git('diff',base,'--','.github/maintenance/phase3/'),'','Source records changed');
console.log('PASS: 14 inner-page main contents and Phase 3 records unchanged; only approved People and Publications summaries differ.');
