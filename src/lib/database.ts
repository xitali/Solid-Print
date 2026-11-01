import type { Payload } from 'payload'
import { bindings,onCloudflare } from './cloudflare'
export async function claimUpload(p:Payload,id:string) {
  if(onCloudflare){const r=await (await bindings()).D1.prepare("UPDATE quote_files SET status='uploading',updated_at=? WHERE id=? AND status='pending' RETURNING id").bind(new Date().toISOString(),id).all();return r.results.length===1}
  return (await p.db.pool.query("UPDATE quote_files SET status='uploading',updated_at=NOW() WHERE id=$1 AND status='pending' RETURNING id",[id])).rowCount===1
}
