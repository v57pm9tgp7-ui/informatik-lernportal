(function(){'use strict';
  const classes={GS1B:'GS1B',GS1D:'GS1D',UNASSIGNED:'Nicht zugeordnet',ALL:'Alle Lernenden'};
  const taskNames={
    onenote:{1:'Workshop-Notizbuch öffnen',2:'Abschnitte und Seiten',3:'Text gestalten',4:'Text strukturieren',5:'Bilder einfügen',6:'PDF aus Teams',7:'Links und To-dos',8:'YouTube-Video',9:'Mit dem HP-Stift',10:'Gemeinsam arbeiten',11:'Zusatzaufgaben',12:'OneNote mal anders'},
    digipen:{1:'Funktioniert der Stift?',2:'Stift, Marker, Radierer und Lasso',3:'Wichtiges im Text markieren',4:'Handschrift umwandeln',5:'Einen freien Samstag planen',6:'Eine Rechnung mit dem Stift',7:'Eine Party planen',8:'Meine Freizeit als Mindmap',9:'Welche Handschrift erkennt OneNote?'},
    scan:{1:'OneDrive fürs Scannen vorbereiten',2:'Eine Seite als PDF scannen',3:'Eine Packliste gut lesbar scannen',4:'Mehrere Seiten in eine PDF bringen',5:'Den Scan am Notebook wiederfinden',7:'Infos übernehmen, ohne alles abzutippen',6:'Einen Aushang sichern',8:'Einen Mini-Comic als PDF machen'}
  };
  const defs={onenote:{label:'OneNote',required:[1,2,3,4,5,6,7,8,9,10],optional:[11,12]},digipen:{label:'DigiPen',required:[1,2,3,4,5],optional:[6,7,8,9]},scan:{label:'Scannen',required:[1,2,3,4,5,7],optional:[6,8]}};
  let currentClass='GS1B',students=[],selected=null;
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function pct(done,total){return total?Math.round(done/total*100):0}
  function when(value){
    if(!value)return {main:'–',sub:''};const d=new Date(value);if(Number.isNaN(d.getTime()))return {main:'–',sub:''};
    const now=new Date(),same=now.toDateString()===d.toDateString();const yesterday=new Date(now);yesterday.setDate(now.getDate()-1);
    const main=same?'Heute':yesterday.toDateString()===d.toDateString()?'Gestern':d.toLocaleDateString('de-CH',{day:'2-digit',month:'2-digit'});
    return {main,sub:d.toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'})};
  }
  function ageDays(value){const t=new Date(value).getTime();return Number.isFinite(t)?(Date.now()-t)/86400000:999}
  function needsSupport(s){return Number(s.total_done||0)<5||ageDays(s.last_seen)>7}
  function toast(text){const el=$('#toast');el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,2600)}
  async function api(path,options={}){const r=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Anfrage fehlgeschlagen');return data}
  function meter(done,total){const p=pct(done,total),cl=done>=total?'done':done===0?'none':'';return `<div class="meter ${cl}"><div class="meter-line"><span style="width:${p}%"></span></div><small>${done} / ${total}</small></div>`}
  function row(s){
    const activity=when(s.last_seen),total=Number(s.total_done||0),p=pct(total,21),support=needsSupport(s);
    return `<tr class="student-row" data-email="${esc(s.email)}" tabindex="0">
      <td><div class="person"><strong>${esc(s.name||s.email)}</strong><small>${esc(s.email)}</small>${support?'<span class="support-pill">im Blick behalten</span>':''}</div></td>
      <td>${meter(Number(s.onenote_done||0),10)}</td>
      <td>${meter(Number(s.digipen_done||0),5)}</td>
      <td>${meter(Number(s.scan_done||0),6)}</td>
      <td><span class="overall ${p===100?'done':p<30?'low':''}">${p}%</span><small> ${total}/21</small></td>
      <td><div class="activity"><strong>${activity.main}</strong><small>${activity.sub}</small></div></td>
      <td><select class="class-select" data-assign="${esc(s.email)}" aria-label="Klasse von ${esc(s.name||s.email)}"><option value="" ${!s.class_name?'selected':''}>Nicht zugeordnet</option><option value="GS1B" ${s.class_name==='GS1B'?'selected':''}>GS1B</option><option value="GS1D" ${s.class_name==='GS1D'?'selected':''}>GS1D</option></select></td>
    </tr>`;
  }
  function filtered(){
    const q=$('#searchInput').value.trim().toLowerCase();let list=students.filter(s=>!q||String(s.name).toLowerCase().includes(q)||s.email.toLowerCase().includes(q));
    const sort=$('#sortSelect').value;
    const byName=(a,b)=>String(a.name).localeCompare(String(b.name),'de');
    if(sort==='progress-asc')list.sort((a,b)=>a.total_done-b.total_done||byName(a,b));
    else if(sort==='progress-desc')list.sort((a,b)=>b.total_done-a.total_done||byName(a,b));
    else if(sort==='activity')list.sort((a,b)=>new Date(b.last_seen)-new Date(a.last_seen));
    else if(sort==='name')list.sort(byName);
    else list.sort((a,b)=>Number(needsSupport(b))-Number(needsSupport(a))||a.total_done-b.total_done||byName(a,b));
    return list;
  }
  function render(){
    const list=filtered(),rows=$('#studentRows');rows.innerHTML=list.map(row).join('');$('#emptyState').hidden=list.length>0;
    $('#studentCount').textContent=students.length;$('#activeToday').textContent=students.filter(s=>ageDays(s.last_seen)<1&&new Date(s.last_seen).toDateString()===new Date().toDateString()).length;
    $('#averageProgress').textContent=(students.length?Math.round(students.reduce((sum,s)=>sum+Number(s.total_done||0),0)/(students.length*21)*100):0)+'%';
    $('#supportCount').textContent=students.filter(needsSupport).length;$('#classTitle').textContent=classes[currentClass];
    $$('[data-assign]').forEach(select=>select.addEventListener('change',async event=>{event.stopPropagation();const email=select.dataset.assign;try{await api('/lehrperson/api/assign',{method:'POST',body:JSON.stringify({email,className:select.value||null})});toast(`Klasse gespeichert: ${select.value||'nicht zugeordnet'}`);await load()}catch(error){toast(error.message)}}));
    $$('.student-row').forEach(tr=>{tr.addEventListener('click',event=>{if(event.target.closest('select'))return;openDetail(tr.dataset.email)});tr.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('select')){event.preventDefault();openDetail(tr.dataset.email)}})});
  }
  function taskList(track,p){
    const def=defs[track],requiredDone=new Set(p?.requiredDone||[]),optionalDone=new Set(p?.optionalDone||[]),started=new Set(p?.started||[]);
    return [...def.required.map(id=>[id,false]),...def.optional.map(id=>[id,true])].map(([id,optional])=>{
      const done=(optional?optionalDone:requiredDone).has(id),begun=started.has(id),state=done?'Erledigt':begun?'Begonnen':'Offen',cl=done?'done':begun?'started':'';
      return `<div class="task-status ${cl} ${optional?'optional':''}"><span class="num">${id}</span><span><strong>${esc(taskNames[track][id]||`Auftrag ${id}`)}</strong>${optional?'<br><small>Zusatzauftrag</small>':''}</span><span class="state">${state}</span></div>`;
    }).join('');
  }
  function openDetail(email){
    const s=students.find(item=>item.email===email);if(!s)return;selected=s;$('#detailName').textContent=s.name||s.email;$('#detailEmail').textContent=s.email;
    const progress=s.progress||{};
    $('#detailContent').innerHTML=`<div class="detail-summary">${Object.entries(defs).map(([key,d])=>`<div class="detail-module"><h3>${d.label}</h3><strong>${(progress[key]?.requiredDone||[]).length} / ${d.required.length}</strong><p>Pflichtaufträge erledigt</p></div>`).join('')}</div>${Object.entries(defs).map(([key,d])=>`<section><h3>${d.label}</h3><div class="task-status-list">${taskList(key,progress[key])}</div></section>`).join('')}`;
    $('#detailDialog').showModal();
  }
  async function load(){
    try{
      const data=await api(`/lehrperson/api/students?class=${encodeURIComponent(currentClass)}`);students=data.students||[];$('#setupNotice').hidden=true;render();
      if(currentClass!=='UNASSIGNED'){
        try{const unassigned=await api('/lehrperson/api/students?class=UNASSIGNED');const count=unassigned.students?.length||0;$('[data-unassigned-count]').textContent=count?`(${count})`:''}catch{}
      }else $('[data-unassigned-count]').textContent=students.length?`(${students.length})`:'';
    }catch(error){students=[];render();$('#setupNotice').hidden=false;if(!/D1/.test(error.message))toast(error.message)}
  }
  $$('.class-tab').forEach(button=>button.addEventListener('click',()=>{currentClass=button.dataset.class;$$('.class-tab').forEach(b=>b.classList.toggle('is-active',b===button));load()}));
  $('#searchInput').addEventListener('input',render);$('#sortSelect').addEventListener('change',render);$('#refreshButton').addEventListener('click',load);
  $('#removeStudentButton').addEventListener('click',async()=>{if(!selected)return;if(!confirm(`Den Eintrag ${selected.email} wirklich entfernen?`))return;try{await api('/lehrperson/api/remove',{method:'POST',body:JSON.stringify({email:selected.email})});$('#detailDialog').close();toast('Eintrag entfernt.');await load()}catch(error){toast(error.message)}});
  load();setInterval(load,60000);
})();
