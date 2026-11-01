// The generated Next.js server stays behind this small security/cache boundary.
import nextWorker from '../.open-next/worker.js'
const protectedPath = (path) => {
  try { path=decodeURIComponent(path).replace(/\/+/g,'/') } catch { return true }
  if (/^\/admin(?:\/|$)/i.test(path)) return true
  if (!/^\/api(?:\/|$)/i.test(path)) return false
  return !/^\/api\/(?:health|quote\/(?:sessions|inquiries|files\/\d+)|media\/file\/[^/]+)\/?$/.test(path)
}
async function authorized(request,env) {
  if (!env.ADMIN_GATE_PASSWORD) return false
  const expected='Basic '+btoa('solidprint:'+env.ADMIN_GATE_PASSWORD)
  const encoder=new TextEncoder()
  const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(request.headers.get('Authorization')||'')),crypto.subtle.digest('SHA-256',encoder.encode(expected))])
  const x=new Uint8Array(a),y=new Uint8Array(b);let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0
}
function secure(response) {
  const result=new Response(response.body,response)
  result.headers.set('X-Content-Type-Options','nosniff')
  result.headers.set('X-Frame-Options','DENY')
  result.headers.set('Referrer-Policy','strict-origin-when-cross-origin')
  result.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()')
  result.headers.set('Strict-Transport-Security','max-age=15552000')
  result.headers.set('X-Robots-Tag','noindex, nofollow')
  result.headers.set('Content-Security-Policy',"object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'")
  return result
}
export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url)
    if (protectedPath(url.pathname) && !await authorized(request,env)) return secure(new Response('Panel właściciela wymaga dodatkowego logowania.',{status:401,headers:{'WWW-Authenticate':'Basic realm="Solid Print", charset="UTF-8"','Cache-Control':'private, no-store'}}))
    if(url.pathname.startsWith('/api/quote/') && request.method!=='GET'){
      if(request.headers.get('Origin')!==env.NEXT_PUBLIC_SERVER_URL)return secure(Response.json({error:'Nieprawidłowe źródło zapytania.'},{status:403}))
      if(env.FORM_LIMIT && !(await env.FORM_LIMIT.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'})).success)return secure(Response.json({error:'Zbyt wiele prób. Odczekaj minutę.'},{status:429,headers:{'Retry-After':'60'}}))
    }
    // Never cache sessions, admin pages, form responses, authenticated requests or RSC payloads.
    const cacheable=request.method==='GET'&&!request.headers.has('Cookie')&&!request.headers.has('Authorization')&&!request.headers.has('RSC')&&!request.headers.has('Next-Router-Prefetch')&&!url.search&&!/^\/(?:api|admin|_next)(?:\/|$)/i.test(url.pathname)&&request.headers.get('Accept')?.includes('text/html')
    const cache=cacheable?caches.default:null
    if(cache){const hit=await cache.match(request);if(hit){const response=secure(hit);response.headers.set('X-Solid-Cache','HIT');return response}}
    const response=secure(await nextWorker.fetch(request,env,ctx))
    if(cache&&response.status===200&&!response.headers.has('Set-Cookie')&&response.headers.get('Content-Type')?.includes('text/html')){
      const stored=response.clone();stored.headers.set('Cache-Control','public, max-age=60');ctx.waitUntil(cache.put(request,stored));response.headers.set('Cache-Control','no-cache');response.headers.set('X-Solid-Cache','MISS')
    }
    return response
  }
}
