import dotenv from 'dotenv'
import { randomBytes } from 'node:crypto'
import { writeFile,mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
dotenv.config({quiet:true})
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config')
const p=await getPayload({config});const password=randomBytes(24).toString('hex');const email=`qa-${Date.now()}@solidprint.local`
const user=await p.create({collection:'users',data:{email,password,role:'owner',name:'Test panelu'}})
const login=await fetch('http://127.0.0.1:3000/api/users/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});assert.equal(login.status,200);const auth=await login.json()
const headers={'Content-Type':'application/json',Authorization:`JWT ${auth.token}`}
const create=await fetch('http://127.0.0.1:3000/api/products',{method:'POST',headers,body:JSON.stringify({title:'QA — produkt testowy',slug:'qa-produkt-testowy',description:'Wyłącznie dane testowe do sprawdzenia katalogu, wariantów i zapytań.',category:'QA',material:'Test',dimensions:'40 × 40 × 40 mm',published:true,available:true,variants:[{name:'Testowy wariant',color:'Testowy kolor'}]})});assert.equal(create.status,201);const product=(await create.json()).doc
const page=await fetch(`http://127.0.0.1:3000/projekty/${product.slug}`);assert.equal(page.status,200);assert.match(await page.text(),/QA — produkt testowy/)
const unauth=await fetch('http://127.0.0.1:3000/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Forbidden'})});assert.equal(unauth.status,403)
const inquiries=await p.find({collection:'inquiries',limit:100,depth:0});const inquiry=inquiries.docs.find(i=>i.email?.endsWith('@solidprint.local'));assert.ok(inquiry)
await p.update({collection:'inquiries',id:inquiry.id,data:{status:'closed'}});const closed=await p.findByID({collection:'inquiries',id:inquiry.id,depth:0});assert.ok(closed.closedAt)
await p.update({collection:'inquiries',id:inquiry.id,data:{status:'review'}})
await mkdir('.data/qa',{recursive:true});await writeFile('.data/qa/access.json',JSON.stringify({email,password,userId:user.id,productId:product.id,productSlug:product.slug}),{mode:0o600})
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/cms-report.json',JSON.stringify({login:true,createProduct:true,publicProduct:true,unauthenticatedCreateBlocked:true,closedAtRecorded:true},null,2))
console.log('CMS: logowanie, tworzenie produktu, publiczna karta, kontrola dostępu i statusy — OK. Dane testowe zostaną usunięte po kontroli interfejsu.')
await p.destroy()
process.exit(0)
