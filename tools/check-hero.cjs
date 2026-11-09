const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const baseline = require('node:child_process').execFileSync('git',['show','origin/main:index.html'],{cwd:root,encoding:'utf8'});
const heroCopy = s => s.slice(s.indexOf('<div class="hero-copy">'),s.indexOf('<div class="hero-art"')).replace(/\r\n/g,'\n');
assert.equal(heroCopy(fs.readFileSync(path.join(root,'index.html'),'utf8')),heroCopy(baseline),'Hero left copy changed');
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
      assert.equal(errors.length,0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const img=page.locator('.hero-art img');
      assert(await img.evaluate(i=>i.naturalWidth>0));
      if(phase==='after') {
        const data=await img.evaluate(i=>({w:i.width,h:i.height,nw:i.naturalWidth,nh:i.naturalHeight,fit:getComputedStyle(i).objectFit}));
        assert(Math.abs(data.w/data.h-data.nw/data.nh)<0.02,'image aspect ratio changed');
        assert.equal(data.fit,'contain');
        const box=await img.boundingBox();
        assert(box.x>=0 && box.x+box.width<=width,'image exceeds viewport');
      }
      await page.screenshot({path:path.join(out,`${phase}-${width}.png`)});
      await page.close();
    }
    console.log(`${phase}: 5 viewport checks passed`);
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
