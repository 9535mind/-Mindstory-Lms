/**
 * PortOne 본인인증 + 결제 검증 — 위변조 방지 및 발급 완료 처리
 * POST /api/payment/verify
 */

import { Hono } from 'hono'
import type { Bindings } from '../types/database'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/helpers'
import {
  getIamportAccessToken,
  getIamportCertification,
  getIamportPayment,
  normalizeKoreanName,
  type IamportPayment,
} from '../utils/portone'

const app = new Hono<{ Bindings: Bindings }>()

function assertPortoneKeys(c: import('hono').Context): { impKey: string; impSecret: string } {
  const impKey = c.env.PORTONE_IMP_KEY
  const impSecret = c.env.PORTONE_IMP_SECRET
  if (!impKey || !impSecret) {
    throw new Error('PORTONE_IMP_KEY, PORTONE_IMP_SECRET 환경 변수를 설정하세요.')
  }
  return { impKey, impSecret }
}

async function readJson(c: import('hono').Context): Promise<Record<string, unknown>> {
  try {
    return (await c.req.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

function paymentBuyerName(pg: IamportPayment): string {
  const raw = (pg as { buyer_name?: string; name?: string }).buyer_name ?? (pg as { name?: string }).name
  return String(raw ?? '').trim()
}

/**
 * POST /api/payment/verify
 * Body: { imp_uid_cert, imp_uid_pay, merchant_uid }
 */
app.post('/verify', requireAuth, async (c) => {
  try {
    const { impKey, impSecret } = assertPortoneKeys(c)
    const user = c.get('user') as { id: number; name?: string | null; email?: string | null }
    const body = await readJson(c)
    const imp_uid_cert = String(body.imp_uid_cert ?? body.cert_imp_uid ?? '').trim()
    const imp_uid_pay = String(body.imp_uid_pay ?? body.imp_uid ?? '').trim()
    const merchant_uid = String(body.merchant_uid ?? body.order_id ?? '').trim()

    if (!imp_uid_cert || !imp_uid_pay || !merchant_uid) {
      return c.json(
        errorResponse('imp_uid_cert, imp_uid_pay, merchant_uid(주문번호)가 필요합니다.'),
        400,
      )
    }

    const { DB } = c.env

    const row = await DB.prepare(
      `SELECT * FROM certificate_issuances WHERE order_id = ? AND user_id = ?`,
    )
      .bind(merchant_uid, user.id)
      .first<{
        id: number
        user_id: number
        certificate_id: number
        order_id: string
        amount: number
        status: string
      }>()

    if (!row) {
      return c.json(errorResponse('발급 주문을 찾을 수 없습니다.'), 404)
    }
    if (row.status === 'PAID') {
      return c.json(successResponse({ issuanceId: row.id, alreadyPaid: true }, '이미 처리된 결제입니다.'))
    }
    if (row.status !== 'PENDING') {
      return c.json(errorResponse('처리할 수 없는 주문 상태입니다.'), 400)
    }

    const token = await getIamportAccessToken(impKey, impSecret)
    const cert = await getIamportCertification(imp_uid_cert, token)
    const pg = await getIamportPayment(imp_uid_pay, token)

    if (pg.merchant_uid !== merchant_uid) {
      return c.json(errorResponse('결제 주문번호가 일치하지 않습니다.'), 400)
    }
    if (typeof pg.amount !== 'number' || pg.amount !== row.amount) {
      return c.json(errorResponse('결제 금액이 주문과 일치하지 않습니다.'), 400)
    }
    if (pg.status !== 'paid') {
      return c.json(errorResponse('결제가 완료되지 않았습니다.'), 400)
    }

    const certNameNorm = normalizeKoreanName(cert.name)
    if (!certNameNorm) {
      return c.json(errorResponse('본인인증 정보에 실명이 없습니다.'), 400)
    }

    const payName = paymentBuyerName(pg)
    if (payName && normalizeKoreanName(payName) !== certNameNorm) {
      return c.json(
        errorResponse('본인인증 실명과 결제 수단 명의가 일치하지 않습니다. 동일인으로 진행해 주세요.'),
        400,
      )
    }

    const phoneFromCert = String(cert.phone ?? '').replace(/\D/g, '')
    const birthRaw = String(cert.birthday ?? cert.birth ?? '').trim()

    try {
      await DB.prepare(
        `UPDATE users SET
          real_name = ?,
          phone_number = COALESCE(?, phone_number),
          phone = COALESCE(phone, ?),
          is_verified = 1,
          updated_at = datetime('now')
        WHERE id = ?`,
      )
        .bind(cert.name, phoneFromCert || null, phoneFromCert || null, user.id)
        .run()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (/no such column/i.test(msg)) {
        try {
          await DB.prepare(
            `UPDATE users SET name = COALESCE(name, ?), phone = COALESCE(phone, ?), updated_at = datetime('now') WHERE id = ?`,
          )
            .bind(cert.name, phoneFromCert || null, user.id)
            .run()
        } catch {
          await DB.prepare(`UPDATE users SET name = COALESCE(name, ?), updated_at = datetime('now') WHERE id = ?`)
            .bind(cert.name, user.id)
            .run()
        }
      } else {
        throw e
      }
    }

    if (birthRaw) {
      try {
        await DB.prepare(`UPDATE users SET birth_date = ? WHERE id = ?`).bind(birthRaw, user.id).run()
      } catch {
        /* birth_date 컬럼 없음 등 */
      }
    }

    await DB.prepare(
      `UPDATE certificate_issuances SET
        status = 'PAID',
        imp_uid_cert = ?,
        imp_uid_pay = ?,
        issued_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?`,
    )
      .bind(imp_uid_cert, imp_uid_pay, row.id)
      .run()

    return c.json(
      successResponse(
        {
          issuanceId: row.id,
          certificate_id: row.certificate_id,
          real_name: cert.name,
          amount: row.amount,
        },
        '본인인증 및 결제가 확인되었습니다.',
      ),
    )
  } catch (e) {
    console.error('[payment/verify]', e)
    const msg = e instanceof Error ? e.message : String(e)
    return c.json(errorResponse(msg.includes('PortOne') ? msg : '결제 검증에 실패했습니다.'), 500)
  }
})

export default app
