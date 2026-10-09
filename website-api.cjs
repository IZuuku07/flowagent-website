'use strict';
const crypto=require('node:crypto');
const {authorized,normalizePost}=require('./publishing.cjs');
const collections={services:'services','pricing-plans':'pricingPlans',testimonials:'testimonials','case-studies':'caseStudies',faqs:'faqs','blog-posts':'blogPosts',media:'media'};
const settings=['brandName','tagline','businessEmail','whatsapp','phone','bookingLink','currency','country','address','logoPath','defaultStripeLink','defaultPaypalLink','paypalEmail','newsletterTitle','newsletterText','footerBlurb'];
const sections=['home','about','pricing','contact','faq','blog'];
const fail=(statusCode,message)=>{throw Object.assign(Error(message),{statusCode});};
const revision=data=>'"'+crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')+'"';
function object(value){if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'Expected a JSON object.');}
function validate(value,depth=0){
 if(depth>8)fail(400,'Content is too deeply nested.');
 if(typeof value==='string'){if(value.length>90000)fail(400,'Text is too long.');return;}
 if(typeof value==='boolean'||(typeof value==='number'&&Number.isFinite(value)))return;
 if(Array.isArray(value)){if(value.length>200)fail(400,'Too many array entries.');value.forEach(v=>validate(v,depth+1));return;}
 object(value);for(const [key,v] of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))fail(400,'Invalid field.');validate(v,depth+1);if(/(?:Link|Url|Path)$/.test(key)&&typeof v==='string'&&v&&!/^(?:https:\/\/|\/(?!\/)|[a-zA-Z0-9][\w./-]*$|mailto:|tel:|#)/.test(v))fail(400,'Unsafe URL: '+key);}
}
function allow(body,keys){object(body);for(const key of Object.keys(body))if(!keys.includes(key))fail(400,'Unsupported field: '+key);validate(body);}
function merge(previous,patch){
 const out=structuredClone(previous||{});
 for(const [key,value] of Object.entries(patch)){
  if(value&&typeof value==='object'&&!Array.isArray(value))out[key]=merge(out[key],value);
  else out[key]=value;
 }
 return out;
}
function publicView(data){return Object.fromEntries(['settings','pageContent','seo',...Object.values(collections)].map(k=>[k,k==='settings'?Object.fromEntries(settings.map(n=>[n,data.settings?.[n]??''])):structuredClone(data[k]||{})]));}
function createWebsiteApi({read,save,parse,send,normalizeItem}){
 return async function handle(req,res,pathname){
  if(pathname!=='/api/v1'&&!pathname.startsWith('/api/v1/'))return false;
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const token=process.env.FLOWAGENT_WEBSITE_API_TOKEN;
  if(!token||token.length<32){send(res,503,{error:'Website control API is not configured.'});return true;}
  if(!authorized(req.headers.authorization,token)){send(res,401,{error:'Unauthorized'});return true;}
  const parts=pathname.slice('/api/v1'.length).split('/').filter(Boolean);
  if(parts.length===1&&parts[0]==='capabilities'&&req.method==='GET'){
   send(res,200,{version:'1',resources:['content','settings','pages','seo',...Object.keys(collections)],authentication:'Bearer',writePrecondition:'If-Match from a GET response',scope:'Public website content. No admin credentials, customer records or server configuration.'});return true;
  }
  const resource=parts[0],key=collections[resource];
  if(!['content','settings','pages','seo'].includes(resource)&&!key){send(res,404,{error:'Resource not found'});return true;}
  if(parts.length>2){send(res,404,{error:'Resource not found'});return true;}
  if(parts[1]&&!key&&resource!=='pages'){send(res,404,{error:'Resource not found'});return true;}
  const data=await read(),etag=revision(data);res.setHeader('ETag',etag);
  if(req.method==='GET'){
   let value;
   if(resource==='content'&&parts.length===1)value=publicView(data);
   else if(key)value=parts[1]?(data[key]||[]).find(i=>i.id===parts[1]):data[key]||[];
   else if(resource==='pages')value=parts[1]?data.pageContent?.[parts[1]]:data.pageContent;
   else if(parts.length===1)value=resource==='settings'?publicView(data).settings:data.seo;
   if(value===undefined){send(res,404,{error:'Resource not found'});return true;}
   send(res,200,{data:value,revision:etag});return true;
  }
  const allowed=key?(parts[1]?['PATCH','DELETE']:['POST']):resource==='content'?[]:['PATCH'];
  if(!allowed.includes(req.method)){res.setHeader('Allow',['GET',...allowed].join(', '));send(res,405,{error:'Method not allowed'});return true;}
  if(!req.headers['if-match']){send(res,428,{error:'Read the resource first and send its ETag as If-Match.'});return true;}
  if(req.headers['if-match']!==etag){send(res,412,{error:'Website content changed. Read it again before updating.'});return true;}
  let result,status=200;
  if(key){
   const items=data[key]||[],index=parts[1]?items.findIndex(i=>i.id===parts[1]):-1;
   if(parts[1]&&index<0){send(res,404,{error:'Item not found'});return true;}
   if(req.method==='DELETE'){result=items[index];data[key]=items.filter((_,i)=>i!==index);}
   else{
    const body=await parse(req,131072);object(body);
    const previous=index<0?{}:items[index];
    const fields=key==='blogPosts'?['slug','title','excerpt','category','tags','author','publishedAt','metaDescription','contentHtml','language','imageUrl','imageAlt','editorialDisclosure','approved']:Object.keys(normalizeItem(key,{})).filter(k=>k!=='id');
    allow(body,fields);
    if(key!=='blogPosts'){
     const shape=normalizeItem(key,{});
     for(const [field,v] of Object.entries(body)){
      if(Array.isArray(shape[field])){if(!Array.isArray(v))fail(400,'Expected an array: '+field);}
      else if(typeof v!==typeof shape[field])fail(400,'Invalid field type: '+field);
     }
    }
    const input={...previous,...body};
    const item=key==='blogPosts'?{...previous,...normalizePost({...input,approved:body.approved===true})}:{...previous,...normalizeItem(key,input,previous.id)};
    if(key==='blogPosts'&&previous.id)item.id=previous.id;
    if(!String(item.title||item.name||item.question||'').trim())fail(400,'A title, name or question is required.');
    if(['services','caseStudies','blogPosts'].includes(key)){
     if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))fail(400,'Invalid slug.');
     if(items.some((v,i)=>i!==index&&v.slug===item.slug))fail(409,'Slug already exists.');
    }
    if(index<0){items.push(item);status=201;}else items[index]=item;
    data[key]=items;result=item;
   }
  }else{
   const body=await parse(req,131072);
   if(resource==='settings'){allow(body,settings);if(Object.values(body).some(v=>typeof v!=='string'))fail(400,'Settings must be strings.');data.settings={...data.settings,...body};result=publicView(data).settings;}
   if(resource==='pages'){
    if(parts[1]){if(!sections.includes(parts[1]))fail(404,'Page not found.');allow(body,Object.keys(data.pageContent[parts[1]]||{}));data.pageContent[parts[1]]=merge(data.pageContent[parts[1]],body);result=data.pageContent[parts[1]];}
    else{allow(body,sections);for(const [page,patch] of Object.entries(body)){allow(patch,Object.keys(data.pageContent[page]||{}));data.pageContent[page]=merge(data.pageContent[page],patch);}result=data.pageContent;}
   }
   if(resource==='seo'){
    allow(body,['defaultTitle','defaultDescription','siteUrl','twitterHandle','pages']);
    for(const [k,v] of Object.entries(body)){if(k==='pages'){object(v);for(const [route,p] of Object.entries(v)){if(!/^\/(?!\/)[a-zA-Z0-9/-]*$/.test(route))fail(400,'Invalid SEO page route.');allow(p,['title','description']);if(Object.values(p).some(s=>typeof s!=='string'))fail(400,'SEO text must be strings.');}}else if(typeof v!=='string')fail(400,'SEO text must be strings.');}
    if(body.siteUrl){let u;try{u=new URL(body.siteUrl);}catch{fail(400,'siteUrl must be an HTTPS origin.');}if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)fail(400,'siteUrl must be an HTTPS origin.');}
    data.seo=merge(data.seo,body);result=data.seo;
   }
  }
  await save(data);const next=revision(data);res.setHeader('ETag',next);send(res,status,{data:result,revision:next,action:req.method==='DELETE'?'deleted':status===201?'created':'updated'});return true;
 };
}
module.exports={createWebsiteApi,revision};
