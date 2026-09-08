const fs=require('node:fs/promises');
const path=require('node:path');
function paths(root,env=process.env){const dataDir=env.FLOWAGENT_DATA_DIR?path.resolve(env.FLOWAGENT_DATA_DIR):path.join(root,'data');return {dataDir,publicContent:path.join(dataDir,'public-content.json'),privateRuntime:path.join(dataDir,'private-runtime.json'),config:env.FLOWAGENT_DATA_DIR?path.join(dataDir,'server-config.json'):path.join(root,'server-config.json')};}
async function initialize(root,env=process.env){const p=paths(root,env);await fs.mkdir(p.dataDir,{recursive:true});const seed=path.join(root,'data','public-content.json');if(path.resolve(seed)!==path.resolve(p.publicContent)){try{await fs.copyFile(seed,p.publicContent,require('node:fs').constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;}}return p;}
module.exports={paths,initialize};
