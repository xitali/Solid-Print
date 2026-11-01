import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { cms } from '@/lib/cms'
import { validateFiles } from '@/lib/rules'
import { guardOrigin,rateLimit,readJSON,newToken,hash,errorResponse,HttpError } from '@/lib/server'
const schema=z.object({files:z.array(z.object({name:z.string(),size:z.number(),kind:z.enum(['model','reference'])})).max(8),website:z.string().optional()})
export async function POST(request:Request){try{
  guardOrigin(request);const parsed=schema.safeParse(await readJSON(request));if(!parsed.success)throw new HttpError(400,'Nieprawidłowa lista załączników.');if(parsed.data.website)throw new HttpError(400,'Nie udało się wysłać zapytania.')
  const errors=validateFiles(parsed.data.files);if(errors.length)throw new HttpError(400,errors.join(' '))
  const ipHash=await rateLimit(request,'sessions');const p=await cms();const token=newToken()
  const session=await p.create({collection:'upload-sessions',data:{tokenHash:hash(token),ipHash,expiresAt:new Date(Date.now()+2*3600000).toISOString()}})
  const files=[];for(const f of parsed.data.files){const doc=await p.create({collection:'quote-files',data:{...f,sessionId:String(session.id),objectKey:`quote/${randomUUID()}`,status:'pending'}});files.push({id:doc.id,name:f.name})}
  return Response.json({sessionId:session.id,token,files},{headers:{'Cache-Control':'no-store'}})
}catch(e){return errorResponse(e)}}
