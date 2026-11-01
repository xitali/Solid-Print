// OpenNext uses directory symlinks. Windows junctions work without Developer Mode.
import fs from 'node:fs'
import {syncBuiltinESMExports} from 'node:module'
if(process.platform==='win32'){
  const original=fs.symlinkSync
  fs.symlinkSync=(target,path,type)=>{
    try{return original(target,path,type)}catch(error){
      if(error.code!=='EPERM'||!fs.statSync(target).isDirectory())throw error
      return original(target,path,'junction')
    }
  }
  syncBuiltinESMExports()
}
