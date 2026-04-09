/**
 * PortOne(구 아임포트) REST API — Cloudflare Workers / Hono
 *
 * 환경 변수( wrangler / Pages 설정 ):
 * - c.env.PORTONE_IMP_KEY   — REST API용 가맹점 식별키
 * - c.env.PORTONE_IMP_SECRET — REST API용 시크릿
 *
 * @see https://developers.portone.io/opi/ko/integration/start/v1/rest
 */

interface IamportTokenResponse {
  code?: number
  message?: string | null
  response?: { access_token?: string }
}

interface IamportPaymentEnvelope {
  code?: number
  message?: string | null
  response?: IamportPayment
}

export interface IamportPayment {
  imp_uid?: string
  merchant_uid?: string
  amount?: number
  status?: string
  pay_method?: string
  paid_at?: number
  buyer_name?: string
  [key: string]: unknown
}

/**
 * PORTONE_IMP_KEY / PORTONE_IMP_SECRET 으로 액세스 토큰 발급
 */
export async function getIamportAccessToken(
  impKey: string,
  impSecret: string
): Promise<string> {
  const res = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret }),
  })
  const data = (await res.json()) as IamportTokenResponse
  if (!res.ok || data.code !== 0 || !data.response?.access_token) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'PortOne 토큰 발급 실패'
    )
  }
  return data.response.access_token
}

async function parsePaymentResponse(res: Response): Promise<IamportPayment> {
  const data = (await res.json()) as IamportPaymentEnvelope
  if (!res.ok || data.code !== 0 || !data.response) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'PortOne 결제 조회 실패'
    )
  }
  return data.response
}

/**
 * imp_uid 로 포트원 서버에서 결제 단건 조회
 * (Authorization: 토큰 단독 / Bearer 형식 모두 시도)
 */
export async function getIamportPayment(
  impUid: string,
  accessToken: string
): Promise<IamportPayment> {
  const url = `https://api.iamport.kr/payments/${encodeURIComponent(impUid)}`

  const res1 = await fetch(url, {
    method: 'GET',
    headers: { Authorization: accessToken },
  })
  const data1 = (await res1.json()) as IamportPaymentEnvelope
  if (res1.ok && data1.code === 0 && data1.response) {
    return data1.response
  }

  const res2 = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return parsePaymentResponse(res2)
}

/** PortOne V1 본인인증 단건 조회 — GET /certifications/{imp_uid} */
export interface IamportCertification {
  imp_uid?: string
  merchant_uid?: string
  name?: string
  birthday?: string
  birth?: string
  phone?: string
  certified?: boolean
  unique_key?: string
  [key: string]: unknown
}

interface IamportCertificationEnvelope {
  code?: number
  message?: string | null
  response?: IamportCertification
}

export async function getIamportCertification(
  impUid: string,
  accessToken: string,
): Promise<IamportCertification> {
  const url = `https://api.iamport.kr/certifications/${encodeURIComponent(impUid)}`

  const res1 = await fetch(url, {
    method: 'GET',
    headers: { Authorization: accessToken },
  })
  const data1 = (await res1.json()) as IamportCertificationEnvelope
  if (res1.ok && data1.code === 0 && data1.response) {
    return data1.response
  }

  const res2 = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data2 = (await res2.json()) as IamportCertificationEnvelope
  if (!res2.ok || data2.code !== 0 || !data2.response) {
    throw new Error(
      typeof data2.message === 'string' ? data2.message : 'PortOne 본인인증 조회 실패',
    )
  }
  return data2.response
}

/** 실명 비교용 정규화 (공백·대소문자 무시) */
export function normalizeKoreanName(s: string | null | undefined): string {
  return String(s ?? '')
    .trim()
    .replace(/\s+/g, '')
}
