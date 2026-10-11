"""Verify the delivered films, not just the build configuration.

Run after both media build scripts. Decodes all audio/video and measures the
encoded AAC loudness/true peaks; validates real durations against the website.
This technical check is not a substitute for a human listening review.
"""
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'dist/assets/projects/media'
raw = (ROOT/'dist/assets/projects-media-data.js').read_text()
media = json.loads(raw.split(' = ',1)[1].rstrip().removesuffix(';'))
results = []

for pid, expected in media.items():
    video = OUT/(pid+'.mp4')
    probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams',
                                               '-show_format','-of','json',str(video)]))
    audio = [s for s in probe['streams'] if s['codec_type']=='audio']
    visual = [s for s in probe['streams'] if s['codec_type']=='video']
    assert len(audio)==len(visual)==1, pid+' requires exactly one audio/video stream'
    assert audio[0]['codec_name']=='aac' and audio[0]['tags']['language']=='deu', pid
    assert visual[0]['codec_name']=='h264' and visual[0]['pix_fmt']=='yuv420p', pid
    assert (visual[0]['width'],visual[0]['height'])==(1280,720), pid
    for stream in audio+visual:
        assert abs(float(stream['duration'])-expected['duration'])<.15, pid+' duration mismatch'
    # Full decode, including the final frames and the final spoken sentence.
    subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(video),'-map','0:v:0',
                    '-map','0:a:0','-f','null','-'],check=True)
    measured = subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-vn','-af',
        'loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json','-f','null','-'],
        check=True,capture_output=True,text=True)
    stats = json.loads(measured.stderr[measured.stderr.rfind('{'):])
    loudness,peak = float(stats['input_i']),float(stats['input_tp'])
    assert -17 <= loudness <= -15, f'{pid} loudness {loudness}'
    # Allow 0.05 dB measurement/codec tolerance around 1 dB of final headroom.
    assert peak <= -.95, f'{pid} encoded true peak {peak}'
    data=video.read_bytes();offset=0;atoms=[]
    while offset+8<=len(data):
        size=int.from_bytes(data[offset:offset+4],'big');name=data[offset+4:offset+8]
        if size==1:size=int.from_bytes(data[offset+8:offset+16],'big')
        if size==0:size=len(data)-offset
        assert size>=8, pid+' invalid MP4 atom'
        atoms.append(name);offset+=size
    assert atoms.index(b'moov')<atoms.index(b'mdat'), pid+' not fast-start'
    row={'project':pid,'seconds':expected['duration'],'bytes':video.stat().st_size,
         'audio':audio[0]['codec_name'],'LUFS':loudness,'dBTP':peak,'decode':'passed'}
    results.append(row)
    print(json.dumps(row,ensure_ascii=False),flush=True)

assert len(results)==5
print('All five narrated films passed.',flush=True)
