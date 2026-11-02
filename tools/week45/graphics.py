"""Original, exact SVG teaching diagrams and poster comparisons. No external assets."""
from html import escape

def text(s,x,y,size=28,color='#24364b',weight=400,font='Arial'):
 return f'<text x="{x}" y="{y}" font-family="{font},sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(s)}</text>'
def lines(rows,x,y,size=28,color='#24364b',weight=400,gap=None):
 return ''.join(text(t,x,y+i*(gap or size*1.4),size,color,weight) for i,t in enumerate(rows))
def start(w,h,bg,title):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{escape(title)}</title><rect width="{w}" height="{h}" fill="{bg}"/>'
def rect(x,y,w,h,fill,stroke='none',r=12):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def end(s):return s+'</svg>'
def job(good):
 s=start(1400,900,'#f4f1e8' if good else '#fff1aa','Berufsporträt Logistiker/in EFZ, '+('überarbeitet' if good else 'Ausgangsplakat'))
 if good:
  s+=rect(0,0,440,900,'#173b56',r=0)+text('MEIN LEHRBERUF',45,80,25,'#d9c9a0',700)
  s+=lines(['Logistiker/in','EFZ'],45,210,57,'#ffffff',700)+lines(['Fachrichtung','Lager'],45,400,35,'#ffffff')
  s+=rect(45,605,350,155,'#eacb72')+text('3 Jahre',65,666,47,'#173b56',700)+text('bis zum EFZ',65,717,29,'#173b56')
  s+=text('Was mache ich?',500,100,40,'#173b56',700)+lines(['Waren annehmen und kontrollieren.','Waren richtig einlagern.','Bestellungen für den Versand vorbereiten.'],500,165,29,gap=48)
  s+=text('Wo arbeite ich?',500,365,40,'#173b56',700)+lines(['Zum Beispiel in Lagerhallen und','Verteilzentren.'],500,428,30)
  s+=text('Was hilft mir dabei?',500,600,40,'#173b56',700)+lines(['Systematisch und sorgfältig arbeiten.','Im Team arbeiten und körperlich belastbar sein.'],500,663,29,gap=46)
  s+=text('Quelle: berufsberatung.ch · Logistiker/in EFZ · 02.11.2026',500,850,21)
 else:
  s+=text('MEGA BERUF!!!',65,120,88,'#9a2687',700,'Georgia')+text('Lager',1030,65,28,'#8a8707')
  s+=rect(850,170,490,190,'#ffa743',r=0)+text('3 JAHRE',880,285,81,'#b84b28',700,'Courier New')
  s+=text('Logistiker/in EFZ',140,440,43,'#757612',400,'Georgia')
  s+=lines(['Waren annehmen und kontrollieren.','Waren richtig einlagern.','Bestellungen für den Versand vorbereiten.'],65,575,23,'#7a7218',gap=29)
  s+=lines(['Lagerhallen, Verteilzentren.','Systematisch, sorgfältig, teamfähig,','körperlich belastbar.'],800,515,23,'#c23a92',gap=35)
  s+=text('DAS IST MEIN LEHRBERUF',310,780,49,'#176589',700,'Times New Roman')
  s+=text('Quelle: berufsberatung.ch · Logistiker/in EFZ · 02.11.2026',50,862,19,'#555427')
 return end(s)
def ngo(good):
 s=start(900,1200,'#edf3e8' if good else '#dbe7ee','WWF Schweiz: '+('überarbeitetes NGO-Porträt' if good else 'unübersichtliches Ausgangsplakat'))
 if good:
  s+=text('PORTRÄT EINER NGO',55,75,22,'#526d48',700)+text('WWF Schweiz',55,165,67,'#173e31',700)
  s+=lines(['Natur schützen.','Zukunft ermöglichen.'],55,260,49,'#173e31',700,gap=64)
  s+=rect(55,405,790,155,'#173e31')+text('DAS ZIEL',80,453,22,'#bcd3aa',700)+lines(['Einen lebenswerten Planeten für','kommende Generationen erhalten.'],80,502,30,'#ffffff')
  s+=text('Daran arbeitet der WWF',55,650,36,'#173e31',700)
  for i,(n,t) in enumerate([('01','Wälder und Meere schützen'),('02','Arten erhalten'),('03','Das Klima schützen')]):
   y=725+i*73;s+=text(n,65,y,28,'#5e7f4e',700)+text(t,135,y,32,'#173e31')
  s+=text('So geht die Organisation vor',55,1000,33,'#173e31',700)+lines(['Bildung und Zusammenarbeit mit Wirtschaft,','Finanzwesen und Politik.'],55,1055,28,'#173e31')
  s+=lines(['Quelle: wwf.ch · Über den WWF Schweiz · 02.11.2026','Unterrichtsporträt, keine offizielle WWF-Publikation.'],55,1150,17,'#52654c',gap=26)
 else:
  s+='<circle cx="450" cy="310" r="260" fill="#b7d0d8"/><circle cx="390" cy="265" r="60" fill="#82a5b0"/><circle cx="600" cy="380" r="95" fill="#829aaa"/>'
  s+=text('NATUR',120,400,140,'#dae6eb',700)+text('WWF Schweiz',540,635,27,'#6c8995',400,'Georgia')
  s+=lines(['Einen lebenswerten Planeten für kommende Generationen erhalten.','Wälder und Meere schützen, Arten erhalten, Klima schützen.','Bildung und Zusammenarbeit mit Wirtschaft, Finanzwesen und Politik.'],45,800,19,'#77919d',gap=25)
  s+=text('PORTRÄT EINER NGO',65,1020,30,'#77919d')
  s+=lines(['Quelle: wwf.ch · Über den WWF Schweiz · 02.11.2026','Unterrichtsporträt, keine offizielle WWF-Publikation.'],50,1140,16,'#6f8a96',gap=25)
 return end(s)
