import dotenv from 'dotenv'
import assert from 'node:assert/strict'
import { readFile,writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { sendInquiry,type SubmissionState,type SubmissionSession,type UploadItem } from '../src/lib/submission'
dotenv.config({quiet:true})
if(process.env.LOCAL_DEVELOPMENT!=='true')throw new Error('Test wyłącznie lokalny.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const p=await getPayload({config})
// A local test run can exceed the public rate limit. Remove only localhost QA rate-limit rows in this isolated dev database.
await p.delete({collection:'rate-limits',where:{id:{greater_than:0}}})
const base='http://127.0.0.1:3000';const fetcher=(url:string,init:RequestInit)=>fetch(base+url,{...init,headers:{...init.headers,Origin:base}})
const create=await fetcher('/api/quote/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({files:[]})}).then(r=>r.json())
const state:SubmissionState={key:randomUUID(),session:{id:create.sessionId,token:create.token,files:[],uploaded:new Set()}}
await p.update({collection:'upload-sessions',id:create.sessionId,data:{expiresAt:new Date(Date.now()-1000).toISOString()}})
const data={type:'design',name:'Test sesji',email:'session@solidprint.local',description:'TEST QA — odnowienie sesji bez utraty danych.',privacy:true}
const number=await sendInquiry(state,data,[],undefined,fetcher);assert.ok(number);assert.notEqual(state.session?.id,create.sessionId)
await p.update({collection:'upload-sessions',id:state.session!.id,data:{expiresAt:new Date(Date.now()-1000).toISOString()}})
assert.equal(await sendInquiry(state,data,[],undefined,fetcher),number)
assert.equal((await p.count({collection:'inquiries',where:{idempotencyKey:{equals:state.key}}})).totalDocs,1)
const bytes=await readFile('.data/qa/model.stl');const file=new File([bytes],'model.stl')
const one:UploadItem={id:randomUUID(),file,kind:'model'},two:UploadItem={id:randomUUID(),file:new File([bytes],'second.stl'),kind:'model'}
const fileState:SubmissionState={key:randomUUID(),session:null};let interrupted=true
const sendFile=async(item:UploadItem,id:number,s:SubmissionSession)=>{if(item.id===two.id&&interrupted){interrupted=false;throw new Error('Test przerwania sieci')};const response=await fetcher(`/api/quote/files/${id}`,{method:'PUT',headers:{'x-upload-token':s.token},body:item.file});assert.equal(response.status,200)}
await assert.rejects(()=>sendInquiry(fileState,{...data,type:'print'},[one,two],sendFile,fetcher),/przerwania/)
assert.ok(fileState.session?.uploaded.has(one.id))
fileState.session=null // Client changed the attachment list after a partial upload.
const third:UploadItem={id:randomUUID(),file:new File([bytes],'third.stl'),kind:'model'}
const receipt=await sendInquiry(fileState,{...data,type:'print'},[one,third],sendFile,fetcher);assert.ok(receipt)
const inquiry=await p.find({collection:'inquiries',where:{number:{equals:receipt}},limit:1,depth:0});assert.equal(inquiry.docs[0].files?.length,2)
await writeFile('artifacts/recovery-report.json',JSON.stringify({expiredSessionRecovered:true,uncertainCommitReturnsSameReceipt:true,oneInquiryPerSubmission:true,newSessionUploadsEveryAttachment:true},null,2))
console.log('Wygaśnięcie sesji, utracona odpowiedź i zmiana załączników po błędzie: OK.')
await p.destroy();process.exit(0)
