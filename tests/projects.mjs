import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';

const context=vm.createContext({document:{readyState:'loading',addEventListener(){}},console});
for(const file of ['projects-data.js','projects-learning.js','projects-core.js','projects-media-data.js','projects-workspace.js','projects.js'])vm.runInContext(fs.readFileSync(`dist/assets/${file}`,'utf8'),context,{filename:file});
const {projects,sources}=context.MediaInfoProjects,C=context.MediaInfoProjectsCore,V=context.MediaInfoProjectViews;
const clean=o=>JSON.parse(JSON.stringify(o));
const owner='test.person@stud.bffbern.ch';

test('five complete projects have unique permanent IDs and usable materials',()=>{
  assert.equal(projects.length,5);assert.equal(new Set(projects.map(p=>p.id)).size,5);
  for(const p of projects){
    assert.equal(p.steps.length,6,p.id);assert.ok(p.quality.length>=5,p.id);assert.ok(p.template.length>150,p.id);
    assert.equal(Object.keys(p.timeboxes).length,3,p.id);assert.equal(p.extensions.length,2,p.id);
    for(const s of p.steps){assert.ok(s.actions.length>=3,p.id);assert.ok(s.help.length,p.id);assert.ok(s.example&&s.checkpoint,p.id);}
    for(const r of p.resources||[])assert.ok(fs.existsSync(path.join('dist',r.href)),r.href);
  }
  assert.ok(!JSON.stringify(projects).includes('ß'));
  for(const s of sources){assert.ok(s.url.startsWith('https://'));assert.ok(s.projects.every(id=>projects.some(p=>p.id===id)));}
});

