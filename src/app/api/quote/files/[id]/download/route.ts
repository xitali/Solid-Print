import { Readable } from 'node:stream'
import { cms } from '@/lib/cms'
import { canDownload } from '@/lib/rules'
import { readObject } from '@/lib/storage'
import { errorResponse,HttpError } from '@/lib/server'
import { createDownloadGrant,verifyDownloadGrant } from '@/lib/download-grants'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
  const p=await cms();const {user}=await p.auth({headers:request.headers});if(!user)throw new HttpError(401,'Zaloguj się w panelu właściciela.')
  const {id}=await params;const file=await p.findByID({collection:'quote-files',id,depth:0,user,overrideAccess:false})
  if(!canDownload(user,file.status!))throw new HttpError(403,'Plik pozostaje w kwarantannie lub nie masz dostępu.')
  const url=new URL(request.url);const secret=process.env.PAYLOAD_SECRET!
  if(!url.searchParams.has('expires')&&!url.searchParams.has('signature')){const grant=createDownloadGrant(id,file.contentHash||'',secret);url.searchParams.set('expires',String(grant.expires));url.searchParams.set('signature',grant.signature);return new Response(null,{status:302,headers:{Location:url.toString(),'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}})}
  if(!verifyDownloadGrant(id,file.contentHash||'',secret,Number(url.searchParams.get('expires')),url.searchParams.get('signature')||''))throw new HttpError(403,'Odnośnik wygasł. Otwórz plik ponownie z panelu właściciela.')
  const obj=await readObject(file.objectKey!)
  return new Response(Readable.toWeb(obj.stream) as ReadableStream,{headers:{'Content-Type':'application/octet-stream','Content-Length':String(obj.size),'Content-Disposition':`attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(file.name)}`,'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}})
}catch(e){return errorResponse(e)}}
