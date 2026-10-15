import http from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {Corpus,Problem,decodeFile,search} from './corpus.js';
import {LocalModel} from './model.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function createApp({store=resolve(root,'data/corpus.json'),model=new LocalModel(),fixture=JSON.parse(readFileSync(resolve(root,'fixture.json'),'utf8'))}={}){
  const corpus=new Corpus(store);
  const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  const server=http.createServer(async(req,res)=>{
    try{
      const allowedHost=`127.0.0.1:${server.address().port}`;if(req.headers.host!==allowedHost)throw new Problem('Use the displayed 127.0.0.1 address.',403);
      const url=new URL(req.url,'http://'+allowedHost);
      if(req.method==='GET'&&!url.pathname.startsWith('/api/')){const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};const file=files[url.pathname];if(!file)throw new Problem('Not found.',404);res.writeHead(200,{'Content-Type':file[1]+'; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'",'X-Content-Type-Options':'nosniff'});res.end(readFileSync(resolve(root,'public',file[0])));return;}
      if(req.method==='GET'&&url.pathname==='/api/corpus')return send(res,200,corpus.snapshot());
      if(req.method!=='POST')throw new Problem('Not found.',404);
      if(req.headers.origin!=='http://'+allowedHost||req.headers['content-type']!=='application/json')throw new Problem('Same-origin JSON request required.',403);
      const buffers=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>1600000)throw new Problem('Request exceeds import limit.',413);buffers.push(chunk);}
      let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(buffers)));}catch{throw new Problem('Invalid JSON.');}if(!body||typeof body!=='object')throw new Problem('Expected JSON object.');
      let result;
      switch(url.pathname){
        case '/api/fixtures':result=corpus.add(body.revision,fixture.documents);break;
        case '/api/import':if(!Array.isArray(body.files))throw new Problem('Choose text files.');result=corpus.add(body.revision,body.files.map(f=>{if(typeof f.name!=='string'||! /\.(txt|md)$/i.test(f.name))throw new Problem('Only .txt and .md files are supported.');return {title:f.name,text:decodeFile(f.base64)};}));break;
        case '/api/edit':result=corpus.edit(body.revision,body.id,body.title,body.text);break;
        case '/api/delete':result=corpus.delete(body.revision,body.id);break;
        case '/api/search':if(body.revision!==corpus.state.revision)throw new Problem('Corpus changed. Reload and requery.',409);result=search(corpus.snapshot(),body.query);break;
        case '/api/draft':{
          const state=corpus.snapshot();if(body.revision!==state.revision)throw new Problem('Corpus changed. Reload and requery.',409);const found=search(state,body.query);
          let draft;try{draft=await model.draft(body.query,found.hits);}catch(e){if(corpus.state.revision!==state.revision)throw new Problem('Source changed while AI was pending. Old result discarded.',409);throw e;}
          if(corpus.state.revision!==state.revision)throw new Problem('Source changed while AI was pending. Old result discarded.',409);result={revision:state.revision,...draft};break;
        }
        default:throw new Problem('Not found.',404);
      }send(res,200,result);
    }catch(e){send(res,e.status||500,{error:e.status?e.message:'Local storage/server error. Existing data was not reset.'});}
  });return {server,corpus};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const {server}=createApp({store:process.env.STORE_PATH||resolve(root,'data/corpus.json')});server.listen(Number(process.env.PORT||4176),'127.0.0.1',()=>console.log(`Document Search: http://127.0.0.1:${server.address().port}`));}catch(e){console.error(e.message);process.exitCode=1;}
}
