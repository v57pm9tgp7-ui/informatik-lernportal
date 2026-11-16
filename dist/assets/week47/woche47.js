/* One small exhibit per project, even at the beginning of the work. */
(() => {
  'use strict';
  const advice = {
    'werkstatt-werbespot': [
      'Stellen Sie den Gegenstand auf den Tisch. Fotografieren Sie ihn einmal im Ganzen und einmal im Einsatz. Wählen Sie das Bild, auf dem man den Nutzen besser sieht.',
      'Halten Sie Ihren Spot an zwei Stellen an. Stellen Sie die Bilder nebeneinander und erklären Sie, warum diese Reihenfolge passt.',
      'Spielen Sie fünf Sekunden ohne Ton ab. Lassen Sie jemanden sagen, welchen Nutzen Ihr Spot verspricht.',
      'Auf welchem Bild erkennen Sie besser, wozu der Gegenstand gut ist?'],
    'werkstatt-geschichte': [
      'Schreiben Sie eine erste Nachricht und zwei mögliche Antworten auf ein Blatt. Zeichnen Sie unter jede Antwort einen Pfeil mit einer anderen Folge.',
      'Zeigen Sie eine Entscheidung mit zwei Antwortknöpfen. Markieren Sie den Weg, den Sie als Erstes verlinken möchten.',
      'Lassen Sie jemanden eine der zwei Antworten anklicken. Vergleichen Sie das erwartete mit dem tatsächlichen Ende.',
      'Welche Antwort würden Sie wählen und was erwarten Sie danach?'],
    'werkstatt-plakat': [
      'Öffnen Sie das Ausgangsplakat. Machen Sie eine Kopie und vergrössern Sie dort nur die wichtigste Information. Speichern Sie beide Ansichten.',
      'Schneiden Sie aus beiden Versionen die gleiche Stelle aus. Zeigen Sie die Änderung und begründen Sie sie.',
      'Zeigen Sie beide Versionen kurz aus Distanz. Fragen Sie, welche Hauptaussage ankommt.',
      'Welche Information lesen Sie auf meiner neuen Version zuerst?'],
    'werkstatt-app': [
      'Zeichnen Sie auf Papier einen Handybildschirm mit Titel und zwei Knöpfen. Beschriften Sie beide mit einer Handlung. Fotografieren Sie die Skizze.',
      'Öffnen Sie eine App-Ansicht und nehmen Sie einen Screenshot auf. Kennzeichnen Sie einen Knopf und erklären Sie, wohin er führen soll.',
      'Lassen Sie jemanden eine Aufgabe mit Ihrer App versuchen. Zeigen Sie den Bildschirm, auf dem die Person entschieden hat.',
      'Wo würden Sie tippen, um die gezeigte Aufgabe zu lösen?'],
    'kurz-nachrichten': [
      'Öffnen Sie eine Beispielnachricht im Projekt. Markieren Sie eine auffällige Stelle. Notieren Sie daneben, wie Sie die Nachricht prüfen würden.',
      'Zeigen Sie eine Nachricht mit Ihrer Markierung. Ergänzen Sie, welcher Hinweis Ihre Entscheidung beeinflusst hat.',
      'Geben Sie einer Person die Nachricht zuerst ohne Ihre Markierung. Vergleichen Sie Ihre Entscheidungen.',
      'Welches Detail würden Sie zuerst prüfen?'],
    'kurz-bildausschnitt': [
      'Öffnen Sie das Projektbild. Erstellen Sie einen engen und einen weiten Ausschnitt derselben Szene. Legen Sie sie nebeneinander.',
      'Geben Sie Ihren Ausschnitten zwei unterschiedliche Überschriften. Zeigen Sie, was ausserhalb des engen Bildrands liegt.',
      'Zeigen Sie zuerst den engen Ausschnitt und danach den weiten. Halten Sie fest, welche Vermutung sich verändert.',
      'Was denken Sie beim ersten Bild, und was ändert sich beim zweiten?'],
    'kurz-plakat': [
      'Öffnen Sie den Aushang. Schreiben Sie Anlass, Ort und Zeit auf drei Zettel. Ordnen Sie die Zettel nach Wichtigkeit und fotografieren Sie Ihre Anordnung.',
      'Zeigen Sie den alten und den neuen Titel Ihres Aushangs. Begründen Sie, welche Information zuerst auffallen soll.',
      'Zeigen Sie Ihren Aushang drei Sekunden lang. Fragen Sie nach Anlass und Zeit.',
      'Welche Angabe haben Sie sofort gefunden, welche mussten Sie suchen?'],
    'kurz-storyboard': [
      'Zeichnen Sie zwei Kästchen. Im ersten passiert eine Panne, im zweiten versucht jemand zu helfen. Strichfiguren genügen.',
      'Wählen Sie zwei benachbarte Bilder und erklären Sie, wie die Handlung von einem zum anderen springt.',
      'Zeigen Sie Ihre Bildfolge ohne Worte. Bitten Sie jemanden, die Handlung nachzuerzählen.',
      'Was ist zwischen diesen beiden Bildern passiert?'],
    'projekt-tutorial': [
      'Wählen Sie einen einzigen Handgriff. Machen Sie ein Bild vor und eines nach dem Klick. Kreisen Sie die richtige Stelle ein.',
      'Zeigen Sie Ihren schwierigsten Schritt mit einem Pfeil. Erklären Sie, warum gerade diese Stelle eine Hilfe braucht.',
      'Lassen Sie jemanden einen Schritt nur mit Ihrer Anleitung ausführen. Beobachten Sie, wo die Person zögert.',
      'Worauf würden Sie mit dieser Anleitung jetzt klicken?'],
    'projekt-cockpit': [
      'Legen Sie in OneNote eine Seite mit den Titeln «Aufgaben» und «Termine» an. Tragen Sie je ein erfundenes Beispiel ein. Machen Sie einen Screenshot.',
      'Zeigen Sie einen Bereich mit einem unpersönlichen Beispieleintrag. Erklären Sie, wie er die Suche erleichtert.',
      'Bitten Sie jemanden, in Ihrer Ansicht einen Termin zu finden. Beobachten Sie den ersten Blick.',
      'Wo würden Sie zuerst nach dem nächsten Termin suchen?'],
    'projekt-dokumente': [
      'Wählen Sie drei unpersönliche Beispielseiten. Schreiben Sie die Titel auf und ordnen Sie sie. Fotografieren Sie die Reihenfolge und begründen Sie die erste Seite.',
      'Zeigen Sie die Seitenübersicht mit zwei oder drei Vorschaubildern. Erklären Sie die gewählte Reihenfolge.',
      'Öffnen Sie Ihre PDF neu. Lassen Sie eine Person eine vorgegebene Information finden und auf Lesbarkeit prüfen.',
      'Welche Seite würden Sie für diese Information zuerst öffnen?'],
    'projekt-faktencheck': [
      'Schreiben Sie Ihre Behauptung wortgetreu auf. Daneben notieren Sie eine überprüfbare Frage und welche Quelle bei der Prüfung helfen könnte. Markieren Sie «Urteil offen».',
      'Zeigen Sie eine Fundstelle mit ihrer Herkunft. Markieren Sie genau die Stelle, die bei Ihrer Frage hilft.',
      'Zeigen Sie Ihr Urteil und die Belege dazu. Bitten Sie jemanden, einen noch offenen Punkt zu nennen.',
      'Welcher Beleg würde Sie bei dieser Behauptung überzeugen?'],
    'projekt-lifehacks': [
      'Öffnen Sie eine längere Seite. Suchen Sie mit Ctrl + F ein Wort. Machen Sie einen Screenshot des Treffers und notieren Sie, welcher Schritt Ihnen Zeit spart.',
      'Zeigen Sie einen Trick aus Ihrer Sammlung mit einem eigenen Beispiel und seinem sichtbaren Ergebnis.',
      'Geben Sie einer Person dieselbe Aufgabe und Ihre Erklärung. Beobachten Sie, ob sie den Trick selbst anwenden kann.',
      'An welcher Stelle meiner Anleitung würden Sie eine Zusatzinfo brauchen?']
  };
  const $ = id => document.getElementById(id);
  const projects = globalThis.MediaInfoCatalogue.items;
  const options = projects.map(p => new Option(p.title,p.key));
  $('project').replaceChildren(...options);
  $('project').value = 'werkstatt-app';
  const ids = ['audience','evidence','choice','next','question'];
  const defaults = ['[Zielgruppe und Ziel]','[mein echter Ausschnitt]','[meine Entscheidung und der Grund]','[mein nächster Schritt]','[meine Frage]'];
  function selection(){return projects.find(p=>p.key===$('project').value);}
  function prompt(){
    const [aud,ev,why,next,ask] = ids.map((id,i)=>$(id).value.trim() || defaults[i]);
    return 'Erstelle drei kurze Folien auf Deutsch für eine Minute vor meiner Klasse. Mein Projekt heisst «'+selection().title+'».\n\nFolie 1: Mein Ziel und mein Publikum: '+aud+'\nFolie 2: Das kann ich heute zeigen: '+ev+' Meine Entscheidung: '+why+' Lass Platz für mein eigenes Bild. Ich füge es selbst ein.\nFolie 3: Das plane ich als Nächstes: '+next+' Meine Frage an die Klasse: '+ask+'\n\nSchreibe pro Folie einen klaren Titel und höchstens zwei kurze Sätze. Unterscheide, was schon besteht und was erst geplant ist. Verwende nur meine Angaben. Erfinde keine Ergebnisse, Quellen oder Tests.';
  }
  function renderPrompt(){ $('prompt').textContent = prompt(); $('status').textContent=''; }
  function refreshCoach(){
    const project=selection(), tips=advice[project.key], i=$('stage').selectedIndex;
    $('c-title').textContent=['In fünf Minuten etwas Vorzeigbares schaffen','Eine Entscheidung im Entwurf zeigen','Einen kleinen Test machen'][i];
    $('c-action').textContent=tips[i]; $('c-question').textContent=tips[3];
    $('c-link').href=project.href; $('c-link').textContent=project.title+' öffnen ↗';
    renderPrompt();
  }
  const drafts = new Map();
  let currentProject = selection().key;
  $('project').addEventListener('change',()=>{
    drafts.set(currentProject,{notes:ids.map(id=>$(id).value),stage:$('stage').value});
    currentProject=selection().key;
    const draft=drafts.get(currentProject);
    ids.forEach((id,i)=>{$(id).value=draft?.notes[i] || '';});
    $('stage').value=draft?.stage || 'start';
    refreshCoach();
  });
  $('stage').addEventListener('change',refreshCoach);
  ids.forEach(id=>$(id).addEventListener('input',renderPrompt));
  refreshCoach();
  $('copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(prompt());$('status').textContent='Kopiert. Fügen Sie den Text in Gamma mit Ctrl + V ein.';}
    catch{const range=document.createRange(); range.selectNodeContents($('prompt'));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);$('status').textContent='Text markiert. Drücken Sie Ctrl + C.';}
  });
  document.querySelector('.save-notes').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([prompt()],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='Mein Folienplan.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  });
  function slide(index){
    document.querySelectorAll('.sample').forEach((el,i)=>el.hidden=index!==i);
    document.querySelectorAll('[data-slide]').forEach((el,i)=>el.setAttribute('aria-pressed',String(index===i)));
  }
  document.querySelectorAll('[data-slide]').forEach(el=>el.addEventListener('click',()=>slide(Number(el.dataset.slide))));
  slide(0);
  function jump(){
    const section=document.getElementById(location.hash.slice(1));
    if(section?.matches('details.step')){section.open=true; requestAnimationFrame(()=>section.scrollIntoView({block:'start'}));}
  }
  window.addEventListener('hashchange',jump);
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(link && link.hash===location.hash)jump();
  });
  jump();
})();
