import { bindings,onCloudflare } from './cloudflare'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, unlink, stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
export const localStorageEnabled=()=>process.env.STORAGE_MODE==='local'&&process.env.LOCAL_DEVELOPMENT==='true'&&new URL(process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000').hostname==='127.0.0.1'
export const s3=()=>new S3Client({endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION||'us-east-1',forcePathStyle:true,credentials:{accessKeyId:process.env.S3_ACCESS_KEY!,secretAccessKey:process.env.S3_SECRET_KEY!}})
const localPath=(key:string)=>{if(!/^quote\/[a-f0-9-]+$/.test(key))throw new Error('Invalid object key');return path.resolve('.data/objects',key)}
export async function storeFile(key:string,filePath:string,size:number){
  if(onCloudflare){const {PRIVATE_FILES}=await bindings();await PRIVATE_FILES.put(key,Readable.toWeb(createReadStream(filePath)) as unknown as import('@cloudflare/workers-types').ReadableStream,{httpMetadata:{contentType:'application/octet-stream'}});return}
  if(localStorageEnabled()){const dest=localPath(key);await mkdir(path.dirname(dest),{recursive:true});await pipeline(createReadStream(filePath),createWriteStream(dest,{flags:'w',mode:0o600}));return}
  await s3().send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,Body:createReadStream(filePath),ContentLength:size,ContentType:'application/octet-stream'}))
}
export async function readObject(key:string):Promise<{stream:Readable;size:number;contentType?:string}>{
  if(onCloudflare){const obj=await (await bindings()).PRIVATE_FILES.get(key);if(!obj)throw new Error('Missing object');return {stream:Readable.fromWeb(obj.body as never),size:obj.size,contentType:obj.httpMetadata?.contentType}}
  if(localStorageEnabled()){const dest=localPath(key);return {stream:createReadStream(dest),size:(await stat(dest)).size}}
  const result=await s3().send(new GetObjectCommand({Bucket:process.env.S3_BUCKET,Key:key}));if(!result.Body)throw new Error('Missing object');return {stream:result.Body as Readable,size:result.ContentLength||0,contentType:result.ContentType}
}
export async function deleteObject(key:string){if(onCloudflare){await (await bindings()).PRIVATE_FILES.delete(key);return}if(localStorageEnabled()){await unlink(localPath(key)).catch(e=>{if(e.code!=='ENOENT')throw e});return}await s3().send(new DeleteObjectCommand({Bucket:process.env.S3_BUCKET,Key:key}))}
