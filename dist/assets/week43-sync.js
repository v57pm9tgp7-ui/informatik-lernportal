/* Synchronisiert nur die 15 Übungshäkchen der Woche 43, niemals Notizen oder Testantworten. */
(function(){
  'use strict';
  const ACCESS_KEY='mediainfolab_student_access_v1';
  const STATE_KEY='w43v3';
  const OWNER_KEY='mediainfolab_w43_owner_v1';
  const EMAIL_RE=/^[^\s@]+@stud\.bffbern\.ch$/i;
  const $=selector=>document.querySelector(selector);
  let queue=Promise.resolve(),merged=false,startedSignature='',startTimer=null;

  function read(key){
    try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}
  }
  function email(){
    const value=String(read(ACCESS_KEY)?.email||'').trim().toLowerCase();
    return EMAIL_RE.test(value)?value:'';
  }
  function allowed(){
    const value=email();if(!value)return '';
    const owner=String(localStorage.getItem(OWNER_KEY)||'').trim().toLowerCase();
    if(owner&&owner!==value){
      show('Woche 43 ist in diesem Browser bereits einer anderen Schulmail zugeordnet. Bitte verwenden Sie Ihren eigenen Browser.','error');
      return '';
    }
    return value;
  }
  function snapshot(){
    const state=read(STATE_KEY)||{};
    const completed=Object.entries(state.completed||{}).filter(([id,done])=>done&&/^t(?:[1-9]|1[0-5])$/.test(id)).map(([id])=>Number(id.slice(1)));
    const started=Object.entries(state.runs||{}).filter(([id,run])=>/^t(?:[1-9]|1[0-5])$/.test(id)&&run&&
      (run.active===true||Number(run.elapsed)>0)).map(([id])=>Number(id.slice(1)));
    return {completed,started:[...new Set([...completed,...started])]};
  }
  function show(message,tone=''){
    const el=$('#week43CloudStatus');
    if(!el)return;
    el.textContent=message;
    el.dataset.state=tone;
  }
  function send(body){
    const studentEmail=allowed();if(!studentEmail)return Promise.resolve(false);
    const request={...body,email:studentEmail};
    queue=queue.catch(()=>{}).then(async()=>{
      const response=await fetch('/api/week43',{
        method:'POST',headers:{'content-type':'application/json'},
        credentials:'same-origin',body:JSON.stringify(request)
      });
      if(!response.ok)throw new Error('Synchronisierung fehlgeschlagen');
      localStorage.setItem(OWNER_KEY,studentEmail);
      show('Arbeitsstand der Woche 43 wurde gespeichert.','ok');
      return true;
    }).catch(()=>{
      show('Auf dem Gerät gespeichert. Die Übertragung ist noch nicht gelungen.','error');
      return false;
    });
    return queue;
  }
  function initial(){
    if(merged||!allowed()||localStorage.getItem(STATE_KEY)===null)return;
    merged=true;
    send({mode:'merge',...snapshot()}).then(ok=>{if(!ok)merged=false});
  }
  function syncStarted(){
    if(!allowed()||localStorage.getItem(STATE_KEY)===null)return;
    const started=snapshot().started;
    const signature=started.join(',');
    if(signature===startedSignature)return;
    startedSignature=signature;
    send({mode:'start',started}).then(ok=>{if(!ok)startedSignature=''});
  }
  const nativeSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const result=nativeSet.call(this,key,value);
    if(this===localStorage){
      if(key===ACCESS_KEY){setTimeout(initial,0)}
      if(key===STATE_KEY){
        clearTimeout(startTimer);
        startTimer=setTimeout(syncStarted,550);
      }
    }
    return result;
  };
  document.addEventListener('change',event=>{
    const input=event.target.closest?.('[data-complete]');
    if(!input)return;
    const match=/^t(\d+)$/.exec(input.dataset.complete||'');
    if(!match)return;
    const taskId=Number(match[1]);
    if(taskId<1||taskId>15)return;
    send({mode:'patch',taskId,done:Boolean(input.checked)});
  });
  document.addEventListener('DOMContentLoaded',()=>{
    if(!$('#week43CloudStatus'))return;
    if(email())initial();else show('Melden Sie sich mit Ihrer Schulmail an, um den Arbeitsstand zu übertragen.');
  });
  window.addEventListener('online',()=>{initial();syncStarted()});
  window.addEventListener('focus',()=>{initial();syncStarted()});
})();