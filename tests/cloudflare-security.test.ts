import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
// Validate the deploy-time boundary independently from the generated Next server.
const source=readFileSync(new URL('../cloudflare/worker.js',import.meta.url),'utf8')
const body=source.slice(source.indexOf('const protectedPath'),source.indexOf('async function authorized'))
const protectedPath=new Function(body+'; return protectedPath')() as (path:string)=>boolean
describe('Cloudflare owner boundary',()=>{
 it('gates admin and all private CMS APIs including the first-account endpoint',()=>{for(const path of ['/admin','/admin/create-first-user','/api/users','/api/users/first-register','/api/inquiries','/api/graphql','/%61dmin','/api/quote/files/1/download'])expect(protectedPath(path),path).toBe(true)})
 it('allows only the intended public APIs',()=>{for(const path of ['/','/projekty','/api/health','/api/quote/sessions','/api/quote/inquiries','/api/quote/files/12','/api/media/file/photo.webp'])expect(protectedPath(path),path).toBe(false)})
})
