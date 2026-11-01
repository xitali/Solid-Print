import dotenv from 'dotenv'
import { CreateBucketCommand,HeadBucketCommand } from '@aws-sdk/client-s3'
dotenv.config({quiet:true})
const {s3,localStorageEnabled}=await import('../src/lib/storage')
if(!localStorageEnabled()){
  const client=s3();try{await client.send(new HeadBucketCommand({Bucket:process.env.S3_BUCKET}))}catch{await client.send(new CreateBucketCommand({Bucket:process.env.S3_BUCKET}))}
}
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config')
const p=await getPayload({config})
console.log('Baza i magazyn plików gotowe. Utwórz konto właściciela na /admin, a następnie uzupełnij ustawienia strony.')
await p.destroy()
process.exit(0)
