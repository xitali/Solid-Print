import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import EmbeddedPostgres from 'embedded-postgres'
import { SMTPServer } from 'smtp-server'
import dotenv from 'dotenv'

await mkdir('.data/mail',{recursive:true})
try { await access('.env') } catch {
  const password=randomBytes(24).toString('hex')
  await writeFile('.env',[
    `DATABASE_URL=postgres://solidprint:${password}@127.0.0.1:55432/solidprint`,
    `POSTGRES_PASSWORD=${password}`,`PAYLOAD_SECRET=${randomBytes(32).toString('hex')}`,
    'NEXT_PUBLIC_SERVER_URL=http://127.0.0.1:3000','STORAGE_MODE=local','LOCAL_DEVELOPMENT=true',
    'SMTP_HOST=127.0.0.1','SMTP_PORT=51025','SMTP_SECURE=false','SMTP_FROM=Solid Print <powiadomienia@solidprint.local>',
    'OWNER_EMAIL=owner@solidprint.local','CLAMAV_HOST=127.0.0.1','CLAMAV_PORT=53310',
    'SITE_INDEXABLE=false','ALLOW_SCHEMA_PUSH=true',
  ].join('\n')+'\n',{mode:0o600})
}
dotenv.config({quiet:true})
const pg=new EmbeddedPostgres({databaseDir:path.resolve('.data/postgres'),user:'solidprint',password:process.env.POSTGRES_PASSWORD!,port:55432,persistent:true,autoRehydrateSymlinks:true,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}})
try {await access('.data/postgres/PG_VERSION')}catch{await pg.initialise()}
await pg.start()
const client=pg.getPgClient();await client.connect()
const found=await client.query("SELECT 1 FROM pg_database WHERE datname='solidprint'")
await client.end()
if(!found.rowCount) await pg.createDatabase('solidprint')
const mail=new SMTPServer({secure:false,authOptional:true,disabledCommands:['AUTH','STARTTLS'],hideSTARTTLS:true,onData(stream,session,callback){
  const parts:Buffer[]=[];stream.on('data',d=>parts.push(d));stream.on('error',callback);stream.on('end',async()=>{try{await writeFile(path.join('.data/mail',`${Date.now()}-${randomBytes(4).toString('hex')}.eml`),Buffer.concat(parts));callback()}catch(e){callback(e as Error)}})
}})
mail.listen(51025,'127.0.0.1')
console.log('PostgreSQL gotowy: 127.0.0.1:55432. Lokalna poczta: .data/mail. Pliki: .data/objects.')
console.log('Skaner antywirusowy wymaga ClamAV. Bez skanera pliki pozostają w kwarantannie — ochrona pozostaje aktywna.')
async function stop(){mail.close();await pg.stop();process.exit()}
process.on('SIGINT',stop);process.on('SIGTERM',stop)
