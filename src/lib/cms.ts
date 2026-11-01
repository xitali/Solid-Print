import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import type { Website } from './types'

export const cms = cache(async () => getPayload({config}))
export async function list<T>(collection:string, limit=100):Promise<T[]> {
  if (!process.env.DATABASE_URL && process.env.PLATFORM!=='cloudflare') return []
  const p = await cms()
  const docs:T[]=[];let page=1
  while(true){const result=await p.find({collection:collection as never,where:{published:{equals:true}},limit,page,depth:2,overrideAccess:false,sort:collection==='faqs'?'order':'-createdAt'});docs.push(...result.docs as T[]);if(!result.hasNextPage)break;page++}
  return docs
}
export const website = cache(async ():Promise<Website> => {
  if (!process.env.DATABASE_URL && process.env.PLATFORM!=='cloudflare') return {}
  const p = await cms()
  return await p.findGlobal({slug:'website',depth:2,overrideAccess:false}) as Website
})
