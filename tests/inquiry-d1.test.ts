import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

const context = vi.hoisted(() => ({ env: {} as Record<string, unknown> }))
vi.mock('../src/lib/cloudflare', () => ({ bindings: async () => context.env }))
import { saveInquiryD1 } from '../src/lib/inquiry-d1'
import { inquirySchema } from '../src/lib/rules'

let db: DatabaseSync
function setup() {
  db = new DatabaseSync(':memory:')
  db.exec(readFileSync('migrations-d1/0001_initial.sql', 'utf8'))
  const prepare = (sql: string) => ({
    bind: (...values: any[]) => ({ run: () => db.prepare(sql).run(...values) }),
  })
  context.env = { D1: { prepare, batch: async (statements: { run(): unknown }[]) => {
    db.exec('BEGIN')
    try { const result = statements.map(s => s.run()); db.exec('COMMIT'); return result }
    catch (error) { db.exec('ROLLBACK'); throw error }
  } } }
  db.exec("INSERT INTO upload_sessions (id) VALUES (1)")
}
afterEach(() => { db?.close(); vi.unstubAllEnvs() })
const data = inquirySchema.parse({ type: 'design', name: 'Anna', email: 'anna@example.org', description: 'Opis obudowy do projektu', privacy: true })

describe('D1: rzeczywista transakcja SQLite i kolejka', () => {
  it('korzysta z konfiguracji odbiorcy i zapisuje daty ISO zgodne z Payload', async () => {
    setup(); vi.stubEnv('OWNER_EMAIL', 'owner@example.org'); vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://test.example.org')
    await saveInquiryD1(data, '1', 'first', 'SP-2026-12345678', [])
    const messages = db.prepare('SELECT * FROM outbox ORDER BY id').all()
    expect(messages.map(m => m.to)).toEqual(['anna@example.org', 'owner@example.org'])
    expect(messages[1].text).toContain('https://test.example.org/admin/')
    expect(messages[0].next_attempt_at).toMatch(/^\d{4}-\d\d-\d\dT.*Z$/)
  })
  it('bez konfiguracji nie wysyła na prywatny adres autora', async () => {
    setup(); vi.stubEnv('OWNER_EMAIL', '')
    await saveInquiryD1(data, '1', 'first', 'SP-2026-12345678', [])
    expect(db.prepare('SELECT "to" FROM outbox').all()).toEqual([{ to: 'anna@example.org' }])
  })
  it('wycofuje całe zapytanie i sesję, gdy zapis kolejki zawiedzie', async () => {
    setup(); db.exec('DROP TABLE outbox')
    await expect(saveInquiryD1(data, '1', 'first', 'SP-2026-12345678', [])).rejects.toThrow()
    expect(db.prepare('SELECT count(*) AS n FROM inquiries').get()?.n).toBe(0)
    expect(db.prepare('SELECT inquiry_id FROM upload_sessions WHERE id=1').get()?.inquiry_id).toBeNull()
  })
})
