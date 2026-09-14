(function(){'use strict';
  const ACCESS_KEY='mediainfolab_student_access_v1';
  const KEYS={onenote:'onenoteWorkshopGS1_student_v3',digipen:'digitalArbeiten_digipen_v1',scan:'digitalArbeiten_scannen_v1'};
  const EMAIL_RE=/^[^\s@]+@stud\.bffbern\.ch$/i;
  const relevant=new Set([ACCESS_KEY,...Object.values(KEYS)]);
  let timer=null,lastSignature='';

  function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
  function ids(value){return [...new Set((Array.isArray(value)?value:[]).map(Number).filter(Number.isInteger))]}
  function email(){const value=read(ACCESS_KEY);const result=String(value.email||'').trim().toLowerCase();return EMAIL_RE.test(result)?result:''}
  function hasStarted(raw,id,prefix){
    const checks=raw&&typeof raw.checks==='object'&&raw.checks?raw.checks:{};
    const note=raw&&raw.notes&&typeof raw.notes==='object'?raw.notes[id]:'';
    return Object.entries(checks).some(([key,value])=>Boolean(value)&&key.startsWith(prefix))||String(note||'').trim().length>0;
  }
  function track(raw,required,optional,kind){
    const done=ids(kind==='onenote'?raw.doneTasks:raw.done);
    const doneSet=new Set(done);
    const started=[...required,...optional].filter(id=>doneSet.has(id)||hasStarted(raw,id,kind==='onenote'?`t${id}-`:`${id}_`));
    return {
      requiredDone:required.filter(id=>doneSet.has(id)),
      optionalDone:optional.filter(id=>doneSet.has(id)),
      started,
      last:Number(kind==='onenote'?raw.lastTask:raw.last)||null
    };
  }
  function payload(){
    const studentEmail=email();if(!studentEmail)return null;
    const one=read(KEYS.onenote),pen=read(KEYS.digipen),scan=read(KEYS.scan);
    return {
      email:studentEmail,
      progress:{
        onenote:track(one,[1,2,3,4,5,6,7,8,9,10],[11,12],'onenote'),
        digipen:track(pen,[1,2,3,4,5],[6,7,8,9],'digipen'),
        scan:track(scan,[1,2,3,4,5,7],[6,8],'scan')
      },
      clientUpdatedAt:new Date().toISOString()
    };
  }
  async function syncNow(){
    const body=payload();if(!body)return false;
    const signature=JSON.stringify(body.progress)+'|'+body.email;
    if(signature===lastSignature&&document.visibilityState==='visible')return true;
    try{
      const response=await fetch('/api/progress',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),credentials:'same-origin',keepalive:true});
      if(response.ok){lastSignature=signature;document.documentElement.dataset.cloudSync='ok';return true}
      document.documentElement.dataset.cloudSync='waiting';return false;
    }catch{document.documentElement.dataset.cloudSync='waiting';return false}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(syncNow,900)}

  const originalSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const result=originalSetItem.call(this,key,value);
    if(this===localStorage&&relevant.has(String(key)))schedule();
    return result;
  };
  const originalRemoveItem=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key){
    const result=originalRemoveItem.call(this,key);
    if(this===localStorage&&relevant.has(String(key)))schedule();
    return result;
  };

  window.MediaInfoSync={syncNow,schedule};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(syncNow,350),{once:true});else setTimeout(syncNow,350);
  window.addEventListener('focus',schedule);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')syncNow();else schedule()});
})();
