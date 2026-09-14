const STUDENT_DOMAIN='stud.bffbern.ch';
const TEACHER_EMAIL='christoph.marti@bffbern.ch';
const CLASSES=new Set(['GS1B','GS1D']);
const ROSTER=[
  {email:'raghad.alabbar@stud.bffbern.ch',name:'Raghad AlAbbar',className:'GS1B'},
  {email:'viktoria.aleshchenko@stud.bffbern.ch',name:'Viktoria Aleshchenko',className:'GS1B'},
  {email:'crizia.amico@stud.bffbern.ch',name:'Crizia Amico',className:'GS1B'},
  {email:'varvara.bondarenko@stud.bffbern.ch',name:'Varvara Bondarenko',className:'GS1B'},
  {email:'anabela.dimitrova@stud.bffbern.ch',name:'Anabela Dimitrova',className:'GS1B'},
  {email:'safia.essahbi@stud.bffbern.ch',name:'Safia Essahbi',className:'GS1B'},
  {email:'maria.ferhati@stud.bffbern.ch',name:'Maria Ferhati',className:'GS1B'},
  {email:'delina.fisseha@stud.bffbern.ch',name:'Delina Fisseha',className:'GS1B'},
  {email:'medina.hani@stud.bffbern.ch',name:'Medina Hani',className:'GS1B'},
  {email:'rim.kbrom@stud.bffbern.ch',name:'Rim Kbrom',className:'GS1B'},
  {email:'sven.lustenberger@stud.bffbern.ch',name:'Sven Lustenberger',className:'GS1B'},
  {email:'ida.luethi@stud.bffbern.ch',name:'Ida Luethi',className:'GS1B'},
  {email:'ramize.mustafa@stud.bffbern.ch',name:'Ramize Mustafa',className:'GS1B'},
  {email:'viktoria.nishchenko@stud.bffbern.ch',name:'Viktoria Nishchenko',className:'GS1B'},
  {email:'besjon.sakiri@stud.bffbern.ch',name:'Besjon Sakiri',className:'GS1B'},
  {email:'shanice.wafukama@stud.bffbern.ch',name:'Shanice Wafukama',className:'GS1B'},
  {email:'valentin.werren@stud.bffbern.ch',name:'Valentin Werren',className:'GS1B'},
  {email:'linda.zefi@stud.bffbern.ch',name:'Linda Zefi',className:'GS1B'},
  {email:'retaj.alsalloumi@stud.bffbern.ch',name:'Retaj Al Salloumi',className:'GS1D'},
  {email:'anila.asipi@stud.bffbern.ch',name:'Anila Asipi',className:'GS1D'},
  {email:'david.djordjevic@stud.bffbern.ch',name:'David Djordjevic',className:'GS1D'},
  {email:'idaije.iseni@stud.bffbern.ch',name:'Idaije Iseni',className:'GS1D'},
  {email:'ramo.jusic@stud.bffbern.ch',name:'Ramo Jusic',className:'GS1D'},
  {email:'robinsean.klaus@stud.bffbern.ch',name:'Robin Sean Klaus',className:'GS1D'},
  {email:'vivien.liebenberg@stud.bffbern.ch',name:'Vivien Liebenberg',className:'GS1D'},
  {email:'elisia.morina@stud.bffbern.ch',name:'Elisia Morina',className:'GS1D'},
  {email:'eyluel.mutlu@stud.bffbern.ch',name:'Eylül Mutlu',className:'GS1D'},
  {email:'lyna.oedipe@stud.bffbern.ch',name:'Lyna Oedipe',className:'GS1D'},
  {email:'andrijana.radic@stud.bffbern.ch',name:'Andrijana Radic',className:'GS1D'},
  {email:'safoaa.sakyi@stud.bffbern.ch',name:'Safoaa Sakyi',className:'GS1D'},
  {email:'someja.salihu@stud.bffbern.ch',name:'Someja Salihu',className:'GS1D'},
  {email:'nyesel.samkyil@stud.bffbern.ch',name:'Nyesel Samkyil',className:'GS1D'},
  {email:'elia.scigliano@stud.bffbern.ch',name:'Elia Scigliano',className:'GS1D'},
  {email:'taisiia.ustinova@stud.bffbern.ch',name:'Taisiia Ustinova',className:'GS1D'},
  {email:'jael.wuethrich@stud.bffbern.ch',name:'Jael Wüthrich',className:'GS1D'},
  {email:'anastasiia.yevdokimova@stud.bffbern.ch',name:'Anastasiia Yevdokimova',className:'GS1D'},
  {email:'niyat.yohannes@stud.bffbern.ch',name:'Niyat Yohannes',className:'GS1D'}
];
const ROSTER_BY_EMAIL=new Map(ROSTER.map(item=>[item.email,item]));

