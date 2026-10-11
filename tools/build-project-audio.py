"""Generate the reviewed project scripts as timed German female narration.

Requires edge-tts==7.2.8 and ffmpeg. Text is sent to Microsoft's online speech
service. Only the public lesson scripts are sent; no learner data is involved.
Audio and word timings are cached outside the repository, with content hashes.
Run: python tools/build-project-audio.py --output /absolute/path/to/audio-cache
The resulting manifest is consumed by build-project-media.py --audio-manifest.
"""
import argparse
import asyncio
import hashlib
import importlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import wave

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
RATE = 24000
FPS = 12
VOICE = 'de-DE-SeraphinaMultilingualNeural'
PROSODY = '-5%'


def run(args):
    return subprocess.run(args, check=True, capture_output=True).stdout


def normal(s):
    return ''.join(c.lower() for c in s if c.isalnum())


def align_words(script, boundaries):
    """Restore the exact script spelling/punctuation using real word timings."""
    tokens = list(re.finditer(r'\S+', script))
    words = [b for b in boundaries if b['type'] == 'WordBoundary']
    expected = ''.join(normal(t.group()) for t in tokens)
    actual = ''.join(normal(b['text']) for b in words)
    if expected != actual:
        raise ValueError(f'Word timing mismatch: {script!r} versus {actual!r}')
    spans = []
    cursor = 0
    for b in words:
        end = cursor + len(normal(b['text']))
        spans.append((cursor, end, b['offset']/1e7, (b['offset']+b['duration'])/1e7))
        cursor = end
    result = []
    cursor = 0
    for t in tokens:
        end = cursor + len(normal(t.group()))
        match = [b for b in spans if b[1] > cursor and b[0] < end]
        if not match:
            raise ValueError('Unmatched script token: '+t.group())
        result.append({'text': t.group(), 'start': match[0][2], 'end': match[-1][3]})
        cursor = end
    return result