def body(good):
 s=start(1100,1100,'#f5f9fc' if good else '#f7e7ee','Atmungssystem: '+('geordnetes Informationsplakat' if good else 'Ausgangsplakat ohne klare Leserichtung'))
 if good:
  s+=text('DAS ATMUNGSSYSTEM',50,100,52,'#17496d',700)+text('Luft hinein. Gase austauschen.',50,158,32,'#406178')
  s+=text('1 · Der Weg der Luft',50,248,33,'#17496d',700)
  nodes=[(50,280,300,100,'Nase oder Mund'),(400,280,300,100,'Luftröhre'),(750,280,300,100,'Bronchien')]
  for x,y,w,h,t in nodes:s+=rect(x,y,w,h,'#d9eaf5')+text(t,x+18,y+60,30,'#17496d',700)
  s+=text('→',355,344,36)+text('→',707,344,36)
  s+='<path d="M900 380V420H510V450" stroke="#315e7d" stroke-width="3" fill="none"/>'+text('↓',497,463,31)
  s+=rect(350,475,350,80,'#bcd8e9')+text('Lungenbläschen',380,525,32,'#17496d',700)
  s+=text('2 · Dort findet der Gasaustausch statt',50,640,32,'#17496d',700)
  s+=rect(50,690,325,185,'#e4eef3')+rect(725,690,325,185,'#f8e7dc')
  s+=text('Lungenbläschen',78,735,30,'#17496d',700)+text('Blut',755,735,30,'#8b4229',700)
  s+='<path d="M395 785H700l-13 -8m13 8-13 8" stroke="#17496d" stroke-width="4" fill="none"/>'+text('Sauerstoff',455,765,25,'#17496d')
  s+='<path d="M700 845H395l13 -8m-13 8 13 8" stroke="#8b4229" stroke-width="4" fill="none"/>'+text('Kohlendioxid',430,827,25,'#8b4229')
  s+=text('Kohlendioxid wird anschliessend ausgeatmet.',50,911,25,'#406178')
  s+=text('3 · Die Atembewegung',50,950,31,'#17496d',700)+text('Das Zwerchfell hilft, den Brustraum beim Atmen zu bewegen.',50,1000,27)
  s+=text('Quelle: gesundheitsinformation.de · Wie funktioniert die Lunge? · 02.11.2026',50,1067,18)
 else:
  s+=rect(40,40,1020,160,'#bd4c74',r=0)+text('WAS PASSIERT IM KÖRPER?',65,135,49,'#ffffff',700,'Georgia')
  s+=rect(45,240,365,210,'#e0d1e5',r=0)+lines(['Sauerstoff gelangt aus','den Lungenbläschen','ins Blut.'],65,295,26,'#614565',gap=44)
  s+=rect(515,300,530,90,'#e6b7c5',r=0)+text('DAS ATMUNGSSYSTEM',535,357,37,'#943c60',700)
  s+=lines(['Nase/Mund → Luftröhre → Bronchien','→ Lungenbläschen'],400,530,23,'#6d496e',gap=35)
  s+=rect(610,670,440,190,'#c6b3d6',r=0)+lines(['Das Zwerchfell hilft,','den Brustraum beim','Atmen zu bewegen.'],635,722,29,'#503c6a')
  s+=lines(['Kohlendioxid gelangt aus','dem Blut in die','Lungenbläschen.'],65,810,30,'#9d365a',gap=50)
  s+=text('Kohlendioxid wird anschliessend ausgeatmet.',440,990,22,'#7c5974')
  s+=text('Quelle: gesundheitsinformation.de · Wie funktioniert die Lunge? · 02.11.2026',40,1055,18,'#7c5974')
 return end(s)
