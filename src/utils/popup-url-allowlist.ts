/**
 * 사이트 팝업(공지) 이미지·링크 URL — 외부 광고·피싱 도메인 차단.
 * 허용: 동일 출처 상대경로, mindstory.kr(및 *.mindstory.kr), Cloudflare Pages 배포 도메인, 로컬 개발.
 */

function allowedHostname(h: string): boolean {
    const host = h.toLowerCase()
    if (host === 'mindstory.kr' || host === 'www.mindstory.kr') return true
    if (host.endsWith('.mindstory.kr')) return true
    if (host === 'mslms.pages.dev' || host.endsWith('.mslms.pages.dev')) return true
    if (host === 'localhost' || host === '127.0.0.1') return true
    return false
}

/** GET /api/popups/active 및 클라이언트 popup.js 와 동일 규칙 */
export function sanitizePopupUrl(raw: string | null | undefined): string | null {
    if (raw == null) return null
    const s = String(raw).trim()
    if (!s) return null
    // Same-origin paths only (no // open redirect)
    if (s.startsWith('/') && !s.startsWith('//')) return s
    let u: URL
    try {
        u = new URL(s)
    } catch {
        return null
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (u.protocol === 'http:' && !allowedHostname(u.hostname)) return null
    if (u.protocol === 'https:' && !allowedHostname(u.hostname)) return null
    return u.toString()
}
