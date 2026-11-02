import { describe,it,expect,beforeAll } from 'vitest'
const base='http://127.0.0.1:3000'
const active=process.env.RUN_INTEGRATION==='true'
const headers={'Content-Type':'application/json',Origin:base}
const submit=(url:string,body:unknown,extra:Record<string,string>={})=>fetch(base+url,{method:'POST',headers:{...headers,...extra},body:JSON.stringify(body)})
describe.skipIf(!active)('rzeczywisty serwer i PostgreSQL',()=>{
  beforeAll(async()=>{
    // First compilation in next dev is not API execution time.
    await fetch(base+'/api/health')
    await fetch(base+'/api/quote/sessions',{method:'POST',headers:{...headers,Origin:'https://invalid.example'},body:'{}'})
  },60000)
  it('odrzuca zapytania z innego źródła oraz pliki wykonywalne',async()=>{
    const badOrigin=await submit('/api/quote/sessions',{files:[]},{Origin:'https://example.org'});expect(badOrigin.status).toBe(403)
    const badFile=await submit('/api/quote/sessions',{files:[{name:'model.exe',size:20,kind:'model'}]});expect(badFile.status).toBe(400)
  })
  it('przyjmuje projektowanie bez pliku i powtarza ten sam numer bez duplikatu',async()=>{
    const sessionResponse=await submit('/api/quote/sessions',{files:[]});expect(sessionResponse.status).toBe(200);const s=await sessionResponse.json()
    const data={type:'design',name:'Test integracyjny',email:'qa@solidprint.local',quantity:1,description:'TEST QA — projekt obudowy bez gotowego modelu.',privacy:true,sessionId:s.sessionId,idempotencyKey:crypto.randomUUID()}
    const first=await submit('/api/quote/inquiries',data,{'x-upload-token':s.token});const a=await first.json();expect(first.status,JSON.stringify(a)).toBe(201);expect(a.number).toMatch(/^SP-\d{4}-[A-F0-9]{8}$/)
    const second=await submit('/api/quote/inquiries',data,{'x-upload-token':s.token});expect(second.status).toBe(200);expect((await second.json()).number).toBe(a.number)
  })
  it('nie przyjmuje zapytania zanim przesłano cały plik i chroni kwarantannę',async()=>{
    const bytes='solid qa\nendsolid qa\n'
    const r=await submit('/api/quote/sessions',{files:[{name:'qa.stl',size:Buffer.byteLength(bytes),kind:'model'}]});expect(r.status).toBe(200);const s=await r.json()
    const data={type:'print',name:'Test pliku',email:'qa@solidprint.local',description:'TEST QA — plik do sprawdzenia przesyłania.',privacy:true,sessionId:s.sessionId,idempotencyKey:crypto.randomUUID()}
    const early=await submit('/api/quote/inquiries',data,{'x-upload-token':s.token});expect(early.status).toBe(400)
    const wrongToken=await fetch(`${base}/api/quote/files/${s.files[0].id}`,{method:'PUT',headers:{Origin:base,'x-upload-token':'bad-token'},body:bytes});expect(wrongToken.status).toBe(403)
    const upload=await fetch(`${base}/api/quote/files/${s.files[0].id}`,{method:'PUT',headers:{Origin:base,'x-upload-token':s.token},body:bytes});expect(upload.status).toBe(200)
    const inquiry=await submit('/api/quote/inquiries',data,{'x-upload-token':s.token});expect(inquiry.status,await inquiry.clone().text()).toBe(201)
    const download=await fetch(`${base}/api/quote/files/${s.files[0].id}/download`);expect(download.status).toBe(401)
    const list=await fetch(`${base}/api/quote-files`);expect(list.status).toBe(403)
  })
})
