import { createHmac,timingSafeEqual } from 'node:crypto'
const sign=(id:string,hash:string,expires:number,secret:string)=>createHmac('sha256',secret).update(`${id}:${hash}:${expires}`).digest('hex')
export function createDownloadGrant(id:string,hash:string,secret:string,now=Date.now()){const expires=now+5*60000;return {expires,signature:sign(id,hash,expires,secret)}}
export function verifyDownloadGrant(id:string,hash:string,secret:string,expires:number,signature:string,now=Date.now()){
  if(!Number.isSafeInteger(expires)||expires<=now||expires>now+5*60000||!/^[a-f0-9]{64}$/.test(signature))return false
  return timingSafeEqual(Buffer.from(signature),Buffer.from(sign(id,hash,expires,secret)))
}
