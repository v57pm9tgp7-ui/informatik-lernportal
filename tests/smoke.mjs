import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve('dist');
const htmlFiles=fs.readdirSync(root).filter(name=>name.endsWith('.html'));
const failures=[];
function filesBelow(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?filesBelow(path.join(directory,entry.name)):[path.join(directory,entry.name)])}
function check(label,fn){try{fn();console.log('✓',label)}catch(error){failures.push(`${label}: ${error.message}`);console.error('✗',label)}}

check('alle vier HTML-Einstiegspunkte vorhanden',()=>{
  for(const name of ['index.html','onenote.html','digipen.html','scannen.html'])assert.ok(fs.existsSync(path.join(root,name)),name);
});

for(const name of htmlFiles){
  const file=path.join(root,name),source=fs.readFileSync(file,'utf8');
  check(`${name}: eindeutige IDs`,()=>{
    const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);assert.deepEqual([...new Set(duplicates)],[]);
  });
  check(`${name}: lokale Verknüpfungen vorhanden`,()=>{
    for(const match of source.matchAll(/(?:href|src)="([^"#][^"]*)"/g)){
      const ref=match[1];if(/^(?:https?:|data:|mailto:|javascript:)/.test(ref))continue;
      const clean=ref.split('#')[0].split('?')[0];if(!clean)continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(file),clean)),`${ref} fehlt`);
    }
  });
  check(`${name}: Inline-JavaScript syntaktisch gültig`,()=>{
    for(const [i,match] of [...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].entries()){
      try{new Function(match[1])}catch(error){throw new Error(`Script ${i+1}: ${error.message}`)}
    }
  });
}

for(const name of fs.readdirSync(path.join(root,'assets')).filter(n=>n.endsWith('.js'))){
  check(`${name}: JavaScript syntaktisch gültig`,()=>new Function(fs.readFileSync(path.join(root,'assets',name),'utf8')));
}

