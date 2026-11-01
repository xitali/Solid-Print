import { mkdir,writeFile,readFile,cp,readdir,stat,rm } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createWriteStream,createReadStream } from 'node:fs'
import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { ListObjectsV2Command,PutObjectCommand } from '@aws-sdk/client-s3'
import type { Payload } from 'payload'
import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { localStorageEnabled,s3 } from './storage'
import { readObject } from './storage'
const collections=['users','media','products','materials','services','projects','articles','faqs','quote-files','inquiries','upload-sessions','outbox','rate-limits'] as const
async function hashStream(stream:Readable){const digest=createHash('sha256');for await(const chunk of stream)digest.update(chunk);return digest.digest('hex')}
const hashFile=(file:string)=>hashStream(createReadStream(file))
async function exists(dir:string){return stat(dir).then(()=>true,()=>false)}
export async function createBackup(p:Payload,root=process.env.BACKUP_DIR||'.data/backups'){
  const dir=path.resolve(root,new Date().toISOString().replace(/[:.]/g,'-'))
  await mkdir(dir,{recursive:true,mode:0o700})
  const transactionID=await (p.db as unknown as PostgresAdapter).beginTransaction({isolationLevel:'repeatable read'})
  const req=transactionID?{transactionID}:undefined
  try{
    const data:Record<string,unknown[]>={}
    for(const collection of collections){data[collection]=[];let page=1;while(true){const result=await p.find({collection,limit:100,page,depth:0,req,showHiddenFields:true});data[collection].push(...result.docs);if(!result.hasNextPage)break;page++}}
    const website=await p.findGlobal({slug:'website',depth:0,req,showHiddenFields:true})
    if(transactionID)await p.db.commitTransaction(transactionID)
    const snapshot=JSON.stringify({version:1,createdAt:new Date().toISOString(),collections:data,website})
    await writeFile(path.join(dir,'snapshot.json'),snapshot,{mode:0o600})
    const objects:Record<string,string>={},contentTypes:Record<string,string>={}
    if(localStorageEnabled()){
      for(const folder of ['objects','public-media']){const source=path.resolve('.data',folder);if(await exists(source))await cp(source,path.join(dir,folder),{recursive:true})}
    }else{
      const client=s3();let token:string|undefined
      do{const result=await client.send(new ListObjectsV2Command({Bucket:process.env.S3_BUCKET,ContinuationToken:token}));for(const item of result.Contents||[]){if(!item.Key||item.Key.includes('..')||item.Key.startsWith('/'))throw new Error('Nieprawidłowy klucz obiektu w kopii.');const obj=await readObject(item.Key);contentTypes[item.Key]=obj.contentType||'application/octet-stream';const dest=path.join(dir,'s3',item.Key);await mkdir(path.dirname(dest),{recursive:true});await pipeline(obj.stream,createWriteStream(dest,{mode:0o600}))}token=result.NextContinuationToken}while(token)
    }
    async function hashes(folder:string){for(const entry of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await hashes(file);else objects[path.relative(dir,file).split(path.sep).join('/')]=await hashFile(file)}}
    await hashes(dir)
    await writeFile(path.join(dir,'manifest.json'),JSON.stringify({version:1,createdAt:new Date().toISOString(),source:{storageMode:localStorageEnabled()?'local':'s3',bucket:process.env.S3_BUCKET||null},counts:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])),files:objects,contentTypes},null,2),{mode:0o600})
    return dir
  }catch(e){if(transactionID)await p.db.rollbackTransaction(transactionID).catch(()=>{});await writeFile(path.join(dir,'INCOMPLETE.txt'),'Kopia nieukończona. Nie używać do odtwarzania.');throw e}
}
export async function restoreBackup(p:Payload,dir:string){
  const dbName=new URL(process.env.DATABASE_URL!).pathname.slice(1)
  if(!dbName.startsWith('solidprint_restore_'))throw new Error('Odtwarzanie wymaga oddzielnej bazy solidprint_restore_*. Nigdy nie nadpisuje bazy działającej strony.')
  if(await exists(path.join(dir,'INCOMPLETE.txt')))throw new Error('Kopia jest niekompletna.')
  const manifest=JSON.parse(await readFile(path.join(dir,'manifest.json'),'utf8'))
  if(!localStorageEnabled()){
    if(manifest.source?.storageMode!=='s3'||!process.env.S3_BUCKET||manifest.source.bucket===process.env.S3_BUCKET)throw new Error('Odtwarzanie S3 wymaga innego bucketu niż źródłowy.')
    const target=await s3().send(new ListObjectsV2Command({Bucket:process.env.S3_BUCKET,MaxKeys:1}));if(target.Contents?.length)throw new Error('Docelowy bucket odtwarzania musi być pusty.')
  }
  for(const [name,expected] of Object.entries(manifest.files)){if(name.includes('..')||path.isAbsolute(name))throw new Error('Nieprawidłowa ścieżka w kopii.');if(await hashFile(path.join(dir,name))!==expected)throw new Error(`Nieprawidłowa suma kontrolna: ${name}`)}
  const backup=JSON.parse(await readFile(path.join(dir,'snapshot.json'),'utf8'))
  for(const collection of collections){const count=await p.count({collection});if(count.totalDocs)throw new Error(`Baza docelowa nie jest pusta: ${collection}`)}
  const transactionID=await p.db.beginTransaction();const req=transactionID?{transactionID}:undefined
  try{
    for(const collection of collections){for(const doc of backup.collections[collection])await p.db.create({collection,customID:doc.id,data:doc,req})}
    await p.updateGlobal({slug:'website',data:backup.website,req})
    if(transactionID)await p.db.commitTransaction(transactionID)
    for(const collection of collections){const table=p.db.tableNameMap.get(collection.replace(/-/g,'_'));if(table)await p.db.pool.query(`SELECT setval(pg_get_serial_sequence($1, 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM "${table}"), 1), (SELECT COUNT(*) > 0 FROM "${table}"))`,[table])}
    if(localStorageEnabled()){
      for(const folder of ['objects','public-media'])if(await exists(path.join(dir,folder)))await cp(path.join(dir,folder),path.resolve('.data/restored',dbName,folder),{recursive:true})
    }else{
      async function upload(folder:string){for(const item of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,item.name);if(item.isDirectory())await upload(file);else {const key=path.relative(path.join(dir,'s3'),file).split(path.sep).join('/');await s3().send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,Body:createReadStream(file),ContentLength:(await stat(file)).size,ContentType:manifest.contentTypes?.[key]||'application/octet-stream'}))}}}
      await upload(path.join(dir,'s3'))
    }
    for(const [name,expected] of Object.entries(manifest.files)){
      if(name==='snapshot.json')continue
      if(localStorageEnabled()){const restored=path.resolve('.data/restored',dbName,name);if(await hashFile(restored)!==expected)throw new Error(`Niezgodna odzyskana zawartość: ${name}`)}
      else if(name.startsWith('s3/')){const obj=await readObject(name.slice(3));if(await hashStream(obj.stream)!==expected)throw new Error(`Niezgodna odzyskana zawartość: ${name}`);if(obj.contentType!==manifest.contentTypes?.[name.slice(3)])throw new Error(`Niezgodny typ MIME: ${name}`)}
    }
    return manifest.counts
  }catch(e){if(transactionID)await p.db.rollbackTransaction(transactionID).catch(()=>{});throw e}
}
export async function pruneBackups(root=process.env.BACKUP_DIR||'.data/backups',now=Date.now()){
  const absolute=path.resolve(root);await mkdir(absolute,{recursive:true})
  for(const item of await readdir(absolute,{withFileTypes:true})){if(!item.isDirectory()||!/^\d{4}-\d{2}-\d{2}T/.test(item.name))continue;const dir=path.resolve(absolute,item.name);if(!dir.startsWith(absolute+path.sep))throw new Error('Nieprawidłowy katalog kopii.');const meta=await stat(dir);if(now-meta.mtimeMs>30*86400000)await rm(dir,{recursive:true,force:true})}
}
