import dotenv from 'dotenv'
import { readFile,writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import sharp from 'sharp'
dotenv.config({quiet:true})
if(process.env.LOCAL_DEVELOPMENT!=='true')throw new Error('Test wyłącznie lokalny.')
const {getPayload}=await import('payload');const {default:config}=await import('../src/payload.config');const p=await getPayload({config})
const bytes=await sharp({create:{width:800,height:600,channels:3,background:'#0F3D3E'}}).png().toBuffer()
const media=await p.create({collection:'media',data:{alt:'Obraz testowy QA — nie jest zdjęciem realizacji'},file:{data:bytes,mimetype:'image/png',name:`qa-${Date.now()}.png`,size:bytes.length}})
const response=await fetch(new URL(media.url!,'http://127.0.0.1:3000'));assert.equal(response.status,200);assert.match(response.headers.get('Content-Type')||'',/^image\/png/);const image=await sharp(Buffer.from(await response.arrayBuffer())).metadata();assert.equal(image.width,800);assert.equal(image.height,600)
const access=JSON.parse(await readFile('.data/qa/access.json','utf8'));await p.update({collection:'products',id:access.productId,data:{images:[{image:media.id,caption:'Wyłącznie obraz testowy QA.'}]}})
const productPage=await fetch('http://127.0.0.1:3000/projekty/'+access.productSlug);assert.match(await productPage.text(),/Obraz testowy QA/)
await p.update({collection:'products',id:access.productId,data:{images:[]}});await p.delete({collection:'media',id:media.id})
await writeFile('artifacts/media-report.json',JSON.stringify({upload:true,publicImageResponse:true,mimeType:true,imageDimensions:true,productGallery:true,testImageDeleted:true},null,2));console.log('Zdjęcia CMS, publiczne pobranie i galeria produktu: OK.');await p.destroy();process.exit(0)
