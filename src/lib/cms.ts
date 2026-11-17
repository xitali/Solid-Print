import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import type { Website } from './types'

export const cms = cache(async () => getPayload({config}))
export async function homeItems<T>(collection: 'products' | 'projects' | 'articles' | 'faqs', limit: number, filter: Where = {}): Promise<T[]> {
  if (!process.env.DATABASE_URL && process.env.PLATFORM !== 'cloudflare') return []
  const p = await cms()
  const { docs } = await p.find({
    collection,
    where: { and: [{ published: { equals: true } }, filter] },
    limit,
    depth: 1,
    pagination: false,
    overrideAccess: false,
    sort: collection === 'faqs' ? ['order', 'id'] : ['-createdAt', '-id'],
  })
  return docs as T[]
}
export async function list<T>(collection:string, limit=100):Promise<T[]> {
  if (!process.env.DATABASE_URL && process.env.PLATFORM!=='cloudflare') return []
  const p = await cms()
  const manuallyOrdered = collection === 'materials' || collection === 'services'
  const docs:T[]=[];let page=1
  const sort = manuallyOrdered ? ['-createdAt', '-id'] : collection === 'faqs' ? 'order' : '-createdAt'
  while(true){const result=await p.find({collection:collection as never,where:{published:{equals:true}},limit,page,depth:2,overrideAccess:false,sort});docs.push(...result.docs as T[]);if(!result.hasNextPage)break;page++}
  if (manuallyOrdered) {
    const order = (doc: T) => (doc as { displayOrder?: number | null }).displayOrder ?? Number.MAX_SAFE_INTEGER
    docs.sort((a, b) => order(a) - order(b))
  }
  return docs
}
export const website = cache(async ():Promise<Website> => {
  if (!process.env.DATABASE_URL && process.env.PLATFORM!=='cloudflare') return {}
  const p = await cms()
  return await p.findGlobal({slug:'website',depth:2,overrideAccess:false}) as Website
})
