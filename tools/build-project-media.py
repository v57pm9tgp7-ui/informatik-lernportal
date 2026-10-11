"""Create the original illustrations and five narrated motion-graphic films.

Requirements: Python + Pillow, ffmpeg with libx264; no network or stock assets.
All examples, scene timings, captions and SVGs derive from project-media.json.
Run: python tools/build-project-media.py --audio-manifest /path/manifest.json
Add --stills-only to refresh illustrations and metadata without encoding video.
The required manifest comes from build-project-audio.py. Silent video generation
is intentionally not supported: a new project film always needs real narration.
"""
import argparse, hashlib, json, subprocess, html, tempfile, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/projects/media'; OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads((ROOT/'tools/project-media.json').read_text())
W,H=1280,720
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
NAVY='#102e44'; INK='#18364c'; MUTED='#466072'; WHITE='#ffffff'

class Canvas:
    def __init__(self):
        self.image=Image.new('RGB',(W,H),'#eef3f7'); self.d=ImageDraw.Draw(self.image); self.svg=[];self.boxes=[]
    def rect(self,box,fill,r=0,stroke=None,width=1):
        self.d.rounded_rectangle(box,radius=r,fill=fill,outline=stroke,width=width)
        x,y,x2,y2=box;self.svg.append(f'<rect x="{x}" y="{y}" width="{x2-x}" height="{y2-y}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="{width}"' if stroke else '')+'/>')
    def text(self,x,y,s,size=26,bold=False,color=INK):
        f=ImageFont.truetype(BOLD if bold else FONT,size);self.d.text((x,y),s,font=f,fill=color,anchor='lt')
        self.svg.append(f'<text x="{x}" y="{y+size*.81:.1f}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{html.escape(s)}</text>')
    def line(self,points,color,width=3):
        self.d.line(points,fill=color,width=width)
        self.svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>')
    def lines(self,s,size,width,bold=False):
        f=ImageFont.truetype(BOLD if bold else FONT,size);lines=[]
        for part in s.split('\n'):
            line=''
            for word in part.split():
                test=(line+' '+word).strip()
                if f.getlength(test)>width and line:lines.append(line);line=word
                else:line=test
            lines.append(line)
        return lines
    def para(self,x,y,s,width,height,size=26,bold=False,color=INK):
        while True:
            lines=self.lines(s,size,width,bold)
            if len(lines)*size*1.3<=height:break
            size-=1
            if size<20:raise ValueError(f'Text too dense: {s}')
        for i,line in enumerate(lines):self.text(x,y+round(i*size*1.3),line,size,bold,color)
    def card(self,box,title,body,accent,number=None,compact=False):
        x,y,x2,y2=box;self.rect(box,WHITE,16,'#d3dee6',2);self.rect((x,y,x+7,y2),accent,3)
        top=22
        if number is not None:
            self.rect((x+22,y+20,x+71,y+64),accent,12);self.text(x+32,y+30,f'{number:02}',24,True,WHITE);top=82
        self.para(x+24,y+top,title,x2-x-48,65 if not compact else 35,26 if not compact else 24,True)
        self.para(x+24,y+top+(77 if not compact else 43),body,x2-x-48,y2-y-top-(95 if not compact else 58),26 if not compact else 23,color=MUTED)
        self.boxes.append(box)

