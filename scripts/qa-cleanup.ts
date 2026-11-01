import dotenv from 'dotenv'
import { readFile } from 'node:fs/promises'
dotenv.config({quiet:true})
if(process.env.LOCAL_DEVELOPMENT!=='true'||!process.env.DATABASE_URL?.includes('127.0.0.1:55432/solidprint'))throw new Error('Usuwanie danych QA jest dostępne wyłącznie w lokalnej bazie testowej.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const {deleteObject}=await import('../src/lib/storage')
const p=await getPayload({config})
const inquiries=await p.find({collection:'inquiries',where:{email:{like:'@solidprint.local'}},limit:1000,depth:0})
for(const inquiry of inquiries.docs){await p.update({collection:'inquiries',id:inquiry.id,data:{files:[]}});const files=await p.find({collection:'quote-files',where:{inquiryId:{equals:String(inquiry.id)}},limit:10});for(const f of files.docs){if(f.objectKey)await deleteObject(f.objectKey);await p.delete({collection:'quote-files',id:f.id})}await p.delete({collection:'inquiries',id:inquiry.id})}
await p.delete({collection:'outbox',where:{to:{like:'@solidprint.local'}}})
const products=await p.find({collection:'products',where:{slug:{like:'qa-'}},limit:100,depth:0});for(const product of products.docs)if(product.slug.startsWith('qa-'))await p.delete({collection:'products',id:product.id})
const media=await p.find({collection:'media',where:{filename:{like:'qa-'}},limit:100,depth:0});for(const image of media.docs)if(image.filename?.startsWith('qa-'))await p.delete({collection:'media',id:image.id})
const users=await p.find({collection:'users',where:{email:{like:'qa-'}},limit:100});for(const user of users.docs)if(user.email.startsWith('qa-')&&user.email.endsWith('@solidprint.local'))await p.delete({collection:'users',id:user.id})
await p.delete({collection:'rate-limits',where:{id:{greater_than:0}}})
console.log('Usunięto oznaczone dane QA. Panel umożliwia utworzenie własnego konta, jeśli nie ma właścicieli.')
await p.destroy();process.exit(0)
