import {cms} from '@/lib/cms'
import {deleteObject} from '@/lib/storage'
import {errorResponse,guardOrigin,HttpError,readJSON} from '@/lib/server'

async function owned(request:Request,id:string){
  if(!/^\d+$/.test(id))throw new HttpError(404,'Nie znaleziono zapytania.')
  const p=await cms()
  const {user}=await p.auth({headers:request.headers})
  if(user?.role!=='owner')throw new HttpError(401,'Zaloguj się jako właściciel.')
  const inquiry=await p.findByID({collection:'inquiries',id,depth:0,overrideAccess:false,user})
  return {p,user,inquiry}
}
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params
    const {inquiry}=await owned(request,id)
    const {idempotencyKey,sessionId,...data}=inquiry
    return new Response(JSON.stringify(data,null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="zapytanie-${id}.json"`,'Cache-Control':'private, no-store'}})
  }catch(e){return errorResponse(e)}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    guardOrigin(request)
    const {id}=await params
    const {p,user,inquiry}=await owned(request,id)
    const body=await readJSON(request,2000)
    if(body.action!=='anonymize'||body.confirmNumber!==inquiry.number)throw new HttpError(400,'Potwierdź numer zapytania.')
    const files=await p.find({collection:'quote-files',where:{inquiryId:{equals:id}},limit:10,depth:0,overrideAccess:false,user})
    // Fail closed on storage failure. A retry can complete an interrupted operation.
    for(const file of files.docs){if(file.objectKey)await deleteObject(file.objectKey);await p.delete({collection:'quote-files',id:file.id,overrideAccess:false,user})}
    await p.delete({collection:'outbox',where:{subject:{contains:inquiry.number}},overrideAccess:false,user})
    await p.update({collection:'inquiries',id,overrideAccess:false,user,context:{anonymize:true},data:{
      name:'Dane usunięte',email:'',phone:'',company:'',nip:'',description:'Dane osobowe i opis usunięte na żądanie.',notes:'',material:'',color:'',deadline:'',productSnapshot:null,files:[],status:'closed',history:[],
    }})
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})
  }catch(e){return errorResponse(e)}
}
