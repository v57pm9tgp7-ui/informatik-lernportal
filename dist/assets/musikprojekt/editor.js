(() => {
  'use strict';
  const STEPS = 16;
  const SAMPLE_RATE = 32000;
  const SONG = ['A', 'A', 'B', 'A'];
  const tracks = ['Kick', 'Clap', 'Hi-Hat', 'Bass C', 'Bass G', 'Glocke'];
  const FILE_TYPE = 'mediainfolab-beatstudio';

  const noteFields = {Titel:'beat-title', hoeridee:'mp-hoeridee', wechsel:'mp-wechsel', feedback:'mp-feedback'};

  function starterBar() {
    return tracks.map((_, row) => Array.from({length: STEPS}, (_, step) => row === 0 && step % 4 === 0));
  }
  function cloneBar(bar) {
    return bar.map(row => row.slice());
  }
  function readProject(source) {
    const obj = JSON.parse(source);
    if (!obj || obj.format !== FILE_TYPE || obj.version !== 1 ||
        typeof obj.title !== 'string' || obj.title.length > 70 ||
        !Number.isInteger(obj.bpm) || obj.bpm < 80 || obj.bpm > 160) throw Error('Ungültige Projektdatei.');
    const checked = {};
    for (const name of ['A', 'B']) {
      const bar = obj.patterns?.[name];
      if (!Array.isArray(bar) || bar.length !== tracks.length ||
          !bar.every(row => Array.isArray(row) && row.length === STEPS && row.every(cell => typeof cell === 'boolean'))) {
        throw Error('Die Tonspuren sind unvollständig.');
      }
      checked[name] = cloneBar(bar);
    }
    const notes = {Titel:obj.title,hoeridee:'',wechsel:'',feedback:''};
    if (obj.notizen !== undefined) {
      if (!obj.notizen || typeof obj.notizen !== 'object' || Array.isArray(obj.notizen)) throw Error('Ungültige Notizen.');
      for (const key of Object.keys(noteFields)) {
        const text = obj.notizen[key];
        if (text === undefined) continue;
        if (typeof text !== 'string' || text.length > (key === 'Titel' ? 70 : 2000)) throw Error('Ungültiger Notiztext.');
        notes[key] = text;
      }
    }
    return {format: FILE_TYPE, version: 1, title: notes.Titel, bpm: obj.bpm, patterns: checked, notizen: notes};
  }

  /* Synthesize our six original sounds once. Both playback and WAV use the same mix. */
  function synthesize(index) {
    const length = [.34,.18,.09,.20,.20,.40][index];
    const out = new Float32Array(Math.ceil(SAMPLE_RATE * length));
    let seed = 7507, lastNoise = 0, phase = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SAMPLE_RATE;
      seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      const high = (noise - lastNoise) * .5;
      lastNoise = noise;
      let sound;
      if (index === 0) {
        phase += 2 * Math.PI * (44 + 115 * Math.exp(-42*t)) / SAMPLE_RATE;
        sound = .68 * Math.sin(phase) * Math.exp(-14*t);
      } else if (index === 1) {
        const burst = t < .044 ? 1 - (t % .014) / .014 : .5;
        sound = .58 * high * burst * Math.exp(-16*t);
      } else if (index === 2) {
        sound = .40 * high * Math.exp(-55*t);
      } else if (index === 3 || index === 4) {
        const angle = (index === 3 ? 65.406 : 97.999) * t * 2 * Math.PI;
        sound = .33 * (Math.sin(angle) + .25*Math.sin(2*angle) + .12*Math.sin(3*angle)) * Math.exp(-11*t);
      } else {
        const angle = 523.25 * t * 2 * Math.PI;
        sound = .27 * (Math.sin(angle) + .33*Math.sin(2.76*angle)) * Math.exp(-12*t);
      }
      out[i] = sound * Math.min(1,t/.002,(length-t)/.010);
    }
    return out;
  }
  let sounds;
  function render(project, bars) {
    sounds ??= tracks.map((_, index) => synthesize(index));
    const stepFrames = SAMPLE_RATE * 60 / project.bpm / 4;
    const mix = new Float32Array(Math.round(stepFrames * STEPS * bars.length));
    bars.forEach((name, barIndex) => {
      project.patterns[name].forEach((row, track) => row.forEach((enabled, step) => {
        if (!enabled) return;
        const offset = Math.round((barIndex*STEPS + step)*stepFrames);
        const signal = sounds[track];
        const end = Math.min(signal.length, mix.length - offset);
        for (let i = 0; i < end; i++) mix[offset+i] += signal[i];
      }));
    });
    const fade = Math.round(SAMPLE_RATE * .006);
    for (let i = 0; i < mix.length; i++) mix[i] = Math.tanh(mix[i]) * Math.min(1,(mix.length-1-i)/fade);
    return mix;
  }
  function wav(pcm) {
    const bytes = new ArrayBuffer(44 + pcm.length*2);
    const view = new DataView(bytes);
    function tag(offset, text) { for (let i=0; i<text.length; i++) view.setUint8(offset+i, text.charCodeAt(i)); }
    tag(0,'RIFF'); view.setUint32(4,bytes.byteLength-8,true); tag(8,'WAVE');
    tag(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
    view.setUint32(24,SAMPLE_RATE,true); view.setUint32(28,SAMPLE_RATE*2,true);
    view.setUint16(32,2,true); view.setUint16(34,16,true); tag(36,'data'); view.setUint32(40,pcm.length*2,true);
    for (let i=0; i<pcm.length; i++) view.setInt16(44+i*2, Math.round(pcm[i]*32767), true);
    return bytes;
  }

  const editor = document.getElementById('studio');
  if (!editor) return;
  const el = short => document.getElementById('beat-' + short);
  let project = {format: FILE_TYPE, version: 1, title: '', bpm: 126, patterns: {A: starterBar(), B: starterBar()}};
  let selected = 'A', previousB = null, dirty = false;
  let audio, source, raf, playingPlan = null, live = null, request = 0;
  const cells = [], tabs = Array.from(editor.querySelectorAll('[data-beat-pattern]'));
  function say(message) { el('status').textContent = message; }
  function updateGrid() {
    cells.forEach((row, r) => row.forEach((cell, c) => {
      cell.setAttribute('aria-pressed', String(project.patterns[selected][r][c]));
      cell.setAttribute('aria-label', tracks[r]+', Takt '+selected+', Feld '+(c+1));
    }));
    document.getElementById('beat-gridname').textContent = 'Takt ' + selected;
    el('grid').setAttribute('aria-label','Takt '+selected+' bearbeiten');
    for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.beatPattern === selected));
    el('preview').textContent = 'Takt ' + selected + ' anhören';
    el('undo').hidden = !previousB;
  }
  function makeGrid() {
    const grid = el('grid');
    const header = document.createElement('div'); header.className = 'beat-row';
    const name = document.createElement('span'); name.id = 'beat-gridname'; name.className = 'beat-label'; header.append(name);
    for (let i=1; i<=4; i++) {
      const group=document.createElement('span'); group.textContent='Schlag '+i; group.className='beat-group';header.append(group);
    }
    grid.append(header);
    tracks.forEach((track, r) => {
      const row = document.createElement('div'); row.className='beat-row';
      const label = document.createElement('span'); label.className='beat-label'; label.textContent=track; row.append(label);
      cells.push([]);
      for (let c=0; c<STEPS; c++) {
        const cell = document.createElement('button');cell.type='button';cell.className='beat-cell';
        cell.dataset.first=String(c%4===0);cell.tabIndex=(r===0 && c===0)?0:-1;
        cell.addEventListener('focus',() => {
          const old=grid.querySelector('button[tabindex="0"]');
          if (old && old!==cell) old.tabIndex=-1;
          cell.tabIndex=0;
        });
        cell.addEventListener('click',() => {
          const previousPlan = playingPlan;
          stop();
          const events=project.patterns[selected][r];
          events[c]=!events[c];dirty=true;
          if (selected==='B') previousB=null;
          updateGrid();
          if (previousPlan) play(previousPlan.bars,previousPlan.loop);
          else say(track+' in Feld '+(c+1)+(events[c]?' eingeschaltet.':' ausgeschaltet.'));
        });
        cell.addEventListener('keydown',e => {
          const delta={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]}[e.key];
          if (!delta) return;
          e.preventDefault();
          const rr=Math.max(0,Math.min(tracks.length-1,r+delta[0]));
          const cc=Math.max(0,Math.min(STEPS-1,c+delta[1]));
          cells[rr][cc].focus();
        });
        row.append(cell);cells[r].push(cell);
      }
      grid.append(row);
    });
  }

  function stop() {
    request++;
    playingPlan = null;
    if (live) {
      for (const channel of Object.values(live.channels)) {
        try { channel.player.stop(); } catch {}
        channel.player.disconnect();channel.gain.disconnect();
      }
      live=null;
    }
    liveButtons(false);
    el('live-status').textContent='Live-Spiel gestoppt.';
    if (source) {
      source.onended=null;
      try { source.stop(); } catch {}
      source.disconnect(); source=null;
    }
    cancelAnimationFrame(raf);
    cells.forEach(row => row.forEach(cell=>cell.classList.remove('beat-current')));
    el('stop').disabled=true;el('playing').textContent='';
  }
  async function play(bars,loop) {
    stop();
    const ticket=request;
    playingPlan = {bars,loop};
    el('stop').disabled=false;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw Error('Kein Audiokontext');
      audio ??= new Audio();
      await audio.resume();
      if (request!==ticket) return;
      const pcm = render(project,bars);
      const buffer=audio.createBuffer(1,pcm.length,SAMPLE_RATE);
      buffer.getChannelData(0).set(pcm);
      source=audio.createBufferSource(); source.buffer=buffer; source.loop=loop;
      source.connect(audio.destination);
      const start=audio.currentTime;
      source.onended=() => {
        if(ticket!==request) return;
        stop();say('Die Folge ist zu Ende.');
      };
      source.start(start);
      say(loop?'Takt '+bars[0]+' läuft in einer Schleife.':'Die Takte spielen in der Reihenfolge A, A, B, A.');
      let previous = -1;
      function tick() {
        if (request!==ticket) return;
        const step = Math.floor((audio.currentTime-start) * project.bpm * 4 / 60) % (STEPS*bars.length);
        if (step >= 0 && step!==previous) {
          const index=Math.floor(step/STEPS), field=step%STEPS;
          el('playing').textContent='Takt '+bars[index]+' · Schlag '+(1+Math.floor(field/4));
          cells.forEach(row=>row.forEach((cell,c)=>cell.classList.toggle('beat-current',bars[index]===selected && c===field)));
          previous=step;
        }
        raf=requestAnimationFrame(tick);
      }
      tick();
    } catch {
      if(ticket!==request) return;
      stop();say('Der Browser konnte den Ton nicht starten. Speichern Sie Ihre Folge als WAV und hören Sie die Datei an.');
    }
  }
  function liveButtons(running) {
    el('live-start').disabled=running;
    el('live-stop').disabled=!running;
    for (const name of ['A','B']) {
      el('queue-'+name).disabled=!running;
      el('queue-'+name).setAttribute('aria-pressed',String(running && live?.queued===name));
    }
  }
  function describeLive() {
    el('live-status').textContent='Es läuft Takt '+live.active+'. '+(live.queued ? 'Vorgemerkt: Takt '+live.queued+'.' : 'Er wiederholt sich.');
    liveButtons(true);
  }
  function updateLiveBoundary() {
    if (live?.queued && audio.currentTime >= live.switchTime) {
      live.active=live.queued;live.queued=null;
      describeLive();
    }
  }
  function queueLive(name) {
    if (!live) return;
    updateLiveBoundary();
    const now=audio.currentTime;
    const nextBar=Math.max(1,Math.floor((now-live.start)/live.duration)+1);
    const at=live.start+nextBar*live.duration;
    // Both patterns run on the same audio clock. Only one is audible in each bar.
    for (const [key,channel] of Object.entries(live.channels)) {
      channel.gain.gain.cancelScheduledValues(now);
      channel.gain.gain.setValueAtTime(key===live.active ? 1 : 0,now);
      channel.gain.gain.setValueAtTime(key===name ? 1 : 0,at);
    }
    live.queued=name;live.switchTime=at;describeLive();
  }
  async function startLive() {
    stop();
    const ticket=request;
    el('live-stop').disabled=false;
    try {
      const Audio=window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw Error('Kein Audiokontext');
      audio ??= new Audio();
      await audio.resume();
      if (request!==ticket) return;
      const channels={};
      let duration=0;
      for (const name of ['A','B']) {
        const pcm=render(project,[name]), buffer=audio.createBuffer(1,pcm.length,SAMPLE_RATE);
        buffer.getChannelData(0).set(pcm);duration=pcm.length/SAMPLE_RATE;
        const player=audio.createBufferSource(), gain=audio.createGain();
        player.buffer=buffer;player.loop=true;
        gain.gain.value=name===selected ? 1 : 0;
        player.connect(gain);gain.connect(audio.destination);
        channels[name]={player,gain};
      }
      const start=audio.currentTime+.035;
      live={active:selected,queued:null,switchTime:0,start,duration,channels};
      for (const channel of Object.values(channels)) channel.player.start(start);
      describeLive();
      say('Live-Spiel läuft. Mit «Als Nächstes» wechseln Sie den Takt.');
      function tick() {
        if (request!==ticket) return;
        updateLiveBoundary();
        raf=requestAnimationFrame(tick);
      }
      tick();
    } catch {
      if(request!==ticket) return;
      stop();say('Das Live-Spiel konnte nicht starten. Hören Sie Ihre gespeicherte WAV-Datei an.');
    }
  }
  function download(content, type, suffix) {
    const base=(project.title.trim() || 'Mein Track').replace(/[\\/:*?"<>|\u0000-\u001f]/g,' ').trim() || 'Mein Track';
    const url=URL.createObjectURL(new Blob([content],{type}));
    const link=document.createElement('a');link.href=url;link.download=base+suffix;document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  makeGrid();updateGrid();
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    const next=tab.dataset.beatPattern;
    if (next===selected) return;
    stop();selected=next;updateGrid();say('Sie bearbeiten Takt '+selected+'.');
  }));
  el('duplicate').addEventListener('click',()=>{
    stop();previousB=cloneBar(project.patterns.B);project.patterns.B=cloneBar(project.patterns.A);
    selected='B';dirty=true;updateGrid();say('Takt A wurde nach B kopiert. Verändern Sie jetzt Takt B.');
  });
  el('undo').addEventListener('click',()=>{
    if (!previousB) return;
    stop();project.patterns.B=previousB;previousB=null;selected='B';dirty=true;updateGrid();say('Der vorherige Takt B ist wieder da.');
  });
  el('tempo').addEventListener('change',()=>{
    const tempo=Number(el('tempo').value);
    if(!Number.isInteger(tempo) || tempo<80 || tempo>160) {
      el('tempo').value=project.bpm;say('Wählen Sie ein ganzes Tempo zwischen 80 und 160.');return;
    }
    stop();project.bpm=tempo;dirty=true;say('Tempo: '+tempo+' Schläge pro Minute.');
  });
  function collectNotes() {
    const notes={};
    for (const [key,id] of Object.entries(noteFields)) {
      notes[key]=key==='Titel' ? project.title : document.getElementById(id)?.value || '';
    }
    return notes;
  }
  for (const [key,id] of Object.entries(noteFields)) {
    const field=document.getElementById(id);
    field?.addEventListener('input',()=>{
      if (key === 'Titel') project.title=field.value;
      dirty=true;
    });
  }
  el('preview').addEventListener('click',()=>play([selected],true));
  el('arrange').addEventListener('click',()=>play(SONG,false));
  el('stop').addEventListener('click',()=>{stop();say('Wiedergabe gestoppt.');});
  el('live-start').addEventListener('click',startLive);
  for (const name of ['A','B']) el('queue-'+name).addEventListener('click',()=>queueLive(name));
  el('live-stop').addEventListener('click',()=>{stop();say('Live-Spiel beendet.');});
  el('wav').addEventListener('click',()=>{
    download(wav(render(project,SONG)),'audio/wav','.wav');
    say('WAV-Datei mit vier Takten erstellt. Für spätere Änderungen speichern Sie auch die Projektdatei.');
  });
  el('save').addEventListener('click',()=>{
    download(JSON.stringify({...project,notizen:collectNotes()},null,2),'application/json','.json');
    dirty=false;say('Die bearbeitbare Projektdatei wurde zum Download bereitgestellt.');
  });
  el('load').addEventListener('click',()=>el('file').click());
  el('file').addEventListener('change',async()=>{
    const file=el('file').files[0]; el('file').value='';
    if(!file) return;
    try {
      if (file.size>64000) throw Error('Datei zu gross.');
      const restored=readProject(await file.text());
      if(dirty && !window.confirm('Die geladene Datei ersetzt Ihre aktuellen Takte. Möchten Sie fortfahren?'))return;
      stop();project=restored;selected='A';dirty=false;previousB=null;
      el('tempo').value=project.bpm;el('title').value=project.title;
      for (const [key,id] of Object.entries(noteFields)) {
        const field=document.getElementById(id);
        if (field) field.value=project.notizen[key];
      }
      updateGrid();say('Ihr Projekt ist geladen. Sie bearbeiten Takt A.');
    } catch { say('Diese Datei konnte nicht geladen werden. Wählen Sie eine JSON-Projektdatei aus diesem Track-Editor.'); }
  });
  window.addEventListener('pagehide',stop);
})();