def story():
 s=start(1120,820,'#f2f6fa','Bauplan der Entscheidungsgeschichte mit sechs Folien, zwei Entscheidungen und drei Enden')
 s+='<defs><marker id="a" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0 0L9 3L0 6" fill="#52738e"/></marker></defs>'
 def box(x,y,w,h,title,sub,fill='#ffffff'):
  return rect(x,y,w,h,fill,'#a4b6c4')+text(title,x+20,y+37,25,'#203e58',700)+text(sub,x+20,y+70,19)
 def arrow(path):return f'<path d="{path}" stroke="#52738e" stroke-width="3" fill="none" marker-end="url(#a)"/>'
 s+=box(375,30,370,100,'1 · Start','Eine Nachricht mit zwei Tickets')+arrow('M560 130V185')
 s+=box(375,190,370,105,'2 · Entscheidung 1','Nachfragen oder ignorieren?','#e8f1f8')
 s+=arrow('M375 245H185V410')+text('Ignorieren',60,350,22)
 s+=arrow('M745 245H905V410')+lines(['Bekannte Nummer','anrufen'],660,345,22)
 s+=box(25,415,340,115,'4 · Ende A','Ein ruhiger Abend','#f6ecd7')
 s+=box(670,415,425,115,'3 · Entscheidung 2','Anlass ab 18 – Sie sind 17.','#e8f1f8')
 s+=arrow('M775 530V610H610V650')+text('Trotzdem hingehen',450,594,21)
 s+=arrow('M995 530V650')+lines(['Anderen Abend','planen'],800,575,21)
 s+=box(410,660,335,110,'5 · Ende B','Kein Einlass','#f6ecd7')+box(770,660,325,110,'6 · Ende C','Ein anderer Plan','#f6ecd7')
 s+=text('Jedes Ende: «Noch einmal» → Folie 1',25,806,24,'#526579',700)
 return end(s)
def wireframe():
 s=start(1080,650,'#f1f6f8','Schematische App-Fläche: Titel oben, Inhalt in der Mitte, Hauptaktion unten, Rückweg darunter')
 s+=rect(60,30,360,590,'#ffffff','#264d63',28)+rect(85,60,310,70,'#e1eee8')+text('APP-NAME',106,105,26,'#225b48',700)
 s+=rect(85,160,310,210,'#f1f5f3')+lines(['Titel dieser Ansicht','Ein kurzer Text.','Nur das, was man','jetzt braucht.'],106,205,24,gap=42)
 s+=rect(85,425,310,65,'#246a55')+text('Details ansehen',113,466,27,'white',700)+rect(85,510,310,60,'#e1eee8')+text('Zurück',190,548,24,'#225b48',700)
 for y,t,sub in [(95,'1 · Orientierung','App-Name immer am gleichen Ort.'),(245,'2 · Inhalt','Ein Thema und wenige klare Sätze.'),(457,'3 · Hauptaktion','Konkretes Verb statt «OK».'),(545,'4 · Rückweg','Ab Ansicht 2 immer erreichbar.')]:
  s+=f'<path d="M430 {y}H490" stroke="#7095a2" stroke-width="2"/>'+text(t,520,y-7,27,'#254e62',700)+text(sub,520,y+28,23)
 return end(s)
def link():
 s=start(1080,620,'#f1f6f8','Schematischer Linkdialog: Button auf Folie 3 markieren und Folie 4 als Ziel wählen')
 s+=text('FOLIE 3 · DETAIL',40,55,24,'#24556b',700)+rect(40,90,350,420,'#ffffff','#8ea9b5')+text('Schwarze Trinkflasche',65,150,25,'#234e61',700)
 s+=lines(['Metallflasche mit','blauem Deckel.'],65,215,26)+rect(65,350,300,65,'#216b55')+text('Abholort ansehen',85,392,26,'white',700)
 s+='<rect x="77" y="363" width="278" height="41" fill="none" stroke="#ffcc47" stroke-width="3" stroke-dasharray="7 5"/>'
 s+=text('1 · Den Text markieren',40,565,25,'#234e61',700)
 s+=text('→',423,283,62,'#52768a')+rect(510,90,530,420,'#ffffff','#8ea9b5')+text('Link einfügen',535,140,29,'#234e61',700)
 s+=text('Diese Präsentation',535,192,25,'#254e62',700)+lines(['1 Start','2 Auswahl','3 Details'],555,246,24,gap=42)
 s+=rect(535,348,475,53,'#dcf0e4')+text('✓ 4 Abholort',555,383,26,'#16543f',700)+text('5 Bestätigung',555,438,24)
 s+=rect(810,460,200,42,'#216b55')+text('Einfügen',851,489,23,'white',700)+text('2 · Ziel wählen und bestätigen',510,565,25,'#234e61',700)
 s+=text('Schema, kein Screenshot. Bezeichnungen können je nach PowerPoint-Version abweichen.',40,608,20,'#5b6f7c')
 return end(s)
