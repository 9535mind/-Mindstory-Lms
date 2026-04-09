/**
 * 자격증 발급비 결제 준비 — PortOne request_pay 직전 pending 행 생성
 * POST /api/certificate-issuance/prepare
 */

import { Hono } from 'hono'
import type { Bindings } from '../types/database'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse, generateOrderId } from '../utils/helpers'

const app = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/certificate-issuance/catalog/:id
 * 발급비·표시용 (주문 생성 없음) — 자격증 신청 동의 팝업 금액 표시
 */
app.get('/catalog/:id', requireAuth, async (c) => {
  try {
    const raw = c.req.param('id')
    const cid = parseInt(String(raw ?? ''), 10)
    if (!Number.isFinite(cid) || cid <= 0) {
      return c.json(errorResponse('유효한 자격증 ID가 필요합니다.'), 400)
    }
    const { DB } = c.env
    const row = await DB.prepare(
      `SELECT id, name, fee_won, issuer_name, registration_number FROM private_certificate_catalog WHERE id = ?`,
    )
      .bind(cid)
      .first<{
        id: number
        name: string
        fee_won: number | null
        issuer_name: string
        registration_number: string
      }>()
    if (!row) {
      return c.json(errorResponse('자격증 정보를 찾을 수 없습니다.'), 404)
    }
    const fee_won = Math.max(0, Math.trunc(Number(row.fee_won ?? 70000)))
    return c.json(successResponse({ id: row.id, name: row.name, issuer_name: row.issuer_name, fee_won, registration_number: row.registration_number }))
  } catch (e) {
    console.error('[certificate-issuance/catalog]', e)
    return c.json(errorResponse('자격증 정보를 불러오지 못했습니다.'), 500)
  }
})

async function readJson(c: import('hono').Context): Promise<Record<string, unknown>> {
  try {
    return (await c.req.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * POST /api/certificate-issuance/prepare
 * Body: { certificate_catalog_id: number }
 */
app.post('/prepare', requireAuth, async (c) => {
  try {
    const user = c.get('user') as { id: number }
    const body = await readJson(c)
    const rawId = body.certificate_catalog_id ?? body.certificate_id
    const cid =
      typeof rawId === 'number' && Number.isFinite(rawId)
        ? Math.trunc(rawId)
        : parseInt(String(rawId ?? ''), 10)
    if (!Number.isFinite(cid) || cid <= 0) {
      return c.json(errorResponse('certificate_catalog_id가 필요합니다.'), 400)
    }

    const { DB } = c.env

    const cert = await DB.prepare(
      `SELECT id, name, fee_won, cost_total, registration_number, issuer_name
       FROM private_certificate_catalog WHERE id = ?`,
    )
      .bind(cid)
      .first<{
        id: number
        name: string
        fee_won: number | null
        cost_total: string
        registration_number: string
        issuer_name: string
      }>()

    if (!cert) {
      return c.json(errorResponse('자격증 정보를 찾을 수 없습니다.'), 404)
    }

    const amount = Math.max(0, Math.trunc(Number(cert.fee_won ?? 33000)))
    if (amount <= 0) {
      return c.json(errorResponse('발급비 금액이 설정되지 않았습니다. 관리자에게 문의해 주세요.'), 400)
    }

    const order_id = `CI-${generateOrderId()}`

    try {
      await DB.prepare(
        `INSERT INTO certificate_issuances (
          user_id, certificate_id, order_id, amount, status
        ) VALUES (?, ?, ?, ?, 'PENDING')`,
      )
        .bind(user.id, cert.id, order_id, amount)
        .run()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (/no such table/i.test(msg)) {
        return c.json(errorResponse('발급·결제 테이블이 준비되지 않았습니다.'), 503)
      }
      throw e
    }

    const orderName = `[${cert.issuer_name}] ${cert.name} 발급비`

    return c.json(
      successResponse({
        merchant_uid: order_id,
        amount,
        orderName,
        certificate_catalog_id: cert.id,
        pg: c.env.PORTONE_PG || 'html5_inicis',
      }),
    )
  } catch (e) {
    console.error('[certificate-issuance/prepare]', e)
    return c.json(errorResponse('발급 결제 준비에 실패했습니다.'), 500)
  }
})

export default app
