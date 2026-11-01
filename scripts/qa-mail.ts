import dotenv from 'dotenv'
import assert from 'node:assert/strict'
import { readdir,readFile,writeFile } from 'node:fs/promises'
dotenv.config({quiet:true})
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const {processMail,processScans}=await import('../src/lib/jobs')
const p=await getPayload({config});const initialPort=process.env.SMTP_PORT
const message=await p.create({collection:'outbox',data:{to:'retry@solidprint.local',subject:'TEST QA — ponowienie poczty',text:'Wiadomość wyłącznie do lokalnej skrzynki testowej.',state:'pending',attempts:0,nextAttemptAt:new Date().toISOString()}})
process.env.SMTP_PORT='1';await processMail(p)
let row=await p.findByID({collection:'outbox',id:message.id});assert.equal(row.state,'pending');assert.equal(row.attempts,1);assert.ok(row.lastError)
process.env.SMTP_PORT=initialPort;await p.update({collection:'outbox',id:message.id,data:{nextAttemptAt:new Date(Date.now()-1000).toISOString()}});await processMail(p)
row=await p.findByID({collection:'outbox',id:message.id});assert.equal(row.state,'sent');assert.equal(row.attempts,2)
await processScans(p)
const files=await p.find({collection:'quote-files',where:{status:{equals:'quarantined'}},limit:10});assert.ok(files.docs.every(f=>f.status==='quarantined'))
const mailFiles=await readdir('.data/mail');assert.ok(mailFiles.length>=2);const text=await readFile(`.data/mail/${mailFiles[0]}`,'utf8');assert.match(text,/Message-ID:/i)
await writeFile('artifacts/mail-report.json',JSON.stringify({deliveryToLocalMailbox:true,retryAfterFailure:true,privateFilesRemainQuarantinedWithoutScanner:true,mailCount:mailFiles.length},null,2))
console.log('Poczta lokalna i ponowienie po błędzie: OK. Brak ClamAV nie zwalnia plików z kwarantanny.')
await p.destroy();process.exit(0)
