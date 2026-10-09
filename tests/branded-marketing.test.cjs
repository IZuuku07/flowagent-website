const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const marketing=require('../marketing.cjs');
const upgrade=require('../content-upgrade.cjs');
const seo=require('../seo.cjs');
const seed=require('../data/public-content.json');
test('homepage CTA labels and destinations reflect saved owner content',()=>{
 const d=upgrade(seed);
 Object.assign(d.pageContent.home,{primaryCtaLabel:'Ask us',primaryCtaLink:'/contact?source=home',secondaryCtaLabel:'Our services',secondaryCtaLink:'/services',finalCtaLabel:'Talk to the team',finalCtaLink:'/contact?source=footer'});
 const html=marketing.render(d,'/',{});
 assert(html.includes('href="/contact?source=home">Ask us</a>'));
 assert(html.includes('href="/services">Our services</a>'));
 assert(html.includes('href="/contact?source=footer">Talk to the team</a>'));
});
test('home contains all four services but does not restore owner-removed services',()=>{
 const d=upgrade(seed);
 let html=marketing.render(d,'/',{});
 for(const s of ['social-media-manager','blog-automation','whatsapp-chat-bot','social-media-automation'])assert(html.includes('/services/'+s));
 d.services=d.services.filter(s=>s.slug!=='social-media-automation');
 html=marketing.render(d,'/',{});assert(!html.includes('/services/social-media-automation'));
});
test('brand imagery replaces generic defaults while owner images are preserved and escaped',()=>{
 const d=upgrade(seed),s=d.services.find(s=>s.slug==='whatsapp-chat-bot');
 assert(marketing.render(d,'/',{}).includes('/media/brand/whatsapp.webp'));
 s.imageUrl='https://example.com/custom.png';s.imageAlt='Owner <image>';
 const html=marketing.render(d,'/',{});
 assert(html.includes('src="https://example.com/custom.png"'));
 assert(html.includes('alt="Owner &lt;image&gt;"'));
 s.imageUrl='javascript:alert(1)';assert(!marketing.render(d,'/',{}).includes('javascript:'));
});
test('unsafe CTA protocols are not rendered',()=>{
 const d=upgrade(seed);d.pageContent.home.primaryCtaLink='javascript:alert(1)';d.pageContent.home.primaryCtaLabel='<script>bad()</script>';
 const html=marketing.render(d,'/',{});assert(!html.includes('href="javascript:'));assert(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
});
test('hero is server-rendered with dimensions and priority, other imagery is lazy',()=>{
 const d=upgrade(seed),html=marketing.render(d,'/',{});
 assert(html.includes('/media/brand/hero.webp'));assert(html.includes('fetchpriority="high"'));assert(html.includes('loading="lazy"'));assert(html.includes('width="1024" height="1024"'));
});
test('upgrade preserves edited and deleted records',()=>{
 const d=structuredClone(seed);d.pageContent.home.heroTitle='Owner title';d.services=d.services.slice(1);d.services[0].description='Owner description';
 const result=upgrade(d);assert.equal(result.pageContent.home.heroTitle,'Owner title');assert.equal(result.services.length,d.services.length);assert.equal(result.services[0].description,'Owner description');assert.deepEqual(upgrade(result),result);
});
test('server-rendered owner copy remains escaped and preserves one main element',()=>{
 const d=upgrade(seed);d.pageContent.home.heroTitle='$& <script>alert(1)</script>';
 const result=seo.apply(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),d,'/').html;
 assert(result.includes('<h1>$&amp; &lt;script&gt;alert(1)&lt;/script&gt;</h1>'));assert.equal((result.match(/<main\b/g)||[]).length,1);assert(!result.includes('<script>alert(1)</script>'));
});
