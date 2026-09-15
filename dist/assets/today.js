(function(){
  'use strict';
  const ACCESS_KEY='mediainfolab_student_access_v1';
  const STUDENT_RE=/^[^\s@]+@stud\.bffbern\.ch$/i;
  const KEYS={onenote:'onenoteWorkshopGS1_student_v3',digipen:'digitalArbeiten_digipen_v1',scan:'digitalArbeiten_scannen_v1'};
  const taskNames={
    onenote:{1:'Workshop-Notizbuch öffnen',2:'Abschnitte und Seiten',3:'Text gestalten',4:'Text strukturieren',5:'Bilder einfügen',6:'PDF aus Teams',7:'Links und To-dos',8:'YouTube-Video',9:'Mit dem HP-Stift',10:'Gemeinsam arbeiten',11:'Zusatzaufgaben',12:'OneNote mal anders'},
    digipen:{1:'Funktioniert der Stift?',2:'Stift, Marker, Radierer und Lasso',3:'Wichtiges im Text markieren',4:'Handschrift umwandeln',5:'Einen freien Samstag planen',6:'Eine Rechnung mit dem Stift',7:'Eine Party planen',8:'Meine Freizeit als Mindmap',9:'Welche Handschrift erkennt OneNote?'},
    scan:{1:'OneDrive fürs Scannen vorbereiten',2:'Eine Seite als PDF scannen',3:'Eine Packliste gut lesbar scannen',4:'Mehrere Seiten in eine PDF bringen',5:'Den Scan am Notebook wiederfinden',7:'Infos übernehmen, ohne alles abzutippen',6:'Einen Aushang sichern',8:'Einen Mini-Comic als PDF machen'}
  };
  const labels={onenote:'OneNote',digipen:'DigiPen',scan:'Scannen'};
  const links={onenote:id=>`onenote.html#auftrag-${id}`,digipen:id=>`digipen.html#auftrag-${id}`,scan:id=>`scannen.html#auftrag-${id}`};
  let focus=null,lastEmail='';

  function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}}
  function email(){const value=read(ACCESS_KEY);const result=String(value.email||'').trim().toLowerCase();return STUDENT_RE.test(result)?result:''}
  function ids(value){return new Set((Array.isArray(value)?value:[]).map(Number))}
  function startedFromRaw(track,id){
    const raw=read(KEYS[track]);
    const done=ids(track==='onenote'?raw.doneTasks:raw.done);
    if(done.has(Number(id)))return'done';
    const checks=raw&&typeof raw.checks==='object'&&raw.checks?raw.checks:{};
    const prefix=track==='onenote'?`t${id}-`:`${id}_`;
    const note=raw&&raw.notes&&typeof raw.notes==='object'?raw.notes[id]:'';
    const begun=Object.entries(checks).some(([key,value])=>Boolean(value)&&key.startsWith(prefix))||String(note||'').trim().length>0;
    return begun?'started':'open';
  }
  function render(){
    const panel=document.querySelector('#studentTodayPanel');if(!panel)return;
    if(!focus?.active||(!(focus.tasks||[]).length&&!focus.message)){panel.hidden=true;return}
    panel.hidden=false;
    document.querySelector('#studentTodayClass').textContent=focus.className||'';
    document.querySelector('#studentTodayTitle').textContent=focus.title||'Heute wichtig';
    const message=document.querySelector('#studentTodayMessage');message.textContent=focus.message||'';message.hidden=!focus.message;
    const list=document.querySelector('#studentTodayTasks');
    let doneCount=0;
    list.innerHTML=(focus.tasks||[]).map(task=>{
      const state=startedFromRaw(task.track,task.taskId);if(state==='done')doneCount++;
      const stateLabel=state==='done'?'Erledigt':state==='started'?'In Arbeit':'Offen';
      return `<a class="student-today-task ${state}" href="${links[task.track](task.taskId)}"><span class="student-today-number">${task.taskId}</span><span><small>${labels[task.track]}</small><strong>${taskNames[task.track]?.[task.taskId]||`Auftrag ${task.taskId}`}</strong></span><span class="student-today-state">${state==='done'?'✓ ':''}${stateLabel}</span></a>`;
    }).join('');
    const total=(focus.tasks||[]).length;
    document.querySelector('#studentTodayProgress').textContent=total?`${doneCount} von ${total} Fokus-Aufträgen erledigt`:'Hinweis von Herrn Marti';
    const bar=document.querySelector('#studentTodayBar');bar.style.width=(total?Math.round(doneCount/total*100):0)+'%';
  }
  async function load(){
    const studentEmail=email();if(!studentEmail){focus=null;render();return}
    lastEmail=studentEmail;
    try{
      const response=await fetch('/api/today?email='+encodeURIComponent(studentEmail),{cache:'no-store'}),data=await response.json();
      if(response.ok){focus={...(data.focus||{}),className:data.className||null};render()}
    }catch{}
  }
  function scheduleRender(){clearTimeout(scheduleRender.timer);scheduleRender.timer=setTimeout(render,120)}
  const originalSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){const result=originalSet.call(this,key,value);if(this===localStorage&&Object.values(KEYS).includes(String(key)))scheduleRender();return result};
  document.addEventListener('DOMContentLoaded',()=>{load();setTimeout(load,700);setInterval(()=>{if(document.visibilityState==='visible')load()},60000)});
  window.addEventListener('focus',()=>{const current=email();if(current!==lastEmail)load();else{render();load()}});
  window.addEventListener('storage',event=>{if(event.key===ACCESS_KEY)load();else if(Object.values(KEYS).includes(event.key))render()});
})();
