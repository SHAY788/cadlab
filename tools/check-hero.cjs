const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const baseline = require('node:child_process').execFileSync('git',['show','origin/main:index.html'],{cwd:root,encoding:'utf8'});
const copyText = s => ['eyebrow','hero-descriptor','hero-summary'].map(c => s.match(new RegExp('<(?:div|p) class="'+c+'">(.*?)</(?:div|p)>'))[1]);
const current = fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const file of require('node:child_process').execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8'}).trim().split('\n')) {
  const html=fs.readFileSync(path.join(root,file.trim()),'utf8');
  const submenu=html.match(/id="lab-submenu">([\s\S]*?)<\/div>/)[1];
  assert(!submenu.includes('Contact'),`${file}: duplicate Contact`);
  assert(html.match(/<nav id="navigation"[\s\S]*?<\/nav>/)[0].includes('>Contact</a>'),`${file}: top-level Contact missing`);
}
assert.deepEqual(copyText(current),copyText(baseline),'Supporting Hero copy changed');
const phase = process.argv[2] || 'after';
const out = path.join(root, '.github/review/hero');
fs.mkdirSync(out, {recursive:true});
const server = http.createServer((req,res) => {
  let file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403); return res.end();}
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    const mime = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
    res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch {res.writeHead(404);res.end();}
});
(async () => {
  await new Promise(r => server.listen(0,'127.0.0.1',r));
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    for (const width of [360,390,768,1024,1440]) {
      const page = await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
      const errors=[];
      await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.fulfill({status:200,body:''}));
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForFunction(()=>document.querySelector('.hero-art img').complete);
      if(width<=900) await page.locator('#menuButton').click();
      await page.locator('[aria-controls="lab-submenu"]').click();
      assert.equal(await page.locator('#lab-submenu a').count(),2);
      assert.equal(await page.locator('#navigation > a').filter({hasText:/^Contact$/}).count(),1);
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`navigation-${width}.png`)});
      await page.keyboard.press('Escape');
      if(width<=900) await page.keyboard.press('Escape');
      assert.equal(errors.length,0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const img=page.locator('.hero-art img');
      assert.equal(await page.locator('.hero h1').innerText(),'CAD is\nthe future.');
      assert.equal(await page.locator('.hero-actions,.hero-copy .cta,.hero-copy .cta-secondary').count(),0);
      assert.equal(await page.locator('.hero-bottom,.focus-strip').count(),0);
      assert(await img.evaluate(i=>i.naturalWidth>0));
      if(phase==='after') {
        const data=await img.evaluate(i=>({w:i.width,h:i.height,nw:i.naturalWidth,nh:i.naturalHeight,fit:getComputedStyle(i).objectFit}));
        assert(Math.abs(data.w/data.h-data.nw/data.nh)<0.02,'image aspect ratio changed');
        assert.equal(data.fit,'contain');
        const box=await img.boundingBox();
        assert(box.x>=0 && box.x+box.width<=width,'image exceeds viewport');
      }
      await page.screenshot({path:path.join(out,`${phase}-${width}.png`)});
      const photo=page.locator('.about-photo');
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(i=>i.decode());
      const photoData=await photo.evaluate(i=>({w:i.width,h:i.height,nw:i.naturalWidth,nh:i.naturalHeight}));
      assert.equal(photoData.nw,513);
      assert.equal(photoData.nh,342);
      assert(Math.abs(photoData.w/photoData.h-photoData.nw/photoData.nh)<0.02,'group photo aspect ratio changed');
      const facilities=page.locator('.about-facilities img');
      await facilities.scrollIntoViewIfNeeded();
      await facilities.evaluate(i=>i.decode());
      const equipment=await facilities.evaluate(i=>({w:i.width,h:i.height,nw:i.naturalWidth,nh:i.naturalHeight}));
      assert(equipment.nw>=2000,'restored facilities image resolution');
      assert(Math.abs(equipment.w/equipment.h-equipment.nw/equipment.nh)<0.02,'facilities image aspect ratio changed');
      const groupBox=await photo.boundingBox(),equipmentBox=await facilities.boundingBox();
      assert(equipmentBox.y>=groupBox.y+groupBox.height,'facilities overlaps group photo');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.locator('#about').screenshot({path:path.join(out,`about-${width}.png`),style:'.header{visibility:hidden !important}'});
      for(const id of ['research','people']) {
        assert.equal(await page.locator(`#${id} .section-heading > p`).count(),0);
        assert.equal(await page.locator(`#${id} .card`).count(),3);
        assert.equal(await page.locator(`#${id} .card-description-ko[lang="ko"]`).count(),3);
        if([390,1440].includes(width)) await page.locator(`#${id}`).screenshot({path:path.join(out,`${id}-${width}.png`)});
      }
      assert.equal(await page.locator('#publications .section-heading > p').count(),0);
      assert.equal(await page.locator('#publicationList .entry').count(),5);
      if([390,1440].includes(width)) await page.locator('#publications').screenshot({path:path.join(out,`publications-${width}.png`)});
      assert.equal(await page.locator('#projects .section-heading > p').count(),0);
      assert.equal(await page.locator('#projectList .card').count(),2);
      if([390,1440].includes(width)) await page.locator('#projects').screenshot({path:path.join(out,`projects-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/publications/international.html`);
      assert.equal(await page.locator('.catalogue-note,.year-nav,.summary').count(),0);
      assert.equal(await page.locator('.year-block li').count(),44);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`international-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/publications/korean.html`);
      assert.equal(await page.locator('.catalogue-note,.year-nav,.overview .count').count(),0);
      assert.equal(await page.locator('.year-block li').count(),29);
      assert.equal(await page.locator('.overview h2').innerText(),'논문 목록 · Journal Publications');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`korean-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/publications/articles.html`);
      assert.equal(await page.locator('.catalogue-note,.year-nav').count(),0);
      assert.equal(await page.locator('#article-list li').count(),11);
      assert(!await page.locator('main').innerText().then(s=>s.includes('11 articles and technical writings')));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`articles-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/publications/patents.html`);
      assert.equal(await page.locator('.catalogue-note,.intro,nav[aria-label="patents years"]').count(),0);
      assert.equal(await page.locator('article.item').count(),7);
      assert.equal(await page.locator('nav[aria-label="software years"]').count(),1);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`patents-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/publications/standards.html`);
      assert.equal(await page.locator('.catalogue-note,.year-nav,.intro,.notice').count(),0);
      assert.equal(await page.locator('article.record').count(),6);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`standards-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/research/ongoing.html`);
      assert.equal(await page.locator('.notice').count(),0);
      assert.equal(await page.locator('article.project').count(),1);
      assert(await page.locator('#P002 .period').isVisible());
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`ongoing-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/research/completed.html`);
      assert.equal(await page.locator('.notice,.intro').count(),0);
      assert.equal(await page.locator('article.project-card').count(),26);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`completed-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/lab/contact.html`);
      assert.equal(await page.locator('.map-section .button.secondary').count(),0);
      assert.equal(await page.getByText('팔달관 지도에서 보기 ↗',{exact:true}).count(),0);
      assert.equal(await page.locator('.map-section .note').count(),0);
      assert.equal(await page.locator('.map-frame iframe').count(),1);
      assert.equal(await page.getByRole('link',{name:'정문 → 팔달관 도보 길찾기 ↗',exact:true}).count(),1);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.locator('.map-section').screenshot({path:path.join(out,`contact-map-${width}.png`)});
      await page.goto(`http://127.0.0.1:${server.address().port}/lab/motto.html`);
      assert.equal(await page.locator('.attribution').nth(1).innerText(),'— Charles Mingus, an artist and member of Oasis');
      assert.equal(await page.getByText(/Historical transcription:/).count(),0);
      assert.equal(await page.locator('.quote').innerText(),'Do your worst and i will do my best');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if([390,1440].includes(width)) await page.screenshot({path:path.join(out,`motto-${width}.png`)});
      await page.close();
    }
    const pages=require('node:child_process').execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8'}).trim().split('\n');
    for(const width of [390,1440]) {
      const page=await browser.newPage({viewport:{width,height:1000}});
      await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.fulfill({status:200,body:''}));
      for(const file of pages) {
        await page.goto(`http://127.0.0.1:${server.address().port}/${file.trim()}`);
        await page.locator('.header .brand img').click();
        await page.waitForURL(`http://127.0.0.1:${server.address().port}/index.html`);
        assert.equal(await page.locator('.hero h1').innerText(),'CAD is\nthe future.');
      }
      await page.close();
    }
    console.log(`${phase}: 5 viewport checks and 30 desktop/mobile Logo home-navigation checks passed`);
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
