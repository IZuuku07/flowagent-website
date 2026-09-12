const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const upgrade=require('../content-upgrade.cjs');
const seo=require('../seo.cjs');
const data=require('../data/public-content.json');
test('upgrades preserve custom content and removed services across admin saves',()=>{
 const edited=structuredClone(data);
 edited.pageContent.home.heroTitle='My edited title';
 edited.services=edited.services.slice(1);
 edited.services[0].description='Owner edited service';
 edited.seo.pages['/'].title='Owner edited SEO';
 const updated=upgrade(edited);
 assert.equal(updated.pageContent.home.heroTitle,'My edited title');
 assert.equal(updated.services.length,edited.services.length);
 assert.equal(updated.services[0].description,'Owner edited service');
 assert.equal(updated.seo.pages['/'].title,'Owner edited SEO');
 assert.deepEqual(upgrade(updated),updated);
});
test('rendered content escapes owner input and does not interpret replacement tokens',()=>{
 const edited=structuredClone(data);
 edited.pageContent.home.heroTitle='$& <script>alert(1)</script>';
 const result=seo.apply(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),edited,'/').html;
 assert(result.includes('<h1>$&amp; &lt;script&gt;alert(1)&lt;/script&gt;</h1>'));
 assert.equal((result.match(/<main\b/g)||[]).length,1);
 assert(!result.includes('<script>alert(1)</script>'));
});
test('blog body is server rendered with executable attributes removed',()=>{
 const edited=structuredClone(data);
 edited.blogPosts[0].contentHtml='<h2>Useful heading</h2><p onclick="bad()">Safe text</p><script>bad()</script>';
 const result=seo.apply('<html><head><title>Blog</title></head><body><main></main></body></html>',edited,'/blog/'+edited.blogPosts[0].slug).html;
 assert(result.includes('<h2>Useful heading</h2>'));
 assert(result.includes('Safe text'));
 assert(!result.includes('bad()'));
});
