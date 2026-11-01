import { bindings } from './cloudflare'
import type { z } from 'zod'
import type { inquirySchema } from './rules'
import { inquiryMessages } from './inquiry-mail'

// D1 has no interactive SQL transactions. A single batch commits the complete receipt atomically.
export async function saveInquiryD1(
  data: z.infer<typeof inquirySchema>,
  sessionId: string,
  key: string,
  number: string,
  files: { id: number }[],
  snapshot?: Record<string, unknown>
) {
  const { D1 } = await bindings()
  const columns = [
    'number',
    'session_id',
    'idempotency_key',
    'type',
    'status',
    'name',
    'email',
    'phone',
    'company',
    'nip',
    'material',
    'color',
    'unit',
    'deadline',
    'delivery',
    'quantity',
    'description',
    'product_snapshot',
  ]
  const values = [
    number,
    sessionId,
    key,
    data.type,
    'new',
    data.name,
    data.email,
    data.phone,
    data.company,
    data.nip,
    data.material,
    data.color,
    data.unit,
    data.deadline,
    data.delivery,
    data.quantity,
    data.description,
    snapshot ? JSON.stringify(snapshot) : null,
  ]
  const statements = [
    D1.prepare(
      'INSERT INTO inquiries (' + columns.join(',') + ') VALUES (' + columns.map(() => '?').join(',') + ')'
    ).bind(...values),
  ]
  statements.push(
    D1.prepare(
      'UPDATE upload_sessions SET inquiry_id=CAST((SELECT id FROM inquiries WHERE idempotency_key=?) AS TEXT) WHERE id=?'
    ).bind(key, sessionId)
  )
  for (const [index, file] of files.entries()) {
    statements.push(
      D1.prepare(
        'UPDATE quote_files SET inquiry_id=CAST((SELECT id FROM inquiries WHERE idempotency_key=?) AS TEXT) WHERE id=? AND session_id=?'
      ).bind(key, file.id, sessionId)
    )
    statements.push(
      D1.prepare(
        `INSERT INTO inquiries_rels ("order",parent_id,path,quote_files_id) VALUES (?,(SELECT id FROM inquiries WHERE idempotency_key=?),'files',?)`
      ).bind(index + 1, key, file.id)
    )
  }

  const now = new Date().toISOString()
  for (const message of inquiryMessages(data, number)) {
    statements.push(D1.prepare(
      'INSERT INTO outbox ("to",subject,text,state,attempts,next_attempt_at,updated_at,created_at) VALUES (?,?,?,?,?,?,?,?)'
    ).bind(message.to, message.subject, message.text, 'pending', 0, now, now, now))
  }

  await D1.batch(statements)
  return number
}
