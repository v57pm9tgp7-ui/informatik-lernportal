(function(){
  'use strict';

  const classes={GS1B:'GS1B',GS1D:'GS1D',UNASSIGNED:'Nicht zugeordnet',ALL:'Alle Lernenden'};
  const taskNames={
    onenote:{1:'Workshop-Notizbuch öffnen',2:'Abschnitte und Seiten',3:'Text gestalten',4:'Text strukturieren',5:'Bilder einfügen',6:'PDF aus Teams',7:'Links und To-dos',8:'YouTube-Video',9:'Mit dem HP-Stift',10:'Gemeinsam arbeiten',11:'Zusatzaufgaben',12:'OneNote mal anders'},
    digipen:{1:'Funktioniert der Stift?',2:'Stift, Marker, Radierer und Lasso',3:'Wichtiges im Text markieren',4:'Handschrift umwandeln',5:'Einen freien Samstag planen',6:'Eine Rechnung mit dem Stift',7:'Eine Party planen',8:'Meine Freizeit als Mindmap',9:'Welche Handschrift erkennt OneNote?'},
    scan:{1:'OneDrive fürs Scannen vorbereiten',2:'Eine Seite als PDF scannen',3:'Eine Packliste gut lesbar scannen',4:'Mehrere Seiten in eine PDF bringen',5:'Den Scan am Notebook wiederfinden',7:'Infos übernehmen, ohne alles abzutippen',6:'Einen Aushang sichern',8:'Einen Mini-Comic als PDF machen'}
  };
  const trackMeta={
    onenote:{label:'OneNote',ids:[1,2,3,4,5,6,7,8,9,10,11,12]},
    digipen:{label:'DigiPen',ids:[1,2,3,4,5,6,7,8,9]},
    scan:{label:'Scannen',ids:[1,2,3,4,5,7,6,8]}
  };

  let currentClass='GS1B';
  let students=[];
  let selected=null;
  let assignmentSettings=null;
  let todayFocus={active:false,title:'Heute wichtig',message:'',tasks:[],updatedAt:null};
  let statusFilter='ALL';

  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pct=(done,total)=>total?Math.round(Number(done||0)/Number(total||0)*100):0;

  function toast(text){
    const el=$('#toast');
    el.textContent=text;
    el.hidden=false;
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>{el.hidden=true},2600);
  }

  async function api(path,options={}){
    const response=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})},cache:'no-store'});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'Anfrage fehlgeschlagen');
    return data;
  }

  function when(value){
    if(!value)return{main:'–',sub:''};
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return{main:'–',sub:''};
    const now=new Date();
    const yesterday=new Date(now);yesterday.setDate(now.getDate()-1);
    const main=now.toDateString()===date.toDateString()?'Heute':yesterday.toDateString()===date.toDateString()?'Gestern':date.toLocaleDateString('de-CH',{day:'2-digit',month:'2-digit'});
    return{main,sub:date.toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'})};
  }

  function ageDays(value){
    if(!value)return 999;
    const time=new Date(value).getTime();
    return Number.isFinite(time)?Math.max(0,(Date.now()-time)/86400000):999;
  }

  function statusInfo(student){
    const done=Number(student.total_done||0),possible=Number(student.total_possible||0);
    if(!student.first_seen||!student.last_seen)return{key:'notstarted',rank:1,label:'Noch nicht gestartet',reason:'Noch kein Arbeitsstand synchronisiert',tone:'gray'};
    const progress=pct(done,possible),inactive=ageDays(student.last_seen),known=ageDays(student.first_seen);
    if(possible===0)return{key:'course',rank:2,label:'Keine Pflichtaufträge',reason:'Aktuell sind keine Pflichtaufträge freigeschaltet',tone:'blue'};
    if(done>=possible)return{key:'done',rank:0,label:'Fertig',reason:`Alle ${possible} Pflichtaufträge erledigt`,tone:'green'};
    if(known<1)return{key:'new',rank:1,label:'Neu',reason:done?`${done} Pflichtaufträge bereits erledigt`:'Heute erstmals synchronisiert',tone:'blue'};
    if(inactive>7)return{key:'urgent',rank:5,label:'Dringend',reason:`Seit ${Math.floor(inactive)} Tagen nicht aktiv`,tone:'red'};
    if(known>3&&progress<20)return{key:'urgent',rank:5,label:'Dringend',reason:`Erst ${done} von ${possible} Pflichtaufträgen erledigt`,tone:'red'};
    if(inactive>3)return{key:'watch',rank:4,label:'Beobachten',reason:`Seit ${Math.floor(inactive)} Tagen nicht aktiv`,tone:'amber'};
    if(known>2&&progress<50)return{key:'watch',rank:3,label:'Beobachten',reason:`Fortschritt aktuell bei ${progress}%`,tone:'amber'};
    return{key:'course',rank:2,label:'Auf Kurs',reason:`${done} von ${possible} Pflichtaufträgen erledigt`,tone:'green'};
  }

  function doneSet(progressTrack){
    return new Set([...(progressTrack?.requiredDone||[]),...(progressTrack?.optionalDone||[])].map(Number));
  }

  function taskState(student,track,id){
    const progress=student.progress?.[track]||{};
    const done=doneSet(progress).has(Number(id));
    const started=new Set((progress.started||[]).map(Number)).has(Number(id));
    return done?'done':started?'started':'open';
  }

  function focusState(student){
    const tasks=todayFocus.tasks||[];
    if(!tasks.length)return'none';
    const states=tasks.map(task=>taskState(student,task.track,task.taskId));
    if(states.every(state=>state==='done'))return'done';
    if(states.some(state=>state==='done'||state==='started'))return'working';
    return'open';
  }

  function meter(done,total){
    const progress=pct(done,total),className=total>0&&Number(done)>=Number(total)?'done':Number(done)===0?'none':'';
    return `<div class="meter ${className}"><div class="meter-line"><span style="width:${progress}%"></span></div><small>${Number(done||0)} / ${Number(total||0)}</small></div>`;
  }

  function statusBadge(student){
    const status=statusInfo(student);
    return `<span class="status-badge ${status.tone}">${status.label}</span><small class="status-reason">${esc(status.reason)}</small>`;
  }

  function row(student){
    const activity=when(student.last_seen),total=Number(student.total_done||0),possible=Number(student.total_possible||0),progress=pct(total,possible),status=statusInfo(student),focus=focusState(student);
    const focusPill=todayFocus.tasks?.length?`<span class="focus-pill ${focus}">${focus==='done'?'Heute fertig':focus==='working'?'Heute in Arbeit':focus==='open'?'Heute offen':'Kein Fokus'}</span>`:'';
    return `<tr class="student-row status-${status.tone}" data-email="${esc(student.email)}" tabindex="0">
      <td><div class="person"><strong>${esc(student.name||student.email)}</strong><small>${esc(student.email)}</small>${focusPill}</div></td>
      <td><div class="priority-cell">${statusBadge(student)}</div></td>
      <td>${meter(student.onenote_done,student.onenote_possible)}</td>
      <td>${meter(student.digipen_done,student.digipen_possible)}</td>
      <td>${meter(student.scan_done,student.scan_possible)}</td>
      <td><span class="overall ${progress===100&&possible?'done':progress<30?'low':''}">${progress}%</span><small> ${total}/${possible}</small></td>
      <td><div class="activity"><strong>${activity.main}</strong><small>${activity.sub}</small></div></td>
      <td>${student.roster_locked?`<span class="class-badge">${esc(student.class_name)}</span>`:`<select class="class-select" data-assign="${esc(student.email)}"><option value="" ${!student.class_name?'selected':''}>Nicht zugeordnet</option><option value="GS1B" ${student.class_name==='GS1B'?'selected':''}>GS1B</option><option value="GS1D" ${student.class_name==='GS1D'?'selected':''}>GS1D</option></select>`}</td>
    </tr>`;
  }

  function matchesStatusFilter(student){
    if(statusFilter==='ALL')return true;
    if(statusFilter==='today-open')return todayFocus.tasks?.length>0&&focusState(student)!=='done';
    const key=statusInfo(student).key;
    if(statusFilter==='course')return key==='course'||key==='new';
    return key===statusFilter;
  }

  function filtered(){
    const query=$('#searchInput').value.trim().toLowerCase();
    let list=students.filter(student=>(!query||String(student.name||'').toLowerCase().includes(query)||student.email.toLowerCase().includes(query))&&matchesStatusFilter(student));
    const sort=$('#sortSelect').value;
    const byName=(a,b)=>String(a.name).localeCompare(String(b.name),'de');
    if(sort==='progress-asc')list.sort((a,b)=>pct(a.total_done,a.total_possible)-pct(b.total_done,b.total_possible)||byName(a,b));
    else if(sort==='progress-desc')list.sort((a,b)=>pct(b.total_done,b.total_possible)-pct(a.total_done,a.total_possible)||byName(a,b));
    else if(sort==='activity')list.sort((a,b)=>(new Date(b.last_seen||0))-(new Date(a.last_seen||0))||byName(a,b));
    else if(sort==='name')list.sort(byName);
    else list.sort((a,b)=>statusInfo(b).rank-statusInfo(a).rank||pct(a.total_done,a.total_possible)-pct(b.total_done,b.total_possible)||byName(a,b));
    return list;
  }

  function renderSummary(){
    $('#studentCount').textContent=students.length;
    $('#studentCountSub').textContent=currentClass==='ALL'?'insgesamt':currentClass==='UNASSIGNED'?'ohne Klassenzuordnung':'in der gewählten Klasse';
    $('#activeToday').textContent=students.filter(student=>student.last_seen&&new Date(student.last_seen).toDateString()===new Date().toDateString()).length;
    const average=students.length?Math.round(students.reduce((sum,student)=>sum+pct(student.total_done,student.total_possible),0)/students.length):0;
    $('#averageProgress').textContent=average+'%';
    $('#supportCount').textContent=students.filter(student=>['urgent','watch'].includes(statusInfo(student).key)).length;
  }

  function renderRadar(){
    const counts={done:0,course:0,new:0,notstarted:0,watch:0,urgent:0};
    students.forEach(student=>{counts[statusInfo(student).key]++});
    $('#radarDone').textContent=counts.done;
    $('#radarCourse').textContent=counts.course+counts.new;
    $('#radarNotStarted').textContent=counts.notstarted;
    $('#radarWatch').textContent=counts.watch;
    $('#radarUrgent').textContent=counts.urgent;
    const attention=students.filter(student=>['urgent','watch'].includes(statusInfo(student).key)).sort((a,b)=>statusInfo(b).rank-statusInfo(a).rank||pct(a.total_done,a.total_possible)-pct(b.total_done,b.total_possible)).slice(0,6);
    const box=$('#attentionList');
    if(!attention.length){
      box.innerHTML='<div class="all-clear"><strong>Aktuell kein besonderer Unterstützungsbedarf</strong><span>Die vorhandenen Lernstände wirken unauffällig.</span></div>';
      return;
    }
    box.innerHTML=attention.map(student=>{const status=statusInfo(student);return `<button class="attention-item ${status.tone}" type="button" data-open-email="${esc(student.email)}"><span><strong>${esc(student.name||student.email)}</strong><small>${esc(status.reason)}</small></span><span class="attention-progress">${student.total_done}/${student.total_possible}</span></button>`}).join('');
    $$('[data-open-email]',box).forEach(button=>button.addEventListener('click',()=>openDetail(button.dataset.openEmail)));
  }

  function renderTable(){
    const list=filtered();
    $('#studentRows').innerHTML=list.map(row).join('');
    $('#emptyState').hidden=list.length>0;
    $$('.class-select').forEach(select=>select.addEventListener('change',async event=>{
      event.stopPropagation();
      try{
        await api('/lehrperson/api/assign',{method:'POST',body:JSON.stringify({email:select.dataset.assign,className:select.value||null})});
        toast('Klasse gespeichert');
        await load();
      }catch(error){toast(error.message)}
    }));
    $$('.student-row').forEach(tr=>{
      tr.addEventListener('click',event=>{if(!event.target.closest('select'))openDetail(tr.dataset.email)});
      tr.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('select')){event.preventDefault();openDetail(tr.dataset.email)}});
    });
  }

  function renderClassCounts(counts={}){
    $$('[data-class-count]').forEach(el=>{
      const key=el.dataset.classCount;
      const count=counts[key];
      el.textContent=Number.isFinite(count)?`(${count})`:'';
    });
  }

  function assignmentStatus(track,id){
    return assignmentSettings?.[track]?.[id]||'required';
  }

  function renderAssignments(){
    const validClass=currentClass==='GS1B'||currentClass==='GS1D';
    $('#assignmentClassNotice').hidden=validClass;
    $('#assignmentModules').hidden=!validClass;
    $('#resetAssignments').disabled=!validClass;
    if(!validClass){$('#assignmentModules').innerHTML='';return}
    const labels={required:'Pflicht',optional:'Zusatz',hidden:'Verborgen',completed:'Abgeschlossen'};
    $('#assignmentModules').innerHTML=Object.entries(trackMeta).map(([track,meta])=>{
      const rows=meta.ids.map(id=>{
        const status=assignmentStatus(track,id);
        return `<div class="assignment-row"><div class="assignment-title"><span class="assignment-number">${id}</span><div><strong>${esc(taskNames[track][id]||`Auftrag ${id}`)}</strong><small>${labels[status]}</small></div></div><select class="assignment-select status-${status}" data-track="${track}" data-task-id="${id}" aria-label="Status ${meta.label} Auftrag ${id}"><option value="required" ${status==='required'?'selected':''}>Pflicht</option><option value="optional" ${status==='optional'?'selected':''}>Zusatz</option><option value="hidden" ${status==='hidden'?'selected':''}>Verborgen</option><option value="completed" ${status==='completed'?'selected':''}>Abgeschlossen</option></select></div>`;
      }).join('');
      return `<section class="assignment-module"><header class="assignment-module-head"><h3>${meta.label}</h3><p>${meta.ids.length} Aufträge</p></header><div class="assignment-list">${rows}</div></section>`;
    }).join('');
    $$('.assignment-select').forEach(select=>select.addEventListener('change',async()=>{
      const old=assignmentStatus(select.dataset.track,Number(select.dataset.taskId));
      select.disabled=true;
      try{
        await api('/lehrperson/api/assignments',{method:'POST',body:JSON.stringify({className:currentClass,track:select.dataset.track,taskId:Number(select.dataset.taskId),status:select.value})});
        assignmentSettings[select.dataset.track][Number(select.dataset.taskId)]=select.value;
        toast('Auftrag gespeichert');
        renderAssignments();
        await loadToday();
        renderTodayEditor();
        renderMatrix();
      }catch(error){select.value=old;toast(error.message)}finally{select.disabled=false}
    }));
  }

  function availableTodayTasks(){
    if(!assignmentSettings)return[];
    const tasks=[];
    for(const [track,meta] of Object.entries(trackMeta)){
      for(const id of meta.ids){
        const status=assignmentStatus(track,id);
        if(status==='hidden')continue;
        tasks.push({track,taskId:id,status,label:taskNames[track][id]||`Auftrag ${id}`,module:meta.label});
      }
    }
    return tasks;
  }

  function renderTodayEditor(){
    const validClass=currentClass==='GS1B'||currentClass==='GS1D';
    $('#todayClassNotice').hidden=validClass;
    $('#todayEditor').hidden=!validClass;
    $('#todayClassStatus').hidden=!validClass;
    const todayFilter=$('[data-status-filter="today-open"]');if(todayFilter)todayFilter.hidden=!validClass;
    if(!validClass){
      $('#todayHeading').textContent='Was ist heute wichtig?';
      $('#todaySaveState').textContent='Klasse auswählen';
      renderMatrix();
      return;
    }
    $('#todayHeading').textContent=`Unterricht heute · ${currentClass}`;
    $('#todayActive').checked=Boolean(todayFocus.active);
    $('#todayTitle').value=todayFocus.title||'Heute wichtig';
    $('#todayMessage').value=todayFocus.message||'';
    $('#todayMessageCount').textContent=$('#todayMessage').value.length;
    const selectedKeys=new Set((todayFocus.tasks||[]).map(task=>`${task.track}:${task.taskId}`));
    const byTrack={onenote:[],digipen:[],scan:[]};
    availableTodayTasks().forEach(task=>byTrack[task.track].push(task));
    $('#todayTasks').innerHTML=Object.entries(byTrack).map(([track,tasks])=>`<fieldset class="today-task-group"><legend>${trackMeta[track].label}</legend>${tasks.map(task=>{
      const key=`${task.track}:${task.taskId}`,checked=selectedKeys.has(key);
      return `<label class="today-task-choice ${checked?'is-selected':''}"><input type="checkbox" data-today-task data-track="${task.track}" data-task-id="${task.taskId}" ${checked?'checked':''}><span class="today-task-number">${task.taskId}</span><span><strong>${esc(task.label)}</strong><small>${task.status==='required'?'Pflicht':task.status==='optional'?'Zusatz':'Abgeschlossen'}</small></span></label>`;
    }).join('')}</fieldset>`).join('');
    $$('[data-today-task]').forEach(input=>input.addEventListener('change',()=>{
      const checked=$$('[data-today-task]:checked');
      if(checked.length>8){input.checked=false;toast('Maximal 8 Fokus-Aufträge auswählen');return}
      input.closest('.today-task-choice').classList.toggle('is-selected',input.checked);
      $('#todaySaveState').textContent='Änderungen noch nicht gespeichert';
      $('#todaySaveState').classList.add('dirty');
      updateTodayStatsFromForm();
    }));
    updateTodayStats();
    $('#todaySaveState').textContent=todayFocus.updatedAt?`Gespeichert · ${when(todayFocus.updatedAt).main} ${when(todayFocus.updatedAt).sub}`:'Noch nicht gespeichert';
    $('#todaySaveState').classList.remove('dirty');
  }

  function focusFromForm(){
    return{
      active:$('#todayActive').checked,
      title:$('#todayTitle').value.trim()||'Heute wichtig',
      message:$('#todayMessage').value.trim(),
      tasks:$$('[data-today-task]:checked').map(input=>({track:input.dataset.track,taskId:Number(input.dataset.taskId)}))
    };
  }

  function updateTodayStatsFromForm(){
    const draft=focusFromForm(),old=todayFocus;
    todayFocus={...todayFocus,...draft};
    updateTodayStats();
    renderMatrix();
    todayFocus=old;
  }

  function updateTodayStats(){
    const tasks=todayFocus.tasks||[];
    let done=0,working=0,open=0;
    if(tasks.length){
      students.forEach(student=>{
        const state=focusState(student);
        if(state==='done')done++;else if(state==='working')working++;else open++;
      });
    }
    $('#todayDoneCount').textContent=done;
    $('#todayWorkingCount').textContent=working;
    $('#todayOpenCount').textContent=tasks.length?open:0;
    $('#todayTaskCount').textContent=tasks.length;
  }

  async function saveToday(focus,success='Heutiger Fokus gespeichert'){
    if(!(currentClass==='GS1B'||currentClass==='GS1D'))return;
    const data=await api('/lehrperson/api/today',{method:'POST',body:JSON.stringify({className:currentClass,...focus})});
    todayFocus=data.focus;
    toast(success);
    renderTodayEditor();
    renderTable();
    renderMatrix();
  }

  async function loadToday(){
    if(!(currentClass==='GS1B'||currentClass==='GS1D')){
      todayFocus={active:false,title:'Heute wichtig',message:'',tasks:[],updatedAt:null};
      return;
    }
    const data=await api(`/lehrperson/api/today?class=${encodeURIComponent(currentClass)}`);
    todayFocus=data.focus||{active:false,title:'Heute wichtig',message:'',tasks:[],updatedAt:null};
  }

  function renderMatrix(){
    const validClass=currentClass==='GS1B'||currentClass==='GS1D';
    const tasks=todayFocus.tasks||[];
    const empty=$('#matrixEmpty'),wrap=$('#matrixWrap');
    if(!validClass||!tasks.length){empty.hidden=false;wrap.hidden=true;return}
    empty.hidden=true;wrap.hidden=false;
    $('#matrixHead').innerHTML=`<tr><th>Lernende/r</th>${tasks.map(task=>`<th title="${esc(taskNames[task.track]?.[task.taskId]||'')}"><span>${esc(trackMeta[task.track].label)}</span><strong>${task.taskId}</strong></th>`).join('')}<th>Heute</th></tr>`;
    $('#matrixBody').innerHTML=students.map(student=>{
      const cells=tasks.map(task=>{
        const state=taskState(student,task.track,task.taskId);
        const symbol=state==='done'?'✓':state==='started'?'•':'–';
        const label=state==='done'?'Erledigt':state==='started'?'Begonnen':'Offen';
        return `<td class="matrix-cell ${state}" title="${label}: ${esc(taskNames[task.track]?.[task.taskId]||'')}"><span>${symbol}</span></td>`;
      }).join('');
      const state=focusState(student),label=state==='done'?'Fertig':state==='working'?'In Arbeit':'Offen';
      return `<tr data-matrix-email="${esc(student.email)}"><td><button type="button" class="matrix-person" data-open-matrix="${esc(student.email)}">${esc(student.name||student.email)}</button></td>${cells}<td><span class="focus-pill ${state}">${label}</span></td></tr>`;
    }).join('');
    $$('[data-open-matrix]').forEach(button=>button.addEventListener('click',()=>openDetail(button.dataset.openMatrix)));
  }

  function taskList(track,progress){
    const done=doneSet(progress),started=new Set((progress?.started||[]).map(Number));
    return trackMeta[track].ids.map(id=>{
      const assignment=assignmentStatus(track,id),isDone=done.has(id),begun=started.has(id),state=isDone?'Erledigt':begun?'Begonnen':'Offen',className=isDone?'done':begun?'started':'',label={required:'Pflichtauftrag',optional:'Zusatzauftrag',hidden:'Verborgen',completed:'Abgeschlossen'}[assignment]||assignment;
      const focus=(todayFocus.tasks||[]).some(task=>task.track===track&&Number(task.taskId)===Number(id));
      return `<div class="task-status ${className} ${assignment} ${focus?'is-focus':''}"><span class="num">${id}</span><span><strong>${esc(taskNames[track][id]||`Auftrag ${id}`)}</strong><br><small>${label}${focus?' · Heute im Fokus':''}</small></span><span class="state">${state}</span></div>`;
    }).join('');
  }

  async function openDetail(email){
    const student=students.find(item=>item.email===email);
    if(!student)return;
    selected=student;
    let restoreContext=null;
    if((student.class_name==='GS1B'||student.class_name==='GS1D')&&student.class_name!==currentClass){
      try{
        const [assignmentData,todayData]=await Promise.all([
          api(`/lehrperson/api/assignments?class=${encodeURIComponent(student.class_name)}`),
          api(`/lehrperson/api/today?class=${encodeURIComponent(student.class_name)}`)
        ]);
        restoreContext={assignmentSettings,todayFocus};
        assignmentSettings=assignmentData.settings||assignmentSettings;
        todayFocus=todayData.focus||todayFocus;
      }catch{}
    }
    $('#detailName').textContent=student.name||student.email;
    $('#detailEmail').textContent=`${student.email} · ${student.class_name||'Nicht zugeordnet'}`;
    const status=statusInfo(student),activity=when(student.last_seen),focus=focusState(student);
    const focusTasks=(todayFocus.tasks||[]).map(task=>{
      const state=taskState(student,task.track,task.taskId);
      return `<span class="detail-focus-task ${state}">${state==='done'?'✓':state==='started'?'•':'–'} ${esc(trackMeta[task.track].label)} ${task.taskId}</span>`;
    }).join('');
    $('#detailContent').innerHTML=`
      <section class="detail-status ${status.tone}"><div><span class="status-badge ${status.tone}">${status.label}</span><strong>${esc(status.reason)}</strong></div><div><span>Letzte Aktivität</span><strong>${activity.main} ${activity.sub}</strong></div></section>
      ${todayFocus.tasks?.length?`<section class="detail-focus"><div><p class="eyebrow">Unterricht heute</p><h3>${focus==='done'?'Heutiger Fokus erledigt':focus==='working'?'Am heutigen Fokus dran':'Heutiger Fokus noch offen'}</h3></div><div class="detail-focus-tasks">${focusTasks}</div></section>`:''}
      <div class="detail-summary">
        <article class="detail-module"><h3>OneNote</h3><strong>${student.onenote_done}/${student.onenote_possible}</strong><small>Pflichtaufträge</small></article>
        <article class="detail-module"><h3>DigiPen</h3><strong>${student.digipen_done}/${student.digipen_possible}</strong><small>Pflichtaufträge</small></article>
        <article class="detail-module"><h3>Scannen</h3><strong>${student.scan_done}/${student.scan_possible}</strong><small>Pflichtaufträge</small></article>
      </div>
      <section class="detail-task-section"><h3>OneNote</h3><div class="task-status-list">${taskList('onenote',student.progress?.onenote)}</div></section>
      <section class="detail-task-section"><h3>DigiPen</h3><div class="task-status-list">${taskList('digipen',student.progress?.digipen)}</div></section>
      <section class="detail-task-section"><h3>Scannen</h3><div class="task-status-list">${taskList('scan',student.progress?.scan)}</div></section>`;
    $('#removeStudentButton').hidden=Boolean(student.roster_locked);
    $('#detailDialog').showModal();
    if(restoreContext){assignmentSettings=restoreContext.assignmentSettings;todayFocus=restoreContext.todayFocus}
  }

  function render(){
    $('#classTitle').textContent=classes[currentClass];
    renderSummary();
    renderRadar();
    renderTable();
    renderTodayEditor();
    renderAssignments();
    renderMatrix();
  }

  async function load(){
    $('#setupNotice').hidden=true;
    try{
      const data=await api(`/lehrperson/api/students?class=${encodeURIComponent(currentClass)}`);
      students=data.students||[];
      renderClassCounts(data.counts||{});
      if(currentClass==='GS1B'||currentClass==='GS1D'){
        const [assignments]=await Promise.all([
          api(`/lehrperson/api/assignments?class=${encodeURIComponent(currentClass)}`),
          loadToday()
        ]);
        assignmentSettings=assignments.settings||null;
      }else{
        assignmentSettings=null;
        await loadToday();
      }
      $('#lastRefresh').textContent=`Aktualisiert ${new Date().toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'})}`;
      render();
    }catch(error){
      $('#setupNotice').hidden=false;
      toast(error.message);
    }
  }

  function csvEscape(value){
    const text=String(value??'');
    return /[;"\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
  }

  function exportCsv(){
    const rows=[['Name','Schulmail','Klasse','Status','Begründung','OneNote','DigiPen','Scannen','Gesamt','Heute','Letzte Aktivität']];
    for(const student of students){
      const status=statusInfo(student),focus=focusState(student),activity=student.last_seen?new Date(student.last_seen).toLocaleString('de-CH'):'';
      rows.push([student.name,student.email,student.class_name||'',status.label,status.reason,`${student.onenote_done}/${student.onenote_possible}`,`${student.digipen_done}/${student.digipen_possible}`,`${student.scan_done}/${student.scan_possible}`,`${student.total_done}/${student.total_possible}`,focus==='done'?'Fertig':focus==='working'?'In Arbeit':focus==='open'?'Offen':'',activity]);
    }
    const csv='\uFEFF'+rows.map(row=>row.map(csvEscape).join(';')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`MedienInfoLab_${currentClass}_${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    toast('CSV exportiert');
  }

  function bindEvents(){
    $$('.class-tab').forEach(button=>button.addEventListener('click',async()=>{
      currentClass=button.dataset.class;
      statusFilter='ALL';
      $$('.class-tab').forEach(item=>item.classList.toggle('is-active',item===button));
      $$('.status-filter').forEach(item=>item.classList.toggle('is-active',item.dataset.statusFilter==='ALL'));
      await load();
    }));
    $('#refreshButton').addEventListener('click',load);
    $('#exportButton').addEventListener('click',exportCsv);
    $('#printButton').addEventListener('click',()=>window.print());
    $('#searchInput').addEventListener('input',renderTable);
    $('#sortSelect').addEventListener('change',renderTable);
    $$('.status-filter').forEach(button=>button.addEventListener('click',()=>{
      statusFilter=button.dataset.statusFilter;
      $$('.status-filter').forEach(item=>item.classList.toggle('is-active',item===button));
      renderTable();
    }));
    $('#todayMessage').addEventListener('input',()=>{$('#todayMessageCount').textContent=$('#todayMessage').value.length;$('#todaySaveState').textContent='Änderungen noch nicht gespeichert';$('#todaySaveState').classList.add('dirty')});
    $('#todayTitle').addEventListener('input',()=>{$('#todaySaveState').textContent='Änderungen noch nicht gespeichert';$('#todaySaveState').classList.add('dirty')});
    $('#todayActive').addEventListener('change',()=>{$('#todaySaveState').textContent='Änderungen noch nicht gespeichert';$('#todaySaveState').classList.add('dirty')});
    $('#saveTodayButton').addEventListener('click',()=>saveToday(focusFromForm()).catch(error=>toast(error.message)));
    $('#clearTodayButton').addEventListener('click',()=>saveToday({...focusFromForm(),active:false},'«Heute wichtig» ausgeblendet').catch(error=>toast(error.message)));
    $('#copyTodayButton').addEventListener('click',async()=>{
      if(!(currentClass==='GS1B'||currentClass==='GS1D'))return;
      const target=currentClass==='GS1B'?'GS1D':'GS1B';
      if(!confirm(`Heutigen Fokus von ${currentClass} auf ${target} kopieren?`))return;
      try{
        const focus=focusFromForm();
        await api('/lehrperson/api/today',{method:'POST',body:JSON.stringify({className:target,...focus})});
        toast(`Auf ${target} kopiert`);
      }catch(error){toast(error.message)}
    });
    $('#resetAssignments').addEventListener('click',async()=>{
      if(!(currentClass==='GS1B'||currentClass==='GS1D'))return;
      if(!confirm(`Auftragssteuerung für ${currentClass} auf den Standard zurücksetzen?`))return;
      try{
        const data=await api('/lehrperson/api/assignments/reset',{method:'POST',body:JSON.stringify({className:currentClass})});
        assignmentSettings=data.settings;
        toast('Standard wiederhergestellt');
        renderAssignments();renderTodayEditor();
      }catch(error){toast(error.message)}
    });
    $('#removeStudentButton').addEventListener('click',async()=>{
      if(!selected||selected.roster_locked)return;
      if(!confirm(`${selected.email} wirklich aus der Übersicht entfernen?`))return;
      try{
        await api('/lehrperson/api/remove',{method:'POST',body:JSON.stringify({email:selected.email})});
        $('#detailDialog').close();toast('Fehleintrag entfernt');await load();
      }catch(error){toast(error.message)}
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{bindEvents();load()});
})();
