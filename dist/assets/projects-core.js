(function () {
  'use strict';
  const SCHEMA = 'mediainfolab-projects';
  const L = globalThis.MediaInfoLearning;
  const own = (o, key) => Object.prototype.hasOwnProperty.call(o, key);
  const plain = o => !!o && typeof o === 'object' && !Array.isArray(o);
  const string = (value, max = 12000) => typeof value === 'string' ? value.slice(0, max) : '';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const empty = () => ({version:1, updatedAt:'', projects:{}});
  const emptyProject = () => ({checks:[], quality:[], notes:{}, time:'full', choice:'', last:0, startedAt:'', updatedAt:'', finishedAt:'',planner:L.basePlanner(),studio:L.baseStudio(),actions:[]});
  const validIndices = (items, count) => [...new Set((Array.isArray(items) ? items : []).filter(n => Number.isInteger(n) && n >= 0 && n < count))].sort((a,b) => a-b);
  function cleanProject(raw, project) {
    const out = emptyProject();
    if (!plain(raw)) return out;
    out.checks = validIndices(raw.checks, project.steps.length);
    out.quality = validIndices(raw.quality, project.quality.length);
    out.time = ['short','medium','full'].includes(raw.time) ? raw.time : 'full';
    out.choice = (project.choices || []).some(c => c.id === raw.choice) ? raw.choice : '';
    out.last = Number.isInteger(raw.last) && raw.last >= 0 && raw.last <= project.steps.length ? raw.last : 0;
    for (const k of ['startedAt','updatedAt','finishedAt']) out[k] = string(raw[k], 40);
    if (plain(raw.notes)) for (const k of ['plan','pause','result', ...project.steps.map((_, i) => `step${i}`)]) {
      if (own(raw.notes,k)) out.notes[k] = string(raw.notes[k]);
    }
    out.planner=L.cleanPlanner(raw.planner);out.studio=L.cleanStudio(raw.studio);
    out.actions=[...new Set((Array.isArray(raw.actions)?raw.actions:[]).filter(x=>typeof x==='string'&&/^[0-5]-[0-9]{1,2}$/.test(x)))].slice(0,100);
    if (out.checks.length !== project.steps.length || out.quality.length !== project.quality.length) out.finishedAt = '';
    return out;
  }
  function normalize(raw, projects) {
    if (!plain(raw) || raw.version !== 1 || !plain(raw.projects)) throw new Error('Dieser Arbeitsstand hat ein unbekanntes Format.');
    const out = empty(); out.updatedAt = string(raw.updatedAt,40);
    for (const p of projects) if (own(raw.projects,p.id)) out.projects[p.id] = cleanProject(raw.projects[p.id],p);
    return out;
  }
  function decode(text, projects, owner) {
    if (typeof text !== 'string' || text.length > 6000000) throw new Error('Die Datei ist zu gross für einen Projekt-Arbeitsstand.');
    let raw; try { raw = JSON.parse(text); } catch { throw new Error('Die Datei ist keine lesbare JSON-Sicherung.'); }
    if (!plain(raw) || raw.schema !== SCHEMA || raw.version !== 1) throw new Error('Bitte wählen Sie eine Sicherung aus dem Bereich «Projekte».');
    if (string(raw.owner).toLowerCase() !== String(owner).toLowerCase()) throw new Error('Diese Sicherung gehört zu einer anderen Schulmailadresse. Wechseln Sie zuerst zur passenden Schulmail.');
    return normalize(raw.state, projects);
  }
  function encode(state, projects, owner) {
    return JSON.stringify({schema:SCHEMA,version:1,owner,exportedAt:new Date().toISOString(),state:normalize(state,projects)},null,2);
  }
  const record = (state, p) => state.projects[p.id] || emptyProject();
  const eligible = (r,p) => r.checks.length === p.steps.length && r.quality.length === p.quality.length;
  const status = r => r.finishedAt ? 'Basis fertig' : r.startedAt || r.checks.length || Object.values(r.notes).some(Boolean) ? 'In Arbeit' : 'Noch offen';
  const next = (r,p) => {const i=p.steps.findIndex((_,i)=>!r.checks.includes(i));return i<0?'abschluss':`schritt-${i+1}`;};
  function route(hash, projects) {
    const bits = String(hash || '').replace(/^#/,'').split('/');
    const p = projects.find(x => x.id === bits[0]);
    if (!p) return {project:null, page:'catalogue', index:-1};
    const match = /^schritt-([1-9][0-9]*)$/.exec(bits[1] || '');
    if(match && Number(match[1]) <= p.steps.length) return {project:p,page:'step',index:Number(match[1])-1};
    const pages={abschluss:'finish',cockpit:'planner',werkbank:'studio',beispiele:'media'};
    return {project:p,page:pages[bits[1]]||'overview',index:-1};
  }
  globalThis.MediaInfoProjectsCore = {SCHEMA,escape,empty,emptyProject,cleanProject,normalize,decode,encode,record,eligible,status,next,route};
})();
