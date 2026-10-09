'use strict';
// Owner-authorized publication of the reviewed 9 October 2026 article release.
// This is a one-time content migration, not automatic publication of future drafts.
const crypto=require('node:crypto');
const {publishBatch}=require('./publishing.cjs');
const RELEASE='flowagent-reviewed-blog-2026-10-09';
const DIGEST='4ebe438464f374de4ea717f9ba98f5a444cf7c201f41b074157abb90f6621d8d';
async function publishRelease(documents,library){
 const data=await documents.read('public');
 if(!data)throw Error('Public content is not initialized.');
 if(data._contentReleases?.[RELEASE])return {release:RELEASE,alreadyApplied:true,created:0};
 if(!Array.isArray(library)||library.length!==100||crypto.createHash('sha256').update(JSON.stringify(library)).digest('hex')!==DIGEST)throw Error('Approved blog release does not match the reviewed library. No publication was attempted.');
 const existing=new Set((data.blogPosts||[]).map(p=>p.slug));
 const missing=library.filter(p=>!existing.has(p.slug));
 const receipt=missing.length?publishBatch(data,{posts:missing}):{created:0,updated:0,unchanged:0};
 data._contentReleases={...data._contentReleases,[RELEASE]:{appliedAt:new Date().toISOString(),libraryDigest:DIGEST,created:receipt.created,retainedExisting:100-missing.length}};
 await documents.write('public',data);
 return {release:RELEASE,created:receipt.created,retainedExisting:100-missing.length};
}
module.exports={publishRelease,RELEASE};
