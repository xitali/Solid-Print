import { createHash,randomBytes,timingSafeEqual } from 'node:crypto'
import type { Payload } from 'payload'
import { cms } from './cms'
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex')
export const newToken=()=>randomBytes(32).toString('hex')
export function sameHash(token:string,expected:string){const a=Buffer.from(hash(token));const b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}
export function guardOrigin(request:Request){const origin=request.headers.get('origin');const expected=new URL(process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000').origin;if(!origin||origin!==expected)throw new HttpError(403,'Nieprawidłowe źródło zapytania. Odśwież stronę i spróbuj ponownie.')}
export class HttpError extends Error{constructor(public status:number,message:string,public code?:string){super(message)}}
export function errorResponse(error:unknown){if(error instanceof HttpError)return Response.json({error:error.message,code:error.code},{status:error.status});console.error('Błąd obsługi zapytania:',error instanceof Error?error.message:'unknown');return Response.json({error:'Nie udało się zakończyć operacji. Twoje dane pozostają w formularzu. Spróbuj ponownie.'},{status:500})}
export async function rateLimit(request:Request,namespace:string,max=12){
  // The outer Worker enforces FORM_LIMIT before Next runs. Avoid a D1 write per request.
  if(process.env.PLATFORM==='cloudflare')return hash(`${namespace}:${request.headers.get('cf-connecting-ip')||'unknown'}:${process.env.PAYLOAD_SECRET}`)
  const p=await cms();const ip=(process.env.PLATFORM==='cloudflare'?request.headers.get('cf-connecting-ip'):request.headers.get('x-forwarded-for')?.split(',')[0]?.trim())||'local'
  const key=hash(`${namespace}:${ip}:${process.env.PAYLOAD_SECRET}`)
  const now=new Date().toISOString()
  const recent=await p.count({collection:'rate-limits',where:{and:[{key:{equals:key}},{expiresAt:{greater_than:now}}]}})
  if(recent.totalDocs>=max)throw new HttpError(429,'Zbyt wiele prób. Odczekaj 15 minut i spróbuj ponownie.')
  await p.create({collection:'rate-limits',data:{key,expiresAt:new Date(Date.now()+15*60*1000).toISOString()}})
  return key
}
export async function getSession(request:Request,sessionId:string,p:Payload){
  let session;try{session=await p.findByID({collection:'upload-sessions',id:sessionId,depth:0})}catch{throw new HttpError(404,'Sesja wygasła. Wyślij zapytanie ponownie.','SESSION_EXPIRED')}
  const token=request.headers.get('x-upload-token')||''
  if(!session.tokenHash||!sameHash(token,session.tokenHash))throw new HttpError(403,'Brak dostępu do sesji.')
  if(!session.expiresAt||new Date(session.expiresAt).getTime()<Date.now())throw new HttpError(403,'Sesja wygasła. Wyślij zapytanie ponownie.','SESSION_EXPIRED')
  return session
}
export async function readJSON(request:Request,max=64000){
  if(!request.body)throw new HttpError(400,'Brak danych formularza.')
  const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new HttpError(413,'Zbyt dużo danych.')}chunks.push(value)}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new HttpError(400,'Nieprawidłowe dane formularza.')}
}