def browser_example(c,pid,index,cards,a):
    c.rect((40,181,806,540),WHITE,16,'#c4d4e0',2)
    c.rect((40,181,806,222),'#dbe5ec',16)
    c.text(62,193,'Beispielaufbau · kein App-Screenshot',18,False,MUTED)
    if pid=='tutorial':
        c.text(65,241,'Vorher: zu viel Bildschirm',22,True,MUTED)
        c.rect((65,276,395,492),'#e7edf2',9,'#b6cbd9',2)
        c.rect((79,292,153,475),'#b9cdda',6)
        for j in range(5):c.rect((167,294+j*23,364-j%2*60,304+j*23),'#c1d1dc',3)
        c.rect((232,435,365,475),a,6);c.text(244,449,'Speichern',19,True,WHITE)
        c.line([(380,455),(422,455),(422,310),(457,310)],a,4)
        c.line([(446,300),(457,310),(446,320)],a,4)
        c.text(458,241,'Nachher: der wichtige Teil',21,True,a)
        c.rect((458,279,780,406),'#f0eaf9',12,a,3)
        c.text(481,300,'Datei: Tutorial.pdf',23,True)
        c.rect((518,343,755,388),a,8);c.text(553,354,'Speichern',25,True,WHITE)
        c.para(461,432,'«Wählen Sie Speichern.»\nBild und Anweisung passen zusammen.',316,93,23)
        c.boxes.extend([(65,276,395,492),(458,279,780,406)])
    elif index==1:
        c.rect((62,243,783,290),'#edf3f8',7);c.text(79,258,'Strg + F',22,True,a)
        c.rect((482,251,761,282),WHITE,6,'#a9bfce',1);c.text(498,259,'Abgabe',18,True);c.text(694,259,'1 / 1',18,color=MUTED)
        c.text(76,324,'Mein Projekt · Termine',28,True)
        c.text(76,381,'Zwischentest: Dienstag',25,color=MUTED)
        c.rect((71,424,190,463),'#ffe99b',5);c.text(78,433,'Abgabe',25,True);c.text(197,433,': Freitag · 12:00',25)
        c.text(76,495,'Übungsangaben',18,color=MUTED)
        c.line([(590,292),(590,443),(443,443)],a,3);c.line([(455,434),(443,443),(455,452)],a,3)
        c.boxes.extend([(482,251,761,282),(71,424,451,463)])
    elif index==2:
        c.text(65,242,'1 · Eine Übungsseite schliessen',23,True)
        c.rect((65,283,765,340),'#dce6ee',10)
        c.rect((81,294,251,336),WHITE,8);c.text(97,306,'Aufträge',21,True)
        c.rect((267,294,477,336),'#f6e8e3',8);c.text(283,306,'Projektseite  ×',21,True)
        c.text(65,366,'2 · Strg + Umschalt + T',27,True,a)
        c.rect((65,418,765,500),'#dce6ee',10)
        c.rect((81,432,251,487),WHITE,8);c.text(97,451,'Aufträge',21,True)
        c.rect((267,432,499,487),'#d5eee1',8,'#80b49b',2);c.text(281,451,'Projektseite  ✓',21,True)
        c.line([(581,331),(620,331),(620,453),(517,453)],a,4);c.line([(529,443),(517,453),(529,463)],a,4)
        c.boxes.extend([(267,294,477,336),(267,432,499,487)])
    else:
        c.text(65,239,'Windows + Umschalt + S',27,True,a)
        c.rect((65,284,783,520),'#e7edf3',9,'#bccdd8',2)
        c.rect((81,300,239,503),'#c1d2dd',6)
        c.text(258,307,'Meine Anleitung',26,True)
        c.text(274,374,'Nur diesen Bereich',27,True)
        c.text(274,414,'braucht die Erklärung.',27)
        c.rect((253,350,758,462),'#f1eaf9',0)
        c.text(274,371,'Nur diesen Bereich',27,True)
        c.text(274,412,'braucht die Erklärung.',27)
        for x,y,dx,dy in [(251,350,22,22),(759,350,-22,22),(251,464,22,-22),(759,464,-22,-22)]:
            c.line([(x+dx,y),(x,y),(x,y+dy)],a,4)
        c.text(264,488,'Ausschnitt wählen und einfügen',19,color=MUTED)
        c.boxes.extend([(65,284,783,520),(251,350,759,464)])
    c.card((829,181,1240,540),cards[2][0],cards[2][1],a,3)

