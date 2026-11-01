// Small, bounded D1/R2 jobs. Never import the Next/Payload server in scheduled work.
export async function secretMatches(actual, expected) {
  if (!expected) return false
  const encoder = new TextEncoder()
  const digest = value => crypto.subtle.digest('SHA-256', encoder.encode(value))
  const [a, b] = await Promise.all([digest(actual || ''), digest(expected)])
  const x = new Uint8Array(a), y = new Uint8Array(b)
  let different = 0
  for (let i = 0; i < x.length; i++) different |= x[i] ^ y[i]
  return different === 0
}

export async function recordState(env, key, value) {
  await env.D1.prepare('INSERT INTO sp_system_state(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at')
    .bind(key, JSON.stringify(value), new Date().toISOString()).run()
}

export async function scannerRequest(request, env) {
  const json = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'private, no-store'}})
  if (!await secretMatches(request.headers.get('Authorization'), env.SCANNER_TOKEN ? 'Bearer '+env.SCANNER_TOKEN : '')) return json({error:'Brak dostępu.'},401)
  const path = new URL(request.url).pathname
  if (path === '/internal/scanner/jobs' && request.method === 'GET') {
    const rows = await env.D1.prepare("SELECT id,size,content_hash FROM quote_files WHERE status='quarantined' AND inquiry_id IS NOT NULL AND content_hash IS NOT NULL ORDER BY id LIMIT 1").all()
    await recordState(env, 'scanner', {status:'connected'})
    return json({files:rows.results.map(f=>({id:f.id,size:f.size,hash:f.content_hash}))})
  }
  const match = path.match(/^\/internal\/scanner\/(\d+)\/(content|result)$/)
  if (!match) return json({error:'Nie znaleziono.'},404)
  const file = await env.D1.prepare("SELECT object_key,content_hash,size FROM quote_files WHERE id=? AND status='quarantined' AND inquiry_id IS NOT NULL").bind(Number(match[1])).first()
  if (!file) return json({error:'Plik nie oczekuje na skan.'},409)
  if (match[2] === 'content' && request.method === 'GET') {
    const object = await env.PRIVATE_FILES.get(file.object_key)
    if (!object || object.size !== file.size) return json({error:'Brak kompletnego pliku.'},409)
    return new Response(object.body,{headers:{'Content-Type':'application/octet-stream','Content-Length':String(object.size),'Cache-Control':'private, no-store','X-Content-SHA256':file.content_hash}})
  }
  if (match[2] === 'result' && request.method === 'POST') {
    // Body cap also applies to a chunked request without Content-Length.
    const reader=request.body?.getReader(); if(!reader)return json({error:'Brak wyniku.'},400)
    let body='',size=0
    const decoder=new TextDecoder()
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return json({error:'Za dużo danych.'},413)}body+=decoder.decode(value,{stream:true})}
    let result;try{result=JSON.parse(body)}catch{return json({error:'Nieprawidłowy wynik.'},400)}
    if (!['clean','infected'].includes(result.status) || result.hash !== file.content_hash) return json({error:'Nieaktualny wynik.'},409)
    const update=await env.D1.prepare("UPDATE quote_files SET status=?,scan_message=?,updated_at=? WHERE id=? AND status='quarantined' AND content_hash=?")
      .bind(result.status,result.status==='clean'?'ClamAV: nie wykryto zagrożeń.':'ClamAV: wykryto zagrożenie.',new Date().toISOString(),Number(match[1]),result.hash).run()
    return json({ok:update.meta.changes===1},update.meta.changes===1?200:409)
  }
  return json({error:'Niedozwolona metoda.'},405)
}

