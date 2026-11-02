import { onCloudflare } from '@/lib/cloudflare'
import { saveInquiryD1 } from '@/lib/inquiry-d1'
import { withReceipt } from '@/lib/receipt'
import { inquiryMessages } from '@/lib/inquiry-mail'
import { cms } from '@/lib/cms'
import { validateInquiry } from '@/lib/rules'
import { guardOrigin,getSession,readJSON,HttpError,errorResponse,rateLimit } from '@/lib/server'
export async function POST(request:Request){try{
  guardOrigin(request);const body=await readJSON(request)
  if(body.website)throw new HttpError(400,'Nie udało się wysłać formularza.')
  if(typeof body.idempotencyKey!=='string'||!/^[a-f0-9-]{36}$/.test(body.idempotencyKey))throw new HttpError(400,'Nieprawidłowy identyfikator zapytania.')
  const p=await cms()
  const existing=await p.find({collection:'inquiries',where:{idempotencyKey:{equals:body.idempotencyKey}},limit:1,depth:0})
  if(existing.docs[0]){
    // The random 128-bit submission key is a private retry capability, never included in URLs or public responses.
    // Return only the receipt number, including after an upload session has expired or been cleaned up.
    if(existing.docs[0].email!==String(body.email).trim())throw new HttpError(409,'Identyfikator jest już wykorzystany.')
    return Response.json({number:existing.docs[0].number})
  }
  if(!body.sessionId)throw new HttpError(400,'Brak sesji formularza.')
  const session=await getSession(request,String(body.sessionId),p)
  if(session.inquiryId)throw new HttpError(409,'To zapytanie zostało już wysłane.')
  const result=await p.find({collection:'quote-files',where:{sessionId:{equals:String(session.id)}},limit:10,depth:0})
  const files=result.docs
  if(files.some(f=>!['quarantined','clean','infected'].includes(f.status!)))throw new HttpError(400,'Poczekaj na zakończenie przesyłania wszystkich plików.')
  const parsed=validateInquiry(body,files)
  if(!parsed.success)throw new HttpError(400,parsed.error.issues.map(i=>i.message).join(' '))
  const data=parsed.data
  if(data.delivery==='pickup'){const settings=await p.findGlobal({slug:'website'});if(!settings.pickupEnabled)throw new HttpError(400,'Odbiór osobisty nie jest obecnie dostępny.')}
  let productSnapshot:Record<string,unknown>|undefined
  if(data.type==='product'){
    const product=await p.findByID({collection:'products',id:data.productId!,depth:0})
    if(!product.published||!product.available)throw new HttpError(400,'Ten produkt nie przyjmuje obecnie zapytań.')
    const variant=product.variants?.find(v=>v.name===data.variant)
    if(product.variants?.length&&!variant)throw new HttpError(400,'Wybierz dostępny wariant produktu.')
    productSnapshot={id:product.id,title:product.title,slug:product.slug,variant:variant?.name||'',color:variant?.color||'',priceFrom:product.priceFrom,quantity:data.quantity}
  }
  await rateLimit(request,'inquiries',8)
  if(onCloudflare){
    try{return await withReceipt(async number=>{await saveInquiryD1(data,String(session.id),body.idempotencyKey,number,files,productSnapshot);return Response.json({number},{status:201})})}
    catch(error){const retry=await p.find({collection:'inquiries',where:{idempotencyKey:{equals:body.idempotencyKey}},limit:1,depth:0});if(retry.docs[0]?.email===data.email)return Response.json({number:retry.docs[0].number});throw error}
  }
  return await withReceipt(async number=>{
  const transactionID=await p.db.beginTransaction();const req=transactionID?{transactionID}:undefined
  try{
    const {privacy,variant,productId,...fields}=data
    const inquiry=await p.create({collection:'inquiries',req,data:{...fields,number,status:'new',sessionId:String(session.id),idempotencyKey:body.idempotencyKey,productSnapshot,files:files.map(f=>f.id)}})
    for(const file of files)await p.update({collection:'quote-files',id:file.id,req,data:{inquiryId:String(inquiry.id)}})
    await p.update({collection:'upload-sessions',id:session.id,req,data:{inquiryId:String(inquiry.id)}})
    for(const message of inquiryMessages(data,number))await p.create({collection:'outbox',req,data:{...message,state:'pending',attempts:0,nextAttemptAt:new Date().toISOString()}})
    if(transactionID)await p.db.commitTransaction(transactionID)
    return Response.json({number},{status:201})
  }catch(e){if(transactionID)await p.db.rollbackTransaction(transactionID);throw e}
  })
}catch(e){return errorResponse(e)}}
