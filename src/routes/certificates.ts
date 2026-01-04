/**
 * 🎓 수료증 발급 API 라우트
 * /api/certificates/*
 * 
 * 목적: 강좌 수료 후 수료증 발급 및 관리
 * 
 * 기능:
 * - GET /api/courses/:courseId/certificate/eligible - 수료증 발급 가능 여부 확인
 * - POST /api/courses/:courseId/certificate - 수료증 발급
 * - GET /api/my/certificates - 내 수료증 목록
 * - GET /api/certificates/:number - 수료증 조회 (번호로)
 */

import { Hono } from 'hono'
import { Bindings, Certificate, CertificateEligibility } from '../types/database'
import { requireAuth } from '../middleware/auth'
import {
  successResponse,
  throwNotFoundError,
  throwForbiddenError,
  BusinessError,
  handleError
} from '../utils/error-handler'

const certificates = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/courses/:courseId/certificate/eligible
 * 수료증 발급 가능 여부 확인
 * 
 * 조건:
 * - 강좌 수강 중
 * - 진도율 100%
 */
certificates.get('/courses/:courseId/certificate/eligible', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const courseId = parseInt(c.req.param('courseId'))
    const { DB } = c.env

    // 수강 정보 조회
    const enrollment = await DB.prepare(`
      SELECT 
        id,
        progress_rate,
        is_completed,
        completed_at
      FROM enrollments
      WHERE user_id = ? AND course_id = ?
    `).bind(user.id, courseId).first() as any

    if (!enrollment) {
      return throwNotFoundError(c, '수강 정보')
    }

    // 수료 조건 확인 (진도율 100%)
    const eligible = enrollment.progress_rate >= 100

    const result: CertificateEligibility = {
      eligible,
      progress: enrollment.progress_rate,
      completed_at: enrollment.completed_at,
      required_progress: 100
    }

    return successResponse(c, result)

  } catch (error) {
    return handleError(c, error)
  }
})

/**
 * POST /api/courses/:courseId/certificate
 * 수료증 발급
 * 
 * 수료증 번호 형식: CERT-YYYY-MM-NNNN
 */
certificates.post('/courses/:courseId/certificate', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const courseId = parseInt(c.req.param('courseId'))
    const { DB } = c.env

    // 강좌 정보 조회
    const course = await DB.prepare(`
      SELECT id, title FROM courses WHERE id = ?
    `).bind(courseId).first() as any

    if (!course) {
      return throwNotFoundError(c, '강좌')
    }

    // 수강 정보 조회
    const enrollment = await DB.prepare(`
      SELECT 
        id,
        progress_rate,
        is_completed,
        completed_at
      FROM enrollments
      WHERE user_id = ? AND course_id = ?
    `).bind(user.id, courseId).first() as any

    if (!enrollment) {
      return throwNotFoundError(c, '수강 정보')
    }

    // 수료 조건 확인
    if (enrollment.progress_rate < 100) {
      return BusinessError.certificateNotEligible(
        c,
        `진도율이 100% 미만입니다. (현재: ${enrollment.progress_rate.toFixed(1)}%)`
      )
    }

    // 이미 발급된 수료증이 있는지 확인
    const existing = await DB.prepare(`
      SELECT id, certificate_number FROM certificates
      WHERE user_id = ? AND course_id = ?
    `).bind(user.id, courseId).first() as any

    if (existing) {
      // 이미 발급된 수료증 반환
      const certificate = await DB.prepare(`
        SELECT 
          c.*,
          u.name as user_name,
          co.title as course_title
        FROM certificates c
        JOIN users u ON c.user_id = u.id
        JOIN courses co ON c.course_id = co.id
        WHERE c.id = ?
      `).bind(existing.id).first()

      return successResponse(c, { certificate }, '이미 발급된 수료증이 있습니다.')
    }

    // 수료증 번호 생성 (CERT-YYYY-MM-NNNN)
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // 이번 달 발급된 수료증 수 조회
    const countResult = await DB.prepare(`
      SELECT COUNT(*) as count FROM certificates
      WHERE strftime('%Y-%m', issue_date) = ?
    `).bind(`${year}-${month}`).first() as { count: number }

    const sequence = String((countResult?.count || 0) + 1).padStart(4, '0')
    const certificateNumber = `CERT-${year}-${month}-${sequence}`

    // 수료증 발급
    const issueDate = now.toISOString().split('T')[0]
    const completionDate = enrollment.completed_at 
      ? new Date(enrollment.completed_at).toISOString().split('T')[0]
      : issueDate

    await DB.prepare(`
      INSERT INTO certificates (
        user_id,
        course_id,
        enrollment_id,
        certificate_number,
        issue_date,
        completion_date,
        progress_rate,
        issued_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      courseId,
      enrollment.id,
      certificateNumber,
      issueDate,
      completionDate,
      enrollment.progress_rate,
      'Mindstory LMS'
    ).run()

    // 발급된 수료증 조회
    const certificate = await DB.prepare(`
      SELECT 
        c.*,
        u.name as user_name,
        co.title as course_title
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.certificate_number = ?
    `).bind(certificateNumber).first()

    return successResponse(c, { certificate }, '수료증이 발급되었습니다.', 201)

  } catch (error) {
    return handleError(c, error)
  }
})

/**
 * GET /api/my/certificates
 * 내 수료증 목록 조회
 */
certificates.get('/my/certificates', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const { DB } = c.env

    const myCertificates = await DB.prepare(`
      SELECT 
        c.*,
        co.title as course_title,
        co.thumbnail_url as course_thumbnail
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      WHERE c.user_id = ?
      ORDER BY c.issue_date DESC
    `).bind(user.id).all()

    return successResponse(c, { certificates: myCertificates.results })

  } catch (error) {
    return handleError(c, error)
  }
})

/**
 * GET /api/certificates/:number
 * 수료증 조회 (번호로)
 * 
 * 공개 API - 누구나 수료증 번호로 조회 가능 (검증용)
 */
certificates.get('/certificates/:number', async (c) => {
  try {
    const certificateNumber = c.req.param('number')
    const { DB } = c.env

    const certificate = await DB.prepare(`
      SELECT 
        c.*,
        u.name as user_name,
        co.title as course_title
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.certificate_number = ?
    `).bind(certificateNumber).first()

    if (!certificate) {
      return throwNotFoundError(c, '수료증')
    }

    return successResponse(c, { certificate })

  } catch (error) {
    return handleError(c, error)
  }
})

export default certificates
