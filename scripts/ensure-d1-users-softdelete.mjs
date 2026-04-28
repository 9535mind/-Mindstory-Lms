/**
 * D1 users.deleted_at / deletion_reason 멱등 보정
 *   node scripts/ensure-d1-users-softdelete.mjs --local
 *   node scripts/ensure-d1-users-softdelete.mjs --remote
 */
import { execSync } from 'node:child_process'

const db = 'ms12-production-v2'
const remote = process.argv.includes('--remote')
const flag = remote ? '--remote' : '--local'

function d1Out(cmd) {
  return execSync(cmd, { encoding: 'utf8' })
}

function parseExecuteJson(stdout) {
  const m = stdout.match(/\[.+\]/s)
  if (!m) return null
  try {
    return JSON.parse(m[0])
  } catch {
    return null
  }
}

function hasColumn(columnName) {
  const out = d1Out(
    `npx wrangler d1 execute ${db} ${flag} --command "PRAGMA table_info(users);"`,
  )
  const j = parseExecuteJson(out)
  const results = j?.[0]?.results
  if (!Array.isArray(results)) return null
  return results.some((r) => r && String(r.name) === columnName)
}

function runOne(sql) {
  const c = `npx wrangler d1 execute ${db} ${flag} --command ${JSON.stringify(sql)}`
  try {
    execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
    return 'ok'
  } catch (e) {
    const m =
      (e && e.stderr && String(e.stderr)) ||
      (e && e.message) ||
      (e && e.stdout && String(e.stdout)) ||
      String(e)
    if (
      /duplicate column name: deleted_at|duplicate column name: deletion_reason|SQLITE_ERROR.*duplicate column/i.test(
        m,
      )
    ) {
      return 'dup'
    }
    throw e
  }
}

let hasDel = hasColumn('deleted_at')
if (hasDel === true) {
  console.log('[ensure-d1-users-softdelete] users.deleted_at already present — no ALTER.')
} else {
  if (hasDel == null) {
    console.warn(
      '[ensure-d1-users-softdelete] could not read PRAGMA; attempting ALTERs anyway.',
    )
  }
  for (const sql of [
    'ALTER TABLE users ADD COLUMN deleted_at TEXT',
    'ALTER TABLE users ADD COLUMN deletion_reason TEXT',
  ]) {
    const r = runOne(sql)
    if (r === 'dup') {
      console.log('[ensure-d1-users-softdelete] skip duplicate:', sql.split(' ').slice(3, 4).join(' '))
    }
  }
  hasDel = hasColumn('deleted_at')
}

if (hasDel) {
  const ir = runOne(
    'CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at)',
  )
  if (ir === 'ok' || ir === 'dup') {
    console.log('[ensure-d1-users-softdelete] index idx_users_deleted_at ensured.')
  }
} else {
  console.warn(
    '[ensure-d1-users-softdelete] still no users.deleted_at; index skipped (check D1 / migrations).',
  )
}

console.log('[ensure-d1-users-softdelete] done.')
