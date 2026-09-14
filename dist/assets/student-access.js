(function(){'use strict';
  const KEY='mediainfolab_student_access_v1';
  const DOMAIN='stud.bffbern.ch';
  const EMAIL_RE=/^[^\s@]+@stud\.bffbern\.ch$/i;
  const root=document.documentElement;

  function read(){
    try{
      const value=JSON.parse(localStorage.getItem(KEY)||'null');
      return value&&EMAIL_RE.test(String(value.email||''))?value:null;
    }catch{return null}
  }
  function save(email){
    try{localStorage.setItem(KEY,JSON.stringify({email,acceptedAt:new Date().toISOString()}));return true}catch{return false}
  }
  function clear(){try{localStorage.removeItem(KEY)}catch{}}
  function cleanEmail(value){return String(value||'').trim().toLowerCase()}
  function reveal(){root.classList.remove('student-access-check')}
  function addLogout(){
    if(document.querySelector('.student-access-logout'))return;
    const button=document.createElement('button');
    button.type='button';button.className='student-access-logout';button.textContent='Schulmail wechseln';
    button.title='Gespeicherte Schulmailadresse entfernen und neu eingeben';
    button.addEventListener('click',()=>{clear();location.reload()});
    document.body.appendChild(button);
  }
  function showGate(){
    const gate=document.createElement('div');gate.className='student-access-gate';
    gate.innerHTML=`<section class="student-access-card" role="dialog" aria-modal="true" aria-labelledby="student-access-title">
      <div class="student-access-top">
        <div class="student-access-brand"><span class="student-access-mark" aria-hidden="true">IT</span><div><strong>Informatik</strong><span>Unterricht bei Herrn Marti · GS1</span></div></div>
        <p>BFF Bern · Schulzugang</p><h1 id="student-access-title">Mit Ihrer Schulmail starten</h1>
      </div>
      <div class="student-access-body">
        <p class="student-access-intro">Diese Lernumgebung ist für Lernende der BFF Bern. Geben Sie einmal Ihre Schulmailadresse ein. Danach gelangen Sie direkt zu den Aufträgen.</p>
        <form class="student-access-form" novalidate>
          <label class="student-access-label" for="student-access-email">Ihre Schulmailadresse</label>
          <input class="student-access-input" id="student-access-email" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false" placeholder="vorname.nachname@${DOMAIN}" aria-describedby="student-access-error student-access-note" required>
          <p class="student-access-error" id="student-access-error" role="alert" aria-live="polite"></p>
          <button class="student-access-submit" type="submit">Weiter zur Webseite</button>
        </form>
        <p class="student-access-note" id="student-access-note"><span aria-hidden="true">ℹ️</span><span><b>Kein Passwort nötig.</b> Die Adresse wird nur in diesem Browser gespeichert und nicht an einen Server übermittelt.</span></p>
      </div>
    </section>`;
    document.body.appendChild(gate);
    const form=gate.querySelector('form'),input=gate.querySelector('input'),error=gate.querySelector('.student-access-error');
    form.addEventListener('submit',event=>{
      event.preventDefault();const email=cleanEmail(input.value);
      if(!EMAIL_RE.test(email)){
        input.setAttribute('aria-invalid','true');
        error.textContent='Bitte verwenden Sie Ihre Schulmailadresse mit @stud.bffbern.ch.';
        input.focus();return;
      }
      input.removeAttribute('aria-invalid');error.textContent='';save(email);gate.remove();reveal();addLogout();
    });
    input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true'){input.removeAttribute('aria-invalid');error.textContent=''}});
    requestAnimationFrame(()=>input.focus());
  }
  function start(){
    if(read()){reveal();addLogout();return}
    showGate();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
