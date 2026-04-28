/**
 * 사용자 정보 조회·표시 — UI·자비스·버튼에서 동일 로직으로 호출
 */

export type Ms12User = {
  name?: string | null
  company_name?: string | null
  email?: string | null
} & Record<string, unknown>

export async function getCurrentUser(): Promise<Response> {
  return fetch('/api/auth/me', { credentials: 'include' })
}

/** GET /api/auth/me JSON — 비로그인도 success: true + data: null 이므로 id로만 로그인 여부 판정 */
export function isLoggedInMePayload(j: unknown): boolean {
  if (j == null || typeof j !== 'object') return false
  const o = j as Record<string, unknown>
  if (o.success !== true) return false
  const d = o.data
  if (d == null || typeof d !== 'object' || Array.isArray(d)) return false
  const rec = d as Record<string, unknown>
  if (rec.type === 'guest') return false
  const id = rec.id
  if (id == null || id === '') return false
  if (typeof id === 'number' && Number.isFinite(id) && id >= 1) return true
  const s = String(id).trim()
  if (!/^\d+$/.test(s)) return false
  const n = parseInt(s, 10)
  return Number.isFinite(n) && n >= 1
}

/** 로그인 사용자 한 줄 표시(게스트/비로그인은 호출 측에서 별도 처리) */
export function getDisplayName(user: Ms12User | null | undefined): string {
  if (!user || typeof user !== 'object') return '이용자'
  const n = user.name != null ? String(user.name).trim() : ''
  const c = user.company_name != null ? String(user.company_name).trim() : ''
  if (n && c) {
    return `${n} · ${c}`
  }
  const em = user.email != null ? String(user.email).trim() : ''
  return n || c || em || '이용자'
}
