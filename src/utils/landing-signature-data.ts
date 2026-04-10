import type { D1Database } from '@cloudflare/workers-types'

export type SignatureCardId = 'classic' | 'next' | 'ncs'

export type SignatureCardContent = {
  title: string
  description: string
  button_label: string
  button_href: string
}

export const SIGNATURE_CARD_ORDER: SignatureCardId[] = ['classic', 'next', 'ncs']

export const DEFAULT_LANDING_SIGNATURE: Record<SignatureCardId, SignatureCardContent> = {
  classic: {
    title: 'MindStory Classic',
    description: '상담·진로·학습의 뿌리를 내립니다. 변하지 않는 가치를 배우는 프리미엄 입문 과정.',
    button_label: 'Classic 강좌 보기',
    button_href: '/courses/classic',
  },
  next: {
    title: 'MindStory Next',
    description: 'AI 동화·창작·기술을 융합합니다. 한계를 넘어 전문가로 도약하는 심화 실전 과정.',
    button_label: 'Next 강좌 보기',
    button_href: '/courses/next',
  },
  ncs: {
    title: 'MindStory Consortium : 국가인증 공동훈련',
    description:
      '산업인력공단 협약 기업 및 자사 직원을 위한 국가 직무능력표준(NCS) 기반의 전문 직업훈련 과정입니다.',
    button_label: '협약 및 서류 안내',
    button_href: '/courses/consortium',
  },
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** href: 상대 경로 또는 https URL만 허용 */
export function sanitizeSignatureHref(raw: string): string {
  const t = String(raw || '').trim()
  if (!t) return '/'
  if (t.startsWith('/')) return t.split(/[\s<>"']/)[0] || '/'
  try {
    const u = new URL(t)
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString()
  } catch {
    /* ignore */
  }
  return '/'
}

export async function loadLandingSignatureCardsFromDb(env: {
  DB: D1Database
}): Promise<Record<SignatureCardId, SignatureCardContent>> {
  try {
    const res = await env.DB.prepare(
      `SELECT id, title, description, button_label, button_href FROM landing_signature_cards WHERE id IN ('classic','next','ncs')`,
    ).all()
    const rows = (res.results || []) as Array<{
      id: string
      title: string
      description: string
      button_label: string
      button_href: string
    }>
    return mergeSignatureCards(rows)
  } catch {
    return mergeSignatureCards([])
  }
}

export function mergeSignatureCards(
  rows: Array<{
    id: string
    title: string
    description: string
    button_label: string
    button_href: string
  }>,
): Record<SignatureCardId, SignatureCardContent> {
  const out: Record<SignatureCardId, SignatureCardContent> = {
    classic: { ...DEFAULT_LANDING_SIGNATURE.classic },
    next: { ...DEFAULT_LANDING_SIGNATURE.next },
    ncs: { ...DEFAULT_LANDING_SIGNATURE.ncs },
  }
  for (const r of rows) {
    const id = r.id as SignatureCardId
    if (id !== 'classic' && id !== 'next' && id !== 'ncs') continue
    out[id] = {
      title: (r.title || '').trim() || DEFAULT_LANDING_SIGNATURE[id].title,
      description: (r.description || '').trim() || DEFAULT_LANDING_SIGNATURE[id].description,
      button_label: (r.button_label || '').trim() || DEFAULT_LANDING_SIGNATURE[id].button_label,
      button_href: sanitizeSignatureHref(r.button_href || DEFAULT_LANDING_SIGNATURE[id].button_href),
    }
  }
  return out
}
