import { describe,it,expect,beforeAll } from 'vitest'
const base='http://127.0.0.1:3000';const origin={Origin:base}
describe.skipIf(process.env.RUN_INTEGRATION!=='true')('równoległe przesyłanie',()=>{
 beforeAll(async()=>{
  await fetch(base+'/api/health')
  await fetch(base+'/api/quote/sessions',{method:'POST',headers:{Origin:'https://invalid.example','Content-Type':'application/json'},body:'{}'})
 },60000)
 it('tylko jedno żądanie przejmuje plik do zapisu',async()=>{
  const size=1024*1024;const session=await fetch(base+'/api/quote/sessions',{method:'POST',headers:{...origin,'Content-Type':'application/json'},body:JSON.stringify({files:[{name:'race.stl',size,kind:'model'}]})}).then(r=>r.json())
  const bytes=new Uint8Array(size).fill(65)
  const results=await Promise.all([1,2,3,4].map(()=>fetch(`${base}/api/quote/files/${session.files[0].id}`,{method:'PUT',headers:{...origin,'x-upload-token':session.token},body:bytes})))
  const data=await Promise.all(results.map(r=>r.json()));expect(data.filter(d=>d.ok&&!d.alreadyUploaded).length).toBe(1);expect(results.some(r=>r.status===409)).toBe(true)
 })
})
