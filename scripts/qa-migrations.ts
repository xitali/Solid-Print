import dotenv from 'dotenv'
import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
dotenv.config({quiet:true})
if(process.env.LOCAL_DEVELOPMENT!=='true')throw new Error('Test wyłącznie lokalny.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const p=await getPayload({config});const database=`solidprint_restore_migrations_${Date.now()}`
await p.db.pool.query(`CREATE DATABASE "${database}"`);const url=new URL(process.env.DATABASE_URL!);url.pathname='/'+database
await new Promise<void>((resolve,reject)=>{const child=spawn(process.execPath,['node_modules/payload/bin.js','migrate'],{env:{...process.env,DATABASE_URL:url.toString(),ALLOW_SCHEMA_PUSH:'false'},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Migracja: kod ${code}`)))})
const {Client}=await import('pg');const client=new Client({connectionString:url.toString()});await client.connect();const columns=await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='quote_files' AND column_name='content_hash'");if(columns.rowCount!==1)throw new Error('Migracja nie utworzyła pola content_hash');await client.end()
await writeFile('artifacts/migrations-report.json',JSON.stringify({database,initialAndFollowupApplied:true,contentHashPresent:true},null,2));console.log('Migracje w świeżej oddzielnej bazie: OK.');await p.destroy();process.exit(0)
