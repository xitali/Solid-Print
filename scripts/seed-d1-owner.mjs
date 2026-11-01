import { randomBytes, pbkdf2Sync } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const email = process.env.OWNER_EMAIL || 'emanuel.wloch@icloud.com'
const password = process.env.OWNER_PASSWORD || 'SolidPrint2026!Owner'

// On Cloudflare Workers Free (10 ms CPU limit), 600,000 PBKDF2 iterations causes Error 1102.
// Payload's legacy format uses 25,000 iterations (taking ~6 ms CPU), which cleanly fits inside Workers Free.
const salt = randomBytes(32).toString('hex')
const hash = pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex')

console.log(`Seeding owner into remote D1: ${email}`)

const checkSql = `SELECT count(*) as count FROM users WHERE email = '${email.replace(/'/g, "''")}';`
const checkRes = spawnSync(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js',
  'd1',
  'execute',
  'solid-print-test',
  '--remote',
  '--command',
  checkSql,
  '--json',
], { encoding: 'utf8' })

let exists = false
try {
  const json = JSON.parse(checkRes.stdout)
  if (json[0]?.results[0]?.count > 0) exists = true
} catch {}

let sql = ''
if (exists) {
  sql = `UPDATE users SET salt = '${salt}', hash = '${hash}', login_attempts = 0, lock_until = null WHERE email = '${email.replace(/'/g, "''")}';`
} else {
  sql = `INSERT INTO users (name, role, email, salt, hash, created_at, updated_at) VALUES ('Emanuel Włoch', 'owner', '${email.replace(/'/g, "''")}', '${salt}', '${hash}', datetime('now'), datetime('now'));`
}

const execRes = spawnSync(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js',
  'd1',
  'execute',
  'solid-print-test',
  '--remote',
  '--command',
  sql,
  '--json',
], { encoding: 'utf8', stdio: 'inherit' })

console.log('Gotowe. Owner seed completed successfully.')
