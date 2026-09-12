import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const args=process.argv.slice(2);
const valueAfter=(flag,fallback)=>{
  const index=args.indexOf(flag);
  return index>=0&&args[index+1]?args[index+1]:fallback;
};
const port=Number(valueAfter('--port','4173'));
const host=valueAfter('--host','127.0.0.1');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation'};

http.createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep))throw new Error('Ungültiger Pfad');
    const body=await fs.readFile(file);
    response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    response.end(body);
  }catch{
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    response.end('Nicht gefunden');
  }
}).listen(port,host,()=>console.log(`Lernportal bereit auf http://${host}:${port}`));
