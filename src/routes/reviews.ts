import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

// 응답 헬퍼 함수
const successResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message
})

const errorResponse = (error: string) => ({
  success: false,
  error
})

const reviews = new Hono()

interface Review {
  id: number
  user_id: number
  course_id: number
  enrollment_id: number
  rating: number
  review_text: string
  is_visible: number
  created_at: string
  updated_at: string
}

interface CreateReviewInput {
  rating: number
  review_text: string
}

/**
 * GET /api/courses/:courseId/reviews
 * 강좌 리뷰 목록 조회
 */
reviews.get('/:courseId/reviews', async (c) => {
  try {
    const courseId = c.req.param('courseId')
    const { DB } = c.env

    const reviewsData = await DB.prepare(`
      SELECT 
        r.*,
        u.name as user_name
      FROM course_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC
    `).bind(courseId).all()

    return c.json(successResponse(reviewsData.results || []))

  } catch (error) {
    console.error('Get reviews error:', error)
    return c.json(errorResponse('서버 오류가 발생했습니다.'), 500)
  }
})

/**
 * POST /api/courses/:courseId/reviews
 * 강좌 리뷰 작성
 */
reviews.post('/:courseId/reviews', requireAuth, async (c) => {
  try {
    const courseId = c.req.param('courseId')
    const user = c.get('user')
    const body = await c.req.json<CreateReviewInput>()
    const { DB } = c.env

    // 수강 신청 확인
    const enrollment = await DB.prepare(`
      SELECT * FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND status = 'completed'
    `).bind(user.id, courseId).first()

    if (!enrollment) {
      return c.json(errorResponse('수료한 강좌에만 리뷰를 작성할 수 있습니다.'), 403)
    }

    // 이미 리뷰를 작성했는지 확인
    const existingReview = await DB.prepare(`
      SELECT id FROM course_reviews 
      WHERE user_id = ? AND course_id = ?
    `).bind(user.id, courseId).first()

    if (existingReview) {
      return c.json(errorResponse('이미 리뷰를 작성하셨습니다.'), 400)
    }

    // 리뷰 작성
    await DB.prepare(`
      INSERT INTO course_reviews (user_id, course_id, enrollment_id, rating, review_text, is_visible)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(user.id, courseId, enrollment.id, body.rating, body.review_text).run()

    return c.json(successResponse(null, '리뷰가 작성되었습니다.'))

  } catch (error) {
    console.error('Create review error:', error)
    return c.json(errorResponse('서버 오류가 발생했습니다.'), 500)
  }
})

export default reviews
