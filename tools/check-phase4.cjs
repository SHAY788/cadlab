const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.github/review/phase4');fs.mkdirSync(out,{recursive:true});
const pages=cp.execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8'}).trim().split('\n');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{let rel=decodeURIComponent(req.url.split(/[?#]/)[0]);if(rel==='/favicon.ico'){res.writeHead(204);return res.end()}let file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],failures=[],links=new Set();
for(const width of [360,375,390,430,768,900,1024,1440,1920]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<=900,reducedMotion:'reduce'});
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.fulfill({status:200,contentType:'text/html',body:'External map excluded from local regression.'}));
 const p=await context.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text())});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 for(const rel of pages){errors=[];try{
  await p.goto(`${origin}/${rel}`);await p.evaluate(()=>document.fonts.ready);
  assert(await p.locator('main').isVisible());assert.equal(await p.locator('#navigation a').filter({hasText:/^(News|Archive)$/}).count(),0);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow`);
  const menu=p.locator('#menuButton'),nav=p.locator('#navigation');
  if(width<=900){assert(!await nav.isVisible());await menu.click();assert(await nav.isVisible());assert.equal(await menu.getAttribute('aria-expanded'),'true')}else assert(await nav.isVisible());
  for(const key of ['lab','people','publications','research']){
   const toggle=p.locator(`[aria-controls="${key}-submenu"]`),drop=p.locator(`#${key}-submenu`);
   await toggle.focus();await p.keyboard.press('Enter');assert(await drop.isVisible());const b=await drop.boundingBox();assert(b.x>=-1&&b.x+b.width<=width+1);
   await p.keyboard.press('ArrowDown');assert(await drop.locator('a').first().evaluate(e=>e===document.activeElement));await p.keyboard.press('Escape');assert(!await drop.isVisible());
  }
  if(width<=900){if(rel==='index.html'&&[375,390].includes(width))await p.screenshot({path:path.join(out,`menu-${width}.png`)});await p.keyboard.press('Escape');assert(!await nav.isVisible())}
  await p.locator('.site-footer').scrollIntoViewIfNeeded();await p.waitForFunction(()=>[...document.images].every(i=>i.complete));
  assert(await p.locator('img').evaluateAll(xs=>xs.every(i=>i.naturalWidth>0)),'broken image');
  if(rel==='index.html'){
   assert.equal(await p.locator('#news,#archive,#newsList,main .overline').count(),0);
   assert.equal(await p.locator('main section').last().getAttribute('id'),'projects');
   const gap=await p.evaluate(()=>document.querySelector('.site-footer').getBoundingClientRect().top-document.querySelector('main').getBoundingClientRect().bottom);assert(Math.abs(gap)<2,`footer gap ${gap}`);
   if([375,390,1440].includes(width)){await p.screenshot({path:path.join(out,`home-footer-${width}.png`)});await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});await p.screenshot({path:path.join(out,`home-full-${width}.png`),fullPage:true});}
   await p.evaluate(()=>scrollTo(0,0));
   if([375,390,1440].includes(width))await p.screenshot({path:path.join(out,`home-top-${width}.png`)});
  }
  if([375,1440].includes(width)&&rel!=='index.html'){await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});await p.screenshot({path:path.join(out,rel.replaceAll('/','-').replace('.html',`-${width}.png`)),fullPage:true})}
  for(const href of await p.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href)))if(href.startsWith(origin))links.add(href);
  assert.deepEqual(errors,[]);results.push({width,page:rel,status:'PASS'});
 }catch(e){failures.push({width,page:rel,error:e.message,errors});console.log('FAIL',width,rel,e.message)}}
 console.log('Completed width',width);
 await context.close();
}
const ctx=await browser.newContext();const p=await ctx.newPage();for(const href of links){try{const r=await p.goto(href);assert(!r||r.ok());const hash=new URL(href).hash;if(hash)assert(await p.evaluate(h=>!!document.getElementById(decodeURIComponent(h.slice(1))),hash),`missing anchor ${hash}`)}catch(e){failures.push({link:href.replace(origin,''),error:e.message})}}
// Rendered record totals; no data mutation.
const counts={};for(const [rel,selector] of Object.entries({'people/members.html':'main article','people/alumni.html':'main article','publications/international.html':'main .year-block li','publications/korean.html':'main li.paper','publications/articles.html':'main .papers li','publications/patents.html':'main article','publications/standards.html':'main article','research/ongoing.html':'main article','research/completed.html':'main article'})){await p.goto(`${origin}/${rel}`);counts[rel]=await p.locator(selector).count()}
await browser.close();server.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:'Installed Google Chrome / Playwright',widths:[360,375,390,430,768,900,1024,1440,1920],results,failures,checkedInternalLinks:links.size,counts,externalServices:'Stubbed; external map availability not tested'},null,2));console.log(JSON.stringify({checks:results.length,failures,links:links.size,counts},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
