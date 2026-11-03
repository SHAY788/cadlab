const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const base='b450917c0a17f6b4a7902b98af1c4eb05b6caa0c';
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8'});
const pages=git('ls-files','*.html').trim().split('\n');
const clean=s=>s.replace(/\r\n/g,'\n');
for(const file of pages.filter(p=>p!=='index.html')){
 const current=clean(fs.readFileSync(file,'utf8')),before=git('show',`${base}:${file}`);
 assert.equal(current.match(/<main[\s\S]*?<\/main>/)[0],before.match(/<main[\s\S]*?<\/main>/)[0],`${file}: main content changed`);
}
assert.equal(git('diff',base,'--','assets/content.js','.github/maintenance/phase3/'),'','Source data changed');
console.log('PASS: 14 inner-page main contents and all Phase 3 source data unchanged.');
