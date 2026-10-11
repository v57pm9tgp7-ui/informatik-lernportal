(function () {
  'use strict';
  const clamp = (v,min,max,fallback) => Number.isFinite(Number(v)) ? Math.min(max,Math.max(min,Math.round(Number(v)))) : fallback;
  const text = (v,max=6000) => typeof v==='string'?v.slice(0,max):'';
  const basePlanner = () => ({minutes:45,mandatory:10,readiness:'unset',nextMinutes:45,nextDate:'',file:'',nextAction:'',remaining:{},session:{status:'idle',startedAt:'',elapsed:0,mandatoryDone:false,checksAtStart:[]},history:[]});
  const baseStudio = () => ({template:'',title:'',intro:'',blocks:[],reflection:''});
  function cleanPlanner(raw={}) {
    raw=raw&&typeof raw==='object'?raw:{};const p=basePlanner();
    p.minutes=clamp(raw.minutes,1,180,45);p.mandatory=clamp(raw.mandatory,0,180,10);p.nextMinutes=clamp(raw.nextMinutes,10,180,45);
    p.readiness=['done','open','released'].includes(raw.readiness)?raw.readiness:'unset';
    p.nextDate=/^\d{4}-\d{2}-\d{2}$/.test(raw.nextDate||'')?raw.nextDate:'';
    p.file=text(raw.file,500);p.nextAction=text(raw.nextAction,1500);
    for(let i=0;i<6;i++)if(raw.remaining?.[i]!==undefined)p.remaining[i]=clamp(raw.remaining[i],1,90,10);
    const s=raw.session||{};p.session={status:['running','paused','closed'].includes(s.status)?s.status:'idle',startedAt:!Number.isNaN(Date.parse(s.startedAt))?s.startedAt:'',elapsed:clamp(s.elapsed,0,10800,0),mandatoryDone:s.mandatoryDone===true,checksAtStart:Array.isArray(s.checksAtStart)?s.checksAtStart.filter(i=>Number.isInteger(i)&&i>=0&&i<6):[]};
    if(p.session.status==='running'&&!p.session.startedAt)p.session.status='paused';
    p.history=(Array.isArray(raw.history)?raw.history:[]).slice(-12).map(h=>({endedAt:text(h.endedAt,40),minutes:clamp(h.minutes,0,180,0),steps:clamp(h.steps,0,6,0),note:text(h.note,1500)}));return p;
  }
  function cleanStudio(raw={}) {
    raw=raw&&typeof raw==='object'?raw:{};return {template:text(raw.template,60),title:text(raw.title,160),intro:text(raw.intro,2000),reflection:text(raw.reflection,3000),blocks:(Array.isArray(raw.blocks)?raw.blocks:[]).slice(0,20).map((b,i)=>({id:'b'+i,title:text(b?.title,160),text:text(b?.text),extra:text(b?.extra,3000),image:/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(b?.image||'')&&(b.image.length<=180000)?b.image:'',caption:text(b?.caption,300)}))};
  }
  const estimate = s => {const n=s.minutes.match(/\d+/g)?.map(Number)||[5];return Math.ceil((n[0]+(n[1]||n[0]))/2);};
  function elapsed(planner,now=Date.now()) {
    const s=planner.session;return s.elapsed+(s.status==='running'?Math.max(0,Math.min(10800,(now-Date.parse(s.startedAt))/1000)):0);
  }
  function stale(planner,now=Date.now()){return planner.session.status==='running'&&now-Date.parse(planner.session.startedAt)>4*60*60*1000;}
  function plan(project,record,now=Date.now()) {
    const p=record.planner||basePlanner(),active=['running','paused'].includes(p.session.status);
    const spent=active?Math.floor(elapsed(p,now)/60):0,left=Math.max(0,p.minutes-spent),reserve=Math.min(left,p.minutes<=5?p.minutes:p.minutes<20?3:5);
    const mandatoryTotal=p.readiness==='open'&&!p.session.mandatoryDone?p.mandatory:0;
    const mandatory=Math.min(Math.max(0,left-reserve),mandatoryTotal),mandatoryOverflow=Math.max(0,mandatoryTotal-mandatory);
    let available=Math.max(0,left-reserve-mandatory);
    const all=project.steps.map((s,i)=>({index:i,title:s.title,minutes:p.remaining[i]??estimate(s)})).filter(s=>!record.checks.includes(s.index));
    if(!record.finishedAt)all.push({index:6,title:'Qualitätskriterien am Produkt prüfen',minutes:Math.max(1,project.quality.length-record.quality.length)});
    const total=all.reduce((sum,s)=>sum+s.minutes,0),today=[];
    for(const s of all){if(available<=0)break;const minutes=Math.min(s.minutes,available);today.push({...s,minutes,partial:minutes<s.minutes});available-=minutes;}
    const work=today.reduce((sum,s)=>sum+s.minutes,0),later=Math.max(0,total-work),nextBudget=Math.max(1,p.nextMinutes-5);
    return {spent,left,reserve,mandatory,mandatoryOverflow,today,work,total,later,nextSessions:Math.ceil((later+mandatoryOverflow)/nextBudget),free:available,stale:stale(p,now)};
  }
  const setups={
    tutorial:{noun:'Anleitung',intro:'Zielgruppe, benötigtes Programm / Gerät und Ausgangslage',body:'Was soll die Person tun?',extra:'Was sollte danach zu sehen sein?',hint:'Eine klare Handlung pro Schritt. Nennen Sie die Funktion oder Schaltfläche. Ergänzen Sie Ihr eigenes Bild.',reflection:'Ohne-Hilfe-Test: Beobachtung, Verbesserung und Hilfe bei einem häufigen Fehler',templates:[
      {id:'screenshot',name:'Screenshot erklären',description:'Fünf Stationen vom Ausschnitt bis zum lesbaren Bild.',title:'So erstellen Sie einen hilfreichen Screenshot',intro:'Für eine Person, die einen Bildausschnitt in eine Anleitung einfügen möchte.',titles:['Passende Ansicht öffnen','Ausschnitt aufnehmen','Bild einfügen','Wichtiges markieren','Lesbarkeit prüfen']},
      {id:'datei',name:'Datei wiederfinden',description:'Speichern, benennen und später wieder öffnen.',title:'So finden Sie Ihre Datei wieder',intro:'Für eine Person, die ihre gespeicherten Dateien oft suchen muss.',titles:['Projektordner öffnen','Datei sinnvoll benennen','Im richtigen Ordner speichern','Datei schliessen und wiederfinden','Öffnen und Inhalt prüfen']},
      {id:'eigen',name:'Meine eigene Anleitung',description:'Freies Thema mit fünf leeren Schrittkarten.',title:'',intro:'',titles:['Schritt 1','Schritt 2','Schritt 3','Schritt 4','Schritt 5']}
    ]},
    cockpit:{noun:'Cockpit-Entwurf',intro:'Wofür hilft Ihnen diese Seite im Alltag?',body:'Mein Inhalt',extra:'So prüfe ich diesen Bereich',hint:'Tragen Sie echte, überschaubare Aufgaben ein. Nutzen Sie erfundene Daten, wenn Sie das Beispiel später zeigen.',reflection:'Alltagstest: Was fand die Testperson schnell? Was habe ich geändert?',templates:[
      {id:'schule',name:'Schule im Griff',description:'Vier Bereiche für Aufträge, Termine, Links und ein Ziel.',title:'Mein Schul-Cockpit',intro:'Hier sehe ich, womit ich als Nächstes beginne.',titles:['Meine nächsten 3 Aufgaben','Meine nächsten 2 Termine','Meine 3 Schnellzugriffe','Mein erreichbares Wochenziel']},
      {id:'schnuppern',name:'Schnupperlehre vorbereiten',description:'Dieselbe klare Struktur für Ihre Vorbereitung.',title:'Bereit für die Schnupperlehre',intro:'Vorbereiten, Unterlagen finden und nichts Wichtiges vergessen.',titles:['3 Dinge, die ich vorbereite','2 wichtige Termine','3 Links zu meinen Unterlagen','Was ich in dieser Woche erreichen will']},
      {id:'eigen',name:'Mein eigener Aufbau',description:'Leere Bereiche, die Sie selbst benennen und füllen.',title:'',intro:'',titles:['Aufgaben (mindestens 3)','Termine (mindestens 2)','Schnellzugriffe (mindestens 3)','Mein Ziel']}
    ]},
    dokumente:{noun:'Dossier-Plan',intro:'Wozu braucht jemand diese drei Seiten – und warum in dieser Reihenfolge?',body:'Was gehört auf diese Seite?',extra:'Welche wichtige Angabe habe ich hier gefunden? Ist alles vollständig und lesbar?',hint:'Hier planen Sie Reihenfolge und Kontrolle. Die eigentliche dreiseitige PDF erstellen Sie im Scan- oder Bildweg des Auftrags.',reflection:'Mein Qualitätsnachweis: Dateiname, Dateigrösse, 3 gefundene Angaben und überprüfter Speicherort',templates:[
      {id:'openair',name:'Open-Air Nord',description:'Start mit dem vorhandenen Übungsmaterial.',title:'Mein Open-Air-Dossier',intro:'Erfundene Übungsdaten: Infos, Anreise und Packliste an einem Ort.',titles:['Seite 1: Tagesinfo (Blatt B)','Seite 2: Anreise (Blatt C)','Seite 3: Packliste (Blatt A)']},
      {id:'lernen',name:'Lernunterlagen ordnen',description:'Vom Überblick über das Beispiel zur Übung.',title:'Meine Lernunterlagen',intro:'Drei zusammengehörige Blätter ohne persönliche Angaben.',titles:['Seite 1: Überblick','Seite 2: Beispiel','Seite 3: Übung']},
      {id:'eigen',name:'Mein eigenes Dossier',description:'Drei freie Seiten mit eigener Reihenfolge.',title:'',intro:'',titles:['Seite 1','Seite 2','Seite 3']}
    ]},
    faktencheck:{noun:'Faktencheck-Karte',intro:'Die genaue Behauptung in einem überprüfbaren Satz',body:'Meine Aussage / mein Beleg',extra:'Quelle, genauer Fundort und Abrufdatum / Begründung',hint:'Formulieren Sie Belege in eigenen Worten. Zwei Links allein genügen nicht: Zeigen Sie, welche Aussage wo belegt wird.',reflection:'Gegenprüfung: Passen Urteil, Einschränkung und Belege zusammen?',templates:[
      {id:'inkognito',name:'Inkognito prüfen',description:'Prüffrage und zwei verschiedene Anbieter sind vorbereitet.',title:'Inkognito: Bin ich unsichtbar?',intro:'«Im Inkognitomodus kann niemand sehen, welche Webseiten ich besuche.»',titles:['Meine genaue Prüffrage','Quelle 1: Google Chrome-Hilfe','Quelle 2: Mozilla-Hilfe','Mein Urteil mit Einschränkung']},
      {id:'bild',name:'Bild oder Video prüfen',description:'Ursprung, Ort oder Zeit eines bekannten Beispiels prüfen.',title:'Stimmt der Kontext dieses Bildes?',intro:'',titles:['Behauptung und Originalfundort','Quelle 1: Ursprung und Kontext','Quelle 2: unabhängiger Abgleich','Mein Urteil und offene Fragen']},
      {id:'eigen',name:'Meine eigene Behauptung',description:'Ein freier Fall mit derselben Belegstruktur.',title:'',intro:'',titles:['Meine Prüffrage','Quelle 1','Quelle 2: andere Organisation','Mein begründetes Urteil']}
    ]},
    lifehacks:{noun:'Tricksammlung',intro:'Wem hilft Ihre Sammlung besonders?',body:'Nutzen und 2–3 konkrete Schritte',extra:'Mein eigener Test und eine Grenze des Tricks',hint:'Nennen Sie Gerät oder Programm. Beschreiben Sie einen wirklich ausgeführten Test und ergänzen Sie Ihr eigenes Bild.',reflection:'Test durch eine andere Person, meine Verbesserung und mein persönlicher Favorit mit Begründung',templates:[
      {id:'alltag',name:'Schneller im Schulalltag',description:'Fünf nützliche Tricks mit Platz für Ihre Tests.',title:'Fünf Tricks für meinen Schulalltag',intro:'Weniger suchen, übersichtlicher arbeiten, Fehler gezielt beheben.',titles:['Auf einer Webseite suchen','Geschlossenen Browser-Tab zurückholen','Zwei Fenster nebeneinander','Einen gezielten Screenshot aufnehmen','Eine harmlose Änderung rückgängig machen']},
      {id:'ordnung',name:'Ordnung und Kontrolle',description:'Fünf Ideen rund um Planen, Finden und Abgeben.',title:'Fünf Tricks für mehr Übersicht',intro:'Kleine Routinen, die meine Arbeit zuverlässiger machen.',titles:['OneNote-Checkliste nutzen','Auf einer Webseite suchen','Zwei Fenster nebeneinander','Einen Screenshot einfügen','Eine PDF vor der Abgabe prüfen']},
      {id:'eigen',name:'Meine eigene Auswahl',description:'Fünf freie Tippkarten für Ihre Entdeckungen.',title:'',intro:'',titles:['Tipp 1','Tipp 2','Tipp 3','Tipp 4','Tipp 5']}
    ]}
  };
  function makeTemplate(project,id){const t=setups[project.id]?.templates.find(x=>x.id===id);return t?{template:id,title:t.title,intro:t.intro,reflection:'',blocks:t.titles.map((title,i)=>({id:'b'+i,title,text:'',extra:'',image:'',caption:''}))}:baseStudio();}
  const hasWork=s=>!!(s.template||s.title||s.intro||s.blocks.length);
  const studioText=s=>[s.title,s.intro,...s.blocks.map(b=>[b.title,b.text,b.extra,b.caption].filter(Boolean).join('\n')),s.reflection].filter(Boolean).join('\n\n');
  globalThis.MediaInfoLearning={basePlanner,baseStudio,cleanPlanner,cleanStudio,estimate,elapsed,stale,plan,setups,makeTemplate,hasWork,studioText};
})();