POSTER_INFO=[
 dict(name='Mein Lehrberuf',subtitle='Logistiker/in EFZ · Fachrichtung Lager',facts=['Ausbildung: drei Jahre bis zum EFZ.','Aufgaben: Waren annehmen und kontrollieren, richtig einlagern und Bestellungen für den Versand vorbereiten.','Arbeitsorte: zum Beispiel Lagerhallen und Verteilzentren.','Hilfreich: systematische, sorgfältige Arbeitsweise, Teamfähigkeit und körperliche Belastbarkeit.'],source='https://www.berufsberatung.ch/de/berufe/logistiker-in-efz',label='berufsberatung.ch · Logistiker/in EFZ',changes=['Vorher war «Mega Beruf» am grössten. Jetzt steht der Berufsname im Vordergrund. Dadurch erkennt man sofort das Thema.','Vorher waren Aufgaben und Anforderungen über die Fläche verteilt. Jetzt bilden drei Überschriften klare Gruppen. Dadurch findet man die passende Information schnell.','Vorher konkurrierten mehrere Schriften und bunte Flächen. Jetzt verbinden eine Schrift, Blau und ein gelber Akzent die Inhalte. Dadurch wird das Plakat ruhiger und lesbarer.']),
 dict(name='Porträt einer NGO',subtitle='WWF Schweiz',facts=['Ziel: einen lebenswerten Planeten für kommende Generationen erhalten.','Themen: Wälder und Meere schützen, Arten erhalten und das Klima schützen.','Arbeitsweise: Bildung sowie Zusammenarbeit mit Wirtschaft, Finanzwesen und Politik.','Kennzeichnung: Unterrichtsporträt, keine offizielle WWF-Publikation.'],source='https://www.wwf.ch/de/ueber-den-wwf-schweiz',label='WWF Schweiz · Über den WWF Schweiz',changes=['Vorher nahm eine dekorative Grafik fast die halbe Seite ein. Jetzt eröffnet der Name das Porträt. Dadurch ist klar, welche Organisation vorgestellt wird.','Vorher standen alle Fakten in einem kleinen Textstreifen. Jetzt sind Ziel, Themen und Arbeitsweise getrennt. Dadurch versteht man, wofür der WWF steht und wie er arbeitet.','Vorher war die helle Schrift kaum vom Hintergrund zu unterscheiden. Jetzt sorgt dunkelgrüne Schrift für Kontrast. Dadurch kann man die Inhalte auch aus etwas Abstand lesen.']),
 dict(name='Plakat über ein Körpersystem',subtitle='Das Atmungssystem',facts=['Weg der Luft: Nase oder Mund → Luftröhre → Bronchien → Lungenbläschen.','Gasaustausch: Sauerstoff gelangt aus den Lungenbläschen ins Blut.','Kohlendioxid gelangt aus dem Blut in die Lungenbläschen und wird ausgeatmet.','Das Zwerchfell hilft bei der Atembewegung.'],source='https://www.gesundheitsinformation.de/wie-funktioniert-die-lunge.html',label='IQWiG · Wie funktioniert die Lunge?',changes=['Vorher standen die Vorgänge ohne Leserichtung auf dem Plakat. Jetzt gliedern drei nummerierte Bereiche den Ablauf. Dadurch kann man der Erklärung folgen.','Vorher war der Luftweg nur eine kleine Textzeile. Jetzt verbinden beschriftete Kästen die Stationen. Dadurch wird die Reihenfolge sichtbar.','Vorher waren die beiden Gase räumlich verstreut. Jetzt zeigen beschriftete Pfeile die entgegengesetzten Richtungen. Dadurch werden Sauerstoffaufnahme und Kohlendioxidabgabe unterscheidbar.'])]
def assets():
 return dict(photo='',video='assets/week45/werbespot-nochmal.mp4',posterBad=[job(False),ngo(False),body(False)],posterGood=[job(True),ngo(True),body(True)],posterInfo=POSTER_INFO,storySchema=story(),wireframe=wireframe(),linkSchema=link())
