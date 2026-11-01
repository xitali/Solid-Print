import type { MetadataRoute } from 'next'
export const dynamic='force-dynamic'
export default function robots():MetadataRoute.Robots{const origin=process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000';return {rules:process.env.SITE_INDEXABLE==='true'?{userAgent:'*',allow:'/',disallow:['/admin','/api','/wycena','/szukaj']}:{userAgent:'*',disallow:'/'},sitemap:`${origin}/sitemap.xml`}}