export async function cleanupCloudflare(env, now=new Date()) {
  const before=days=>new Date(now.getTime()-days*86400000).toISOString()
  // LIMIT keeps cron CPU/subrequests bounded; the next run resumes remaining work.
  const files=await env.D1.prepare(`SELECT f.id,f.object_key FROM quote_files f LEFT JOIN inquiries i ON CAST(i.id AS TEXT)=f.inquiry_id
    WHERE (f.inquiry_id IS NULL AND f.created_at<?) OR (i.status IN ('closed','rejected') AND i.closed_at<?) ORDER BY f.id LIMIT 20`)
    .bind(before(1),before(90)).all()
  for(const file of files.results){
    if(file.object_key)await env.PRIVATE_FILES.delete(file.object_key)
    // FK cascade removes the attachment relation; metadata only after R2 success.
    await env.D1.prepare('DELETE FROM quote_files WHERE id=?').bind(file.id).run()
  }
  await env.D1.prepare("DELETE FROM inquiries WHERE id IN (SELECT id FROM inquiries WHERE status IN ('closed','rejected') AND closed_at<? AND NOT EXISTS(SELECT 1 FROM quote_files f WHERE f.inquiry_id=CAST(inquiries.id AS TEXT)) LIMIT 20)").bind(before(365)).run()
  for(const table of ['upload_sessions','rate_limits'])await env.D1.prepare(`DELETE FROM ${table} WHERE id IN (SELECT id FROM ${table} WHERE expires_at<? LIMIT 100)`).bind(before(1)).run()
  await env.D1.prepare("DELETE FROM outbox WHERE id IN (SELECT id FROM outbox WHERE state IN ('sent','failed') AND created_at<? LIMIT 100)").bind(before(30)).run()
  await env.D1.prepare("UPDATE quote_files SET status='pending' WHERE status='uploading' AND updated_at<?").bind(new Date(now.getTime()-600000).toISOString()).run()
  await recordState(env,'cleanup',{status:'ok',deletedFiles:files.results.length})
  return files.results.length
}

export async function scheduledMaintenance(env) {
  try { await cleanupCloudflare(env) }
  catch(error) {
    console.error(JSON.stringify({event:'maintenance_failed',message:error instanceof Error?error.message:'unknown'}))
    await recordState(env,'cleanup',{status:'error'})
    throw error
  }
}

export async function processMailCloudflare(env) {
  if(!env.MAIL_API_URL||!env.MAIL_API_TOKEN||!env.MAIL_FROM)return 0
  if(new URL(env.MAIL_API_URL).protocol!=='https:')throw new Error('Mail endpoint requires HTTPS')
  const now=new Date().toISOString()
  const {results}=await env.D1.prepare("SELECT id,\"to\",subject,text,attempts FROM outbox WHERE state='pending' AND (next_attempt_at IS NULL OR next_attempt_at<=?) ORDER BY id LIMIT 3").bind(now).all()
  for(const message of results){
    const lease=await env.D1.prepare("UPDATE outbox SET next_attempt_at=? WHERE id=? AND state='pending' AND (next_attempt_at IS NULL OR next_attempt_at<=?)").bind(new Date(Date.now()+600000).toISOString(),message.id,now).run()
    if(lease.meta.changes!==1)continue
    const attempts=(message.attempts||0)+1
    try{
      const response=await fetch(env.MAIL_API_URL,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.MAIL_API_TOKEN,'Idempotency-Key':'solidprint-outbox-'+message.id},body:JSON.stringify({from:env.MAIL_FROM,to:message.to,subject:message.subject,text:message.text})})
      if(!response.ok)throw new Error('Mail HTTP '+response.status)
      await response.body?.cancel()
      await env.D1.prepare("UPDATE outbox SET state='sent',attempts=?,last_error='',updated_at=? WHERE id=? AND state='pending'").bind(attempts,new Date().toISOString(),message.id).run()
    }catch(error){
      await env.D1.prepare('UPDATE outbox SET state=?,attempts=?,last_error=?,next_attempt_at=?,updated_at=? WHERE id=? AND state=\'pending\'').bind(attempts>=8?'failed':'pending',attempts,'Nie udało się dostarczyć wiadomości. Sprawdź adapter poczty.',new Date(Date.now()+Math.min(3600000,30000*2**attempts)).toISOString(),new Date().toISOString(),message.id).run()
      console.error(JSON.stringify({event:'mail_delivery_failed',outboxId:message.id,attempts}))
    }
  }
  return results.length
}
