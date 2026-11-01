import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const base='http://127.0.0.1:3000'
const results=[]
for(const route of ['/','/uslugi','/projekty','/wycena','/materialy','/kontakt','/o-pracowni','/dla-firm','/realizacje','/poradnik','/szukaj','/prywatnosc','/zasady-zamowien','/cookies','/admin','/robots.txt','/sitemap.xml','/opengraph-image','/api/health']){
  const response=await fetch(base+route);assert.equal(response.status,200,route);results.push({route,status:response.status})
  if(route==='/robots.txt'){const text=await response.text();assert.match(text,/Disallow: \//);assert.match(text,/127\.0\.0\.1:3000\/sitemap\.xml/)}
}
const missing=await fetch(base+'/nie-istnieje');const missingBody=await missing.text();assert.ok([200,404].includes(missing.status));assert.match(missingBody,/Tu jeszcze nic/);assert.match(missingBody,/noindex/)
await writeFile('artifacts/pages-report.json',JSON.stringify({mode:'production',results,notFound:{status:missing.status,correctScreen:true,noindex:true}},null,2))
console.log(`${results.length} publicznych punktów aplikacji: HTTP 200; brakujący adres pokazuje ekran 404 i noindex (Next.js streaming).`)
