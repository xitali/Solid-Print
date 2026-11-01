import dotenv from 'dotenv'
import { mkdir,writeFile,readFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
dotenv.config({quiet:true})
if(process.env.LOCAL_DEVELOPMENT!=='true'||process.env.STORAGE_MODE!=='local')throw new Error('Automatyczny test odtworzenia jest dostępny tylko lokalnie. Test S3 wykonaj jawnie na oddzielnej bazie i pustym buckecie.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const {createBackup}=await import('../src/lib/backup')
let p=await getPayload({config})
const dir=await createBackup(p)
let verifyQA=false
try{const credentials=JSON.parse(await readFile('.data/qa/access.json','utf8'));verifyQA=(await p.count({collection:'users',where:{email:{equals:credentials.email}}})).totalDocs===1}catch{}
const database=`solidprint_restore_${Date.now()}`;await p.db.pool.query(`CREATE DATABASE "${database}"`)
const parsed=new URL(process.env.DATABASE_URL!);parsed.pathname='/'+database
await new Promise<void>((resolve,reject)=>{const child=spawn(process.execPath,['--import','tsx','scripts/restore.ts',dir],{env:{...process.env,DATABASE_URL:parsed.toString(),RESTORE_VERIFY_QA:String(verifyQA)},stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(new Error(`Odtworzenie: kod ${code}`)));child.on('error',reject)})
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/restore-report.json',JSON.stringify({database,backup:path.basename(dir),verified:true},null,2))
console.log('Odtwarzanie do oddzielnej bazy: liczby rekordów i sumy SHA-256 — OK.')
await p.destroy()
// Keep the isolated restored database as evidence; never modify or replace the live database.
process.exit(0)
