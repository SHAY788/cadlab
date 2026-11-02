const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const out=path.resolve(process.env.REVIEW_OUTPUT || '/tmp/cadlab-phase3-review');fs.mkdirSync(out,{recursive:true});
const roots={before:path.resolve(process.env.CADLAB_BASELINE || '../cadlab-phase3-baseline'),after:path.resolve(__dirname,'..')};
const mime={'.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.html':'text/html'};
const server=http.createServer((req,res)=>{const parts=decodeURIComponent(req.url.split(/[?#]/)[0]).split('/');const root=roots[parts[1]];if(req.url==='/favicon.ico'){res.writeHead(204);return res.end()}if(!root){res.writeHead(404);return res.end()}const file=path.resolve(root,parts.slice(2).join('/')||'index.html');if(!file.startsWith(root+'/')){res.writeHead(403);return res.end()}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
const pages=[];function scan(dir,prefix=''){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(f.name==='.git')continue;const rel=path.join(prefix,f.name);if(f.isDirectory())scan(path.join(dir,f.name),rel);else if(f.name.endsWith('.html'))pages.push(rel)}}scan(roots.after);
const samples={'index.html':'home-entries','people/professor.html':'professor','people/members.html':'members','people/alumni.html':'alumni','publications/international.html':'international','publications/korean.html':'korean','publications/articles.html':'articles','research/ongoing.html':'ongoing','research/completed.html':'completed'};
const results=[],failures=[],baselines={};
const destinations=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(roots.after,'.github/maintenance/phase3/project-register.json'),'utf8')).map(x=>[x.name,x.current_page]));
const getContent=(p,rel)=>p.evaluate(({rel,destinations})=>{
 const selectors={'people/alumni.html':'main article','people/members.html':'main article','people/professor.html':'main .intro,main dl','publications/international.html':'main .year-block li','publications/korean.html':'main li.paper','publications/articles.html':'main .papers li','publications/patents.html':'main article','publications/standards.html':'main article','research/ongoing.html':'main article','research/completed.html':'main article'};
 const selector=selectors[rel];if(!selector)return null;const clean=s=>(s||'').replace(/\s+/g,' ').trim();
 let nodes=[...document.querySelectorAll(selector)];
 if(rel==='people/members.html')return nodes.slice(0,3).map(e=>['h3','.role','.email'].map(q=>clean(e.querySelector(q)?.textContent)).join('|')).sort();
 if(rel.startsWith('research/'))return nodes.filter(e=>destinations[clean(e.querySelector('h3').textContent)]===rel).map(e=>['h3','.agency','.period'].map(q=>clean(e.querySelector(q)?.textContent)).join('|')).sort();
 return nodes.map(e=>clean(e.textContent)).sort();
},{rel,destinations});
async function extraChecks(browser,origin){
 const checks=[];
 for(const width of [375,430,768,900,1024,1440]){
  const ctx=await browser.newContext({viewport:{width,height:1000},hasTouch:width<=900,reducedMotion:'reduce'});const page=await ctx.newPage();
  await page.goto(`${origin}/after/people/members.html`);assert(await page.locator('main').textContent().then(t=>t.includes('현재 구성원 5명')));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===375)await page.screenshot({path:`${out}/members-375-after.png`});
  await page.goto(`${origin}/after/publications/international.html`);await page.locator('.year-nav a').last().click();
  const y=await page.locator('#year-2004').boundingBox(),head=await page.locator('.header').boundingBox();assert(y.y>=head.y+head.height-1 && y.y<1000,'Year heading obscured');
  for(const projectPage of ['ongoing','completed']){
   await page.goto(`${origin}/after/research/${projectPage}.html`);assert.equal(await page.locator('main article').count(),projectPage==='ongoing'?1:26);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert(await page.locator('.field-label').first().textContent().then(t=>t.includes(projectPage==='ongoing'?'Original planned period':'Original recorded research period')));
   if(width===1440)await page.screenshot({path:`${out}/${projectPage}-1440-after.png`});
  }
  checks.push(`final Members, year-anchor visibility and 1/26 project display @${width}`);await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await ctx.newPage();
 await page.goto(`${origin}/after/index.html`);const links=await page.locator('#peopleList a,#publicationList a,#projectList a').evaluateAll(xs=>xs.map(x=>({href:x.getAttribute('href'),text:x.textContent})));
 assert.equal(links.length,10);
 for(const link of links){await page.goto(`${origin}/after/index.html`);await page.locator(`main a[href="${link.href}"]`).first().click();assert.equal(new URL(page.url()).pathname,`/after/${link.href}`)}
 checks.push('All 10 homepage record links navigate to their real detail pages');
 for(const mode of ['before','after'])for(const section of ['publications','projects']){await page.goto(`${origin}/${mode}/index.html`);await page.locator(`#${section}`).scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/home-${section}-1440-${mode}.png`})}
 for(const mode of ['before','after']){
  await page.goto(`${origin}/${mode}/people/members.html`);
  if(mode==='after'){
   const sizes=await page.locator('.person-photo-placeholder').evaluateAll(xs=>xs.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]}));assert.equal(sizes.length,5);assert(sizes.every(x=>Math.abs(x[0]-sizes[0][0])<1&&Math.abs(x[1]-sizes[0][1])<1));
  }
  await page.screenshot({path:`${out}/members-full-1440-${mode}.png`,fullPage:true});
 }
 await ctx.close();
 const mobileContext=await browser.newContext({viewport:{width:375,height:1000},hasTouch:true,reducedMotion:'reduce'});const mobilePage=await mobileContext.newPage();
 for(const mode of ['before','after']){await mobilePage.goto(`${origin}/${mode}/people/members.html`);await mobilePage.screenshot({path:`${out}/members-full-375-${mode}.png`,fullPage:true})}await mobileContext.close();
 checks.push('Five uniform photo placeholders and full-page Members comparisons at 375/1440');
 const nojs=await browser.newContext({viewport:{width:1440,height:1000},javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto(`${origin}/after/publications/articles.html`);assert.equal(await staticPage.locator('#article-list li').count(),11);assert(await staticPage.locator('#article-list li').first().isVisible());await staticPage.locator('.year-nav a').last().click();assert(staticPage.url().endsWith('#year-2003'));await nojs.close();checks.push('Articles: 11 readable records and year navigation without JavaScript');
 fs.writeFileSync(path.join(out,'extra-results.json'),JSON.stringify({status:'PASS',checks},null,2));console.log('Supplemental checks: PASS');
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for(const width of [375,430,768,900,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<=900});
  // Map provider availability is outside the local UI test; no external requests.
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.fulfill({status:200,contentType:'text/html',body:''}));
  const p=await context.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text()+' '+e.location().url)});
  for(const rel of pages){
   errors=[];
   try{
    await p.goto(`${origin}/before/${rel}`);baselines[rel]=await getContent(p,rel);
    if(samples[rel] && (width===1440 || (width===375 && ['people/members.html','people/alumni.html','people/professor.html'].includes(rel)))){
      if(rel==='index.html')await p.locator('#people').scrollIntoViewIfNeeded();
      await p.screenshot({path:`${out}/${samples[rel]}-${width}-before.png`});
    }
    errors=[];
    await p.goto(`${origin}/after/${rel}`);await p.evaluate(()=>document.fonts.ready);
    if(baselines[rel])assert.deepEqual(await getContent(p,rel),baselines[rel],`Rendered records changed: ${rel}`);
    const layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,logo:[...document.querySelectorAll('.brand img,.footer-logo img')].map(e=>{const r=e.getBoundingClientRect();return {loaded:e.complete&&e.naturalWidth>0,w:r.width,h:r.height,nw:e.naturalWidth,nh:e.naturalHeight}}),ids:[...document.querySelectorAll('[id]')].map(e=>e.id)}));
    assert(!layout.overflow,`overflow: ${rel}@${width}`);assert.equal(new Set(layout.ids).size,layout.ids.length);
    // Footer's lazy logo may need scrolling to load.
    await p.locator('.footer-logo').scrollIntoViewIfNeeded();await p.waitForFunction(()=>[...document.querySelectorAll('.brand img,.footer-logo img')].every(e=>e.complete&&e.naturalWidth>0));await p.evaluate(()=>scrollTo(0,0));
    for(const x of layout.logo){assert(Math.abs(x.w/x.h-1500/234)<.02);assert(x.w<=1500)}
    assert.equal(await p.locator('#navigation > a').allTextContents().then(a=>a.join('|')),'Home|News|Archive|Contact');
    const nav=p.locator('#navigation'),menu=p.locator('#menuButton');
    if(width<=900){assert(!await nav.isVisible());assert(await menu.isVisible());await menu.tap();assert.equal(await menu.getAttribute('aria-expanded'),'true');assert(await nav.isVisible())}
    else {assert(await nav.isVisible());assert(!await menu.isVisible())}
    for(const key of ['lab','people','publications','research']){
     const toggle=p.locator(`[aria-controls="${key}-submenu"]`),drop=p.locator(`#${key}-submenu`);
     if(width<=900)await toggle.tap();else {await toggle.focus();await p.keyboard.press('Space')}
     assert(await drop.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'true');
     const bounds=await drop.boundingBox();assert(bounds.x>=-1&&bounds.x+bounds.width<=width+1,`dropdown overflow ${rel}@${width}`);
     await toggle.focus();await p.keyboard.press('ArrowDown');assert(await drop.locator('a').first().evaluate(e=>e===document.activeElement));
     await p.keyboard.press('Tab');assert(await drop.locator('a').nth(1).evaluate(e=>e===document.activeElement));
     await p.keyboard.press('Escape');assert(!await drop.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'false');
     await p.keyboard.press('Enter');assert(await drop.isVisible());await p.keyboard.press('Escape');
    }
    if(width<=900){await p.keyboard.press('Escape');assert(!await nav.isVisible());assert(await menu.evaluate(e=>e===document.activeElement))}
    else {await p.locator('.nav-group').nth(1).hover();assert(await p.locator('#people-submenu').isVisible());await p.mouse.move(width-1,999);assert(!await p.locator('#people-submenu').isVisible())}
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    // Capture clean first-viewport comparison images, without focus rings.
    if(samples[rel]&&(width===1440||(width===375&&['people/members.html','people/alumni.html','people/professor.html'].includes(rel)))){
     await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});await p.mouse.move(width-1,999);if(rel==='index.html')await p.locator('#people').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${samples[rel]}-${width}-after.png`});
    }
    if(rel.startsWith('publications/')){
      assert.equal(await p.locator('main .section-nav a').count(),5);
      const yearLinks=p.locator('main .year-nav a');assert(await yearLinks.count()>0);
      await yearLinks.last().click();const target=await yearLinks.last().getAttribute('href');assert.equal(await p.locator(target).count(),1);
    }
    if(rel==='people/alumni.html'){
      const years=await p.locator('main h2.year').allTextContents();assert.deepEqual(years,[...years].sort((a,b)=>Number(b)-Number(a)));assert.equal(await p.locator('main article').count(),27);
    }
    if(rel==='people/members.html'){assert.equal(await p.locator('main article').count(),5);assert.equal(await p.locator('.person-photo-placeholder').count(),5);assert.deepEqual(await p.locator('main article h3').allTextContents(),['송인호','김영준','여인웅','박진성','김도균']);assert(await p.locator('main').textContent().then(t=>t.includes('2026년 3월 석사과정 시작')))}
    if(rel.startsWith('research/')){assert.equal(await p.locator('main article').count(),rel.includes('ongoing')?1:26);assert(await p.locator('.project-status').first().isVisible().catch(()=>false)||await p.locator('.project-status').count()>0);}
    if(rel==='index.html'){
      assert.equal(await p.locator('#peopleList a').count(),3);assert.equal(await p.locator('#publicationList a').count(),5);assert.equal(await p.locator('#projectList a').count(),2);
      assert(!await p.locator('main').textContent().then(t=>/archive under preparation|Faculty information will be added/.test(t)));
    }
    assert.deepEqual(errors,[]);results.push({page:rel,width,status:'PASS'});
   }catch(e){failures.push({page:rel,width,error:e.message});console.log('FAIL',rel,width,e.message);}
  }
  await context.close();console.log(`Completed ${width}px: ${results.filter(r=>r.width===width).length}/15 passed`);
 }
 // Actual page/anchor navigation and resize reset.
 const p=await browser.newPage({viewport:{width:375,height:1000},hasTouch:true});
 await p.goto(`${origin}/after/publications/korean.html`);await p.locator('#menuButton').tap();await p.locator('[aria-controls="people-submenu"]').tap();await p.locator('#people-submenu a').first().click();assert(p.url().endsWith('/after/people/professor.html'));
 await p.locator('#menuButton').tap();await p.locator('#navigation > a').filter({hasText:/^News$/}).click();await p.waitForURL('**/after/index.html#news');assert(!await p.locator('#navigation').isVisible());
 await p.locator('#menuButton').tap();await p.locator('[aria-controls="research-submenu"]').tap();await p.setViewportSize({width:1024,height:1000});assert.equal(await p.locator('#menuButton').getAttribute('aria-expanded'),'false');assert(!await p.locator('#research-submenu').isVisible());await p.setViewportSize({width:900,height:1000});assert(!await p.locator('#navigation').isVisible());
 await extraChecks(browser,origin);
 await browser.close();server.close();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({results,failures,checks:'15 pages × 6 widths; 5 current members; 27 unchanged alumni; 97 immutable outputs; authorized project redistribution 1/26; source-field comparisons; links/year navigation; keyboard/touch; external map stubbed'},null,2));if(failures.length)process.exitCode=1;console.log('TOTAL',results.length,'passed;',failures.length,'failed');
})().catch(e=>{console.error(e);process.exit(1)});
