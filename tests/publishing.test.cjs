const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process'),api=require('../publishing.cjs');
const article={approved:true,slug:'guide-test-automation',title:'A practical automation guide',excerpt:'A practical guide with a concrete workflow example.',category:'Automation',tags:['automation'],language:'fr',author:'FlowAgent Editorial',publishedAt:'2026-10-09',metaDescription:'Plan a simple workflow around approved information, a clear review step and useful handoff rules for your team.',contentHtml:'<h2>Plan a workflow</h2><p>'+('Choose a clear repeatable task and define the information and approval needed. '.repeat(40))+'</p><p><a href="/services/whatsapp-chat-bot">Explore WhatsApp</a></p>'};
test('publishing authentication is separate and fails without a configured secret',()=>{
 assert(!api.authorized('Bearer '+('x'.repeat(40)),undefined));assert(!api.authorized('Bearer wrong','x'.repeat(40)));assert(api.authorized('Bearer '+('x'.repeat(40)),'x'.repeat(40)));
});
test('idempotent publication preserves ID and original date; approval and slugs are validated',()=>{
 const d={blogPosts:[]};const first=api.publish(d,article);assert.equal(first.action,'created');assert.equal(api.publish(d,article).action,'unchanged');assert.equal(d.blogPosts.length,1);
 const updated=api.publish(d,{...article,title:'Revised guide',publishedAt:'2026-10-10'});assert.equal(updated.action,'updated');assert.equal(updated.post.id,first.post.id);assert.equal(updated.post.publishedAt,'2026-10-09');
 assert.throws(()=>api.normalizePost({...article,approved:false}),{statusCode:400});assert.throws(()=>api.normalizePost({...article,slug:'../private'}),{statusCode:400});
});
test('article links survive while scripts, executable attributes and unsafe protocols are removed',()=>{
 const text=api.articleHtml('<p onclick="bad()">Hello</p><script>bad()</script><a href="javascript:alert(1)">Unsafe</a><a href="/blog/safe">Safe</a><img src=x onerror=bad()>');
 assert(!text.includes('bad()'));assert(!text.includes('javascript:'));assert(text.includes('<a href="/blog/safe">Safe</a>'));assert(!text.includes('<img'));
});
test('batch publication validates every article before mutation and preserves linked article integrity',()=>{
 const d={blogPosts:[]};
 assert.throws(()=>api.publishBatch(d,{posts:[article,{...article,slug:'second',approved:false}]}),{statusCode:400});assert.equal(d.blogPosts.length,0);
 const one={...article,contentHtml:article.contentHtml+'<p><a href="/blog/second">Next guide</a></p>'},two={...article,slug:'second'};
 assert.throws(()=>api.publishBatch(d,{posts:[one]}),{statusCode:400});assert.equal(d.blogPosts.length,0);
 assert.equal(api.publishBatch(d,{posts:[one,two]}).created,2);assert.equal(api.publishBatch(d,{posts:[one,two]}).unchanged,2);assert.equal(d.blogPosts.length,2);
});
test('publishing API persists one post and exposes no admin or customer access',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'flowagent-publisher-'));await fs.cp(path.join(__dirname,'..'),root,{recursive:true,filter:p=>!p.includes(path.sep+'.git')&&!p.includes(path.sep+'node_modules')});
 await fs.writeFile(path.join(root,'data','approved-blog-posts.json'),JSON.stringify([article,{...article,slug:'draft-test',approved:false}]));
 const token=crypto.randomBytes(32).toString('base64url'),server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'4210',HOST:'127.0.0.1',FLOWAGENT_STORAGE_DIR:root,FLOWAGENT_PUBLISH_TOKEN:token,FLOWAGENT_SUPABASE_URL:'',FLOWAGENT_SUPABASE_SERVICE_ROLE_KEY:'',SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',WEB3FORMS_ACCESS_KEY:'',WEB3FORMS_KEY:''},stdio:['ignore','pipe','pipe']});
 t.after(async()=>{server.kill();await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));assert(root.startsWith(path.resolve(os.tmpdir())+path.sep));await fs.rm(root,{recursive:true,force:true});});
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('exit',()=>reject(Error('server exited')));setTimeout(()=>reject(Error('start timeout')),8000).unref();});
 const base='http://127.0.0.1:4210',headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
 assert.equal((await fetch(base+'/api/publishing/posts')).status,401);
 assert.equal((await fetch(base+'/api/admin-data',{headers})).status,401);
 assert.equal((await fetch(base+'/api/publishing/posts',{method:'DELETE',headers})).status,405);
 const library=await(await fetch(base+'/api/publishing/library',{headers})).json();assert.equal(library.posts.length,1);
 let r=await fetch(base+'/api/publishing/posts',{method:'POST',headers,body:JSON.stringify(article)});assert.equal(r.status,201);assert.equal((await r.json()).action,'created');
 r=await fetch(base+'/api/publishing/posts',{method:'POST',headers,body:JSON.stringify(article)});assert.equal(r.status,200);assert.equal((await r.json()).action,'unchanged');
 const posts=await(await fetch(base+'/api/publishing/posts',{headers})).json();assert.equal(posts.posts.filter(p=>p.slug===article.slug).length,1);
 r=await fetch(base+'/api/publishing/batch',{method:'POST',headers,body:JSON.stringify({posts:[article]})});assert.equal(r.status,200);assert.equal((await r.json()).unchanged,1);
 const html=await(await fetch(base+'/blog/'+article.slug)).text();assert(html.includes('lang="fr"'));assert(html.includes('BlogPosting'));assert(html.includes(article.metaDescription));assert(html.includes('href="/services/whatsapp-chat-bot"'));
 assert.equal((await fetch(base+'/sitemap.xml',{method:'HEAD'})).status,200);
 assert.equal((await fetch(base+'/robots.txt',{method:'HEAD'})).status,200);
 const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert(sitemap.includes('/blog/'+article.slug));
 assert(!JSON.stringify(posts).includes('sessionSecret'));assert(!JSON.stringify(posts).includes('leads'));
});
