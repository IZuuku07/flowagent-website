const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{spawn}=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'flowagent-qa-'));
for(const name of fs.readdirSync(root)){if(/\.(?:js|cjs|html|css)$/.test(name))fs.copyFileSync(path.join(root,name),path.join(tmp,name));}
fs.mkdirSync(path.join(tmp,'data'));fs.copyFileSync(path.join(root,'data/public-content.json'),path.join(tmp,'data/public-content.json'));
const salt=crypto.randomBytes(16).toString('hex'),password=crypto.randomBytes(24).toString('hex');
const server=spawn(process.execPath,['server.js'],{cwd:tmp,env:{...process.env,SUPABASE_URL:'',SUPABASE_SECRET_KEY:'',SUPABASE_SERVICE_ROLE_KEY:'',FLOWAGENT_DATA_DIR:'',PORT:'4192',HOST:'127.0.0.1',ADMIN_USERNAME:'qa',ADMIN_PASSWORD:process.env.FLOWAGENT_TEST_PASSWORD_ENV ? password : '',ADMIN_PASSWORD_SALT:salt,ADMIN_PASSWORD_HASH:process.env.FLOWAGENT_TEST_PASSWORD_ENV ? '' : crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex'),ADMIN_PASSWORD_ITERATIONS:'1000',SESSION_SECRET:crypto.randomBytes(32).toString('hex'),BASE_URL:'http://localhost:4192',WEB3FORMS_ACCESS_KEY:'',WEB3FORMS_KEY:''},stdio:['ignore','pipe','pipe']});
let errors='';server.stderr.on('data',d=>errors+=d);
(async()=>{try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('exit',()=>reject(Error(errors)));setTimeout(()=>reject(Error('Start timeout')),8000).unref()});
 const url='http://localhost:4192';
 let r=await fetch(url+'/api/admin-data');assert.equal(r.status,401);
 r=await fetch(url+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'qa',password})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];
 const api=async(route,method='GET',body)=>{const r=await fetch(url+route,{method,headers:{Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});assert.equal(r.status,200,route+' '+await r.clone().text());return r.json()};
 const data=await api('/api/admin-data');assert.equal(data.settings.paypalEmail,'aamr.agdal@gmail.com');
 await api('/api/page-content','PUT',{home:{heroTitle:'QA edited homepage'}});
 let html=await(await fetch(url+'/')).text();assert(html.includes('<h1>QA edited homepage</h1>'));assert(html.includes('https://flowagent.best/'));assert(html.includes('application/ld+json'));
 await api('/api/seo','PUT',{pages:{...data.seo.pages,'/':{title:'QA search title',description:'QA description'}}});
 html=await(await fetch(url+'/')).text();assert(html.includes('<title>QA search title</title>'));
 const svc=data.services[0];await api('/api/collections/services/'+svc.id,'PUT',{...svc,title:'QA renamed service'});const after=await api('/api/admin-data');assert.equal(after.services[0].category,svc.category);assert.equal(after.services[0].quoteOnly,svc.quoteOnly);
 await api('/api/settings','PUT',{...data.settings,paypalEmail:'aamr.agdal@gmail.com'});assert.equal((await api('/api/admin-data')).settings.paypalEmail,'aamr.agdal@gmail.com');
 r=await fetch(url+'/services/this-does-not-exist');assert.equal(r.status,404);
 html=await(await fetch(url+'/services/'+svc.slug)).text();assert(html.includes('QA renamed service'));assert(html.includes('Service'));
 const sitemap=await(await fetch(url+'/sitemap.xml')).text();assert(!sitemap.includes('localhost'));assert(!sitemap.includes('/admin'));
 r=await fetch(url+'/admin');assert(r.headers.get('x-robots-tag').includes('noindex'));
 for(const route of ['/server-config.json','/.env.local','/data/public-content.json'])assert.equal((await fetch(url+route)).status,404);
 console.log('PASS: admin login, protected routes, content edits, SEO edits, service metadata preservation, PayPal email persistence, canonical sitemap, unknown service 404, admin noindex.');
 console.log('Tests used an isolated copy; no real leads, payments or site edits were submitted.');
 }finally{server.kill();}})().catch(e=>{console.error(e);console.error(errors);process.exitCode=1});

