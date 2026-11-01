import dotenv from 'dotenv'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
dotenv.config({quiet:true})
if(process.env.LOCAL_DEVELOPMENT!=='true')throw new Error('Test wyłącznie lokalny.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const {cleanup}=await import('../src/lib/jobs');const {storeFile}=await import('../src/lib/storage');const p=await getPayload({config})
const ids:number[]=[]
for(let i=0;i<105;i++){const doc=await p.create({collection:'inquiries',data:{number:`QA-RET-${randomUUID()}`,email:'retention@solidprint.local',status:'new'}});ids.push(doc.id);await p.db.updateOne({collection:'inquiries',id:doc.id,data:{closedAt:new Date(Date.now()-100*86400000).toISOString(),status:'closed'}})}
const id=ids[104];const bytes=Buffer.from('QA retention');await writeFile('.data/qa/retention-file',bytes);const key=`quote/${randomUUID()}`;await storeFile(key,'.data/qa/retention-file',bytes.length)
const file=await p.create({collection:'quote-files',data:{name:'qa-ret.stl',size:bytes.length,kind:'model',objectKey:key,status:'quarantined',inquiryId:String(id)}})
await p.update({collection:'inquiries',id,data:{files:[file.id]}})
await cleanup(p)
assert.equal((await p.count({collection:'quote-files',where:{id:{equals:file.id}}})).totalDocs,0)
assert.equal((await p.findByID({collection:'inquiries',id,depth:0})).files?.length,0)
assert.equal((await p.count({collection:'inquiries',where:{id:{in:ids}}})).totalDocs,105)
for(const id of ids)await p.delete({collection:'inquiries',id})
await writeFile('artifacts/retention-report.json',JSON.stringify({records:105,fileBeyondFirstPageDeleted:true,inquiriesRetainedUntil365Days:true},null,2))
console.log('Retencja: plik sprawy poza pierwszą setką usunięty, młodsze dane spraw zachowane — OK.')
await p.destroy();process.exit(0)