test('all 56 screen views and 5 print views render with unique IDs and valid labels',()=>{
  const views=[['catalogue',V.catalogue()]];
  for(const p of projects){views.push([p.id+'/planner',V.planner(p)],[p.id+'/studio',V.studio(p)],[p.id+'/media',V.media(p)],[p.id,V.overview(p)],[p.id+'/finish',V.finishView(p)],[p.id+'/print',V.printView(p)]);p.steps.forEach((_,i)=>views.push([p.id+'/'+i,V.stepView(p,i)]));}
  assert.equal(views.length,61);
  for(const [name,html] of views){
    assert.ok(html.length>500,name);assert.doesNotMatch(html,/undefined|\[object Object\]/,name);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`duplicate IDs in ${name}`);
    for(const [,label] of html.matchAll(/\bfor="([^"]+)"/g))assert.ok(ids.includes(label),`missing ${label} in ${name}`);
    for(const [,ref] of html.matchAll(/href="(#[^"]+)"/g)){assert.ok(C.route(ref,projects).project,ref);}
    for(const [,ref] of html.matchAll(/href="([^"#]+)"/g)){if(!ref.startsWith('http'))assert.ok(fs.existsSync(path.join('dist',ref.split(/[?#]/)[0])),ref);}
  }
});

test('routing accepts valid deep links and safely falls back for unknown paths',()=>{
  assert.equal(C.route('#faktencheck/schritt-4',projects).index,3);
  assert.equal(C.route('#tutorial/abschluss',projects).page,'finish');
  assert.equal(C.route('#tutorial/schritt-99',projects).page,'overview');
  assert.equal(C.route('#unknown/schritt-1',projects).page,'catalogue');
  assert.equal(C.route('#tutorial/<img>',projects).page,'overview');
});

test('a backup roundtrip preserves all project notes, choices and completion',()=>{
  const state=C.empty();
  for(const p of projects){const r=C.emptyProject();r.checks=p.steps.map((_,i)=>i);r.quality=p.quality.map((_,i)=>i);r.notes={plan:'Eigene Idee äöü',step0:'<script>not executable</script>',pause:'Hier weiter',result:'Getestet'};r.time='short';r.choice=p.choices?.[1]?.id||'';r.startedAt='2026-10-11T10:00:00Z';r.finishedAt='2026-10-11T11:00:00Z';state.projects[p.id]=r;}
  assert.deepEqual(clean(C.decode(C.encode(state,projects,owner),projects,owner)),clean(C.normalize(state,projects)));
});

test('wrong account, corrupt data, unrelated workshop and future format are rejected',()=>{
  const backup=C.encode(C.empty(),projects,owner);
  assert.throws(()=>C.decode(backup,projects,'someone.else@stud.bffbern.ch'),/anderen Schulmail/);
  assert.throws(()=>C.decode('{',projects,owner),/JSON/);
  assert.throws(()=>C.decode('{"workshop":"OneNote Workshop GS1"}',projects,owner),/Projekte/);
  assert.throws(()=>C.decode(backup.replace('"version": 1','"version": 2'),projects,owner),/Projekte/);
  assert.throws(()=>C.decode('a'.repeat(6000001),projects,owner),/gross/);
});

test('malformed fields cannot add arbitrary project keys, duplicate checks or forged completion',()=>{
  const raw=JSON.parse('{"version":1,"projects":{"__proto__":{"bad":true},"tutorial":{"checks":[0,0,-1,999,"1"],"quality":[],"finishedAt":"fake","notes":{"__proto__":"oops","step0":"ok","unexpected":"drop"}},"unknown":{}}}');
  const s=C.normalize(raw,projects);assert.deepEqual(Object.keys(s.projects),['tutorial']);
  assert.deepEqual(clean(s.projects.tutorial.checks),[0]);assert.equal(s.projects.tutorial.finishedAt,'');
  assert.deepEqual(clean(s.projects.tutorial.notes),{step0:'ok'});assert.equal({}.bad,undefined);
});

test('completion requires both work steps and quality checks',()=>{
  const p=projects[0],r=C.emptyProject();assert.equal(C.eligible(r,p),false);
  r.checks=p.steps.map((_,i)=>i);assert.equal(C.eligible(r,p),false);
  r.quality=p.quality.map((_,i)=>i);assert.equal(C.eligible(r,p),true);
  r.finishedAt='2026-10-11';assert.equal(C.status(r),'Basis fertig');
  r.checks.pop();assert.equal(C.cleanProject(r,p).finishedAt,'');
});

test('work can resume at the first unfinished step or the final quality review',()=>{
  const p=projects[0],r=C.emptyProject();assert.equal(C.next(r,p),'schritt-1');
  r.checks=[0,1,3];assert.equal(C.next(r,p),'schritt-3');
  r.checks=p.steps.map((_,i)=>i);assert.equal(C.next(r,p),'abschluss');
});

test('selected paper/image and tutorial routes do not show the other route’s actions',()=>{
  const p=projects.find(p=>p.id==='dokumente');
  const images=V.visibleActions(p,{choice:'bilder'},p.steps[2].actions).join(' ');
  assert.match(images,/PowerPoint/);assert.doesNotMatch(images,/Fotografieren Sie|Starten Sie «Scannen»/);
  const scan=V.visibleActions(p,{choice:'scan'},p.steps[2].actions).join(' ');assert.match(scan,/Fotografieren Sie/);assert.doesNotMatch(scan,/Erstellen Sie in PowerPoint/);
  const t=projects[0];assert.doesNotMatch(V.visibleActions(t,{choice:'bilder'},t.steps[3].actions).join(' '),/Nehmen Sie den geplanten Ablauf auf/);
});

test('all user-provided text is escaped before markup use',()=>{
  assert.equal(C.escape('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(C.escape("</textarea><script>'&"),'&lt;/textarea&gt;&lt;script&gt;&#39;&amp;');
});

// Exercise the actual event handlers and storage boundary, without launching a browser.
function runtime(seed=new Map(), failWrites=false){
  const elements=new Map(),events=new Map(),winEvents=new Map(),downloads=[];
  class Element{
    constructor(id=''){this.id=id;this.dataset={};this.innerHTML='';this.textContent='';this.value='';this.hidden=false;this.open=false;this.listeners=new Map();this.attrs=new Map();}
    setAttribute(k,v){this.attrs.set(k,v)} hasAttribute(k){return this.attrs.has(k)}
    addEventListener(k,fn){this.listeners.set(k,fn)}
    closest(){return this} focus(){} select(){} append(){} remove(){}
    showModal(){this.open=true}close(){this.open=false}
    click(){if(this.download)downloads.push({name:this.download,blob:blobs.get(this.href)})}
  }
  const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
  const classes=new Set(),blobs=new Map();
  const doc={readyState:'loading',activeElement:null,title:'',querySelector:s=>get(s.replace(/^#/,'')),getElementById:get,createElement:()=>new Element(),body:new Element(),documentElement:{classList:{toggle:(v,on)=>on?classes.add(v):classes.delete(v),contains:v=>classes.has(v)}},addEventListener:(k,fn)=>{events.set(k,[...(events.get(k)||[]),fn])}};
  const storage={getItem:k=>seed.get(k)||null,setItem:(k,v)=>{if(failWrites)throw new Error('quota');seed.set(k,v)}};
  const ctx=vm.createContext({document:doc,localStorage:storage,location:{hash:''},navigator:{clipboard:{writeText:async()=>{}}},Blob,URL:{createObjectURL:b=>{const key='blob:'+blobs.size;blobs.set(key,b);return key},revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},scrollTo(){},print(){},addEventListener:(k,fn)=>winEvents.set(k,fn)});
  for(const file of ['projects-data.js','projects-learning.js','projects-core.js','projects-media-data.js','projects-workspace.js','projects.js'])vm.runInContext(fs.readFileSync(`dist/assets/${file}`,'utf8'),ctx);
  for(const fn of events.get('DOMContentLoaded')||[])fn();
  const fire=async(k,target)=>{for(const fn of events.get(k)||[])await fn({target});};
  const action=async(type,project,extra={})=>{const b=new Element();b.dataset={action:type,project,...extra};await fire('click',b)};
  const input=async(project,key,value)=>{const el=new Element();el.dataset={project,note:key};el.value=value;await fire('input',el)};
  const check=async(project,key,index,on=true)=>{const el=new Element();el.dataset={project,[key]:String(index)};el.attrs.set(`data-${key}`,'');el.checked=on;await fire('change',el)};
  return {get,seed,ctx,action,input,check,downloads,doc,fire,Element,winEvents};
}

test('actual UI handlers save notes and checkboxes, reload and keep accounts separate',async()=>{
  const data=new Map([['mediainfolab_student_access_v1',JSON.stringify({email:owner})]]),app=runtime(data);
  await app.input('tutorial','step0','Meine eigene Idee');await app.check('tutorial','step',0);
  const key='mediainfolab_projects_v1:'+owner,saved=JSON.parse(data.get(key));
  assert.equal(saved.projects.tutorial.notes.step0,'Meine eigene Idee');assert.deepEqual(saved.projects.tutorial.checks,[0]);
  const reloaded=runtime(data);assert.match(reloaded.get('main').innerHTML,/Hier können Sie weiterarbeiten/);
  data.set('mediainfolab_student_access_v1',JSON.stringify({email:'second.person@stud.bffbern.ch'}));
  const second=runtime(data);assert.doesNotMatch(second.get('main').innerHTML,/Hier können Sie weiterarbeiten/);
  await second.input('tutorial','step0','Zweite Person');assert.equal(JSON.parse(data.get(key)).projects.tutorial.notes.step0,'Meine eigene Idee');
});

test('actual completion handler refuses premature completion and clears status after unchecking',async()=>{
  const data=new Map([['mediainfolab_student_access_v1',JSON.stringify({email:owner})]]),app=runtime(data),key='mediainfolab_projects_v1:'+owner;
  await app.action('finish','tutorial');assert.equal(data.has(key),false);
  for(let i=0;i<6;i++)await app.check('tutorial','step',i);
  for(let i=0;i<5;i++)await app.check('tutorial','quality',i);
  await app.action('finish','tutorial');assert.ok(JSON.parse(data.get(key)).projects.tutorial.finishedAt);
  await app.check('tutorial','quality',0,false);assert.equal(JSON.parse(data.get(key)).projects.tutorial.finishedAt,'');
});

test('actual file import requires confirmation and restores backup into storage',async()=>{
  const data=new Map([['mediainfolab_student_access_v1',JSON.stringify({email:owner})]]),app=runtime(data),key='mediainfolab_projects_v1:'+owner;
  await app.input('cockpit','plan','Ursprüngliche Idee');await app.action('backup');
  const backup=await app.downloads[0].blob.text();await app.input('cockpit','plan','Neuere Idee');
  await app.get('importProjectFile').listeners.get('change')({target:{files:[{name:'Sicherung.json',size:backup.length,text:async()=>backup}]}});
  assert.match(app.get('dialogBody').innerHTML,/ersetzt/);assert.equal(JSON.parse(data.get(key)).projects.cockpit.notes.plan,'Neuere Idee');
  await app.action('confirm-import');assert.equal(JSON.parse(data.get(key)).projects.cockpit.notes.plan,'Ursprüngliche Idee');
});

test('blocked storage shows a warning and keeps new notes available for export',async()=>{
  const data=new Map([['mediainfolab_student_access_v1',JSON.stringify({email:owner})]]),app=runtime(data,true);
  await app.input('faktencheck','step0','Meine ungespeicherte Beobachtung');
  assert.equal(app.get('storageWarning').hidden,false);assert.match(app.get('saveStatus').textContent,/Nicht dauerhaft gespeichert/);
  await app.action('backup');const raw=JSON.parse(await app.downloads[0].blob.text());
  assert.equal(raw.state.projects.faktencheck.notes.step0,'Meine ungespeicherte Beobachtung');
});

const L=context.MediaInfoLearning;
const projectKey='mediainfolab_projects_v1:'+owner;
const seeded=()=>new Map([['mediainfolab_student_access_v1',JSON.stringify({email:owner})]]);
async function edit(app,project,dataset,value,event='input'){
  const el=new app.Element();el.dataset={project,...dataset};el.value=value;
  for(const key of Object.keys(dataset))el.attrs.set('data-'+key.replace(/[A-Z]/g,x=>'-'+x.toLowerCase()),'');
  await app.fire(event,el);
}
const saved=app=>JSON.parse(app.seed.get(projectKey));

test('a lesson budget allocates mandatory work first, preserves closing time and carries over partial tasks',()=>{
  const p=projects[0],r=C.emptyProject();r.planner.minutes=20;r.planner.mandatory=8;r.planner.readiness='open';
  const q=L.plan(p,r);assert.equal(q.mandatory,8);assert.equal(q.reserve,5);assert.equal(q.work,7);assert.equal(q.today[0].index,0);assert.equal(q.today[1].partial,true);
  assert.equal(q.mandatory+q.work+q.reserve,20);assert.equal(q.later+q.work,q.total);assert.deepEqual(clean(r.checks),[]);
  r.planner.mandatory=30;const full=L.plan(p,r);assert.equal(full.work,0);assert.equal(full.mandatoryOverflow,15);assert.ok(full.later>0);
  r.planner.minutes=3;const short=L.plan(p,r);assert.equal(short.work,0);assert.equal(short.reserve,3);assert.equal(short.mandatory,0);
});

test('remaining time, completed steps, paused clocks and stale sessions produce honest forecasts',()=>{
  const p=projects[0],r=C.emptyProject(),now=Date.parse('2026-10-11T10:15:00Z');
  r.checks=[0,1];r.planner.readiness='done';r.planner.remaining[2]=3;
  r.planner.session={status:'running',startedAt:'2026-10-11T10:00:00Z',elapsed:0,mandatoryDone:true,checksAtStart:[]};
  const q=L.plan(p,r,now);assert.equal(q.left,30);assert.equal(q.today[0].index,2);assert.equal(q.today[0].minutes,3);
  r.planner.session.status='paused';r.planner.session.elapsed=600;assert.equal(L.elapsed(r.planner,now+5000000),600);
  r.planner.session.status='running';assert.equal(L.stale(r.planner,now+6*3600000),true);
  r.checks=p.steps.map((_,i)=>i);r.quality=p.quality.map((_,i)=>i);r.finishedAt='2026-10-11';assert.equal(L.plan(p,r,now).total,0);
});

test('legacy saves migrate without losing notes or completion and a full new backup preserves planning and images',()=>{
  const old={version:1,projects:{tutorial:{checks:[0],quality:[],notes:{plan:'Alte Idee'},time:'short'}}};
  const state=C.normalize(old,projects),r=state.projects.tutorial;assert.equal(r.notes.plan,'Alte Idee');assert.equal(r.planner.minutes,45);assert.equal(r.studio.blocks.length,0);
  r.studio=L.makeTemplate(projects[0],'screenshot');r.studio.blocks[0].text='Mein eigener Text';r.studio.blocks[0].image='data:image/png;base64,aGVsbG8=';r.planner.nextAction='Bild 3 ersetzen';r.planner.file='OneDrive/Meine-Datei';r.actions=['0-1'];
  const round=C.decode(C.encode(state,projects,owner),projects,owner);assert.deepEqual(clean(round),clean(C.normalize(state,projects)));
  r.studio.blocks[0].image='data:image/svg+xml;base64,PHN2Zz4=';assert.equal(C.normalize(state,projects).projects.tutorial.studio.blocks[0].image,'');
});

test('clock starts only after conscious readiness choice and only one project clock runs at a time',async()=>{
  const app=runtime(seeded());await app.action('lesson-start','tutorial');assert.equal(app.seed.has(projectKey),false);assert.match(app.get('projectToast').textContent,/Pflichtaufträgen/);
  await edit(app,'tutorial',{plan:'readiness'},'done','change');await app.action('lesson-start','tutorial');assert.equal(saved(app).projects.tutorial.planner.session.status,'running');
  await edit(app,'cockpit',{plan:'readiness'},'released','change');await app.action('lesson-start','cockpit');
  assert.equal(saved(app).projects.tutorial.planner.session.status,'paused');assert.equal(saved(app).projects.cockpit.planner.session.status,'running');
  await app.action('lesson-resume','tutorial');assert.equal(saved(app).projects.cockpit.planner.session.status,'paused');
});

test('lesson handoff preserves next action, real location and remaining mandatory work without completing tasks',async()=>{
  const app=runtime(seeded());await edit(app,'tutorial',{plan:'readiness'},'open','change');await app.action('lesson-start','tutorial');await app.check('tutorial','step',0);
  await app.action('lesson-close','tutorial');app.get('handoff-file').value='Meine Werkbank / Tutorial';app.get('handoff-next').value='Bild 2 zuschneiden';app.get('handoff-mandatory').value='7';
  await app.action('lesson-finish-backup','tutorial');const r=saved(app).projects.tutorial;
  assert.equal(r.planner.session.status,'closed');assert.equal(r.planner.nextAction,'Bild 2 zuschneiden');assert.equal(r.planner.file,'Meine Werkbank / Tutorial');assert.equal(r.planner.mandatory,7);assert.equal(r.planner.history[0].steps,1);assert.deepEqual(r.checks,[0]);
  const round=C.decode(await app.downloads.at(-1).blob.text(),projects,owner);assert.equal(round.projects.tutorial.planner.nextAction,'Bild 2 zuschneiden');
});

test('template preview and explicit application are separate; replacement is reversible after confirmation',async()=>{
  const app=runtime(seeded());await app.action('template-preview','tutorial',{template:'screenshot'});assert.equal(app.seed.has(projectKey),false);
  await app.action('template-apply','tutorial');assert.equal(saved(app).projects.tutorial.studio.blocks.length,5);
  await edit(app,'tutorial',{studio:'text',block:'0'},'Mein eigener wichtiger Inhalt');
  await app.action('template-preview','tutorial',{template:'datei'});assert.match(app.get('dialogBody').innerHTML,/bereits einen Entwurf/);assert.equal(saved(app).projects.tutorial.studio.blocks[0].text,'Mein eigener wichtiger Inhalt');
  await app.action('template-apply','tutorial');assert.equal(saved(app).projects.tutorial.studio.template,'datei');
  await app.action('studio-undo','tutorial');assert.equal(saved(app).projects.tutorial.studio.template,'datei');await app.action('studio-undo-confirm','tutorial');assert.equal(saved(app).projects.tutorial.studio.blocks[0].text,'Mein eigener wichtiger Inhalt');
});

test('custom blocks can be added, edited, reordered and deliberately removed; preview and HTML export escape input',async()=>{
  const app=runtime(seeded());await app.action('template-preview','lifehacks',{template:'eigen'});await app.action('template-apply','lifehacks');
  await app.action('studio-add','lifehacks');await edit(app,'lifehacks',{studio:'title',block:'5'},'Mein Extra');await edit(app,'lifehacks',{studio:'text',block:'5'},'<script>alert(1)</script>');
  await app.action('studio-up','lifehacks',{block:'5'});assert.equal(saved(app).projects.lifehacks.studio.blocks[4].title,'Mein Extra');
  app.ctx.location.hash='#lifehacks/werkbank';await app.action('studio-toggle','lifehacks');assert.match(app.get('main').innerHTML,/&lt;script&gt;alert/);assert.doesNotMatch(app.get('main').innerHTML,/<script>alert/);
  await app.action('studio-html','lifehacks');const html=await app.downloads.at(-1).blob.text();assert.match(html,/<!doctype html>/);assert.match(html,/&lt;script&gt;/);
  await app.action('studio-remove','lifehacks',{block:'4'});assert.equal(saved(app).projects.lifehacks.studio.blocks.length,6);await app.action('studio-remove-confirm','lifehacks',{block:'4'});assert.equal(saved(app).projects.lifehacks.studio.blocks.length,5);
});

test('editing an already checked product invalidates its old quality assessment',async()=>{
  const app=runtime(seeded());await app.action('template-preview','tutorial',{template:'screenshot'});await app.action('template-apply','tutorial');
  for(let i=0;i<6;i++)await app.check('tutorial','step',i);for(let i=0;i<5;i++)await app.check('tutorial','quality',i);await app.action('finish','tutorial');
  assert.ok(saved(app).projects.tutorial.finishedAt);await edit(app,'tutorial',{studio:'title'},'Veränderte Anleitung');assert.equal(saved(app).projects.tutorial.finishedAt,'');assert.deepEqual(saved(app).projects.tutorial.quality,[]);assert.equal(saved(app).projects.tutorial.checks.length,6);
});

test('switching work routes protects existing progress until explicit confirmation',async()=>{
  const app=runtime(seeded());await app.check('tutorial','step',0);await app.input('tutorial','step0','Meine Notiz bleibt');
  await edit(app,'tutorial',{choice:'video'},'video','change');assert.deepEqual(saved(app).projects.tutorial.checks,[0]);assert.match(app.get('dialogBody').innerHTML,/zurückgesetzt/);
  await app.action('confirm-route','tutorial');assert.equal(saved(app).projects.tutorial.choice,'video');assert.deepEqual(saved(app).projects.tutorial.checks,[]);assert.equal(saved(app).projects.tutorial.notes.step0,'Meine Notiz bleibt');
});

test('switching accounts clears pending import, template selection and undo state',async()=>{
  const app=runtime(seeded());await app.input('tutorial','plan','Person A');await app.action('backup');const backup=await app.downloads[0].blob.text();
  await app.get('importProjectFile').listeners.get('change')({target:{files:[{name:'A.json',size:backup.length,text:async()=>backup}]}});
  await app.action('template-preview','tutorial',{template:'screenshot'});
  app.seed.set('mediainfolab_student_access_v1',JSON.stringify({email:'second.person@stud.bffbern.ch'}));app.winEvents.get('storage')({key:'mediainfolab_student_access_v1'});
  await app.action('confirm-import');await app.action('template-apply','tutorial');assert.equal(app.seed.has('mediainfolab_projects_v1:second.person@stud.bffbern.ch'),false);assert.equal(app.get('projectDialog').open,false);
});

test('all five example films have local illustrations, complete timed captions and corresponding chapter buttons',()=>{
  const media=context.MediaInfoProjectMedia;
  for(const p of projects){const m=media[p.id];assert.ok(m.duration>=90);assert.ok(m.chapters.length>=7);let end=0;
    for(const chapter of m.chapters){assert.ok(Math.abs(chapter.start-end)<.001);end+=chapter.seconds;assert.ok(fs.existsSync('dist/assets/projects/media/'+chapter.image));assert.ok(chapter.caption.length>80);}
    assert.ok(Math.abs(m.duration-end)<.001);for(const ext of ['mp4','vtt'])assert.ok(fs.statSync(`dist/assets/projects/media/${p.id}.${ext}`).size>1000);
    assert.equal((V.media(p).match(/data-action="video-chapter"/g)||[]).length,m.chapters.length);assert.match(V.media(p),/preload="none"/);assert.doesNotMatch(V.media(p),/autoplay/);
  }
});

test('spoken captions reproduce every script word, stay synchronized and have an accessible transcript',()=>{
  const scripts=JSON.parse(fs.readFileSync('tools/project-narration.json','utf8'));
  const seconds=s=>s.split(':').map(Number).reduce((n,x)=>n*60+x,0);
  const normalize=s=>s.replace(/\s+/g,' ').trim();
  for(const p of projects){
    const m=context.MediaInfoProjectMedia[p.id],html=V.media(p);
    assert.equal(m.narration.gender,'female');assert.equal(m.narration.synthetic,true);
    assert.match(html,/KI-generierter Sprecherinnenstimme/);assert.doesNotMatch(html,/ohne Sprecherstimme|\d:\d+\.\d/);
    const blocks=fs.readFileSync(`dist/assets/projects/media/${p.id}.vtt`,'utf8').trim().split(/\n\n/).slice(1);
    let end=0;const spoken=[];
    for(const block of blocks){
      const [time,...lines]=block.split('\n');const match=time.match(/^(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3}) /);
      assert.ok(match,p.id+' invalid VTT');const start=seconds(match[1]),stop=seconds(match[2]);
      assert.ok(start>=end-.001&&stop>start&&stop<=m.duration+.001,p.id+' caption timing');
      assert.ok(lines.length<=2,p.id+' subtitle too dense');end=stop;spoken.push(lines.join(' '));
    }
    const script=scripts.projects[p.id].scenes.flatMap(s=>s.segments.map(s=>s.text));
    assert.equal(normalize(spoken.join(' ')),normalize(script.join(' ')),p.id+' complete spoken subtitles');
    assert.deepEqual(clean(m.chapters.flatMap(c=>c.narration)),script);
    const transcript=fs.readFileSync(`dist/assets/projects/media/${p.id}-sprechtext.txt`,'utf8');
    for(const text of script){assert.ok(transcript.includes(text));assert.ok(html.includes(C.escape(text)),p.id+' visible transcript');}
  }
});
