/**
 * 강좌 수강·결제 전 자격증 안내 팝업 / 챗봇 답변용 공통 데이터
 */

import type { D1Database } from '@cloudflare/workers-types'
import { SQL_COURSE_CATALOG_VISIBLE_ALIAS } from './course-visibility'
import { extractSearchKeywords } from './chat-rag-context'

export type CertificateEnrollmentGuide = {
  course_title: string
  issuer_name: string
  certificate_name: string
  /** 취득 조건 고지 문구 */
  condition_text: string
  fee_list_won: number
  fee_student_won: number
}

const DEFAULT_ISSUE_FEE_LIST = 90000
const DEFAULT_ISSUE_FEE_STUDENT = 70000

const CONDITION_TEXT = '영상 진도율 80% 이상 달성 + 온라인 시험 합격'

function pickPositiveInt(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10)
  if (Number.isFinite(n) && n > 0) return Math.trunc(n)
  return fallback
}

export function buildCertificateEnrollmentGuide(
  courseTitle: string,
  certRow: Record<string, unknown> | null,
): CertificateEnrollmentGuide | null {
  if (!certRow || certRow.name == null || String(certRow.name).trim() === '') return null

  const listW = pickPositiveInt(certRow.issue_fee_list_won, DEFAULT_ISSUE_FEE_LIST)
  const studentW = pickPositiveInt(certRow.issue_fee_student_won, DEFAULT_ISSUE_FEE_STUDENT)

  return {
    course_title: String(courseTitle || '').trim() || '강좌',
    issuer_name: String(certRow.issuer_name || '(주)마인드스토리').trim(),
    certificate_name: String(certRow.name).trim(),
    condition_text: CONDITION_TEXT,
    fee_list_won: listW,
    fee_student_won: studentW,
  }
}

/**
 * 챗봇: "이 과목 자격" 류 질문에 강좌·자격증 매칭 답변 (없으면 null)
 */
export async function buildCertificateBenefitChatReply(
  db: D1Database,
  message: string,
): Promise<string | null> {
  const q = String(message || '').trim()
  if (q.length < 2) return null
  if (!/(자격|수료|민간|취득|받|되나|되니|과목|과정|공부|배우|이수)/.test(q)) return null

  const keywords = extractSearchKeywords(q)
  if (keywords.length === 0) return null

  const courseOrPart = keywords
    .map(() => '(COALESCE(c.title,\'\') || \' \' || COALESCE(c.description,\'\')) LIKE ?')
    .join(' OR ')
  const binds = keywords.map((k) => `%${k}%`)

  const sql = `
    SELECT c.title AS course_title,
           p.issuer_name AS issuer_name,
           p.name AS cert_name,
           COALESCE(CASE WHEN p.issue_fee_list_won IS NOT NULL AND p.issue_fee_list_won > 0 THEN p.issue_fee_list_won END, ${DEFAULT_ISSUE_FEE_LIST}) AS list_won,
           COALESCE(CASE WHEN p.issue_fee_student_won IS NOT NULL AND p.issue_fee_student_won > 0 THEN p.issue_fee_student_won END, ${DEFAULT_ISSUE_FEE_STUDENT}) AS student_won
    FROM courses c
    INNER JOIN private_certificate_catalog p ON p.id = c.certificate_id
    WHERE c.certificate_id IS NOT NULL AND ${SQL_COURSE_CATALOG_VISIBLE_ALIAS} AND (${courseOrPart})
    ORDER BY c.id DESC
    LIMIT 1
  `

  try {
    const row = await db
      .prepare(sql)
      .bind(...binds)
      .first<{
        course_title: string
        issuer_name: string
        cert_name: string
        list_won: number
        student_won: number
      }>()
    if (!row) return null
    const lt = Number(row.list_won) || DEFAULT_ISSUE_FEE_LIST
    const st = Number(row.student_won) || DEFAULT_ISSUE_FEE_STUDENT
    return (
      `[${row.course_title}]을 공부하시면 **${row.issuer_name}**의 ${row.cert_name} 자격을 취득할 수 있어요! 지금 공부하시면 나중에 자격증 발급 시 2만원 할인 혜택을 받으실 수 있어요! 수강생 특별가는 정상가 ${(lt / 10000).toFixed(0)}만원 대비 **${(st / 10000).toFixed(0)}만원**(수강생 혜택)에 발급 가능합니다. 😊`
    )
  } catch (e) {
    const m = String(e instanceof Error ? e.message : e)
    if (!/no such column.*issue_fee/i.test(m)) console.warn('[chat] certificate benefit reply:', e)
    try {
      const legacy = await db
        .prepare(
          `
        SELECT c.title AS course_title,
               p.issuer_name AS issuer_name,
               p.name AS cert_name
        FROM courses c
        INNER JOIN private_certificate_catalog p ON p.id = c.certificate_id
        WHERE c.certificate_id IS NOT NULL AND ${SQL_COURSE_CATALOG_VISIBLE_ALIAS} AND (${courseOrPart})
        ORDER BY c.id DESC
        LIMIT 1
      `,
        )
        .bind(...binds)
        .first<{ course_title: string; issuer_name: string; cert_name: string }>()
      if (!legacy) return null
      const lt = DEFAULT_ISSUE_FEE_LIST
      const st = DEFAULT_ISSUE_FEE_STUDENT
      return (
        `[${legacy.course_title}]을 공부하시면 **${legacy.issuer_name}**의 ${legacy.cert_name} 자격을 취득할 수 있어요! 지금 공부하시면 나중에 자격증 발급 시 2만원 할인 혜택을 받으실 수 있어요! 수강생 특별가는 정상가 ${(lt / 10000).toFixed(0)}만원 대비 **${(st / 10000).toFixed(0)}만원**(수강생 혜택)에 발급 가능합니다. 😊`
      )
    } catch {
      return null
    }
  }
}
