import type { Bindings } from '../types/database'

/**
 * MS12는 누구나 주소로 이용(게스트)이 기본. optional = Guest First · demo = 공개 시연
 * required 는 예전·클라우드 문서 흔적일 수 있어 기본은 무시하고 demo로 동작( MS12_AUTH_STRICT 로만 real required )
 */
export type AuthMode = 'optional' | 'demo' | 'required' | 'disabled'

function authStrict(c: { env: Bindings }): boolean {
  const s = (c.env.MS12_AUTH_STRICT ?? '')
    .toString()
    .trim()
    .toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'force'
}

export function getAuthMode(c: { env: Bindings }): AuthMode {
  const raw = (c.env.AUTH_MODE ?? c.env.MS12_AUTH_MODE ?? 'demo')
    .toString()
    .trim()
    .toLowerCase()
  let mode: AuthMode
  if (raw === 'required' || raw === '1' || raw === 'true' || raw === 'force' || raw === 'yes') {
    mode = 'required'
  } else if (raw === 'disabled' || raw === 'off' || raw === 'no') {
    mode = 'disabled'
  } else if (raw === 'demo' || raw === 'public' || raw === 'open') {
    mode = 'demo'
  } else {
    mode = 'optional'
  }
  if (mode === 'required' && !authStrict(c)) {
    return 'demo'
  }
  return mode
}

/** 게스트 actor + ms12_guest 쿠키 사용 (required 가 아닐 때) */
export function isMs12GuestMode(c: { env: Bindings }): boolean {
  return getAuthMode(c) !== 'required'
}

/** 로그인 없이 앱 셸·MS12 API 가 열리는 모드 */
export function isOpenGuestMode(mode: AuthMode): boolean {
  return mode === 'optional' || mode === 'demo' || mode === 'disabled'
}
