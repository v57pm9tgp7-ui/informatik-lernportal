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
  const students=[];
  for(const roster of ROSTER){
    const row=rows.get(roster.email);rows.delete(roster.email);
    let progress=cleanProgress({});
    if(row){try{progress=JSON.parse(row.progress_json||'{}')}catch{}}
    students.push({
      email:roster.email,name:roster.name,class_name:roster.className,roster_locked:true,
      progress,
      onenote_done:Number(row?.onenote_done||0),digipen_done:Number(row?.digipen_done||0),scan_done:Number(row?.scan_done||0),total_done:Number(row?.total_done||0),
      first_seen:row?.first_seen||null,last_seen:row?.last_seen||null,updated_at:row?.updated_at||null,total_possible:21
    });
  }
  for(const row of rows.values()){
    let progress=cleanProgress({});try{progress=JSON.parse(row.progress_json||'{}')}catch{}
    students.push({...row,name:friendlyName(row.email),progress,total_possible:21,roster_locked:false});
  }
  const filtered=students.filter(student=>{
    if(CLASSES.has(filter))return student.class_name===filter;
    if(filter==='UNASSIGNED')return !student.class_name;
    return true;
  });
  filtered.sort((a,b)=>String(a.class_name||'ZZZ').localeCompare(String(b.class_name||'ZZZ'))||String(a.name).localeCompare(String(b.name),'de'));
  return json({ok:true,classes:[...CLASSES],teacherEmail:TEACHER_EMAIL,students:filtered,rosterCount:ROSTER.length});
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
    if(path==='/lehrperson/api/students'&&request.method==='GET')return listStudents(request,env);
    if(path==='/lehrperson/api/assign'&&request.method==='POST')return assignClass(request,env);
    if(path==='/lehrperson/api/remove'&&request.method==='POST')return removeStudent(request,env);
    if(path==='/lehrperson/api/health'&&request.method==='GET')return health(env);
    if(path==='/lehrperson')return Response.redirect(new URL('/lehrperson/',url),302);
    return env.ASSETS.fetch(request);
  }
};
