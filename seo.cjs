const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=p=>p==='/index.html'?'/':p.replace(/\.html$/,'').replace(/\/$/,'')||'/';
function base(data){try{const u=new URL(data.seo.siteUrl);if(!['https:','http:'].includes(u.protocol))throw Error();return u.origin;}catch{return 'https://flowagent.best';}}
function pageInfo(data,path){
 path=normalized(path);const service=path.startsWith('/services/')?data.services.find(s=>s.slug===path.slice(10)):null;
 const post=path.startsWith('/blog/')?data.blogPosts.find(s=>s.slug===path.slice(6)):null;
 const missing=(path.startsWith('/services/')&&!service)||(path.startsWith('/blog/')&&!post);
 const custom=data.seo.pages?.[path]||{};
 const title=(path==='/admin'?'Manage your website | FlowAgent':null)||custom.title||(service?service.title+' | FlowAgent':post?post.title+' | FlowAgent':data.seo.defaultTitle);
 const description=custom.description||service?.description||post?.excerpt||data.seo.defaultDescription;
 return {path,service,post,missing,title,description,url:base(data)+path,noindex:['/admin','/checkout','/studio','/payment-success','/payment-cancel','/service-detail'].includes(path)||missing||service?.legacy};
}
function apply(html,data,path){
 const info=pageInfo(data,path);const org={'@type':'Organization','@id':base(data)+'/#organization',name:data.settings.brandName||'FlowAgent',url:base(data),logo:base(data)+'/flowagent-logo.png'};
 const graph=[org,{'@type':'WebSite','@id':base(data)+'/#website',url:base(data),name:'FlowAgent',publisher:{'@id':org['@id']}}];
 if(info.service)graph.push({'@type':'Service',name:info.service.title,description:info.service.description,url:info.url,provider:{'@id':org['@id']}});
 if(info.service||info.post)graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base(data)},{'@type':'ListItem',position:2,name:info.service?'Services':'Blog',item:base(data)+(info.service?'/services':'/blog')},{'@type':'ListItem',position:3,name:info.service?.title||info.post.title,item:info.url}]});
 html=html.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi,'').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 const head=`<title>${esc(info.title)}</title><meta name="description" content="${esc(info.description)}"><link rel="canonical" href="${esc(info.url)}"><meta name="robots" content="${info.noindex?'noindex,follow':'index,follow'}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(info.title)}"><meta property="og:description" content="${esc(info.description)}"><meta property="og:url" content="${esc(info.url)}"><meta property="og:image" content="${base(data)}/flowagent-logo.png"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`;
 html=html.replace('</head>',head+'</head>');
 const put=(id,content)=>{const re=new RegExp('(<section[^>]*id="'+id+'"[^>]*>)[\\s\\S]*?(</section>)');html=html.replace(re,(_,a,b)=>a+content+b);};
 if(info.path==='/'){const h=data.pageContent.home;put('heroSection',`<div class="container"><h1>${esc(h.heroTitle)}</h1><p class="hero-text">${esc(h.heroText)}</p><a class="btn btn-primary" href="/contact">Discuss your project</a></div>`);put('servicesSection',`<div class="container"><h2>AI automation services</h2><div class="service-grid">${data.services.filter(s=>!s.legacy).map(s=>`<article class="service-card"><h3><a href="/services/${esc(s.slug)}">${esc(s.title)}</a></h3><p>${esc(s.description)}</p></article>`).join('')}</div></div>`);}
 if(info.service){const s=info.service;put('serviceDetailContainer',`<div class="container"><p class="eyebrow">FLOWAGENT SERVICES</p><h1>${esc(s.title)}</h1><p>${esc(s.description)}</p><h2>What's included</h2><ul>${(s.deliverables||[]).map(v=>`<li>${esc(v)}</li>`).join('')}</ul><a href="/contact?service=${encodeURIComponent(s.slug)}" class="btn btn-primary">Discuss this service</a></div>`);}
 return {html,...info};
}
module.exports={apply,pageInfo,base,normalized};
