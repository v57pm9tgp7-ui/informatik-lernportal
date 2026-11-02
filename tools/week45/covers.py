"""Exact SVG previews of the four media projects, used by the shared catalogue."""
from pathlib import Path
from html import escape

OUT=Path(__file__).resolve().parents[2]/'dist/assets/week45'
def text(x,y,value,size=26,fill='#163b50',weight=600,anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'
def rect(x,y,w,h,fill,rx=12,stroke='none'):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
def line(d,color='#3a6d80',arrow=True):
    return f'<path d="{d}" stroke="{color}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"'+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def save(name,bg,body,title):
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 506" role="img" aria-label="{escape(title)}"><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 6 3.5 0 7" fill="none" stroke="#3a6d80" stroke-width="1.5"/></marker></defs><rect width="900" height="506" fill="{bg}"/><g font-family="Bahnschrift,Segoe UI,Arial,sans-serif">{body}</g></svg>'
    (OUT/f'cover-{name}.svg').write_text(svg)

# A four-frame spot with a recognisable everyday object.
body=rect(54,42,792,420,'#fff',18)+text(86,94,'VIER BILDER. EIN WERBESPOT.',30)
for i in range(4):
    x=86+i*188
    body+=rect(x,126,162,208,['#f5d5b7','#e7d9f0','#cfdfed','#cce4db'][i])
    body+=f'<g transform="translate({x+43} 166) rotate({[-12,8,0,0][i]} 38 60)">'+rect(0,0,76,115,['#be6a46','#915c91','#466f8b','#29725d'][i],6)+rect(7,9,62,96,'#fff6e8',3)
    for yy in [29,46,63,80]: body+=line(f'M18 {yy}H58','#b3a489',False)
    body+='</g>'+text(x+81,373,['Problem','Idee','Nutzen','Schluss'][i],22,anchor='middle')
body+=rect(86,406,728,9,'#dce8ed',4)+rect(86,406,500,9,'#ae583a',4)+text(814,443,'15–30 Sekunden',19,fill='#617681',anchor='end')
save('werbespot','#f3e8de',body,'Vier Bilder ergeben einen Werbespot')

# Branches match the six-slide example, without tiny text or crossing connectors.
body=text(56,57,'ZWEI ENTSCHEIDUNGEN. DREI ENDEN.',30)
body+=line('M450 124V155')+line('M390 205H175V335')+line('M510 205H650V235')+line('M600 287H485V362')+line('M700 287H780V362')
body+=rect(340,79,220,47,'#143e58')+text(450,112,'Start',26,'#fff',anchor='middle')
body+=rect(330,159,240,86,'#fff',14,'#adbed3')+text(450,212,'Entscheidung 1',25,anchor='middle')
body+=rect(535,242,230,78,'#fff',14,'#adbed3')+text(650,291,'Entscheidung 2',24,anchor='middle')
for x,y,color,label in [(70,348,'#c7e4dd','Ende A'),(380,378,'#d6dff0','Ende B'),(675,378,'#eed9b1','Ende C')]:
    body+=rect(x,y,210,65,color)+text(x+105,y+42,label,27,anchor='middle')
save('geschichte','#e8edf7',body,'Eine Geschichte mit zwei Entscheidungen und drei Enden')

# A visible design comparison, with genuinely different layout and hierarchy.
body=text(55,57,'PLAKAT: VORHER UND NACHHER.',30)
body+='<g transform="rotate(-4 238 267)">'+rect(87,98,304,325,'#eed896',10)
body+=text(110,152,'MEIN BERUF',30,'#a33f38')+text(167,210,'Tätigkeiten',19,'#6a4663')+text(110,253,'3 JAHRE',41,'#36686b')+text(196,304,'Wo arbeite ich?',17,'#574879')+text(115,355,'Das kann ich gut',21,'#974d32')+text(173,392,'Logistiker/in EFZ',22,'#325668')+'</g>'
body+=line('M420 269H475')+rect(520,94,293,335,'#fff',10)+rect(520,94,293,100,'#163f56',10)+text(543,132,'MEIN LEHRBERUF',20,'#a5d9d5')+text(543,170,'Logistiker/in EFZ',27,'#fff')
for y,label in [(233,'Was mache ich?'),(296,'Wo arbeite ich?'),(359,'Was hilft mir dabei?')]:
    body+=text(543,y,label,22)+line(f'M543 {y+18}H775','#c0d4dc',False)+line(f'M543 {y+31}H716','#d6e3e9',False)
body+=text(238,470,'Ausgangsplakat',22,anchor='middle')+text(666,470,'Ihre überarbeitete Fassung',22,anchor='middle')
save('plakat','#edf1e8',body,'Ein unübersichtliches Plakat wird neu gestaltet')

# Three readable app screens demonstrating content and a navigation path.
body=text(55,57,'EINE APP ZUM ANKLICKEN.',30)
for i,x in enumerate([150,375,600]):
    body+=rect(x,88,168,338,'#17364b',25)+rect(x+8,98,152,318,'#fff',19)+rect(x+60,108,48,6,'#17364b',3)
    body+=text(x+84,155,['Mein Schrank','Mein Outfit','Für morgen'][i],19,anchor='middle')
    body+=rect(x+19,177,130,159,['#edf2eb','#ebeff7','#edf2eb'][i],9)
    if i<2:
        body+=f'<g transform="translate({x+39} 199)"><path d="M20 4 0 25 16 42 25 34V102H65V34L74 42 90 25 70 4H57Q45 20 33 4Z" fill="{["#648b7b","#8594b2"][i]}"/></g>'
    else:
        body+=f'<circle cx="{x+84}" cy="246" r="37" fill="#36806a"/>'+line(f'M{x+65} 247L{x+79} 261L{x+107} 231','#fff',False)+text(x+84,315,'Ausgewählt',18,anchor='middle')
    body+=rect(x+20,357,128,35,'#1c645c',7)+text(x+84,381,['Auswählen','Merken','Zur Übersicht'][i],16,'#fff',anchor='middle')
body+=line('M329 267H360')+line('M554 267H585')+text(450,475,'Ansichten gestalten · Schaltflächen verbinden',24,anchor='middle')
save('app','#e2efeb',body,'Drei verbundene Ansichten einer Kleider-App')
print('Four SVG project covers built.')
