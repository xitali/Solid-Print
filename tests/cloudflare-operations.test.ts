import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it,vi } from 'vitest'
import { scannerRequest, cleanupCloudflare,processMailCloudflare } from '../cloudflare/maintenance.js'

let db: DatabaseSync
function setup() {
  db = new DatabaseSync(':memory:')
  for (const f of ['0001_initial.sql', '0002_operations.sql']) db.exec(readFileSync('migrations-d1/'+f, 'utf8'))
  const prepare = (sql: string) => {
    const statement = (values: any[] = []) => ({
      bind: (...v: any[]) => statement(v),
      first: async () => db.prepare(sql).get(...values) ?? null,
      all: async () => ({results: db.prepare(sql).all(...values)}),
      run: async () => ({meta: {changes: Number(db.prepare(sql).run(...values).changes)}}),
    })
    return statement()
  }
  return {D1: {prepare}, SCANNER_TOKEN:'test-secret', PRIVATE_FILES: {
    delete: async (_key: string) => {}, get: async (_key: string) => ({body: 'abc',size:3}),
  }} as any
}
afterEach(() => {db?.close();vi.unstubAllGlobals()})
const headers = { Authorization: 'Bearer test-secret', 'Content-Type': 'application/json' }
const hash = 'a'.repeat(64)
function file(id: number, status='quarantined', inquiryId: string|null='1') {
  db.prepare('INSERT INTO quote_files(id,name,size,kind,object_key,status,content_hash,inquiry_id) VALUES (?,?,?,?,?,?,?,?)').run(id,'model.stl',3,'model','quote/'+id,status,hash,inquiryId)
}
describe('Cloudflare skanowanie i retencja', () => {
  it('nie udostępnia modeli bez osobnego tokenu skanera', async () => {
    const env=setup(); file(1)
    const r=await scannerRequest(new Request('https://site/internal/scanner/jobs'),env)
    expect(r.status).toBe(401)
  })
  it('wydaje tylko kwarantannę, wymaga zgodnego hasha i nie zmienia ponownie wyniku', async () => {
    const env=setup(); file(1); file(2,'pending'); file(3,'clean'); file(4,'quarantined',null)
    const jobs=await scannerRequest(new Request('https://site/internal/scanner/jobs',{headers}),env)
    expect((await jobs.json()).files.map((f:any)=>f.id)).toEqual([1])
    const result=(h:string,status:string)=>scannerRequest(new Request('https://site/internal/scanner/1/result',{method:'POST',headers,body:JSON.stringify({hash:h,status})}),env)
    expect((await result('b'.repeat(64),'clean')).status).toBe(409)
    expect((await result(hash,'clean')).status).toBe(200)
    expect((await result(hash,'infected')).status).toBe(409)
  })
  it('usuwanie R2 musi się udać przed usunięciem metadanych; zachowuje otwarte sprawy', async () => {
    const env=setup(); file(1,'quarantined',null); file(2,'clean','2')
    db.exec("UPDATE quote_files SET created_at='2020-01-01T00:00:00.000Z'")
    env.PRIVATE_FILES.delete=async()=>{throw new Error('offline')}
    await expect(cleanupCloudflare(env)).rejects.toThrow('offline')
    expect(db.prepare('SELECT count(*) n FROM quote_files').get()?.n).toBe(2)
    env.PRIVATE_FILES.delete=async()=>{}
    await cleanupCloudflare(env)
    expect(db.prepare('SELECT id FROM quote_files').all().map(f=>f.id)).toEqual([2])
  })
  it('rezerwuje miejsce atomowo i zwalnia je po usunięciu', () => {
    setup(); file(1)
    db.exec('UPDATE sp_storage_budget SET bytes=7499999999')
    expect(()=>file(2)).toThrow('STORAGE_BUDGET_EXCEEDED')
    expect(db.prepare('SELECT bytes FROM sp_storage_budget').get()?.bytes).toBe(7499999999)
    db.exec('DELETE FROM quote_files WHERE id=1')
    expect(db.prepare('SELECT bytes FROM sp_storage_budget').get()?.bytes).toBe(7499999996)
  })
  it('bez adaptera zachowuje pocztę, a po błędzie ponawia z tym samym kluczem',async()=>{
    const env=setup()
    db.exec("INSERT INTO outbox(id,\"to\",subject,text,state,attempts) VALUES (1,'qa@example.org','Test','Test','pending',0)")
    expect(await processMailCloudflare(env)).toBe(0)
    Object.assign(env,{MAIL_API_URL:'https://mail.example.org/send',MAIL_API_TOKEN:'test-only',MAIL_FROM:'test@example.org'})
    const fetcher=vi.fn().mockResolvedValueOnce(new Response('',{status:500})).mockResolvedValueOnce(new Response('{}',{status:200}))
    vi.stubGlobal('fetch',fetcher)
    await processMailCloudflare(env)
    expect(db.prepare('SELECT state,attempts FROM outbox').get()).toMatchObject({state:'pending',attempts:1})
    db.exec("UPDATE outbox SET next_attempt_at='2000-01-01T00:00:00Z'")
    await processMailCloudflare(env)
    expect(db.prepare('SELECT state,attempts FROM outbox').get()).toMatchObject({state:'sent',attempts:2})
    expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toBe(fetcher.mock.calls[1][1].headers['Idempotency-Key'])
  })
})
