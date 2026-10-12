import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
function app(){
 const elements=new Map(),events=new Map();
 const get=s=>{if(!elements.has(s))elements.set(s,{textContent:'',innerHTML:'',dataset:{},style:{},href:''});return elements.get(s)};
 const window={addEventListener:(name,fn)=>events.set(name,fn)};
 const context=vm.createContext({window,document:{addEventListener(){},querySelector:get,querySelectorAll:s=>s.startsWith('[data-week42-')?[get(s)]:[]},location:{hash:'#woche-42'},localStorage:{getItem:()=>null},sessionStorage:{getItem:()=>null},setTimeout,clearTimeout,console});
 const source=fs.readFileSync('dist/assets/portal.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.checkWeek42={week42State,updateWeek42,currentView,HOME_TRACKS};})();');
 vm.runInContext(source,context);
 return {api:context.checkWeek42,window,get,events};
}
const blank=()=>({onenote:{raw:{doneTasks:[]}},digipen:{raw:{done:[]}},scan:{raw:{done:[]}}});
const required=()=>({onenote:{raw:{doneTasks:[1,2,3,4,5,6,7,8,9,10]}},digipen:{raw:{done:[1,2,3,4,5]}},scan:{raw:{done:[1,2,3,4,5,7]}}});
test('week 42 is routed and starts with the earliest missing compulsory task',()=>{
 const a=app(),s=blank(),q=a.api.week42State(s);assert.equal(a.api.currentView(),'woche-42');assert.equal(q.required.length,21);assert.equal(q.optional.length,8);assert.equal(q.next.track,'onenote');assert.equal(q.next.id,1);a.api.updateWeek42(s);assert.match(a.get('[data-week42-progress]').textContent,/0 von 21/);assert.equal(a.get('[data-week42-next-link]').href,'onenote.html#auftrag-1');
});
test('saved work is reused and visible Scan task 6 links to its real stored ID 7',()=>{
 const a=app(),s=required();s.scan.raw.done=[1,2,3,4,5,'5'];s.scan.raw.checks={'7_first':true};const before=JSON.stringify(s);const q=a.api.week42State(s);assert.equal(q.done,20);assert.equal(q.next.id,7);assert.equal(q.next.number,6);assert.equal(q.next.status,'working');a.api.updateWeek42(s);assert.equal(a.get('[data-week42-next-link]').href,'scannen.html#auftrag-7');assert.match(a.get('[data-week42-required]').innerHTML,/In Arbeit/);assert.equal(JSON.stringify(s),before);
});
test('completion recommends choice work and never grants project permission',()=>{
 const a=app(),s=required();a.api.updateWeek42(s);assert.equal(a.get('[data-week42-next-link]').href,'onenote.html#auftrag-11');assert.match(a.get('[data-week42-choice-status]').textContent,/keine Vorgabe/);
 for(const [track,c] of Object.entries(a.api.HOME_TRACKS))s[track].raw[track==='onenote'?'doneTasks':'done']=c.tasks.map(t=>t[0]);
 a.api.updateWeek42(s);assert.match(a.get('[data-week42-next-text]').textContent,/keine Projektfreigabe/);assert.match(a.get('[data-week42-next-link]').textContent,/nach Absprache/);
});
test('class assignment settings control required, choice, hidden and teacher-completed tasks',()=>{
 const a=app(),s=blank(),settings={onenote:{1:'hidden',11:'required'},digipen:{1:'optional'},scan:{7:'completed'}};
 a.window.MediaInfoAssignments={status:()=>settings};const q=a.api.week42State(s);
 assert.equal(q.required.some(t=>t.track==='onenote'&&t.id===1),false);assert.equal(q.required.some(t=>t.track==='onenote'&&t.id===11),true);assert.equal(q.optional.some(t=>t.track==='digipen'&&t.id===1),true);assert.equal(q.required.some(t=>t.track==='scan'&&t.id===7),false);assert.ok(a.events.has('mediainfo:assignments'));
});
test('week 42 explains the full workflow and supplies actual work links in all states',()=>{
 const a=app(),html=fs.readFileSync('dist/index.html','utf8');assert.match(html,/data-view="woche-42"/);assert.match(html,/12.–16. Oktober 2026/);assert.match(html,/letzte 5 Minuten/);assert.match(html,/erst nach Absprache mit Herrn Marti/);
 for(const state of [blank(),required()]){a.api.updateWeek42(state);for(const selector of ['[data-week42-required]','[data-week42-optional]'])for(const [,file,id] of a.get(selector).innerHTML.matchAll(/href="([^"#]+)#auftrag-(\d+)"/g)){assert.ok(fs.existsSync('dist/'+file));assert.ok(Number(id)>0);}}
});
