import type { Payload } from 'payload'
import nodemailer from 'nodemailer'
import { readObject,deleteObject } from './storage'
import { scanStream } from './clamav'
export async function processMail(p:Payload){
  const messages=await p.find({collection:'outbox',where:{and:[{state:{equals:'pending'}},{nextAttemptAt:{less_than_equal:new Date().toISOString()}}]},limit:20,depth:0})
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined})
  for(const message of messages.docs){try{
    await transport.sendMail({from:process.env.SMTP_FROM,to:message.to,subject:message.subject,text:message.text,messageId:`<solidprint-${message.id}@${new URL(process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000').hostname}>`})
    await p.update({collection:'outbox',id:message.id,data:{state:'sent',attempts:(message.attempts||0)+1,lastError:''}})
  }catch(e){const attempts=(message.attempts||0)+1;await p.update({collection:'outbox',id:message.id,data:{attempts,state:attempts>=8?'failed':'pending',lastError:(e as Error).message.slice(0,300),nextAttemptAt:new Date(Date.now()+Math.min(3600000,30000*2**attempts)).toISOString()}})}}
  transport.close()
  return messages.docs.length
}
export async function processScans(p:Payload){
  const files=await p.find({collection:'quote-files',where:{status:{equals:'quarantined'}},limit:10,depth:0})
  for(const file of files.docs){try{if(!file.contentHash)continue;const obj=await readObject(file.objectKey!);const result=await scanStream(obj.stream);await p.db.pool.query("UPDATE quote_files SET status=$1, scan_message=$2, updated_at=NOW() WHERE id=$3 AND status='quarantined' AND content_hash=$4",[result.clean?'clean':'infected',result.message,file.id,file.contentHash])}catch{await p.update({collection:'quote-files',id:file.id,data:{scanMessage:'Skaner niedostępny lub skan nieukończony. Plik pozostaje w kwarantannie.'}})}}
  return files.docs.length
}
export async function cleanup(p:Payload,now=new Date()){
  const orphanBefore=new Date(now.getTime()-24*3600000).toISOString()
  const abandoned=await p.find({collection:'quote-files',where:{and:[{createdAt:{less_than:orphanBefore}},{inquiryId:{exists:false}}]},limit:100,depth:0})
  for(const f of abandoned.docs){if(f.objectKey)await deleteObject(f.objectKey);await p.delete({collection:'quote-files',id:f.id})}
  let cursor=0
  while(true){const closed=await p.find({collection:'inquiries',where:{and:[{id:{greater_than:cursor}},{closedAt:{less_than:new Date(now.getTime()-90*86400000).toISOString()}},{status:{in:['closed','rejected']}}]},limit:100,depth:0,sort:'id'})
    if(!closed.docs.length)break
    for(const inquiry of closed.docs){const files=await p.find({collection:'quote-files',where:{inquiryId:{equals:String(inquiry.id)}},limit:10});await p.update({collection:'inquiries',id:inquiry.id,data:{files:[]}});for(const f of files.docs){if(f.objectKey)await deleteObject(f.objectKey);await p.delete({collection:'quote-files',id:f.id})}if(new Date(inquiry.closedAt!).getTime()<now.getTime()-365*86400000)await p.delete({collection:'inquiries',id:inquiry.id});cursor=inquiry.id}
  }
  for(const collection of ['upload-sessions','rate-limits'] as const){await p.delete({collection,where:{expiresAt:{less_than:new Date(now.getTime()-24*3600000).toISOString()}}})}
  const expiredMail=await p.find({collection:'outbox',where:{and:[{state:{in:['sent','failed']}},{createdAt:{less_than:new Date(now.getTime()-30*86400000).toISOString()}}]},limit:100});for(const m of expiredMail.docs)await p.delete({collection:'outbox',id:m.id})
  // A connection interrupted while streaming may leave a row in uploading.
  await p.update({collection:'quote-files',where:{and:[{status:{equals:'uploading'}},{updatedAt:{less_than:new Date(now.getTime()-10*60000).toISOString()}}]},data:{status:'pending'}})
}
