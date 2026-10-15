import {readFileSync,writeFileSync,renameSync,mkdirSync,openSync,fsyncSync,closeSync} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
export const LIMITS={documents:20,documentBytes:102400,corpusBytes:1048576,query:500};
export class Problem extends Error {constructor(message,status=400){super(message);this.status=status;}}
export function validText(text){
  if(typeof text!=='string'||!text.trim()) throw new Problem('Document text must not be empty.');
  if(Buffer.byteLength(text)>LIMITS.documentBytes) throw new Problem('Document exceeds 100 KiB.');
  if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)||/[\uD800-\uDFFF]/u.test(text)) throw new Problem('Binary or invalid Unicode text is not supported.');
  return text;
}
export function decodeFile(base64){
  if(typeof base64!=='string'||base64.length>140000||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) throw new Problem('Invalid or oversized file encoding.');
  try{return validText(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.from(base64,'base64')));}catch(e){if(e instanceof Problem)throw e;throw new Problem('File must be valid UTF-8.');}
}
function titleValue(title){if(typeof title!=='string'||!title.trim()||title.length>200)throw new Problem('Title must contain 1–200 characters.');return title.trim();}
function validate(state){
  if(state.schema!==1||!Number.isSafeInteger(state.revision)||state.revision<0||!Array.isArray(state.documents))throw new Error('Invalid store schema.');
  if(state.documents.length>LIMITS.documents)throw new Problem('Corpus exceeds 20 documents.');
  const ids=new Set();let size=0;
  for(const d of state.documents){if(typeof d.id!=='string'||!d.id||ids.has(d.id)||!Number.isSafeInteger(d.version)||d.version<1)throw new Error('Invalid document identity.');ids.add(d.id);titleValue(d.title);validText(d.text);size+=Buffer.byteLength(d.text);}
  if(size>LIMITS.corpusBytes)throw new Problem('Corpus exceeds 1 MiB.');
}
export class Corpus{
  constructor(file){this.file=file;try{this.state=JSON.parse(readFileSync(file,'utf8'));validate(this.state);}catch(e){if(e.code==='ENOENT')this.state={schema:1,revision:0,documents:[]};else throw new Error('Store is corrupt or unreadable. Preserve it and restore a known-good backup; no data was reset.',{cause:e});}}
  snapshot(){return structuredClone(this.state);}
  mutate(revision,change){if(revision!==this.state.revision)throw new Problem('Corpus changed. Reload and try again.',409);const next=this.snapshot();change(next.documents);next.revision++;validate(next);mkdirSync(dirname(this.file),{recursive:true});const temp=this.file+'.'+randomUUID()+'.tmp';writeFileSync(temp,JSON.stringify(next,null,2),{mode:0o600,flag:'wx'});const fd=openSync(temp,'r');try{fsyncSync(fd);}finally{closeSync(fd);}renameSync(temp,this.file);this.state=next;return this.snapshot();}
  add(revision,documents){if(!Array.isArray(documents)||!documents.length||documents.length>20)throw new Problem('Choose 1–20 documents.');const normalized=documents.map(d=>({id:randomUUID(),version:1,title:titleValue(d.title),text:validText(d.text)}));return this.mutate(revision,docs=>docs.push(...normalized));}
  edit(revision,id,title,text){title=titleValue(title);text=validText(text);return this.mutate(revision,docs=>{const d=docs.find(d=>d.id===id);if(!d)throw new Problem('Document no longer exists.',404);Object.assign(d,{title,text,version:d.version+1});});}
  delete(revision,id){return this.mutate(revision,docs=>{const i=docs.findIndex(d=>d.id===id);if(i<0)throw new Problem('Document no longer exists.',404);docs.splice(i,1);});}
}
const stop=new Set('a an the is are was were be been to of in on at for from and or with does do did what where when how who which it its this that my our your'.split(' '));
export function tokens(text){return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(t=>!stop.has(t));}
export function chunks(state){const result=[];for(const d of state.documents){for(const m of d.text.matchAll(/[^\r\n]+(?:\r?\n(?!\r?\n)[^\r\n]+)*/g)){// Split very long paragraphs without losing source offsets.
    for(let n=0;n<m[0].length;n+=1800){const text=m[0].slice(n,n+1800);result.push({id:`${d.id}:${d.version}:${m.index+n}`,documentId:d.id,version:d.version,title:d.title,start:m.index+n,end:m.index+n+text.length,text});}
  }}return result;}
export function search(state,query){
  if(typeof query!=='string'||!query.trim()||query.length>LIMITS.query)throw new Problem('Enter a question of 1–500 characters.');
  const terms=[...new Set(tokens(query))];const passages=chunks(state);const bags=passages.map(p=>tokens(p.text));const avg=bags.reduce((s,b)=>s+b.length,0)/(bags.length||1)||1;
  const hits=passages.map((p,i)=>{let score=0;for(const t of terms){const tf=bags[i].filter(w=>w===t).length;if(!tf)continue;const df=bags.filter(b=>b.includes(t)).length;score+=Math.log(1+(bags.length-df+.5)/(df+.5))*tf*2.2/(tf+1.2*(.25+.75*bags[i].length/avg));}return {...p,score};}).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,8);
  // A deliberately narrow lexical warning, not general entailment or contradiction detection.
  const sentences=hits.flatMap(p=>p.text.split(/(?<=[.!?])\s+/));
  const deniedTerms=terms.filter(t=>{const mentions=sentences.filter(s=>tokens(s).includes(t));return mentions.length>0&&mentions.every(s=>/\b(?:does not|do not|did not) (?:record|provide|specify|contain|include|state)\b/i.test(s));});
  const denied=deniedTerms.length>0;
  return {revision:state.revision,query,hits,deniedTerms,status:!hits.length||denied?'insufficient_evidence':'passages',message:!hits.length?'Insufficient evidence: no matching passages. No model request is needed.':denied?'Insufficient evidence: the matching text says information is not recorded or specified. This limited lexical warning is not a semantic guarantee; inspect the passages.':'Matching passages, not a verified answer. Inspect the source; mentions may deny or contradict the requested fact.'};
}
