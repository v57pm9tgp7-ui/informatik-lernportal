(function(){'use strict';
  const KEY='mediainfolab_student_access_v1';
  const DOMAIN='stud.bffbern.ch';
  const TEACHER_EMAIL='christoph.marti@bffbern.ch';
  const EMAIL_RE=/^(?:[^\s@]+@stud\.bffbern\.ch|christoph\.marti@bffbern\.ch)$/i;
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
  function isTeacher(email){return cleanEmail(email)===TEACHER_EMAIL}
  function reveal(){root.classList.remove('student-access-check')}
  function addTeacherLink(email){
    if(!isTeacher(email))return;
    const desktop=document.querySelector('.desktop-nav');
    if(desktop&&!desktop.querySelector('[data-teacher-link]')){
      const a=document.createElement('a');
      a.className='nav-link teacher-nav-link';
      a.href='/lehrperson/';
      a.textContent='Lehrpersonenbereich';
      a.setAttribute('aria-label','Geschützten Lehrpersonenbereich öffnen');
      a.dataset.teacherLink='';
      desktop.appendChild(a);
    }
    const mobile=document.querySelector('.mobile-menu');
    if(mobile&&!mobile.querySelector('[data-teacher-link]')){
      const a=document.createElement('a');
      a.href='/lehrperson/';
      a.className='teacher-mobile-link';
      a.textContent='LP · Lehrpersonenbereich';
      a.dataset.teacherLink='';
      mobile.appendChild(a);
    }
    if(document.querySelector('[data-view="start"]')&&!document.querySelector('.teacher-home-shortcut')){
      const hero=document.querySelector('.portal-hero');
      if(hero){
        const box=document.createElement('aside');
        box.className='teacher-home-shortcut';
        box.setAttribute('aria-label','Persönlicher Lehrpersonen-Zugang');
        box.innerHTML='<div class="teacher-home-icon" aria-hidden="true">LP</div><div class="teacher-home-copy"><span>Nur für Christoph Marti</span><strong>Lehrpersonenbereich</strong><p>GS1B und GS1D · Fortschritt, Unterricht heute und Auftragssteuerung</p></div><a href="/lehrperson/">Bereich öffnen →</a>';
        hero.insertAdjacentElement('afterend',box);
      }
    }
  }
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
        <p class="student-access-intro">Diese Lernumgebung ist für Lernende der BFF Bern. Geben Sie einmal Ihre Schulmailadresse ein. Lehrpersonen verwenden ihre freigeschaltete BFF-Adresse.</p>
        <form class="student-access-form" novalidate>
          <label class="student-access-label" for="student-access-email">Ihre BFF-Mailadresse</label>
          <input class="student-access-input" id="student-access-email" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false" placeholder="vorname.nachname@${DOMAIN}" aria-describedby="student-access-error student-access-note" required>
          <p class="student-access-error" id="student-access-error" role="alert" aria-live="polite"></p>
          <button class="student-access-submit" type="submit">Weiter zur Webseite</button>
        </form>
        <p class="student-access-note" id="student-access-note"><span aria-hidden="true">ℹ️</span><span><b>Lernende:</b> Kein Passwort nötig. Die Schulmail wird zur Zuordnung Ihres Arbeitsstands verwendet. <b>Lehrperson:</b> Die freigeschaltete BFF-Adresse erhält zusätzlich den Link zum geschützten Lehrpersonenbereich.</span></p>
      </div>
    </section>`;
    document.body.appendChild(gate);
    const form=gate.querySelector('form'),input=gate.querySelector('input'),error=gate.querySelector('.student-access-error');
    form.addEventListener('submit',event=>{
      event.preventDefault();const email=cleanEmail(input.value);
      if(!EMAIL_RE.test(email)){
        input.setAttribute('aria-invalid','true');
        error.textContent='Bitte verwenden Sie Ihre Schulmailadresse mit @stud.bffbern.ch oder die freigeschaltete Lehrpersonenadresse.';
        input.focus();return;
      }
      input.removeAttribute('aria-invalid');error.textContent='';save(email);gate.remove();reveal();addLogout();addTeacherLink(email);
    });
    input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true'){input.removeAttribute('aria-invalid');error.textContent=''}});
    requestAnimationFrame(()=>input.focus());
  }
  function start(){
    const access=read();if(access){reveal();addLogout();addTeacherLink(access.email);return}
    showGate();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