def draw_scene(pid,project,s,index,count,video=False):
    c=Canvas();a=project['accent'];c.rect((0,0,W,155),NAVY)
    c.text(40,27,'MEDIENINFOLAB  /  '+project['title'],21,True,'#bfd7e5')
    c.text(1140,27,f'{index+1:02} / {count:02}',20,True,'#bfd7e5')
    c.para(40,74,s['title'],1195,61,40,True,WHITE)
    cards=s['cards'];kind=s['kind']
    if kind=='board':
        for i,(title,body) in enumerate(cards):
            x=40+(i%2)*610;y=181+(i//2)*184
            c.card((x,y,x+590,y+169),title,body,a,compact=True)
    elif kind=='browser':
        browser_example(c,pid,index,cards,a)
    elif kind=='evidence':
        c.card((40,181,645,349),cards[0][0],cards[0][1],a,compact=True)
        c.card((40,370,645,540),cards[1][0],cards[1][1],a,compact=True)
        c.card((671,181,1240,540),cards[2][0],cards[2][1],a,3)
        for y in [280,450]:
            c.line([(630,y),(687,y)],a,4);c.line([(677,y-9),(687,y),(677,y+9)],a,4)
    else:
        for i,(title,body) in enumerate(cards):
            x=40+i*407;box=(x,181,x+386,540)
            c.card(box,title,body,a,i+1)
            if kind=='pages':
                c.rect((x+280,198,x+366,233),'#eef3f7',5)
                c.text(x+292,207,f'{i+1} / 3',19,True,MUTED)
            if kind in ['path','timeline'] and i<2:
                c.rect((x+370,342,x+410,382),NAVY,20)
                c.text(x+380,350,'›',25,True,WHITE)
    if video:
        # Keep the lower band clear for two subtitle lines. The key thought
        # remains above that band, and subtitles never cover the example cards.
        c.rect((40,553,1240,674),NAVY,14)
        c.para(62,566,s['why'],1150,32,23,False,WHITE)
    else:
        c.rect((40,566,1240,658),NAVY,14)
        c.text(62,584,'DARUM FUNKTIONIERT ES',17,True,'#a8d5d4')
        c.para(62,613,s['why'],1150,32,23,False,WHITE)
    c.text(40,685,'Eigenes Beispiel · übertragen, ausprobieren, verbessern',16,False,MUTED)
    c.text(1020,685,'KI-Sprecherin · Deutsch',16,False,MUTED)
    return c

def timestamp(seconds):
    milliseconds=round(seconds*1000)
    seconds,ms=divmod(milliseconds,1000);minutes,seconds=divmod(seconds,60);hours,minutes=divmod(minutes,60)
    return f'{hours:02}:{minutes:02}:{seconds:02}.{ms:03}'


def caption_cues(words,offset):
    groups=[];group=[]
    for word in words:
        proposed=' '.join(w['text'] for w in group+[word])
        if group and (len(proposed)>72 or len(group)>=12):
            groups.append(group);group=[]
        group.append(word)
        if word['text'].endswith(('.', '?', '!')) and len(' '.join(w['text'] for w in group))>=18:
            groups.append(group);group=[]
    if group:groups.append(group)
    result=[]
    for i,group in enumerate(groups):
        text=' '.join(w['text'] for w in group)
        lines=textwrap.wrap(text,width=38,break_long_words=False,break_on_hyphens=False)
        if len(lines)>2:
            # Balance two lines without breaking a German word.
            tokens=text.split();mid=min(range(1,len(tokens)),key=lambda n:abs(len(' '.join(tokens[:n]))-len(' '.join(tokens[n:]))))
            lines=[' '.join(tokens[:mid]),' '.join(tokens[mid:])]
        end=group[-1]['end']+.12
        if i+1<len(groups):end=min(end,groups[i+1][0]['start'])
        result.extend([f'{timestamp(offset+group[0]["start"])} --> {timestamp(offset+end)} line:84% position:50% align:center size:92%', '\n'.join(lines),''])
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio-manifest',type=Path,required=True)
    parser.add_argument('--stills-only',action='store_true')
    args=parser.parse_args()
    manifest=json.loads(args.audio_manifest.read_text())
    scripts=ROOT/'tools/project-narration.json'
    if manifest.get('scriptSha256')!=hashlib.sha256(scripts.read_bytes()).hexdigest():
        raise ValueError('Narration changed: regenerate audio before rendering.')
    if set(manifest['projects'])!=set(DATA):raise ValueError('Audio required for all five projects.')
    for pid,p in DATA.items():
        a=manifest['projects'][pid]
        if not Path(a['audio']).is_file() or len(a['scenes'])!=len(p['scenes']):
            raise ValueError('Missing audio/scenes: '+pid)
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',a['audio']]))
        if abs(float(probe['format']['duration'])-a['duration'])>.001:
            raise ValueError('Incomplete narration file: '+pid)
    metadata={}
    for pid,project in DATA.items():
        audio=manifest['projects'][pid];scenes=project['scenes'];frames=[];chapters=[];vtt=['WEBVTT','']
        time=audio['duration']
        for i,(s,timing) in enumerate(zip(scenes,audio['scenes'])):
            c=draw_scene(pid,project,s,i,len(scenes))
            frames.append(draw_scene(pid,project,s,i,len(scenes),video=True))
            filename=f'{pid}-{i+1:02}.svg'
            svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img"><title>'+html.escape(s['title'])+'</title><desc>'+html.escape(s['caption'])+'</desc><rect width="1280" height="720" fill="#eef3f7"/>'+''.join(c.svg)+'</svg>'
            (OUT/filename).write_text(svg)
            narration=[segment['text'] for segment in timing['segments']]
            chapters.append({**s,'seconds':timing['seconds'],'start':timing['start'],'image':filename,'narration':narration})
            for segment in timing['segments']:
                vtt.extend(caption_cues(segment['words'],timing['start']))
            if i==1:c.image.save(OUT/f'{pid}-poster.jpg',quality=90)
        (OUT/f'{pid}.vtt').write_text('\n'.join(vtt))
        transcript=project['title']+' – Sprechtext\n\n'
        for chapter in chapters:
            transcript+=timestamp(chapter['start'])+' · '+chapter['title']+'\n\n'+'\n\n'.join(chapter['narration'])+'\n\n'
        (OUT/f'{pid}-sprechtext.txt').write_text(transcript)
        metadata[pid]={'title':project['title'],'tag':project['tag'],'duration':time,
            'revision':manifest['scriptSha256'][:12], 'narration':manifest['voice'],'chapters':chapters}
        if not args.stills_only:
            video=OUT/f'{pid}.mp4';fps=12
            with tempfile.TemporaryDirectory() as tmp:
                temp=Path(tmp)/'film.mp4'
                cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(fps),'-i','-','-i',audio['audio'],'-map','0:v:0','-map','1:a:0','-c:v','libx264','-threads','2','-preset','fast','-crf','27','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-ar','48000','-metadata:s:a:0','language=deu','-movflags','+faststart','-shortest',str(temp)]
                process=subprocess.Popen(cmd,stdin=subprocess.PIPE)
                for i,(s,c,timing) in enumerate(zip(scenes,frames,audio['scenes'])):
                    for frame in range(timing['frames']):
                        t=frame/fps;im=c.image.copy();d=ImageDraw.Draw(im)
                        # The highlight follows spoken paragraphs, not an arbitrary timer.
                        current=timing['segments'][0]
                        for segment in timing['segments']:
                            if t>=segment['start']:current=segment
                        b=c.boxes[current['focus']]
                        d.rounded_rectangle((b[0]-3,b[1]-3,b[2]+3,b[3]+3),radius=18,outline=project['accent'],width=4)
                        d.rectangle((0,711,W,719),fill='#d7e3eb');d.rectangle((0,711,round(W*(timing['start']+t)/time),719),fill=project['accent'])
                        if i>0 and t<0.25:im=Image.blend(frames[i-1].image,im,min(1,t/.25))
                        process.stdin.write(im.tobytes())
                process.stdin.close()
                if process.wait()!=0:raise RuntimeError('Video render failed: '+pid)
                video.write_bytes(temp.read_bytes())
            print(f'{pid}: {time:.2f}s, {video.stat().st_size/1024:.0f} KiB, AAC narration',flush=True)
    (ROOT/'dist/assets/projects-media-data.js').write_text('globalThis.MediaInfoProjectMedia = '+json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+';\n')
    print('Narrated films, illustrations, spoken captions and chapter metadata ready.',flush=True)


if __name__=='__main__':main()
