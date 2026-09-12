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
check('Hauptnavigation vollständig',()=>{for(const id of ['start','wochen','grundlagen','training','fortschritt'])assert.match(index,new RegExp(`data-nav="${id}"`))});
check('Woche 37 enthält den OneNote Workshop',()=>{assert.match(index,/Woche<\/span><strong>37<\/strong>/);assert.match(index,/Einheit der Woche 37/);assert.match(index,/data-week37-progress/)});
check('vorbereitetes OneNote-Notizbuch wird korrekt benannt',()=>{assert.match(oneNote,/OneNote Workshop \[Vorname\] \[Nachname\]/);assert.doesNotMatch(oneNote,/Erstellen Sie ein neues Notizbuch/)});
check('echte OneNote-Orientierungsbilder sind eingebunden',()=>{for(const name of ['onenote-workshop-beispiel.jpg','onenote-navigation.jpg','onenote-einfuegen.jpg','onenote-stift-test.jpg','onenote-links-beispiel.jpg']){assert.match(oneNote,new RegExp(name));assert.ok(fs.existsSync(path.join(root,'assets','screenshots',name)),name)}});
check('OneNote-Fortschritt zählt alle 12 Aufgaben',()=>assert.match(portalJs,/onenote:\{done:count\(one\.doneTasks,1,12\),total:12/));
check('alle bestehenden Aufträge bleiben vorhanden',()=>{
  assert.equal((oneNote.match(/class="screen task-screen"/g)||[]).length,12);
  assert.equal((digiPen.match(/\{id:\d+,required:/g)||[]).length,7);
  assert.equal((scan.match(/\{id:\d+,required:/g)||[]).length,7);
});
check('bestehende Speicherschlüssel bleiben erhalten',()=>{for(const key of ['onenoteWorkshopGS1_student_v3','digitalArbeiten_digipen_v1','digitalArbeiten_scannen_v1'])assert.ok(portalJs.includes(key))});
check('freie Navigation bleibt erhalten',()=>assert.doesNotMatch(portalJs,/locked|gesperrt|prerequisite/i));
check('Rückkehrzustand berücksichtigt Scrollposition und Fokus',()=>{assert.match(shellJs,/portalScroll/);assert.match(shellJs,/portalFocus/);assert.match(shellJs,/selectionStart/)});
check('Schriftvergrösserung ist global verfügbar',()=>{assert.match(index,/data-font-toggle/);assert.match(shellJs,/portal-large/)});
check('Workshopseiten verwenden die gemeinsame Navigation',()=>{for(const source of [oneNote,digiPen,scan]){assert.match(source,/assets\/workshop-shell\.css/);assert.match(source,/assets\/workshop-shell\.js/)}});
check('Scan-Workshop verwendet OneDrive statt der eingestellten Lens-App',()=>{assert.match(scan,/OneDrive-App/);assert.doesNotMatch(scan,/Microsoft Lens/)});
check('Sicherung und Wiederherstellung sind erreichbar',()=>{assert.match(index,/id="exportAll"/);assert.match(index,/id="importAllButton"/);assert.match(portalJs,/informatik-lernportal-backup/)});
check('alter OneNote-Stand kann sicher zusammengeführt werden',()=>{assert.match(index,/id="importOneNoteButton"/);assert.match(portalJs,/function importOneNote/);assert.match(portalJs,/notes:\{\.\.\.importedNotes,\.\.\.currentNotes\}/)});
check('responsive, reduzierte Bewegung und Druckansicht sind definiert',()=>{for(const css of [portalCss,shellCss]){assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/@media print/)}assert.match(portalCss,/@media\(max-width:680px\)/)});
check('Stylesheets besitzen ausgeglichene Blöcke',()=>{for(const [name,css] of [['portal.css',portalCss],['workshop-shell.css',shellCss]])assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,name)});
check('keine offensichtlichen Zugangsdaten im Webordner',()=>{
  const all=htmlFiles.map(n=>fs.readFileSync(path.join(root,n),'utf8')).join('\n')+filesBelow(path.join(root,'assets')).filter(n=>/\.(?:css|js|html|txt)$/i.test(n)).map(n=>fs.readFileSync(n,'utf8')).join('\n');
  assert.doesNotMatch(all,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}|github_pat_/);
});

if(failures.length){console.error(`\n${failures.length} Prüfung(en) fehlgeschlagen:\n${failures.join('\n')}`);process.exit(1)}
console.log(`\n${htmlFiles.length} HTML-Dateien geprüft. Alle Strukturtests bestanden.`);
