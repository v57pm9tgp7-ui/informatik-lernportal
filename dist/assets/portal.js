(function(){'use strict';
  const UI_KEY='informatikPortal_ui_v1';
  const KEYS={onenote:'onenoteWorkshopGS1_student_v3',digipen:'digitalArbeiten_digipen_v1',scan:'digitalArbeiten_scannen_v1'};
  const HOME_TRACKS={
    onenote:{required:[1,2,3,4,5,6,7,8,9,10],optional:[11,12],summaryWord:'Grundaufträgen',tasks:[
      [1,'Workshop-Notizbuch öffnen'],[2,'Abschnitte und Seiten'],[3,'Text gestalten'],[4,'Text strukturieren'],[5,'Bilder einfügen'],[6,'PDF aus Teams'],[7,'Links und To-dos'],[8,'YouTube-Video'],[9,'Mit dem HP-Stift'],[10,'Gemeinsam arbeiten'],[11,'Zusatzaufgaben'],[12,'OneNote mal anders']
    ],nextHref:'digipen.html#auftrag-1',nextLabel:'DigiPen beginnen'},
    digipen:{required:[1,2,3,4,5],optional:[6,7,8,9],summaryWord:'Pflichtaufträgen',tasks:[
      [1,'Funktioniert der Stift?'],[2,'Stift, Marker, Radierer und Lasso'],[3,'Wichtiges im Text markieren'],[4,'Handschrift umwandeln'],[5,'Einen freien Samstag planen'],[6,'Eine Rechnung mit dem Stift'],[7,'Eine Party planen'],[8,'Meine Freizeit als Mindmap'],[9,'Welche Handschrift erkennt OneNote?']
    ],nextHref:'scannen.html#auftrag-1',nextLabel:'Scan-Workshop beginnen'},
    scan:{required:[1,2,3,4,5,7],optional:[6,8],summaryWord:'Pflichtaufträgen',tasks:[
      [1,'OneDrive fürs Scannen vorbereiten',1],[2,'Eine Seite als PDF scannen',2],[3,'Eine Packliste gut lesbar scannen',3],[4,'Mehrere Seiten in eine PDF bringen',4],[5,'Den Scan am Notebook wiederfinden',5],[7,'Infos übernehmen, ohne alles abzutippen',6],[6,'Einen Aushang sichern',7],[8,'Einen Mini-Comic als PDF machen',8]
    ],nextHref:'#woche-38',nextLabel:'Woche 38 anzeigen'}
  };
  const views=['start','wochen','woche-37','woche-38','scan-guide','training','fortschritt'];
  const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
  function ui(){return {...{version:1,largeText:false,lastModule:'',lastRoute:'',updatedAt:null},...read(UI_KEY)}}
  function saveUi(patch){const next={...ui(),...patch,updatedAt:new Date().toISOString()};write(UI_KEY,next);return next}
  function stats(){
    const one=read(KEYS.onenote),pen=read(KEYS.digipen),scan=read(KEYS.scan);
    const count=(arr,min,max)=>[...new Set(Array.isArray(arr)?arr:[])].filter(n=>n>=min&&n<=max).length;
    const countIds=(arr,ids)=>[...new Set(Array.isArray(arr)?arr:[])].filter(n=>ids.includes(Number(n))).length;
    const scanSequence=[1,2,3,4,5,7,6,8],scanLast=Number(scan.last);
    return {
      onenote:{done:count(one.doneTasks,1,12),total:12,last:Number(one.lastTask)||1,raw:one},
      digipen:{done:count(pen.done,1,5),total:5,last:Number(pen.last)||1,raw:pen},
      scan:{done:countIds(scan.done,[1,2,3,4,5,7]),total:6,last:scanSequence.includes(scanLast)?scanLast:1,raw:scan}
    };
  }
  function state(s){return s.done===0?'open':s.done>=s.total?'done':'working'}
  function stateText(s){return state(s)==='open'?'Offen':state(s)==='done'?'Erledigt':'In Arbeit'}
  function percent(s){return Math.round(s.done/s.total*100)}
  function visibleTaskNumber(id,last){return id==='scan'?(last===7?6:last===6?7:last):last}
  function moduleHref(id,s){if(id==='onenote')return `onenote.html#auftrag-${Math.min(s.last,12)}`;if(id==='scan')return `scannen.html#auftrag-${s.last}`;return `digipen.html#auftrag-${Math.min(s.last,9)}`}
  function storedIds(value){return new Set((Array.isArray(value)?value:[]).map(Number).filter(Number.isInteger))}
  function taskHref(track,id){const files={onenote:'onenote',digipen:'digipen',scan:'scannen'};return `${files[track]}.html#auftrag-${id}`}
  function homeTaskState(track,id,raw){
    const done=storedIds(track==='onenote'?raw.doneTasks:raw.done).has(id);if(done)return'done';
    const prefix=track==='onenote'?`t${id}-`:`${id}_`,checks=raw.checks&&typeof raw.checks==='object'?raw.checks:{};
    const started=Object.entries(checks).some(([key,value])=>value&&key.startsWith(prefix))||String(raw.notes?.[id]||'').trim().length>0;
    return started?'working':'open';
  }
  function updateHomeOverview(s){
    Object.entries(HOME_TRACKS).forEach(([track,config])=>{
      const raw=s[track].raw||{},optional=new Set(config.optional),doneIds=storedIds(track==='onenote'?raw.doneTasks:raw.done);
      const requiredDone=config.required.filter(id=>doneIds.has(id)).length,optionalDone=config.optional.filter(id=>doneIds.has(id)).length,ready=requiredDone===config.required.length;
      const summary=$(`[data-home-summary="${track}"]`);if(summary)summary.textContent=`${requiredDone} von ${config.required.length} ${config.summaryWord} erledigt · ${optionalDone} von ${config.optional.length} Zusatzaufträgen`;
      const bar=$(`[data-home-bar="${track}"]`);if(bar)bar.style.width=Math.round(requiredDone/config.required.length*100)+'%';
      const list=$(`[data-home-task-list="${track}"]`);if(list)list.innerHTML=config.tasks.map(([id,title,number=id])=>{
        const status=homeTaskState(track,id,raw),statusText=status==='done'?'Erledigt':status==='working'?'In Arbeit':'Offen',kind=optional.has(id)?'optional':'required',kindText=kind==='optional'?'Zusatz':'Pflicht';
        return `<li><a class="home-task-row is-${kind} is-${status}" href="${taskHref(track,id)}" data-module-open="${track}" data-task-kind="${kind}"><span class="home-task-number">${number}</span><span class="home-task-name"><span>${title}</span><small class="home-task-kind ${kind}">${kindText}</small></span><span class="home-task-state">${statusText}</span></a></li>`;
      }).join('');
      const transition=$(`[data-home-transition="${track}"]`),transitionState=$(`[data-transition-state="${track}"]`),transitionLink=$(`[data-transition-link="${track}"]`);
      transition?.classList.toggle('is-ready',ready);if(transitionState)transitionState.textContent=ready?'Wechsel möglich':`${config.required.length-requiredDone} offen`;
      if(transitionLink){
        const nextRequired=config.required.find(id=>!doneIds.has(id)),nextTask=config.tasks.find(task=>task[0]===(nextRequired||config.required[0]));
        transitionLink.href=ready?config.nextHref:taskHref(track,nextRequired||config.required[0]);
        transitionLink.textContent=ready?config.nextLabel:`Offenen Auftrag ${nextTask?.[2]||nextRequired||config.required[0]} öffnen`;
        transitionLink.dataset.moduleOpen=ready?(track==='onenote'?'digipen':track==='digipen'?'scan':track):track;
      }
    });
  }
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
    updateHomeOverview(s);
    const total=s.onenote.total+s.digipen.total+s.scan.total,done=s.onenote.done+s.digipen.done+s.scan.done,p=Math.round(done/total*100);
    $$('[data-total-progress]').forEach(el=>el.textContent=`${done} von ${total}`);$$('[data-total-percent]').forEach(el=>el.textContent=p+'%');
    const ring=$('[data-progress-ring]');if(ring)ring.style.setProperty('--p',p*3.6+'deg');
    const preferred=ui().lastModule;let id=preferred&&s[preferred]&&s[preferred].done<s[preferred].total?preferred:'';
    if(!id)id=s.digipen.done<s.digipen.total?'digipen':s.scan.done<s.scan.total?'scan':s.onenote.done<s.onenote.total?'onenote':'digipen';
    const names={digipen:'DigiPen',scan:'Scannen mit OneDrive',onenote:'OneNote'};const next=s[id];
    const continueTitle=$('[data-continue-title]'),continueText=$('[data-continue-text]'),continueLink=$('[data-continue-link]');
    if(continueTitle)continueTitle.textContent=next.done>=next.total?'Zusatzauftrag auswählen':`${names[id]} weiterbearbeiten`;
    if(continueText)continueText.textContent=next.done>=next.total?'Die Pflichtaufträge sind abgeschlossen. Wählen Sie freiwillig einen Zusatzauftrag.':`Weiter mit Auftrag ${visibleTaskNumber(id,next.last)}. Ihr bisheriger Arbeitsstand bleibt erhalten.`;
    if(continueLink){continueLink.href=moduleHref(id,next);continueLink.dataset.moduleOpen=id}
    const weekDone=s.digipen.done+s.scan.done,weekTotal=11;$$('[data-week-progress]').forEach(el=>el.textContent=`${weekDone} von ${weekTotal} Pflichtaufträgen`);$$('[data-week-percent]').forEach(el=>el.textContent=Math.round(weekDone/weekTotal*100)+'%');
    $$('[data-week37-progress]').forEach(el=>el.textContent=`${s.onenote.done} von ${s.onenote.total} Aufträgen`);$$('[data-week37-percent]').forEach(el=>el.textContent=percent(s.onenote)+'%');
  }
  function currentView(){const hash=location.hash.replace('#','');return views.includes(hash)?hash:'start'}
  function showView(){
    const view=currentView();$$('[data-view]').forEach(el=>{const active=el.dataset.view===view;el.hidden=!active;el.classList.toggle('is-active',active)});
    const navView=view.startsWith('woche-')?'wochen':view;$$('[data-nav]').forEach(a=>a.setAttribute('aria-current',a.dataset.nav===navView?'page':'false'));
    document.title=(view==='start'?'Informatik · Herr Marti':({wochen:'Wochen','woche-37':'Woche 37','woche-38':'Woche 38','scan-guide':'Scan-Guide',training:'Training',fortschritt:'Fortschritt'}[view]+' · Informatik'));
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
  function setupGuide(){
    $$('[data-guide-jump]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.guideJump)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})));
    $$('[data-load-video]').forEach(button=>button.addEventListener('click',()=>{const card=button.closest('[data-video-card]'),id=button.dataset.loadVideo;if(!card||!id)return;card.innerHTML=`<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" title="OneDrive – Scanfunktion: deutschsprachige Videohilfe" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;toast('Video geladen')}));
    const box=$('#guideLightbox'),image=box?.querySelector('img'),title=$('#guideLightboxTitle'),closeButton=box?.querySelector('[data-guide-lightbox-close]');let returnFocus=null;
    function close(){if(!box||box.hidden)return;box.hidden=true;document.body.classList.remove('guide-modal-open');image?.removeAttribute('src');returnFocus?.focus();returnFocus=null}
    function open(button){const source=button.dataset.guideImage,alt=$('img',button)?.alt||'Vergrösserte Abbildung';if(!box||!image||!source)return;returnFocus=button;image.src=source;image.alt=alt;if(title)title.textContent=alt;box.hidden=false;document.body.classList.add('guide-modal-open');closeButton?.focus()}
    $$('[data-guide-image]').forEach(button=>button.addEventListener('click',()=>open(button)));closeButton?.addEventListener('click',close);box?.addEventListener('click',event=>{if(event.target===box||event.target.classList.contains('guide-lightbox-stage'))close()});document.addEventListener('keydown',event=>{if(box?.hidden)return;if(event.key==='Escape')close();if(event.key==='Tab'){event.preventDefault();closeButton?.focus()}});window.addEventListener('hashchange',close);
  }
  function addDigiPenGuideLinks(){
    const desktopScan=$('.desktop-nav [data-nav="scan-guide"]');
    if(desktopScan&&!$('.desktop-nav [data-pen-guide-link]')){const a=document.createElement('a');a.className='nav-link';a.href='digipen-guide.html';a.textContent='DigiPen-Guide';a.dataset.penGuideLink='';desktopScan.before(a)}
    const mobileScan=$('.mobile-menu [data-nav="scan-guide"]');
    if(mobileScan&&!$('.mobile-menu [data-pen-guide-link]')){const a=document.createElement('a');a.href='digipen-guide.html';a.textContent='DigiPen-Guide';a.dataset.penGuideLink='';mobileScan.before(a)}
    $$('.module-card.pen .card-progress').forEach(area=>{if(area.querySelector('[data-pen-guide-card]'))return;const a=document.createElement('a');a.className='card-secondary';a.href='digipen-guide.html';a.textContent='DigiPen-Guide öffnen';a.dataset.penGuideCard='';area.append(a)});
  }
  document.addEventListener('click',e=>{const open=e.target.closest('[data-module-open]');if(open){saveUi({lastModule:open.dataset.moduleOpen,lastRoute:open.getAttribute('href')})}});
  window.addEventListener('scroll',()=>{clearTimeout(window.__portalScrollTimer);window.__portalScrollTimer=setTimeout(()=>sessionStorage.setItem('portalScroll:'+currentView(),String(scrollY)),100)},{passive:true});
  window.addEventListener('hashchange',showView);
  window.addEventListener('pageshow',updateDashboard);
  window.addEventListener('storage',updateDashboard);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateDashboard()});
  document.addEventListener('DOMContentLoaded',()=>{
    addDigiPenGuideLinks();updateDashboard();showView();setLarge(Boolean(ui().largeText));
    $$('[data-font-toggle]').forEach(b=>b.addEventListener('click',()=>setLarge(!document.documentElement.classList.contains('portal-large'))));
    $('#exportAll')?.addEventListener('click',exportAll);$('#importAllButton')?.addEventListener('click',()=>$('#importAll')?.click());$('#importAll')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importAll(f);e.target.value=''});
    $('#importOneNoteButton')?.addEventListener('click',()=>$('#importOneNote')?.click());$('#importOneNote')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importOneNote(f);e.target.value=''});
    setupGuide();
  });
})();