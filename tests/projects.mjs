import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {test} from 'node:test';

const context=vm.createContext({document:{readyState:'loading',addEventListener(){}},console});
for(const file of ['projects-data.js','projects-core.js','projects.js'])vm.runInContext(fs.readFileSync(`dist/assets/${file}`,'utf8'),context,{filename:file});
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

test('all 41 screen views and 5 print views render with unique IDs and valid labels',()=>{
  const views=[['catalogue',V.catalogue()]];
  for(const p of projects){views.push([p.id,V.overview(p)],[p.id+'/finish',V.finishView(p)],[p.id+'/print',V.printView(p)]);p.steps.forEach((_,i)=>views.push([p.id+'/'+i,V.stepView(p,i)]));}
  assert.equal(views.length,46);
  for(const [name,html] of views){
    assert.ok(html.length>500,name);assert.doesNotMatch(html,/undefined|\[object Object\]/,name);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`duplicate IDs in ${name}`);
    for(const [,label] of html.matchAll(/\bfor="([^"]+)"/g))assert.ok(ids.includes(label),`missing ${label} in ${name}`);
    for(const [,ref] of html.matchAll(/href="(#[^"]+)"/g)){assert.ok(C.route(ref,projects).project,ref);}
    for(const [,ref] of html.matchAll(/href="([^"#]+)"/g)){if(!ref.startsWith('http'))assert.ok(fs.existsSync(path.join('dist',ref.split('#')[0])),ref);}
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
  assert.throws(()=>C.decode('a'.repeat(3000001),projects,owner),/gross/);
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
  for(const file of ['projects-data.js','projects-core.js','projects.js'])vm.runInContext(fs.readFileSync(`dist/assets/${file}`,'utf8'),ctx);
  for(const fn of events.get('DOMContentLoaded')||[])fn();
  const fire=async(k,target)=>{for(const fn of events.get(k)||[])await fn({target});};
  const action=async(type,project)=>{const b=new Element();b.dataset={action:type,project};await fire('click',b)};
  const input=async(project,key,value)=>{const el=new Element();el.dataset={project,note:key};el.value=value;await fire('input',el)};
  const check=async(project,key,index,on=true)=>{const el=new Element();el.dataset={project,[key]:String(index)};el.attrs.set(`data-${key}`,'');el.checked=on;await fire('change',el)};
  return {get,seed,ctx,action,input,check,downloads,doc};
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
