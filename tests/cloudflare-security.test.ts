import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
// Validate the deploy-time boundary independently from the generated Next server.
const source=readFileSync(new URL('../cloudflare/worker.js',import.meta.url),'utf8')
const body=source.slice(source.indexOf('const protectedPath'),source.indexOf('async function authorized'))
const protectedPath=new Function(body+'; return protectedPath')() as (path:string)=>boolean
const secure = new Function(source.slice(source.indexOf('const protectedPath'),source.indexOf('export default'))+'; return secure')() as (response:Response,env:{SITE_INDEXABLE:string},path:string)=>Response
describe('Cloudflare owner boundary',()=>{
 it('gates admin and all private CMS APIs including the first-account endpoint',()=>{for(const path of ['/admin','/admin/create-first-user','/api/users','/api/users/first-register','/api/inquiries','/api/graphql','/%61dmin','/api/quote/files/1/download'])expect(protectedPath(path),path).toBe(true)})
 it('allows only the intended public APIs',()=>{for(const path of ['/','/projekty','/api/health','/api/quote/sessions','/api/quote/inquiries','/api/quote/files/12','/api/media/file/photo.webp'])expect(protectedPath(path),path).toBe(false)})
 it('indeksowanie obejmuje tylko publiczne odpowiedzi sukcesu',()=>{
  expect(secure(new Response('ok'),{SITE_INDEXABLE:'true'},'/').headers.has('X-Robots-Tag')).toBe(false)
  for(const path of ['/admin','/%61dmin','/api/health','/internal/scanner/jobs'])expect(secure(new Response('private'),{SITE_INDEXABLE:'true'},path).headers.get('X-Robots-Tag')).toContain('noindex')
  expect(secure(new Response('error',{status:404}),{SITE_INDEXABLE:'true'},'/missing').headers.get('X-Robots-Tag')).toContain('noindex')
  expect(secure(new Response('test'),{SITE_INDEXABLE:'false'},'/').headers.get('X-Robots-Tag')).toContain('noindex')
 })
})
