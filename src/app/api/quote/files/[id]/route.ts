import { Readable,Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { mkdtemp,rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { cms } from '@/lib/cms'
import { guardOrigin,getSession,HttpError,errorResponse } from '@/lib/server'
import { claimUpload } from '@/lib/database'
import { storeFile } from '@/lib/storage'
export const runtime='nodejs'
export const maxDuration=300
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  let temp:string|undefined
  try{guardOrigin(request);const {id}=await params;const p=await cms();const file=await p.findByID({collection:'quote-files',id,depth:0})
    const session=await getSession(request,file.sessionId!,p)
    if(session.inquiryId)throw new HttpError(409,'To zapytanie zostało już wysłane.')
    if(!request.body)throw new HttpError(400,'Brak zawartości pliku.')
    if(['quarantined','clean'].includes(file.status!))return Response.json({ok:true,alreadyUploaded:true})
    if(!await claimUpload(p,id))throw new HttpError(409,'Ten plik jest już przesyłany lub został przesłany. Odczekaj chwilę przed ponowieniem.')
    temp=await mkdtemp(path.join(tmpdir(),'solid-print-'));const dest=path.join(temp,'upload')
    const digest=createHash('sha256');let bytes=0;const limiter=new Transform({transform(chunk,_,cb){bytes+=chunk.length;digest.update(chunk);cb(bytes>file.size?new Error('Plik przekracza zadeklarowany rozmiar.'):null,chunk)}})
    try{
      await pipeline(Readable.fromWeb(request.body as never),limiter,createWriteStream(dest,{mode:0o600}),{signal:AbortSignal.timeout(5*60*1000)})
      if(bytes!==file.size)throw new HttpError(400,'Plik jest niekompletny. Spróbuj ponownie.')
      await storeFile(file.objectKey!,dest,bytes)
      await p.update({collection:'quote-files',id,data:{status:'quarantined',contentHash:digest.digest('hex')}})
    }catch(e){await p.update({collection:'quote-files',id,data:{status:'pending'}});throw e}
    return Response.json({ok:true})
  }catch(e){return errorResponse(e)}finally{if(temp)await rm(temp,{recursive:true,force:true})}
}
