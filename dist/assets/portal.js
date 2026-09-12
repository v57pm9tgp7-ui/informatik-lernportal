(function(){'use strict';
  const UI_KEY='informatikPortal_ui_v1';
  const KEYS={onenote:'onenoteWorkshopGS1_student_v3',digipen:'digitalArbeiten_digipen_v1',scan:'digitalArbeiten_scannen_v1'};
  const views=['start','wochen','grundlagen','training','fortschritt'];
  const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
  function ui(){return {...{version:1,largeText:false,lastModule:'',lastRoute:'',updatedAt:null},...read(UI_KEY)}}
  function saveUi(patch){const next={...ui(),...patch,updatedAt:new Date().toISOString()};write(UI_KEY,next);return next}
  function stats(){
    const one=read(KEYS.onenote),pen=read(KEYS.digipen),scan=read(KEYS.scan);
    const count=(arr,min,max)=>[...new Set(Array.isArray(arr)?arr:[])].filter(n=>n>=min&&n<=max).length;
    return {
      onenote:{done:count(one.doneTasks,1,12),total:12,last:Number(one.lastTask)||1,raw:one},
      digipen:{done:count(pen.done,1,5),total:5,last:Number(pen.last)||1,raw:pen},
      scan:{done:count(scan.done,1,5),total:5,last:Number(scan.last)||1,raw:scan}
    };
  }
  function state(s){return s.done===0?'open':s.done>=s.total?'done':'working'}
  function stateText(s){return state(s)==='open'?'Offen':state(s)==='done'?'Erledigt':'In Arbeit'}
  function percent(s){return Math.round(s.done/s.total*100)}
  function moduleHref(id,s){if(id==='onenote')return `onenote.html#auftrag-${Math.min(s.last,12)}`;return `${id==='scan'?'scannen':'digipen'}.html#auftrag-${Math.min(s.last,7)}`}
  function updateModule(id,s){
    $$(`[data-module="${id}"]`).forEach(card=>{
      const label=$('[data-status]',card),bar=$('[data-progress-bar]',card),copy=$('[data-progress-copy]',card),link=$('[data-module-link]',card);
      if(label){label.className='status '+state(s);label.textContent=stateText(s)}
      if(bar)bar.style.width=percent(s)+'%';
      if(copy)copy.textContent=`${s.done} von ${s.total} erledigt`;
      if(link)link.href=moduleHref(id,s);
    });
  }
  function updateDashboard(){
    const s=stats();Object.entries(s).forEach(([id,value])=>updateModule(id,value));
    const total=s.onenote.total+s.digipen.total+s.scan.total,done=s.onenote.done+s.digipen.done+s.scan.done,p=Math.round(done/total*100);
    $$('[data-total-progress]').forEach(el=>el.textContent=`${done} von ${total}`);$$('[data-total-percent]').forEach(el=>el.textContent=p+'%');
    const ring=$('[data-progress-ring]');if(ring)ring.style.setProperty('--p',p*3.6+'deg');
    const preferred=ui().lastModule;let id=preferred&&s[preferred]&&s[preferred].done<s[preferred].total?preferred:'';
    if(!id)id=s.digipen.done<s.digipen.total?'digipen':s.scan.done<s.scan.total?'scan':s.onenote.done<s.onenote.total?'onenote':'digipen';
    const names={digipen:'DigiPen',scan:'Scannen mit OneDrive',onenote:'OneNote'};const next=s[id];
    const continueTitle=$('[data-continue-title]'),continueText=$('[data-continue-text]'),continueLink=$('[data-continue-link]');
    if(continueTitle)continueTitle.textContent=next.done>=next.total?'Vertiefung auswählen':`${names[id]} weiterbearbeiten`;
    if(continueText)continueText.textContent=next.done>=next.total?'Die Pflichtaufträge sind abgeschlossen. Wählen Sie eine freiwillige Vertiefung.':`Weiter mit Auftrag ${next.last}. Ihr bisheriger Arbeitsstand bleibt erhalten.`;
    if(continueLink){continueLink.href=moduleHref(id,next);continueLink.dataset.moduleOpen=id}
    const weekDone=s.digipen.done+s.scan.done,weekTotal=10;$$('[data-week-progress]').forEach(el=>el.textContent=`${weekDone} von ${weekTotal} Pflichtaufträgen`);$$('[data-week-percent]').forEach(el=>el.textContent=Math.round(weekDone/weekTotal*100)+'%');
    $$('[data-week37-progress]').forEach(el=>el.textContent=`${s.onenote.done} von ${s.onenote.total} Aufträgen`);$$('[data-week37-percent]').forEach(el=>el.textContent=percent(s.onenote)+'%');
  }
  function currentView(){const hash=location.hash.replace('#','');return views.includes(hash)?hash:'start'}
  function showView(){
    const view=currentView();$$('[data-view]').forEach(el=>{const active=el.dataset.view===view;el.hidden=!active;el.classList.toggle('is-active',active)});$$('[data-nav]').forEach(a=>a.setAttribute('aria-current',a.dataset.nav===view?'page':'false'));
    document.title=(view==='start'?'Digital arbeiten':({wochen:'Wochen',grundlagen:'Grundlagen',training:'Training',fortschritt:'Fortschritt'}[view]+' · Digital arbeiten'));
    const y=Number(sessionStorage.getItem('portalScroll:'+view)||0);requestAnimationFrame(()=>scrollTo(0,y));
    const menu=$('.mobile-nav');if(menu)menu.open=false;
  }
  function toast(message){const el=$('#portalToast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,2400)}
  function setLarge(on){document.documentElement.classList.toggle('portal-large',on);$$('[data-font-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(on));b.title=on?'Normale Schrift verwenden':'Schrift deutlich vergrössern';b.textContent=on?'A−':'A+'});saveUi({largeText:on});toast(on?'Grosse Schrift eingeschaltet':'Normale Schrift eingeschaltet')}
  function exportAll(){const payload={type:'informatik-lernportal-backup',version:1,createdAt:new Date().toISOString(),stores:{}};Object.values(KEYS).forEach(k=>payload.stores[k]=read(k));payload.stores[UI_KEY]=ui();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='Informatik-Lernportal-Fortschritt.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Sicherung erstellt')}
  function importAll(file){const reader=new FileReader();reader.onload=()=>{try{const p=JSON.parse(reader.result);if(p.type!=='informatik-lernportal-backup'||!p.stores)throw new Error();for(const key of [...Object.values(KEYS),UI_KEY])if(Object.prototype.hasOwnProperty.call(p.stores,key)&&typeof p.stores[key]==='object')write(key,p.stores[key]);updateDashboard();setLarge(Boolean(ui().largeText));toast('Sicherung geladen')}catch{toast('Diese Sicherung kann nicht gelesen werden.')}};reader.readAsText(file)}
  function importOneNote(file){
    const reader=new FileReader();reader.onload=()=>{try{
      const incoming=JSON.parse(reader.result);
      const recognisable=incoming&&typeof incoming==='object'&&!incoming.stores&&(incoming.workshop==='OneNote Workshop GS1'||Array.isArray(incoming.doneTasks))&&incoming.checks&&typeof incoming.checks==='object'&&incoming.notes&&typeof incoming.notes==='object';
      if(!recognisable)throw new Error();
      const current=read(KEYS.onenote);
      const cleanDone=list=>[...new Set((Array.isArray(list)?list:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b);
      const importedChecks=Object.fromEntries(Object.entries(incoming.checks).filter(([,v])=>typeof v==='boolean'));
      const currentChecks=current.checks&&typeof current.checks==='object'?current.checks:{};
      const importedNotes=Object.fromEntries(Object.entries(incoming.notes).filter(([,v])=>typeof v==='string'));
      const currentNotes=current.notes&&typeof current.notes==='object'?current.notes:{};
      const merged={version:3,doneTasks:cleanDone([...(incoming.doneTasks||[]),...(current.doneTasks||[])]),checks:{...importedChecks,...currentChecks},notes:{...importedNotes,...currentNotes},lastTask:Number(current.lastTask)||Number(incoming.lastTask)||1,updatedAt:new Date().toISOString()};
      if(!write(KEYS.onenote,merged))throw new Error();
      updateDashboard();toast(`OneNote-Stand übernommen: ${merged.doneTasks.length} von 12 Aufträgen erledigt.`);
    }catch{toast('Diese OneNote-Sicherung kann nicht gelesen werden.')}};reader.readAsText(file)
  }
  document.addEventListener('click',e=>{const open=e.target.closest('[data-module-open]');if(open){saveUi({lastModule:open.dataset.moduleOpen,lastRoute:open.getAttribute('href')})}});
  window.addEventListener('scroll',()=>{clearTimeout(window.__portalScrollTimer);window.__portalScrollTimer=setTimeout(()=>sessionStorage.setItem('portalScroll:'+currentView(),String(scrollY)),100)},{passive:true});
  window.addEventListener('hashchange',showView);
  document.addEventListener('DOMContentLoaded',()=>{
    updateDashboard();showView();setLarge(Boolean(ui().largeText));
    $$('[data-font-toggle]').forEach(b=>b.addEventListener('click',()=>setLarge(!document.documentElement.classList.contains('portal-large'))));
    $('#exportAll')?.addEventListener('click',exportAll);$('#importAllButton')?.addEventListener('click',()=>$('#importAll')?.click());$('#importAll')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importAll(f);e.target.value=''});
    $('#importOneNoteButton')?.addEventListener('click',()=>$('#importOneNote')?.click());$('#importOneNote')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importOneNote(f);e.target.value=''});
  });
})();