const DEFAULT_ASSIGNMENTS={
  onenote:{required:[1,2,3,4,5,6,7,8,9,10],optional:[11,12]},
  digipen:{required:[1,2,3,4,5],optional:[6,7,8,9]},
  scan:{required:[1,2,3,4,5,7],optional:[6,8]}
};
const ASSIGNMENT_STATUSES=new Set(['required','optional','hidden','completed']);
const TRACKS=new Set(Object.keys(DEFAULT_ASSIGNMENTS));
function defaultAssignmentStatus(track,id){
  const d=DEFAULT_ASSIGNMENTS[track];
  if(!d)return 'hidden';
  return d.required.includes(Number(id))?'required':d.optional.includes(Number(id))?'optional':'hidden';
}
async function ensureAssignmentTable(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS assignment_settings (
    class_name TEXT NOT NULL,
    track TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (class_name, track, task_id)
  )`).run();
}
async function assignmentMapForClass(env,className){
  const out={};
  for(const [track,d] of Object.entries(DEFAULT_ASSIGNMENTS)){
    out[track]={};
    for(const id of [...d.required,...d.optional])out[track][id]=defaultAssignmentStatus(track,id);
  }
  if(!env.DB||!CLASSES.has(className))return out;
  await ensureAssignmentTable(env);
  const result=await env.DB.prepare('SELECT track,task_id,status FROM assignment_settings WHERE class_name=?').bind(className).all();
  for(const row of result.results||[]){
    if(TRACKS.has(row.track)&&ASSIGNMENT_STATUSES.has(row.status))out[row.track][Number(row.task_id)]=row.status;
  }
  return out;
}
function doneIdsForTrack(progressTrack){
  return new Set([...(progressTrack?.requiredDone||[]),...(progressTrack?.optionalDone||[])] .map(Number));
}
function recalcProgress(progress,settings){
  const result={modules:{},totalDone:0,totalPossible:0};
  for(const track of Object.keys(DEFAULT_ASSIGNMENTS)){
    const done=doneIdsForTrack(progress?.[track]);
    const entries=Object.entries(settings?.[track]||{});
    const required=entries.filter(([,status])=>status==='required').map(([id])=>Number(id));
    const completed=entries.filter(([,status])=>status==='completed').map(([id])=>Number(id));
    const requiredDone=required.filter(id=>done.has(id)).length;
    result.modules[track]={done:requiredDone,possible:required.length,completed:completed.length};
    result.totalDone+=requiredDone;result.totalPossible+=required.length;
  }
  return result;
}

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
}
function cleanEmail(value){return String(value||'').trim().toLowerCase()}
function validStudentEmail(value){return /^[^\s@]+@stud\.bffbern\.ch$/i.test(cleanEmail(value))}
function clampInt(value,min,max){const n=Number(value);return Number.isInteger(n)&&n>=min&&n<=max?n:null}
function cleanIds(value,allowed){
  const set=new Set((Array.isArray(value)?value:[]).map(Number).filter(n=>Number.isInteger(n)&&allowed.includes(n)));
  return [...set].sort((a,b)=>a-b);
}
function cleanTrack(value,required,optional){
  const v=value&&typeof value==='object'?value:{};
  return {
    requiredDone:cleanIds(v.requiredDone,required),
    optionalDone:cleanIds(v.optionalDone,optional),
    started:cleanIds(v.started,[...required,...optional]),
    last:clampInt(v.last,1,99)
  };
}
function cleanProgress(value){
  const p=value&&typeof value==='object'?value:{};
  return {
    onenote:cleanTrack(p.onenote,[1,2,3,4,5,6,7,8,9,10],[11,12]),
    digipen:cleanTrack(p.digipen,[1,2,3,4,5],[6,7,8,9]),
    scan:cleanTrack(p.scan,[1,2,3,4,5,7],[6,8])
  };
}
function counts(progress){
  const one=progress.onenote.requiredDone.length,pen=progress.digipen.requiredDone.length,scan=progress.scan.requiredDone.length;
  return {onenote:one,digipen:pen,scan,total:one+pen+scan,totalPossible:21};
}
async function readJson(request){
  const type=request.headers.get('content-type')||'';
  if(!type.includes('application/json'))throw new Error('content-type');
  const text=await request.text();
  if(text.length>30000)throw new Error('too-large');
  return JSON.parse(text||'{}');
}
function friendlyName(email){
  const known=ROSTER_BY_EMAIL.get(cleanEmail(email));
  if(known)return known.name;
  const local=cleanEmail(email).split('@')[0]||'';
  return local.split(/[._-]+/).filter(Boolean).map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ');
}

async function syncStudent(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  let body;try{body=await readJson(request)}catch{return json({ok:false,error:'Ungültige Daten.'},400)}
  const email=cleanEmail(body.email);
  if(!validStudentEmail(email))return json({ok:false,error:`Nur @${STUDENT_DOMAIN} ist erlaubt.`},400);
  const progress=cleanProgress(body.progress),summary=counts(progress),now=new Date().toISOString();
  const roster=ROSTER_BY_EMAIL.get(email),className=roster?.className||null;
  const raw=JSON.stringify(progress);
  await env.DB.prepare(`
    INSERT INTO students (email, class_name, progress_json, onenote_done, digipen_done, scan_done, total_done, first_seen, last_seen, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      class_name=COALESCE(excluded.class_name, students.class_name),
      progress_json=excluded.progress_json,
      onenote_done=excluded.onenote_done,
      digipen_done=excluded.digipen_done,
      scan_done=excluded.scan_done,
      total_done=excluded.total_done,
      last_seen=excluded.last_seen,
      updated_at=excluded.updated_at
  `).bind(email,className,raw,summary.onenote,summary.digipen,summary.scan,summary.total,now,now,now).run();
  return json({ok:true,updatedAt:now});
}

function requireTeacherPath(request){
  // The real protection is Cloudflare Access on /lehrperson/*.
  // Keeping teacher APIs under the same path ensures the same Access policy covers them.
  return new URL(request.url).pathname.startsWith('/lehrperson/');
}
async function listStudents(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  if(!requireTeacherPath(request))return json({ok:false,error:'Nicht erlaubt.'},403);
  const url=new URL(request.url),filter=url.searchParams.get('class')||'ALL';
  const statement='SELECT email,class_name,progress_json,onenote_done,digipen_done,scan_done,total_done,first_seen,last_seen,updated_at FROM students';
  const result=await env.DB.prepare(statement).all();
  const rows=new Map((result.results||[]).map(row=>[cleanEmail(row.email),row]));
  const settingsByClass={GS1B:await assignmentMapForClass(env,'GS1B'),GS1D:await assignmentMapForClass(env,'GS1D')};
  const students=[];
  const build=(row,email,name,className,rosterLocked)=>{
    let progress=cleanProgress({});if(row){try{progress=cleanProgress(JSON.parse(row.progress_json||'{}'))}catch{}}
    const settings=settingsByClass[className]||Object.fromEntries(Object.keys(DEFAULT_ASSIGNMENTS).map(track=>[track,Object.fromEntries([...DEFAULT_ASSIGNMENTS[track].required,...DEFAULT_ASSIGNMENTS[track].optional].map(id=>[id,defaultAssignmentStatus(track,id)]))]));
    const calc=recalcProgress(progress,settings);
    return {email,name,class_name:className,roster_locked:rosterLocked,progress,
      onenote_done:calc.modules.onenote.done,onenote_possible:calc.modules.onenote.possible,
      digipen_done:calc.modules.digipen.done,digipen_possible:calc.modules.digipen.possible,
      scan_done:calc.modules.scan.done,scan_possible:calc.modules.scan.possible,
      total_done:calc.totalDone,total_possible:calc.totalPossible,
      first_seen:row?.first_seen||null,last_seen:row?.last_seen||null,updated_at:row?.updated_at||null};
  };
  for(const roster of ROSTER){const row=rows.get(roster.email);rows.delete(roster.email);students.push(build(row,roster.email,roster.name,roster.className,true));}
  for(const row of rows.values())students.push(build(row,row.email,friendlyName(row.email),row.class_name||null,false));
  const filtered=students.filter(student=>CLASSES.has(filter)?student.class_name===filter:filter==='UNASSIGNED'?!student.class_name:true);
  filtered.sort((a,b)=>String(a.class_name||'ZZZ').localeCompare(String(b.class_name||'ZZZ'))||String(a.name).localeCompare(String(b.name),'de'));
  return json({ok:true,classes:[...CLASSES],teacherEmail:TEACHER_EMAIL,students:filtered,rosterCount:ROSTER.length});
}
async function publicAssignments(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  const email=cleanEmail(new URL(request.url).searchParams.get('email'));
  const roster=ROSTER_BY_EMAIL.get(email);const className=roster?.className||null;
  const settings=className?await assignmentMapForClass(env,className):await assignmentMapForClass(env,'GS1B');
  return json({ok:true,className,settings});
}
async function teacherAssignments(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  const className=new URL(request.url).searchParams.get('class');
  if(!CLASSES.has(className))return json({ok:false,error:'Bitte GS1B oder GS1D wählen.'},400);
  return json({ok:true,className,settings:await assignmentMapForClass(env,className)});
}
async function updateAssignment(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  let body;try{body=await readJson(request)}catch{return json({ok:false,error:'Ungültige Daten.'},400)}
  const className=String(body.className||''),track=String(body.track||''),taskId=Number(body.taskId),status=String(body.status||'');
  if(!CLASSES.has(className)||!TRACKS.has(track)||!Number.isInteger(taskId)||!Object.prototype.hasOwnProperty.call((await assignmentMapForClass(env,className))[track],taskId)||!ASSIGNMENT_STATUSES.has(status))return json({ok:false,error:'Ungültige Auftragsangabe.'},400);
  await ensureAssignmentTable(env);
  const now=new Date().toISOString();
  await env.DB.prepare(`INSERT INTO assignment_settings (class_name,track,task_id,status,updated_at) VALUES (?,?,?,?,?)
    ON CONFLICT(class_name,track,task_id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at`).bind(className,track,taskId,status,now).run();
  return json({ok:true,className,track,taskId,status,updatedAt:now});
}
async function resetAssignments(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  let body;try{body=await readJson(request)}catch{return json({ok:false,error:'Ungültige Daten.'},400)}
  const className=String(body.className||'');if(!CLASSES.has(className))return json({ok:false,error:'Unbekannte Klasse.'},400);
  await ensureAssignmentTable(env);await env.DB.prepare('DELETE FROM assignment_settings WHERE class_name=?').bind(className).run();
  return json({ok:true,className,settings:await assignmentMapForClass(env,className)});
}
async function assignClass(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  let body;try{body=await readJson(request)}catch{return json({ok:false,error:'Ungültige Daten.'},400)}
  const email=cleanEmail(body.email),className=body.className==null||body.className===''?null:String(body.className);
  if(!validStudentEmail(email))return json({ok:false,error:'Ungültige Schulmail.'},400);
  const roster=ROSTER_BY_EMAIL.get(email);
  if(roster)return json({ok:false,error:`${roster.name} ist fest der Klasse ${roster.className} zugeordnet.`},400);
  if(className!==null&&!CLASSES.has(className))return json({ok:false,error:'Unbekannte Klasse.'},400);
  const found=await env.DB.prepare('SELECT email FROM students WHERE email=?').bind(email).first();
  if(!found)return json({ok:false,error:'Lernende Person nicht gefunden.'},404);
  await env.DB.prepare('UPDATE students SET class_name=?, updated_at=? WHERE email=?').bind(className,new Date().toISOString(),email).run();
  return json({ok:true,email,className});
}
async function removeStudent(request,env){
  if(!env.DB)return json({ok:false,error:'D1 ist noch nicht verbunden.'},503);
  let body;try{body=await readJson(request)}catch{return json({ok:false,error:'Ungültige Daten.'},400)}
  const email=cleanEmail(body.email);
  if(!validStudentEmail(email))return json({ok:false,error:'Ungültige Schulmail.'},400);
  await env.DB.prepare('DELETE FROM students WHERE email=?').bind(email).run();
  return json({ok:true});
}
async function health(env){
  if(!env.DB)return json({ok:false,d1:false},503);
  try{await env.DB.prepare('SELECT 1 AS ok').first();return json({ok:true,d1:true})}catch{return json({ok:false,d1:false},503)}
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),path=url.pathname;
    if(path==='/api/progress'&&request.method==='POST')return syncStudent(request,env);
    if(path==='/api/assignments'&&request.method==='GET')return publicAssignments(request,env);
    if(path==='/lehrperson/api/students'&&request.method==='GET')return listStudents(request,env);
    if(path==='/lehrperson/api/assignments'&&request.method==='GET')return teacherAssignments(request,env);
    if(path==='/lehrperson/api/assignments'&&request.method==='POST')return updateAssignment(request,env);
    if(path==='/lehrperson/api/assignments/reset'&&request.method==='POST')return resetAssignments(request,env);
    if(path==='/lehrperson/api/assign'&&request.method==='POST')return assignClass(request,env);
    if(path==='/lehrperson/api/remove'&&request.method==='POST')return removeStudent(request,env);
    if(path==='/lehrperson/api/health'&&request.method==='GET')return health(env);
    if(path==='/lehrperson')return Response.redirect(new URL('/lehrperson/',url),302);
    return env.ASSETS.fetch(request);
  }
};
