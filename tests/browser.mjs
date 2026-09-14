import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const require=createRequire(import.meta.url);
const runtimeModules=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
if(!runtimeModules)throw new Error('CODEX_PRIMARY_RUNTIME_NODE_MODULES fehlt');
const {chromium}=require(path.join(runtimeModules,'playwright'));
const output=path.resolve('.browser-checks');
await fs.mkdir(output,{recursive:true});

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`)});
page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));

await page.goto('http://127.0.0.1:4173/index.html#start');
await page.evaluate(()=>{
  localStorage.setItem('mediainfolab_student_access_v1',JSON.stringify({email:'test@stud.bffbern.ch',acceptedAt:new Date().toISOString()}));
  localStorage.setItem('onenoteWorkshopGS1_student_v3',JSON.stringify({version:3,doneTasks:[1,2],checks:{'t3-1':true},notes:{},lastTask:3}));
  localStorage.setItem('digitalArbeiten_digipen_v1',JSON.stringify({version:1,done:[1,2,3,4,5],checks:{},notes:{},last:5}));
  localStorage.setItem('digitalArbeiten_scannen_v1',JSON.stringify({version:1,done:[1,2,3,4,5],checks:{},notes:{},last:5}));
});
await page.reload();
await page.screenshot({path:path.join(output,'01-startseite.png'),fullPage:true});
assert.match(await page.locator('.portal-hero h1').textContent(),/Informatik\.\s*Digital arbeiten\./);
assert.equal(await page.locator('[data-home-track]').count(),3);
assert.equal(await page.locator('[data-home-task-list="onenote"] .home-task-row').count(),12);
assert.equal(await page.locator('[data-home-task-list="digipen"] .home-task-row').count(),9);
assert.equal(await page.locator('[data-home-task-list="scan"] .home-task-row').count(),8);
assert.match(await page.locator('[data-home-summary="onenote"]').textContent(),/2 von 10 Grundaufträgen/);
assert.match(await page.locator('[data-home-task-list="onenote"] .home-task-row').nth(2).textContent(),/In Arbeit/);
assert.ok(await page.locator('[data-home-task-list="onenote"] .home-task-row').first().evaluate(element=>element.classList.contains('is-required')));
assert.match(await page.locator('[data-home-task-list="onenote"] .home-task-row').first().textContent(),/Pflicht/);
assert.ok(await page.locator('[data-home-task-list="onenote"] .home-task-row').nth(10).evaluate(element=>element.classList.contains('is-optional')));
assert.match(await page.locator('[data-home-task-list="onenote"] .home-task-row').nth(10).textContent(),/Zusatz/);
assert.ok(await page.locator('[data-home-transition="digipen"]').evaluate(element=>element.classList.contains('is-ready')));
assert.equal(await page.locator('[data-transition-state="digipen"]').textContent(),'Wechsel möglich');
assert.equal(await page.locator('[data-transition-link="digipen"]').getAttribute('href'),'scannen.html#auftrag-1');
assert.equal(await page.locator('[data-transition-link="scan"]').getAttribute('href'),'scannen.html#auftrag-7');

await page.goto('http://127.0.0.1:4173/index.html#scan-guide');
await page.locator('.guide-jumps').waitFor();
await page.locator('#guide-video').scrollIntoViewIfNeeded();
await page.waitForTimeout(250);
const jumpBox=await page.locator('.guide-jumps').boundingBox();
assert.ok(jumpBox&&jumpBox.y<0,'Die Guide-Navigation blieb beim Scrollen im sichtbaren Bereich');
await page.screenshot({path:path.join(output,'02-scan-guide-video.png'),fullPage:false});

await page.goto('http://127.0.0.1:4173/scannen.html#uebersicht');
await page.screenshot({path:path.join(output,'03-scannen-uebersicht.png'),fullPage:true});
assert.match(await page.locator('#progressText').textContent(),/Pflichtaufträge|Noch nicht begonnen/);

await page.goto('http://127.0.0.1:4173/scannen.html#auftrag-5');
assert.equal(await page.locator('#taskTitle').textContent(),'Den Scan am Notebook wiederfinden');
assert.equal(await page.locator('.task-link-button').getAttribute('href'),'https://www.microsoft365.com/');
await page.screenshot({path:path.join(output,'04-scannen-auftrag-5.png'),fullPage:true});
await page.locator('#next').click();
assert.equal(await page.locator('#taskLabel').textContent(),'Pflichtauftrag 6');
assert.equal(await page.locator('#taskTitle').textContent(),'Infos übernehmen, ohne alles abzutippen');
await page.screenshot({path:path.join(output,'05-scannen-ocr.png'),fullPage:true});

await page.evaluate(()=>localStorage.setItem('digitalArbeiten_scannen_v1',JSON.stringify({version:1,done:[1,2,3,4,5,7],checks:{},notes:{},last:7})));
await page.goto('http://127.0.0.1:4173/scannen.html#abschluss');
assert.match(await page.locator('#finishSummary').textContent(),/Alle 6 Pflichtaufträge sind erledigt/);
await page.screenshot({path:path.join(output,'06-scannen-abschluss.png'),fullPage:true});

await page.goto('http://127.0.0.1:4173/digipen.html#auftrag-7');
assert.equal(await page.locator('#taskTitle').textContent(),'Eine Party planen');
await page.screenshot({path:path.join(output,'07-digipen-party.png'),fullPage:true});

await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:4173/index.html#start');
assert.equal(await page.locator('.home-progress-column').count(),3);
const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
assert.ok(dimensions.scrollWidth<=dimensions.clientWidth+1,'Mobile Ansicht besitzt horizontales Scrollen');
await page.screenshot({path:path.join(output,'08-mobile-kurzuebersicht.png'),fullPage:true});

await browser.close();
assert.deepEqual(errors,[]);
console.log('Browserprüfung bestanden. Ansichten liegen in .browser-checks.');
