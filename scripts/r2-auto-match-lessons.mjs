#!/usr/bin/env node
/**
 * 관리자 API로 R2 ↔ 강좌 차시 자동 매칭 호출
 *
 * 사용법:
 *   BASE_URL=https://mindstory.kr \
 *   ADMIN_TOKEN=<JWT 또는 세션에서 복사한 Bearer 토큰> \
 *   node scripts/r2-auto-match-lessons.mjs <course_id> [--dry-run]
 *
 * --dry-run: DB 반영 없이 예상 매칭만 출력
 */

const courseId = process.argv[2]
const dryRun = process.argv.includes('--dry-run')

if (!courseId || !/^\d+$/.test(courseId)) {
  console.error('Usage: BASE_URL=... ADMIN_TOKEN=... node scripts/r2-auto-match-lessons.mjs <course_id> [--dry-run]')
  process.exit(1)
}

const base = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const token = process.env.ADMIN_TOKEN || process.env.TOKEN || ''

if (!token) {
  console.error('Set ADMIN_TOKEN (Bearer JWT for an admin user).')
  process.exit(1)
}

const url = `${base}/api/admin/r2/auto-match`
const body = JSON.stringify({
  course_id: parseInt(courseId, 10),
  dry_run: dryRun,
})

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  },
  body,
})

const text = await res.text()
let json
try {
  json = JSON.parse(text)
} catch {
  console.error(res.status, text)
  process.exit(1)
}

console.log(JSON.stringify(json, null, 2))
if (!json.success) process.exit(1)
