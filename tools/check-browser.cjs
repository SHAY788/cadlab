const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const out=path.resolve(process.env.REVIEW_OUTPUT || '/tmp/cadlab-phase2-review');fs.mkdirSync(out,{recursive:true});
const roots={before:path.resolve(process.env.CADLAB_BASELINE || '../cadlab-phase2-baseline'),after:path.resolve(__dirname,'..')};
const mime={'.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.html':'text/html'};
const server=http.createServer((req,res)=>{const parts=decodeURIComponent(req.url.split(/[?#]/)[0]).split('/');const root=roots[parts[1]];if(req.url==='/favicon.ico'){res.writeHead(204);return res.end()}if(!root){res.writeHead(404);return res.end()}const file=path.resolve(root,parts.slice(2).join('/')||'index.html');if(!file.startsWith(root+'/')){res.writeHead(403);return res.end()}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
const pages=[];function scan(dir,prefix=''){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(f.name==='.git')continue;const rel=path.join(prefix,f.name);if(f.isDirectory())scan(path.join(dir,f.name),rel);else if(f.name.endsWith('.html'))pages.push(rel)}}scan(roots.after);
const samples={'index.html':'home','people/professor.html':'professor','people/alumni.html':'alumni','publications/international.html':'publications','research/ongoing.html':'research','lab/contact.html':'contact'};
const results=[],failures=[],baselines={};
const getContent=p=>p.evaluate(()=>[...document.querySelectorAll('main,.hero')].map(e=>e.textContent.replace(/\s+/g,' ').trim()));
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
    if(width===1440 || (width===375 && ['index.html','people/professor.html'].includes(rel))){
     await p.goto(`${origin}/before/${rel}`);await p.evaluate(()=>document.fonts.ready);baselines[rel]=await getContent(p);
     if(samples[rel])await p.screenshot({path:`${out}/${samples[rel]}-${width}-before.png`});
    }
    await p.goto(`${origin}/after/${rel}`);await p.evaluate(()=>document.fonts.ready);
    if(baselines[rel])assert.deepEqual(await getContent(p),baselines[rel],`Rendered records changed: ${rel}`);
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
    if(samples[rel]&&(width===1440||(width===375&&['index.html','people/professor.html'].includes(rel)))){
     await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});await p.mouse.move(width-1,999);await p.screenshot({path:`${out}/${samples[rel]}-${width}-after.png`});
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
 await browser.close();server.close();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({results,failures,checks:'15 pages × 6 widths; actual page and cross-page News navigation; breakpoint state reset; local map frame only'},null,2));if(failures.length)process.exitCode=1;console.log('TOTAL',results.length,'passed;',failures.length,'failed');
})().catch(e=>{console.error(e);process.exit(1)});
