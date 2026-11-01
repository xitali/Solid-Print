import type { MetadataRoute } from 'next'
import { list } from '@/lib/cms'
export const dynamic='force-dynamic'
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SERVER_URL||'http://127.0.0.1:3000';const routes=['','uslugi','projekty','materialy','o-pracowni','dla-firm','kontakt'];const result=routes.map(route=>({url:`${base}/${route}`}));for(const [collection,route] of [['products','projekty'],['projects','realizacje'],['articles','poradnik']]){const docs=await list<{slug:string}>(collection);for(const d of docs)result.push({url:`${base}/${route}/${d.slug}`})}return result}
