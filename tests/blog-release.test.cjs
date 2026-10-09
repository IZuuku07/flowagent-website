const {test}=require('node:test'),assert=require('node:assert/strict');
const {publishRelease,RELEASE}=require('../blog-release.cjs');
const library=require('../data/approved-blog-posts.json');
function store(initial){let state=structuredClone(initial),writes=0;return {read:async name=>{assert.equal(name,'public');return structuredClone(state);},write:async(name,value)=>{assert.equal(name,'public');state=structuredClone(value);writes++;},state:()=>state,writes:()=>writes};}
test('reviewed release publishes all linked articles once and preserves unrelated public fields',async()=>{
 const db=store({settings:{brandName:'Owner brand'},blogPosts:[],ownerMetadata:{keep:true}});
 const result=await publishRelease(db,library);assert.equal(result.created,100);assert.equal(db.state().blogPosts.length,100);assert.deepEqual(db.state().ownerMetadata,{keep:true});assert.equal(db.state().settings.brandName,'Owner brand');
 assert(db.state()._contentReleases[RELEASE]);assert.equal((await publishRelease(db,library)).alreadyApplied,true);assert.equal(db.writes(),1);
 // A later deliberate removal must not be undone by a restart.
 await db.write('public',{...db.state(),blogPosts:[]});await publishRelease(db,library);assert.equal(db.state().blogPosts.length,0);assert.equal(db.writes(),2);
});
test('release keeps existing owner-edited articles and refuses a changed or unapproved library',async()=>{
 const edited={...library[0],title:'Owner edited title',contentHtml:'Owner content',id:'owner-id'};
 const db=store({blogPosts:[edited]});assert.equal((await publishRelease(db,library)).created,99);assert.deepEqual(db.state().blogPosts[0],edited);
 const invalid=store({blogPosts:[]});await assert.rejects(publishRelease(invalid,library.map((p,i)=>i===0?{...p,approved:false}:p)),/does not match/);assert.equal(invalid.writes(),0);assert.equal(invalid.state().blogPosts.length,0);
});
