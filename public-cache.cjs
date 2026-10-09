'use strict';
function createPublicCache({read,upgrade=v=>v,ttl=15000,now=Date.now}){
 let value=null,expires=0,pending=null,generation=0;
 async function get(){
  if(value!==null&&now()<expires)return upgrade(structuredClone(value));
  if(!pending){
   const version=generation;
   pending=Promise.resolve().then(read).then(data=>{
    if(!data)throw Object.assign(Error('Website content is not initialized'),{statusCode:503});
    if(version===generation){value=structuredClone(data);expires=now()+ttl;}
   }).finally(()=>{pending=null;});
  }
  await pending;if(value===null)return get();return upgrade(structuredClone(value));
 }
 function committed(data){generation++;value=structuredClone(data);expires=now()+ttl;}
 function invalidate(){generation++;value=null;expires=0;}
 return {get,committed,invalidate};
}
module.exports={createPublicCache};
