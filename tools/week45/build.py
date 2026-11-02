from pathlib import Path
import json,re
from graphics import assets
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
data=json.loads((HERE/'content.json').read_text())
data['ASSETS']=assets()
for group,prefix in [('posterBad','ausgang'),('posterGood','muster')]:
 for i,svg in enumerate(data['ASSETS'][group]):(ROOT/f'dist/assets/week45/plakat-{i+1}-{prefix}.svg').write_text(svg)
s=(HERE/'template.html').read_text().replace('__ENHANCEMENTS__',(HERE/'enhancements.js').read_text())
for key,value in data.items():s=s.replace('__'+key+'__',json.dumps(value,ensure_ascii=False).replace('</','<\\/'))
js=re.findall(r'<script>(.*?)</script>',s,re.S)[-1]
s=s.replace('<script>'+js+'</script>','<script src="assets/werkstatt45.js"></script>')
(ROOT/'dist/assets/werkstatt45.js').write_text(js)
(ROOT/'dist/werkstatt45.html').write_text(s)
print('Built werkstatt45.html:',len(s.encode()),'bytes')
