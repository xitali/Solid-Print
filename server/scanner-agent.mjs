import { createHash } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { spawn } from 'node:child_process'

const origin=new URL(process.env.SOLIDPRINT_URL)
if(origin.protocol!=='https:')throw new Error('Scanner requires HTTPS')
if(!process.env.SCANNER_TOKEN)throw new Error('Missing scanner token')
const headers={Authorization:'Bearer '+process.env.SCANNER_TOKEN}
async function call(path,options={}){
  const response=await fetch(new URL('/internal/scanner/'+path,origin),{...options,headers:{...headers,...options.headers},redirect:'error',signal:AbortSignal.timeout(180000)})
  if(!response.ok)throw new Error('Scanner API '+response.status)
  return response
}
async function scan(path){
  return new Promise((resolve,reject)=>{
    const child=spawn('/usr/bin/clamdscan',['--no-summary','--stream',path],{stdio:'ignore',timeout:120000})
    child.on('error',reject)
    child.on('exit',code=>code===0?resolve('clean'):code===1?resolve('infected'):reject(new Error('ClamAV unavailable or incomplete scan')))
  })
}
const {files}=await (await call('jobs')).json()
for(const file of files){
  const directory=await mkdtemp(join(tmpdir(),'solidprint-scan-'))
  try {
    if(!Number.isSafeInteger(file.id)||!Number.isSafeInteger(file.size)||file.size<=0||file.size>100*1024*1024||!/^[a-f0-9]{64}$/.test(file.hash))throw new Error('Invalid job')
    const response=await call(file.id+'/content')
    let size=0
    const hash=createHash('sha256')
    const limit=new Transform({transform(chunk,encoding,done){size+=chunk.length;hash.update(chunk);done(size>file.size?new Error('File size exceeded'):null,chunk)}})
    const path=join(directory,'model')
    await pipeline(Readable.fromWeb(response.body),limit,createWriteStream(path,{mode:0o600}),{signal:AbortSignal.timeout(180000)})
    if(size!==file.size||hash.digest('hex')!==file.hash)throw new Error('Content hash mismatch')
    const status=await scan(path)
    await call(file.id+'/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hash:file.hash,status})})
    console.log(JSON.stringify({event:'scan_complete',id:file.id,status}))
  }finally{await rm(directory,{recursive:true,force:true})}
}
