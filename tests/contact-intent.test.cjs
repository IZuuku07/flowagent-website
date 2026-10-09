const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
test('contact intent and consent survive JSON and native form submissions',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'flowagent-contact-'));
 await fs.cp(path.join(__dirname,'..'),root,{recursive:true,filter:p=>!p.includes(path.sep+'.git')&&!p.includes(path.sep+'node_modules')});
 const password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex');
 const port=4209;
 const server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',FLOWAGENT_STORAGE_DIR:root,FLOWAGENT_SUPABASE_URL:'',FLOWAGENT_SUPABASE_SERVICE_ROLE_KEY:'',SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',ADMIN_USERNAME:'contact-qa',ADMIN_PASSWORD_HASH:crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex'),ADMIN_PASSWORD_SALT:salt,ADMIN_PASSWORD_ITERATIONS:'1000',SESSION_SECRET:crypto.randomBytes(32).toString('hex'),WEB3FORMS_ACCESS_KEY:'',WEB3FORMS_KEY:''},stdio:['ignore','pipe','pipe']});
 t.after(async()=>{server.kill();await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));assert(root.startsWith(path.resolve(os.tmpdir())+path.sep));await fs.rm(root,{recursive:true,force:true});});
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('exit',()=>reject(Error('server exited')));setTimeout(()=>reject(Error('start timeout')),8000).unref();});
 const base='http://127.0.0.1:'+port;
 let r=await fetch(base+'/contact?service=whatsapp-chat-bot&plan=plan-whatsapp-001');let html=await r.text();
 assert(html.includes('name="service" value="whatsapp-chat-bot"'));assert(html.includes('name="plan" value="plan-whatsapp-001"'));assert(html.includes('name="consent" value="yes" required'));assert(html.includes('rel="canonical" href="https://flowagent.best/contact"'));
 html=await(await fetch(base+'/contact?service=not-a-service&plan=not-a-plan')).text();assert(!html.includes('value="not-a-service"'));assert(!html.includes('value="not-a-plan"'));
 const input={name:'Local test',email:'qa@example.test',message:'Only a local test',company:'Test',country:'Morocco',service:'whatsapp-chat-bot',plan:'plan-whatsapp-001'};
 r=await fetch(base+'/api/forms/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});assert.equal(r.status,400);
 r=await fetch(base+'/api/forms/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,consent:'yes'})});assert.equal(r.status,201);
 r=await fetch(base+'/api/forms/contact',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...input,consent:'yes'})});assert.equal(r.status,201);assert((await r.text()).includes('Your request is saved.'));
 r=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'contact-qa',password})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];
 const data=await(await fetch(base+'/api/admin-data',{headers:{Cookie:cookie}})).json();assert.equal(data.leads.length,2);
 for(const lead of data.leads){assert.equal(lead.serviceSlug,'whatsapp-chat-bot');assert.equal(lead.planId,'plan-whatsapp-001');assert.equal(lead.consent.contact,true);assert(lead.service.includes('WhatsApp'));}
});