async def synthesize(cache, pid, scene, number, segment, semaphore):
    script = segment['text']
    digest = hashlib.sha256(json.dumps([VOICE, PROSODY, script], ensure_ascii=False).encode()).hexdigest()
    stem = f'{pid}-{scene+1:02}-{number+1:02}-{digest[:12]}'
    audio = cache/(stem+'.mp3')
    timings = cache/(stem+'.jsonl')
    done = cache/(stem+'.ok')
    async with semaphore:
        cached = done.exists() and audio.exists() and timings.exists()
        # A cache marker alone is not proof of a complete sound file. Validate
        # its decoded duration and every expected word before using it.
        for attempt in range(3):
            candidate, candidate_times = audio, timings
            if not cached:
                candidate, candidate_times = cache/(stem+'.part.mp3'), cache/(stem+'.part.jsonl')
                # Add the managed CA to trusted roots; TLS verification stays on.
                ca = os.environ.get('SSL_CERT_FILE')
                if ca:
                    importlib.import_module('edge_tts.communicate')._SSL_CTX.load_verify_locations(cafile=ca)
                speech = edge_tts.Communicate(script, voice=VOICE, rate=PROSODY,
                                              boundary='WordBoundary', receive_timeout=45)
                await asyncio.wait_for(speech.save(str(candidate), str(candidate_times)), timeout=90)
            try:
                boundaries = [json.loads(line) for line in candidate_times.read_text().splitlines() if line.strip()]
                aligned = align_words(script, boundaries)
                pcm = run(['ffmpeg','-v','error','-i',str(candidate),'-f','s16le','-ar',str(RATE),'-ac','1','-'])
                duration = len(pcm)/(2*RATE)
                if duration < 1 or not aligned or aligned[-1]['end'] > duration+.15:
                    raise ValueError('Incomplete audio: '+stem)
            except ValueError:
                if attempt==2:raise
                cached=False
                print('Regenerating incomplete segment: '+stem,flush=True)
                continue
            if candidate!=audio:
                candidate.replace(audio);candidate_times.replace(timings)
            done.write_text(json.dumps({'sourceSha256':digest,
                'audioSha256':hashlib.sha256(audio.read_bytes()).hexdigest(),
                'duration':duration}))
            break
        print(f'{pid} {scene+1:02}.{number+1}: {duration:.2f}s', flush=True)
        return {**segment, 'words': aligned, 'duration': duration, 'pcm': pcm,
                'sourceSha256': digest}


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    cache = args.output.resolve()
    cache.mkdir(parents=True, exist_ok=True)
    source = ROOT/'tools/project-narration.json'
    data = json.loads(source.read_text())
    manifest = {'schema': 1, 'scriptSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                'voice': {'id':VOICE, 'provider':'Microsoft online speech', 'gender':'female',
                          'language':'de-DE', 'synthetic':True, 'rate':PROSODY}, 'projects':{}}
    semaphore = asyncio.Semaphore(2)
    for pid, project in data['projects'].items():
        tasks = [synthesize(cache,pid,i,j,seg,semaphore)
                 for i,scene in enumerate(project['scenes']) for j,seg in enumerate(scene['segments'])]
        generated = iter(await asyncio.gather(*tasks))
        samples = bytearray()
        scenes = []
        for original in project['scenes']:
            start_samples = len(samples)//2
            samples.extend(bytes(round(data['timing']['sceneLeadSeconds']*RATE)*2))
            segments = []
            for _ in original['segments']:
                segment = next(generated)
                segment['start'] = (len(samples)//2-start_samples)/RATE
                samples.extend(segment.pop('pcm'))
                segment['end'] = (len(samples)//2-start_samples)/RATE
                for word in segment['words']:
                    word['start'] += segment['start']
                    word['end'] += segment['start']
                pause = segment.get('pauseAfter', data['timing']['defaultPauseSeconds'])
                samples.extend(bytes(round(pause*RATE)*2))
                segments.append(segment)
            samples.extend(bytes(round(data['timing']['sceneTailSeconds']*RATE)*2))
            # Align chapter boundaries to exact video frames and audio samples.
            length = len(samples)//2-start_samples
            frames = math.ceil(length/(RATE/FPS))
            samples.extend(bytes((frames*(RATE//FPS)-length)*2))
            scenes.append({'start':start_samples/RATE, 'seconds':frames/FPS,
                           'frames':frames, 'segments':segments})
        raw = cache/(pid+'-raw.wav')
        with wave.open(str(raw),'wb') as output:
            output.setnchannels(1); output.setsampwidth(2); output.setframerate(RATE)
            output.writeframes(samples)
        output = cache/(pid+'.wav')
        pending = cache/(pid+'.normalized.part.wav')
        # Measured two-pass EBU R128 normalization for equal loudness and peaks.
        measure = subprocess.run(['ffmpeg','-hide_banner','-i',str(raw),'-af',
            'loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json','-f','null','-'],
            check=True,capture_output=True,text=True)
        stats = json.loads(measure.stderr[measure.stderr.rfind('{'):])
        filt = ('loudnorm=I=-16:TP=-1.5:LRA=7:linear=true:'+':'.join([
            'measured_I='+stats['input_i'],'measured_TP='+stats['input_tp'],
            'measured_LRA='+stats['input_lra'],'measured_thresh='+stats['input_thresh'],
            'offset='+stats['target_offset']]))
        run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',filt,'-ar',str(RATE),
             '-ac','1','-c:a','pcm_s16le',str(pending)])
        duration = len(samples)/(2*RATE)
        with wave.open(str(pending),'rb') as checked:
            if abs(checked.getnframes()/checked.getframerate()-duration)>.001:
                raise ValueError('Normalized audio duration changed: '+pid)
        pending.replace(output)
        manifest['projects'][pid] = {'audio':str(output), 'duration':duration,
            'scenes':scenes, 'normalization':stats}
        (cache/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
        print(f'READY {pid}: {duration:.2f}s',flush=True)


if __name__ == '__main__':
    asyncio.run(main())
