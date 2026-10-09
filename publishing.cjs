'use strict';
const crypto=require('node:crypto');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function articleHtml(input){
 return String(input||'').replace(/<(script|style|iframe)[\s\S]*?<\/\1\s*>/gi,'').replace(/<[^>]*>/g,tag=>{
  if(/^<\/?(?:p|h2|h3|ul|ol|li|strong|em|blockquote|br)\s*\/?>$/i.test(tag))return tag;
  if(/^<\/a\s*>$/i.test(tag))return '</a>';
  const match=tag.match(/^<a\s+href\s*=\s*(["'])([^"']+)\1\s*>$/i);
  if(!match)return '';
  const url=match[2];if(/[\s<>\\]/.test(url)||!(/^(?:https:\/\/[^/]+\/|\/(?!\/)[a-zA-Z0-9])/.test(url)))return '';
  return '<a href="'+esc(url)+'">';
 });
}
function authorized(header,token){
 if(typeof token!=='string'||token.length<32)return false;
 const supplied=typeof header==='string'&&header.startsWith('Bearer ')?header.slice(7):'';
 const a=Buffer.from(supplied),b=Buffer.from(token);return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
function normalizePost(body){
 const fail=message=>{throw Object.assign(Error(message),{statusCode:400});};
 if(!body||typeof body!=='object'||Array.isArray(body))fail('Expected an article object.');
 if(body.approved!==true)fail('Only editorially approved articles can be published.');
 const text=(key,max,required=false)=>{if(typeof body[key]!=='string'&&body[key]!==undefined)fail('Invalid '+key);const value=String(body[key]||'').trim();if(value.length>max||(required&&!value))fail('Invalid '+key);return value;};
 const slug=text('slug',140,true);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))fail('Invalid article slug.');
 const title=text('title',160,true),content=articleHtml(text('contentHtml',90000,true));
 if(content.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length<300)fail('Article is too short to publish.');
 const publishedAt=text('publishedAt',40)||new Date().toISOString().slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)||!Number.isFinite(Date.parse(publishedAt)))fail('Invalid publication date.');
 const language=text('language',5)||'en';if(!['en','fr','ar'].includes(language))fail('Unsupported article language.');
 const imageUrl=text('imageUrl',200);if(imageUrl&&!/^\/media\/brand\/(hero|whatsapp|social|blog|ugc|workflow)\.webp$/.test(imageUrl))fail('Invalid article image.');
 if(body.tags!==undefined&&(!Array.isArray(body.tags)||body.tags.length>8||body.tags.some(v=>typeof v!=='string'||v.length>64)))fail('Invalid tags.');
 return {id:'blog-'+crypto.createHash('sha256').update(slug).digest('hex').slice(0,20),slug,title,excerpt:text('excerpt',600,true),category:text('category',100,true),tags:body.tags||[],author:text('author',100)||'FlowAgent Editorial',publishedAt,metaDescription:text('metaDescription',180,true),language,imageUrl,imageAlt:text('imageAlt',200),contentHtml:content,editorialDisclosure:text('editorialDisclosure',250),updatedAt:new Date().toISOString()};
}
function publish(data,body){
 const post=normalizePost(body),posts=data.blogPosts||[];const index=posts.findIndex(p=>p.slug===post.slug);let action='created';
 if(index>=0){
  action='updated';post.id=posts[index].id;post.publishedAt=posts[index].publishedAt||post.publishedAt;
  const old=posts[index];const equal=Object.keys(post).filter(k=>k!=='updatedAt').every(k=>JSON.stringify(old[k])===JSON.stringify(post[k]));
  if(equal)return {action:'unchanged',post:old};posts[index]={...old,...post};
 }else posts.push(post);
 data.blogPosts=posts;
 return {action,post};
}
function publishBatch(data,body){
 if(!body||!Array.isArray(body.posts)||body.posts.length<1||body.posts.length>100)throw Object.assign(Error('Provide between 1 and 100 approved articles.'),{statusCode:400});
 const normalized=body.posts.map(normalizePost),slugs=new Set(normalized.map(p=>p.slug));
 if(slugs.size!==normalized.length)throw Object.assign(Error('Duplicate slugs in publication batch.'),{statusCode:400});
 const known=new Set([...(data.blogPosts||[]).map(p=>p.slug),...slugs]);
 for(const post of normalized){
  for(const match of post.contentHtml.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)){
   if(!known.has(match[1]))throw Object.assign(Error('Unpublished internal article link: '+match[1]),{statusCode:400});
  }
 }
 const copy=structuredClone(data);
 const receipts=body.posts.map(p=>{const r=publish(copy,p);return {action:r.action,id:r.post.id,slug:r.post.slug};});
 data.blogPosts=copy.blogPosts;
 return {posts:receipts,created:receipts.filter(p=>p.action==='created').length,updated:receipts.filter(p=>p.action==='updated').length,unchanged:receipts.filter(p=>p.action==='unchanged').length};
}
module.exports={articleHtml,authorized,normalizePost,publish,publishBatch};
