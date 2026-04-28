import type { Bindings } from '../types/database'

/** MS12 공개 모드 고정 — 계정·게스트 구분 없음 */
export type AuthMode = 'public'

export function getAuthMode(_c: { env: Bindings }): AuthMode {
  return 'public'
}

/** @deprecated 호환용 — 항상 공개 */
export function isMs12GuestMode(_c: { env: Bindings }): boolean {
  return false
}

/** @deprecated 호환용 */
export function isOpenGuestMode(_mode: AuthMode): boolean {
  return true
}
