'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const storage=require('./storage.cjs');
function createDocumentStore({root,env=process.env,fetchImpl=fetch}) {
 const url=env.SUPABASE_URL, key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
 if(Boolean(url)!==Boolean(key))throw new Error('Configure both Supabase URL and a server secret key.');
 const remote=Boolean(url&&key),paths=storage.paths(root,env);
 const local={public:paths.publicContent,private:paths.privateRuntime,config:paths.config,studio:path.join(paths.dataDir,'studio-private.json')};
 let endpoint;
 if(remote){const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||!u.hostname.endsWith('.supabase.co'))throw new Error('Use the HTTPS project URL from Supabase.');endpoint=u.origin+'/rest/v1/flowagent_documents';}
 const namespace=env.FLOWAGENT_DATABASE_NAMESPACE||'flowagent';
 if(!/^[a-zA-Z0-9_-]{1,60}$/.test(namespace))throw new Error('Invalid database namespace.');
 const id=name=>{if(!Object.hasOwn(local,name))throw new Error('Unknown document');return namespace+':'+name;};
 async function request(query,options={}){
  try{
   const response=await fetchImpl(endpoint+query,{...options,headers:{apikey:key,...(key.split('.').length===3?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('Database request failed');
   return response.status===204?null:await response.text();
  }catch{throw Object.assign(new Error('Database unavailable. No changes were saved; please try again.'),{statusCode:503});}
 }
 async function read(name){
  const docId=id(name);
  if(remote){const raw=await request('?id=eq.'+encodeURIComponent(docId)+'&select=value');let rows;try{rows=JSON.parse(raw);}catch{throw Object.assign(Error('Invalid database response'),{statusCode:503});}if(!Array.isArray(rows))throw Error('Invalid database response');return rows.length?rows[0].value:null;}
  try{return JSON.parse(await fs.readFile(local[name],'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}
 }
 async function write(name,value,{ifAbsent=false}={}){
  const docId=id(name);
  if(remote){await request('?on_conflict=id',{method:'POST',headers:{Prefer:'resolution='+(ifAbsent?'ignore':'merge')+'-duplicates,return=minimal'},body:JSON.stringify({id:docId,value,updated_at:new Date().toISOString()})});return;}
  await fs.mkdir(path.dirname(local[name]),{recursive:true});
  if(ifAbsent){try{await fs.writeFile(local[name],JSON.stringify(value,null,2),{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;}return;}
  const tmp=local[name]+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(tmp,JSON.stringify(value,null,2),{mode:0o600});await fs.rename(tmp,local[name]);
 }
 async function initialize(){
  if(!remote){await storage.initialize(root,env);return;}
  const current=await read('public');
  if(current===null){const seed=JSON.parse(await fs.readFile(path.join(root,'data','public-content.json'),'utf8'));await write('public',seed,{ifAbsent:true});}
 }
 return {remote,read,write,initialize,status:()=>({mode:remote?'database':env.FLOWAGENT_DATA_DIR?'disk':'local',persistent:remote||Boolean(env.FLOWAGENT_DATA_DIR),hosted:Boolean(env.RENDER)})};
}
module.exports={createDocumentStore};