const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const oneNote=fs.readFileSync(path.join(root,'onenote.html'),'utf8');
const digiPen=fs.readFileSync(path.join(root,'digipen.html'),'utf8');
const scan=fs.readFileSync(path.join(root,'scannen.html'),'utf8');
const portalJs=fs.readFileSync(path.join(root,'assets/portal.js'),'utf8');
const shellJs=fs.readFileSync(path.join(root,'assets/workshop-shell.js'),'utf8');
const portalCss=fs.readFileSync(path.join(root,'assets/portal.css'),'utf8');
const shellCss=fs.readFileSync(path.join(root,'assets/workshop-shell.css'),'utf8');
check('professionelle Startseite und aktuelle Woche sind vorhanden',()=>{assert.match(index,/Arbeitsgrundlage für den Informatikunterricht/);assert.match(index,/Herrn Marti/);assert.match(index,/Woche 38 starten/);assert.match(index,/href="#woche-38"/)});
check('Startseite zeigt den Arbeitsstand in drei Spalten',()=>{assert.match(index,/id="home-progress-title">Was ist schon erledigt\?/);assert.equal((index.match(/data-home-track="(?:onenote|digipen|scan)"/g)||[]).length,3);for(const label of ['Woche 37','Woche 38 · Teil 1','Woche 38 · Teil 2'])assert.match(index,new RegExp(label));assert.match(portalCss,/\.home-progress-grid\{display:grid;grid-template-columns:repeat\(3/)});
check('Kurzübersicht zeigt alle Aufgaben und die drei Wechselpunkte',()=>{for(const title of ['Workshop-Notizbuch öffnen','Gemeinsam arbeiten','Eine Party planen','Infos übernehmen, ohne alles abzutippen','Einen Mini-Comic als PDF machen'])assert.match(portalJs,new RegExp(title.replace(/[?]/g,'\\?')));for(const point of ['Nach Auftrag 10','Nach Pflichtauftrag 5','Nach Pflichtauftrag 6'])assert.match(index,new RegExp(point));assert.match(portalJs,/onenote:\{required:\[1,2,3,4,5,6,7,8,9,10\],optional:\[11,12\]/);assert.match(portalJs,/scan:\{required:\[1,2,3,4,5,7\],optional:\[6,8\]/)});
check('Kurzübersicht unterscheidet offen, begonnen und erledigt',()=>{assert.match(portalJs,/function homeTaskState/);assert.match(portalJs,/return started\?'working':'open'/);assert.match(portalJs,/ready\?'Wechsel möglich'/);assert.match(portalCss,/\.home-task-row\.is-working/);assert.match(portalCss,/\.home-task-row\.is-done/);assert.match(index,/Offen[\s\S]*In Arbeit[\s\S]*Erledigt/)});
check('Pflicht- und Zusatzaufträge sind farbig und mit Text gekennzeichnet',()=>{assert.match(index,/class="legend-kind required">Pflichtauftrag/);assert.match(index,/class="legend-kind optional">Zusatzauftrag/);assert.match(portalJs,/kindText=kind==='optional'\?'Zusatz':'Pflicht'/);assert.match(portalJs,/home-task-row is-\$\{kind\} is-\$\{status\}/);assert.match(portalCss,/\.home-task-row\.is-optional\{--task-kind-bg:#f2ecfa;--task-kind-border:#7452a5\}/);assert.match(portalCss,/\.home-task-kind\.required/);assert.match(portalCss,/\.home-task-kind\.optional/)});
check('Auftragslinks der Kurzübersicht führen in den richtigen Workshop',()=>{assert.match(portalJs,/files=\{onenote:'onenote',digipen:'digipen',scan:'scannen'\}/);assert.match(portalJs,/nextHref:'digipen\.html#auftrag-1'/);assert.match(portalJs,/nextHref:'scannen\.html#auftrag-1'/);assert.match(portalJs,/\[7,'Infos übernehmen, ohne alles abzutippen',6\]/)});
check('Hauptnavigation vollständig und ohne alten Grundlagenbereich',()=>{for(const id of ['start','wochen','scan-guide','training','fortschritt'])assert.match(index,new RegExp(`data-nav="${id}"`));assert.doesNotMatch(index,/data-nav="grundlagen"/)});
check('Woche 37 enthält nur den OneNote Workshop und den Importweg',()=>{assert.match(index,/data-view="woche-37"/);assert.match(index,/id="week37-title">OneNote clever nutzen/);assert.match(index,/Ordner <strong>Dokumente<\/strong>/);assert.match(index,/Hilfe → Speichern → Fortschritt als Datei sichern/);assert.match(index,/id="importOneNoteButton"/)});
check('Woche 38 besitzt eine eigene frei aufrufbare Ansicht',()=>{assert.match(index,/data-view="woche-38"/);assert.match(index,/id="week38-title">Digital arbeiten/);assert.match(portalJs,/views=\['start','wochen','woche-37','woche-38','scan-guide','training','fortschritt'\]/)});
check('ausführlicher OneDrive-Scan-Guide ist frei erreichbar',()=>{assert.match(index,/data-view="scan-guide"/);assert.match(index,/Mit dem Smartphone sauber scannen/);assert.match(index,/Drei Dinge kurz prüfen/);assert.match(index,/Was wird wo gespeichert/);assert.match(index,/Schnelle Lösungen/);assert.match(shellJs,/\['scan-guide','Scan-Guide'\]/);assert.match(scan,/index\.html#scan-guide/)});
check('Scan-Guide enthält sechs lokale, vergrösserbare Schrittgrafiken',()=>{for(let i=1;i<=6;i++){const pattern=new RegExp(`assets/guide/onedrive-0${i}-[^"]+\\.svg`);const match=index.match(pattern);assert.ok(match,`Grafik ${i} fehlt`);assert.ok(fs.existsSync(path.join(root,match[0])),match[0])}assert.equal((index.match(/data-guide-image="assets\/guide\//g)||[]).length,6);assert.match(index,/id="guideLightbox"/);assert.match(index,/Zurück zum Guide/);assert.match(portalJs,/function setupGuide/);assert.match(portalJs,/returnFocus\?\.focus/)});
check('Videohilfe wird erst nach bewusster Aktion datensparsam geladen',()=>{assert.match(index,/data-load-video="rVngXdqdRf8"/);assert.match(index,/Das Video wird erst nach Ihrem Klick geladen/);assert.match(portalJs,/youtube-nocookie\.com\/embed/);assert.doesNotMatch(index,/<iframe/)});
check('Guide nennt die geprüften Quellen und weist auf Versionsunterschiede hin',()=>{assert.match(index,/microsoft\.com\/de-de\/microsoft-365\/onedrive\/document-scanning/);assert.match(index,/support\.microsoft\.com\/en-us\/office\/scan-a-whiteboard/);assert.match(index,/App-Version können Namen oder Positionen leicht abweichen|App-Versionen können abweichen/);assert.match(index,/Geprüft im September 2026/)});
check('vorbereitetes OneNote-Notizbuch wird korrekt benannt',()=>{assert.match(oneNote,/OneNote Workshop \[Vorname\] \[Nachname\]/);assert.doesNotMatch(oneNote,/Erstellen Sie ein neues Notizbuch/)});
check('echte OneNote-Orientierungsbilder sind eingebunden',()=>{for(const name of ['onenote-workshop-beispiel.jpg','onenote-navigation.jpg','onenote-einfuegen.jpg','onenote-stift-test.jpg','onenote-links-beispiel.jpg']){assert.match(oneNote,new RegExp(name));assert.ok(fs.existsSync(path.join(root,'assets','screenshots',name)),name)}});
check('OneNote-Fortschritt zählt alle 12 Aufgaben',()=>assert.match(portalJs,/onenote:\{done:count\(one\.doneTasks,1,12\),total:12/));
check('alle bestehenden Aufträge bleiben vorhanden',()=>{
  assert.equal((oneNote.match(/class="screen task-screen"/g)||[]).length,12);
  assert.equal((digiPen.match(/\{id:\d+,required:/g)||[]).length,9);
  assert.equal((scan.match(/\{id:\d+,(?:number:\d+,)?required:/g)||[]).length,8);
});
check('DigiPen und Scannen bieten Vorbereitung, Material und Hilfe zu jedem Auftrag',()=>{for(const [source,total] of [[digiPen,9],[scan,8]]){assert.equal((source.match(/need:'<strong>Das brauchen Sie/g)||[]).length,total);assert.equal((source.match(/setup:'<strong>Vor dem Start/g)||[]).length,total);assert.equal((source.match(/help:`<div class="help-stage">/g)||[]).length,total);assert.match(source,/Hilfe zu diesem Auftrag einblenden/);assert.match(source,/class="help-detail"/)}});
check('auch alle zwölf OneNote-Aufträge besitzen eine aufrufbare Hilfe',()=>{assert.equal((oneNote.match(/\n\s+(?:[1-9]|1[0-2]):\{title:'Hilfe zu Auftrag/g)||[]).length,12);assert.match(oneNote,/data-open-help/)});
check('Pflicht- und Zusatzaufträge werden korrekt gezählt',()=>{assert.equal((digiPen.match(/required:true/g)||[]).length,5);assert.equal((digiPen.match(/required:false/g)||[]).length,4);assert.equal((scan.match(/required:true/g)||[]).length,6);assert.equal((scan.match(/required:false/g)||[]).length,2);assert.match(portalJs,/countIds\(scan\.done,\[1,2,3,4,5,7\]\),total:6/)});
check('Schnellnavigation berücksichtigt die sichtbare Reihenfolge beider Workshops',()=>{assert.match(shellJs,/map\.id==='scan'\?\[1,2,3,4,5,7,6,8\]/);assert.match(scan,/const sequence=\[1,2,3,4,5,7,6,8\]/);assert.match(shellJs,/displayNumber/)});
check('bestehende Speicherschlüssel bleiben erhalten',()=>{for(const key of ['onenoteWorkshopGS1_student_v3','digitalArbeiten_digipen_v1','digitalArbeiten_scannen_v1'])assert.ok(portalJs.includes(key))});
check('freie Navigation bleibt erhalten',()=>assert.doesNotMatch(portalJs,/locked|gesperrt|prerequisite/i));
check('Rückkehrzustand berücksichtigt Scrollposition und Fokus',()=>{assert.match(shellJs,/portalScroll/);assert.match(shellJs,/portalFocus/);assert.match(shellJs,/selectionStart/)});
check('Screenshots öffnen im Dialog und führen zum Auftrag zurück',()=>{assert.match(shellJs,/id="portalLightbox"/);assert.match(shellJs,/Zurück zum Auftrag/);assert.match(shellJs,/removeAttribute\('target'\)/);assert.match(shellJs,/returnFocus\.focus/);assert.match(shellCss,/\.portal-lightbox/)});
check('Schriftvergrösserung ist global verfügbar',()=>{assert.match(index,/data-font-toggle/);assert.match(shellJs,/portal-large/)});
check('Workshopseiten verwenden die gemeinsame Navigation',()=>{for(const source of [oneNote,digiPen,scan]){assert.match(source,/assets\/workshop-shell\.css/);assert.match(source,/assets\/workshop-shell\.js/)}});
check('Scan-Workshop verwendet OneDrive statt der eingestellten Lens-App',()=>{assert.match(scan,/OneDrive-App/);assert.doesNotMatch(scan,/Microsoft Lens/)});
check('DigiPen-Aufträge sind konkret und lebensnah',()=>{for(const text of ['Einen freien Samstag planen','Eine Party planen','Meine Freizeit als Mindmap','Welche Handschrift erkennt OneNote?'])assert.match(digiPen,new RegExp(text.replace(/[?]/g,'\\?')));assert.doesNotMatch(digiPen,/Maschinenschrift|Eine echte Lernseite|Ein Treffen planen/);assert.match(digiPen,/Windows-Taste plus Umschalt-Taste plus S/);assert.match(digiPen,/mindmap-freizeit-beispiel\.svg/)});
check('DigiPen-Abschluss zeigt offene Aufträge und führt zu Woche 38',()=>{assert.match(digiPen,/id="completionScreen"/);assert.match(digiPen,/function showCompletion/);assert.match(digiPen,/data-finish-open/);assert.match(digiPen,/index\.html#woche-38/)});
check('Scan-Aufträge sind auf OneDrive und einen sinnvollen OCR-Fall abgestimmt',()=>{for(const text of ['Eine Packliste gut lesbar scannen','Einen Aushang sichern','Infos übernehmen, ohne alles abzutippen','Einen Mini-Comic als PDF machen'])assert.match(scan,new RegExp(text));assert.doesNotMatch(scan,/Sicher teilen|Scan unter schwierigen Bedingungen|Qualität prüfen und verbessern|Papier-Rätsel|Das Scan-Duell|Ein Tafelbild retten/);assert.match(scan,/https:\/\/www\.microsoft365\.com\//);assert.match(scan,/Text aus Bild kopieren/);assert.match(scan,/ocr-infozettel-beispiel\.svg/);assert.match(scan,/OneDrive\/Informatik\/Scannen\/Zusatzauftraege/)});
check('Scan-Abschluss zeigt offene Aufträge und führt zu Woche 38',()=>{assert.match(scan,/id="completionScreen"/);assert.match(scan,/function showCompletion/);assert.match(scan,/data-finish-open/);assert.match(scan,/index\.html#woche-38/)});
check('Guide-Navigation scrollt mit und verdeckt den Inhalt nicht',()=>{assert.doesNotMatch(portalCss,/\.guide-jumps\{position:sticky/);assert.match(portalCss,/\.guide-jumps\{position:relative/)});
check('Workshop-Hilfen enthalten keine redundanten Fortschrittsbuttons',()=>{for(const source of [oneNote,digiPen,scan])assert.doesNotMatch(source,/id="(?:exportProgress|importProgress|resetProgress|exportBtn|importFile|resetBtn)"/)});
check('Sicherung und Wiederherstellung sind erreichbar',()=>{assert.match(index,/id="exportAll"/);assert.match(index,/id="importAllButton"/);assert.match(portalJs,/informatik-lernportal-backup/)});
check('alter OneNote-Stand kann sicher zusammengeführt werden',()=>{assert.match(index,/id="importOneNoteButton"/);assert.match(portalJs,/function importOneNote/);assert.match(portalJs,/notes:\{\.\.\.importedNotes,\.\.\.currentNotes\}/)});
check('Umzugsassistent führt Lernende in drei Schritten durch den Import',()=>{assert.match(index,/id="migrationStartButton"/);assert.match(index,/data-migration-step="1"/);assert.match(index,/data-migration-step="2"/);assert.match(index,/data-migration-step="3"/);assert.match(index,/id="migrationPreview"/);assert.match(index,/id="migrationImportConfirm"/);assert.match(portalJs,/function setupMigration/);assert.match(portalJs,/Sie haben auf dieser Webseite bereits gearbeitet/)});
check('OneNote kann eine Transferdatei direkt exportieren',()=>{assert.match(oneNote,/data-help-tab="save"/);assert.match(oneNote,/id="saveTransferFile"/);assert.match(oneNote,/OneNote-Workshop-Arbeitsstand\.json/);assert.match(oneNote,/workshop:'OneNote Workshop GS1'/)});
check('responsive, reduzierte Bewegung und Druckansicht sind definiert',()=>{for(const css of [portalCss,shellCss]){assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/@media print/)}assert.match(portalCss,/@media\(max-width:680px\)/)});
check('Stylesheets besitzen ausgeglichene Blöcke',()=>{for(const [name,css] of [['portal.css',portalCss],['workshop-shell.css',shellCss]])assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,name)});
check('Schulmail-Zugang ist auf allen Einstiegspunkten aktiv',()=>{
  for(const name of htmlFiles){const source=fs.readFileSync(path.join(root,name),'utf8');assert.match(source,/assets\/student-access\.css/);assert.match(source,/assets\/student-access\.js/);assert.match(source,/student-access-check/)}
  const accessJs=fs.readFileSync(path.join(root,'assets','student-access.js'),'utf8');
  assert.match(accessJs,/stud\\.bffbern\\.ch/);
  assert.match(accessJs,/Kein Passwort nötig/);
  assert.match(accessJs,/Schulmail wechseln/);
});

const teacherHtml=fs.readFileSync(path.join(root,'lehrperson','index.html'),'utf8');
const teacherJs=fs.readFileSync(path.join(root,'assets','teacher.js'),'utf8');
const syncJs=fs.readFileSync(path.join(root,'assets','cloud-sync.js'),'utf8');
const workerSource=fs.readFileSync(path.resolve('src','worker.js'),'utf8');
const schemaSource=fs.readFileSync(path.resolve('schema.sql'),'utf8');
check('Lehrpersonenbereich für GS1B und GS1D ist vorhanden',()=>{assert.match(teacherHtml,/Lehrpersonenbereich/);assert.match(teacherHtml,/data-class="GS1B"/);assert.match(teacherHtml,/data-class="GS1D"/);assert.match(teacherHtml,/Nicht zugeordnet/);assert.match(teacherJs,/total_possible|Pflichtaufträge/)});
check('Lehrpersonenbereich zeigt datensparsame Fortschrittsdaten',()=>{assert.match(teacherHtml,/keine persönlichen Notiztexte/i);assert.match(teacherJs,/OneNote/);assert.match(teacherJs,/DigiPen/);assert.match(teacherJs,/Scannen/);assert.match(teacherJs,/requiredDone/)});
check('Cloud-Synchronisation ist auf den Lernenden-Seiten eingebunden',()=>{for(const name of htmlFiles){const source=fs.readFileSync(path.join(root,name),'utf8');assert.match(source,/assets\/cloud-sync\.js/)}assert.match(syncJs,/\/api\/progress/);assert.match(syncJs,/stud\\.bffbern\\.ch/);assert.doesNotMatch(syncJs,/notes:\s*read|notes\s*:/)});
check('Worker besitzt D1-API und beide Klassen',()=>{assert.match(workerSource,/GS1B/);assert.match(workerSource,/GS1D/);assert.match(workerSource,/\/api\/progress/);assert.match(workerSource,/\/lehrperson\/api\/students/);assert.match(workerSource,/env\.ASSETS\.fetch/)});
check('D1-Schema speichert nur Fortschrittsübersicht und Zuordnung',()=>{assert.match(schemaSource,/CREATE TABLE IF NOT EXISTS students/);assert.match(schemaSource,/class_name/);assert.match(schemaSource,/progress_json/);assert.doesNotMatch(schemaSource,/note_text|notes_text|personal_notes/)});

check('Klassenlisten GS1B und GS1D sind fest hinterlegt',()=>{assert.match(workerSource,/Raghad AlAbbar/);assert.match(workerSource,/Retaj Al Salloumi/);assert.match(workerSource,/robinsean\.klaus@stud\.bffbern\.ch/);assert.match(workerSource,/jael\.wuethrich@stud\.bffbern\.ch/);assert.match(workerSource,/ROSTER_BY_EMAIL/);});
check('bekannte Lernende werden automatisch ihrer Klasse zugeordnet',()=>{assert.match(workerSource,/class_name=COALESCE\(excluded\.class_name, students\.class_name\)/);assert.match(workerSource,/roster\?\.className/);assert.match(teacherJs,/Noch nicht gestartet/);assert.match(teacherHtml,/radarNotStarted/);});
check('Lehrpersonenadresse ist freigeschaltet und Link bleibt exklusiv',()=>{const accessJs=fs.readFileSync(path.join(root,'assets','student-access.js'),'utf8');assert.match(accessJs,/christoph\.marti@bffbern\.ch/);assert.match(accessJs,/function addTeacherLink/);assert.match(accessJs,/if\(!isTeacher\(email\)\)return/);assert.match(accessJs,/dataset\.teacherLink/);assert.match(accessJs,/href='\/lehrperson\/'/);assert.match(accessJs,/teacher-home-shortcut/);assert.match(accessJs,/Nur für Christoph Marti/);});


check('Unterricht-heute-Fokus ist im Lehrpersonenbereich vollständig vorhanden',()=>{assert.match(teacherHtml,/id="todayPanel"/);assert.match(teacherHtml,/id="saveTodayButton"/);assert.match(teacherHtml,/Fokus-Matrix/);assert.match(teacherJs,/focusFromForm/);assert.match(teacherJs,/today-open/);assert.match(teacherJs,/CSV exportiert/);});
check('Unterricht-heute-Fokus erscheint auf der Lernenden-Startseite',()=>{const todayJs=fs.readFileSync(path.join(root,'assets','today.js'),'utf8');assert.match(index,/id="studentTodayPanel"/);assert.match(index,/assets\/today\.js/);assert.match(todayJs,/\/api\/today/);assert.match(todayJs,/Offen/);assert.match(todayJs,/In Arbeit/);assert.match(todayJs,/Erledigt/);});
check('Worker speichert und liefert den Unterrichtsfokus',()=>{assert.match(workerSource,/CREATE TABLE IF NOT EXISTS class_today/);assert.match(workerSource,/function cleanTodayTasks/);assert.match(workerSource,/\/api\/today/);assert.match(workerSource,/\/lehrperson\/api\/today/);assert.match(schemaSource,/CREATE TABLE IF NOT EXISTS class_today/);});

check('keine offensichtlichen Zugangsdaten im Webordner',()=>{
  const all=htmlFiles.map(n=>fs.readFileSync(path.join(root,n),'utf8')).join('\n')+filesBelow(path.join(root,'assets')).filter(n=>/\.(?:css|js|html|txt)$/i.test(n)).map(n=>fs.readFileSync(n,'utf8')).join('\n');
  assert.doesNotMatch(all,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}|github_pat_/);
});

if(failures.length){console.error(`\n${failures.length} Prüfung(en) fehlgeschlagen:\n${failures.join('\n')}`);process.exit(1)}
console.log(`\n${htmlFiles.length} HTML-Dateien geprüft. Alle Strukturtests bestanden.`);
