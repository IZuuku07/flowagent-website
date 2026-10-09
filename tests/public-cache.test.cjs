const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPublicCache}=require('../public-cache.cjs');
test('public cache coalesces reads and does not expose mutable cached objects',async()=>{
 let reads=0;const cache=createPublicCache({read:async()=>{reads++;return {title:'Original'};}});
 const [a,b]=await Promise.all([cache.get(),cache.get()]);assert.equal(reads,1);a.title='Modified';assert.equal(b.title,'Original');assert.equal((await cache.get()).title,'Original');
});
test('a saved public edit is visible immediately and wins over an older read',async()=>{
 let resolve;const cache=createPublicCache({read:()=>new Promise(r=>resolve=r)});
 const pending=cache.get();await Promise.resolve();cache.committed({title:'Saved'});resolve({title:'Old'});assert.equal((await pending).title,'Saved');assert.equal((await cache.get()).title,'Saved');
});
test('expired cache does not silently fall back after a database failure',async()=>{
 let time=0,fail=false;const cache=createPublicCache({ttl:10,now:()=>time,read:async()=>{if(fail)throw Error('Database unavailable');return {title:'Known'};}});
 await cache.get();time=11;fail=true;await assert.rejects(cache.get(),/Database unavailable/);
});
test('uncertain writes invalidate the public snapshot before a retry reads the database',async()=>{
 let data={title:'Before'},reads=0;const cache=createPublicCache({read:async()=>{reads++;return data;}});
 await cache.get();data={title:'Committed despite a timeout'};cache.invalidate();assert.equal((await cache.get()).title,data.title);assert.equal(reads,2);
});
