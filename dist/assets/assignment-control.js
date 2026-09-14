(function(){'use strict';
  const ACCESS_KEY='mediainfolab_student_access_v1';
  const DEFAULTS={onenote:{1:'required',2:'required',3:'required',4:'required',5:'required',6:'required',7:'required',8:'required',9:'required',10:'required',11:'optional',12:'optional'},digipen:{1:'required',2:'required',3:'required',4:'required',5:'required',6:'optional',7:'optional',8:'optional',9:'optional'},scan:{1:'required',2:'required',3:'required',4:'required',5:'required',7:'required',6:'optional',8:'optional'}};
  let settings=JSON.parse(JSON.stringify(DEFAULTS)),className=null,loaded=false,lastEmail='';
  const page=location.pathname.split('/').pop()||'index.html';
  const track=page.includes('onenote')?'onenote':page.includes('digipen')&&!page.includes('guide')?'digipen':page.includes('scannen')?'scan':null;
  function readEmail(){try{return String(JSON.parse(localStorage.getItem(ACCESS_KEY)||'{}').email||'').trim().toLowerCase()}catch{return''}}
  function status(t,id){return settings?.[t]?.[Number(id)]||DEFAULTS?.[t]?.[Number(id)]||'hidden'}
  function isVisible(t,id){return status(t,id)!=='hidden'}
  function label(st){return {required:'Pflicht',optional:'Zusatz',hidden:'Verborgen',completed:'Abgeschlossen'}[st]||st}
  function allDone(track){try{const key=track==='onenote'?'onenoteWorkshopGS1_student_v3':track==='digipen'?'digitalArbeiten_digipen_v1':'digitalArbeiten_scannen_v1';const raw=JSON.parse(localStorage.getItem(key)||'{}');return new Set((track==='onenote'?raw.doneTasks:raw.done)||[])}catch{return new Set()}}
  async function load(){const email=readEmail();if(!email||email===lastEmail&&loaded)return;lastEmail=email;try{const r=await fetch('/api/assignments?email='+encodeURIComponent(email),{cache:'no-store'}),d=await r.json();if(r.ok&&d.settings){settings=d.settings;className=d.className||null;loaded=true;apply()}}catch{} }
  function applyIndex(){
    const doneBy={onenote:allDone('onenote'),digipen:allDone('digipen'),scan:allDone('scan')};
    for(const t of Object.keys(DEFAULTS)){
      document.querySelectorAll(`[data-home-task-list="${t}"] .home-task-row`).forEach(row=>{
        const m=(row.getAttribute('href')||'').match(/auftrag-(\d+)/);if(!m)return;const id=Number(m[1]),st=status(t,id);row.closest('li').hidden=st==='hidden';row.dataset.taskKind=st==='optional'?'optional':'required';row.classList.toggle('is-optional',st==='optional');row.classList.toggle('is-required',st==='required');row.classList.toggle('is-completed',st==='completed');const kind=row.querySelector('.home-task-kind');if(kind){kind.textContent=label(st);kind.className='home-task-kind '+(st==='optional'?'optional':st==='completed'?'completed':'required')}
      });
      const req=Object.entries(settings[t]||{}).filter(([,s])=>s==='required').map(([id])=>Number(id)),opt=Object.entries(settings[t]||{}).filter(([,s])=>s==='optional').map(([id])=>Number(id)),done=doneBy[t];const rd=req.filter(id=>done.has(id)).length,od=opt.filter(id=>done.has(id)).length;
      const summary=document.querySelector(`[data-home-summary="${t}"]`);if(summary)summary.textContent=`${rd} von ${req.length} Pflichtaufträgen erledigt · ${od} von ${opt.length} Zusatzaufträgen`;
      const bar=document.querySelector(`[data-home-bar="${t}"]`);if(bar)bar.style.width=(req.length?Math.round(rd/req.length*100):100)+'%';
      const transition=document.querySelector(`[data-transition="${t}"]`),state=transition?.querySelector('[data-transition-state]');if(state)state.textContent=req.length===rd?'Wechsel möglich':`${req.length-rd} offen`;
    }
    const reqTotal=['digipen','scan'].reduce((n,t)=>n+Object.values(settings[t]||{}).filter(s=>s==='required').length,0),doneTotal=['digipen','scan'].reduce((n,t)=>n+Object.entries(settings[t]||{}).filter(([,s])=>s==='required').filter(([id])=>doneBy[t].has(Number(id))).length,0);document.querySelectorAll('[data-week-progress]').forEach(el=>el.textContent=`${doneTotal} von ${reqTotal} Pflichtaufträgen`);document.querySelectorAll('[data-week-percent]').forEach(el=>el.textContent=(reqTotal?Math.round(doneTotal/reqTotal*100):100)+'%');
  }
  function applyWorkshop(){if(!track)return;const stFor=id=>status(track,Number(id));
    if(track==='onenote'){
      document.querySelectorAll('[data-task-card]').forEach(card=>{const id=Number(card.dataset.taskCard),st=stFor(id);card.hidden=st==='hidden';card.classList.toggle('assignment-completed',st==='completed');let tag=card.querySelector('.assignment-kind');if(!tag){tag=document.createElement('span');tag.className='assignment-kind';card.querySelector('.overview-task-top')?.appendChild(tag)}tag.textContent=label(st);tag.dataset.status=st});
      const m=location.hash.match(/auftrag-(\d+)/);if(m&&stFor(m[1])==='hidden'){location.hash='uebersicht';return}
      document.querySelectorAll('.task-screen[data-task]').forEach(section=>{const st=stFor(section.dataset.task);section.dataset.assignmentStatus=st;const badge=section.querySelector('.task-banner .assignment-kind');if(!badge){const b=document.createElement('span');b.className='assignment-kind assignment-kind-banner';section.querySelector('.task-banner')?.appendChild(b)}const b=section.querySelector('.task-banner .assignment-kind');if(b){b.textContent=label(st);b.dataset.status=st}});
    }else{
      document.querySelectorAll('[data-open]').forEach(card=>{const id=Number(card.dataset.open),st=stFor(id);card.hidden=st==='hidden';card.classList.toggle('assignment-completed',st==='completed');const k=card.querySelector('.kind');if(k){k.textContent=label(st);k.dataset.status=st}});
      const m=location.hash.match(/auftrag-(\d+)/);if(m&&stFor(m[1])==='hidden'){location.hash='uebersicht';return}
      if(m){const st=stFor(m[1]),lab=document.querySelector('#taskLabel');if(lab)lab.textContent=`${label(st)}auftrag ${m[1]}`.replace('Abgeschlossenauftrag','Abgeschlossener Auftrag').replace('Verborgenauftrag','Auftrag')}
    }
  }
  function apply(){if(page==='index.html'||page==='')applyIndex();applyWorkshop();document.documentElement.dataset.assignmentClass=className||''}
  const observer=new MutationObserver(()=>{if(loaded){clearTimeout(observer.timer);observer.timer=setTimeout(apply,30)}});
  document.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{childList:true,subtree:true});load();setTimeout(load,500);setInterval(()=>{const email=readEmail();if(email&&(!loaded||email!==lastEmail))load()},1000)});
  window.addEventListener('hashchange',()=>setTimeout(apply,0));
  window.addEventListener('storage',e=>{if(e.key===ACCESS_KEY){loaded=false;load()}});
  window.MediaInfoAssignments={status:()=>settings,className:()=>className,reload:()=>{loaded=false;return load()}};
})();
