/**
 * Progress Tracking API Routes
 * Handles lesson progress updates and course completion tracking
 */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { Bindings } from '../types/database'
import { requireAuth } from '../middleware/auth'

const app = new Hono<{ Bindings: Bindings }>()

const COMPLETE_THRESHOLD_PCT = 80

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

async function readJsonBody(c: Context): Promise<Record<string, unknown>> {
  try {
    return (await c.req.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

/** 진도 upsert — watched_seconds / total_seconds 기반 진도율, 80% 이상 자동 완료 */
async function upsertLessonProgress(
  c: Context,
  lessonIdStr: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const user = c.get('user') as { id: number; role: string }
  if (user.role === 'admin') {
    return c.json({
      success: true,
      skipped: true,
      message: '관리자 계정은 진도가 기록되지 않습니다.',
    })
  }

  const lessonId = Number(lessonIdStr)
  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    return c.json({ success: false, error: '유효하지 않은 차시입니다.' }, 400)
  }

  const { DB } = c.env

  const lesson = await DB.prepare(
    `SELECT id, course_id, COALESCE(video_duration_minutes, 0) AS video_duration_minutes FROM lessons WHERE id = ?`,
  )
    .bind(lessonId)
    .first<{ id: number; course_id: number; video_duration_minutes: number }>()

  if (!lesson) {
    return c.json({ success: false, error: '차시를 찾을 수 없습니다.' }, 404)
  }

  const enrollment = await DB.prepare(`SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`)
    .bind(user.id, lesson.course_id)
    .first<{ id: number }>()

  if (!enrollment) {
    return c.json({ success: false, error: '수강 중인 과정이 아닙니다.' }, 403)
  }

  const watchedRaw =
    body.watched_seconds ?? body.last_position_seconds ?? body.current_time ?? body.currentTime
  const totalRaw = body.total_seconds ?? body.duration_seconds ?? body.duration

  let watchedSeconds = Math.max(0, Math.floor(Number(watchedRaw ?? 0)))
  let totalSeconds = Math.max(0, Math.floor(Number(totalRaw ?? 0)))

  if (totalSeconds <= 0) {
    totalSeconds = Math.max(0, Math.floor((lesson.video_duration_minutes || 0) * 60))
  }

  const legacyPct = Number(body.watch_percentage ?? body.progress_percent ?? NaN)
  let progressPct = 0
  if (totalSeconds > 0) {
    progressPct = Math.min(100, Math.round((Math.min(watchedSeconds, totalSeconds) / totalSeconds) * 100))
  } else if (Number.isFinite(legacyPct)) {
    progressPct = Math.min(100, Math.round(legacyPct))
  }

  let isCompleted =
    progressPct >= COMPLETE_THRESHOLD_PCT ? 1 : 0
  const forceComplete =
    body.is_completed === 1 ||
    body.is_completed === true ||
    String(body.is_completed) === '1'
  if (forceComplete) {
    isCompleted = 1
    progressPct = Math.max(progressPct, 100)
    if (totalSeconds > 0) {
      watchedSeconds = Math.max(watchedSeconds, totalSeconds)
    }
  }

  const watchDelta = Math.max(
    0,
    Math.min(
      Number(body.watch_time_seconds ?? body.watch_time_delta ?? 0) || 0,
      24 * 3600,
    ),
  )

  const completedAtInsert = isCompleted ? new Date().toISOString() : null

  try {
    await DB.prepare(
      `
      INSERT INTO lesson_progress (
        enrollment_id, lesson_id, user_id, course_id,
        watch_percentage, last_position_seconds, watch_time_seconds, total_seconds,
        is_completed, completed_at, last_watched_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(enrollment_id, lesson_id)
      DO UPDATE SET
        user_id = excluded.user_id,
        course_id = excluded.course_id,
        watch_percentage = MAX(COALESCE(lesson_progress.watch_percentage, 0), excluded.watch_percentage),
        last_position_seconds = MAX(COALESCE(lesson_progress.last_position_seconds, 0), excluded.last_position_seconds),
        watch_time_seconds = COALESCE(lesson_progress.watch_time_seconds, 0) + excluded.watch_time_seconds,
        total_seconds = MAX(COALESCE(lesson_progress.total_seconds, 0), excluded.total_seconds),
        is_completed = MAX(COALESCE(lesson_progress.is_completed, 0), excluded.is_completed),
        completed_at = CASE
          WHEN MAX(COALESCE(lesson_progress.is_completed, 0), excluded.is_completed) = 1
            AND lesson_progress.completed_at IS NULL
          THEN datetime('now')
          ELSE lesson_progress.completed_at
        END,
        last_watched_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `,
    ).bind(
      enrollment.id,
      lessonId,
      user.id,
      lesson.course_id,
      progressPct,
      watchedSeconds,
      watchDelta,
      totalSeconds,
      isCompleted,
      completedAtInsert,
    ).run()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/no such column.*user_id|total_seconds/i.test(msg)) {
      await DB.prepare(
        `
        INSERT INTO lesson_progress (
          enrollment_id, lesson_id, watch_percentage,
          last_position_seconds, watch_time_seconds,
          is_completed, completed_at, last_watched_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(enrollment_id, lesson_id)
        DO UPDATE SET
          watch_percentage = MAX(COALESCE(lesson_progress.watch_percentage, 0), excluded.watch_percentage),
          last_position_seconds = MAX(COALESCE(lesson_progress.last_position_seconds, 0), excluded.last_position_seconds),
          watch_time_seconds = COALESCE(lesson_progress.watch_time_seconds, 0) + excluded.watch_time_seconds,
          is_completed = MAX(COALESCE(lesson_progress.is_completed, 0), excluded.is_completed),
          completed_at = CASE
            WHEN MAX(COALESCE(lesson_progress.is_completed, 0), excluded.is_completed) = 1
              AND lesson_progress.completed_at IS NULL
            THEN datetime('now')
            ELSE lesson_progress.completed_at
          END,
          last_watched_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `,
      ).bind(
        enrollment.id,
        lessonId,
        progressPct,
        watchedSeconds,
        watchDelta,
        isCompleted,
        completedAtInsert,
      ).run()
    } else {
      throw e
    }
  }

  const courseLessonCount = await DB.prepare(`SELECT COUNT(*) as c FROM lessons WHERE course_id = ?`)
    .bind(lesson.course_id)
    .first<{ c: number }>()
  const completedLessonCount = await DB.prepare(
    `SELECT COUNT(*) as c FROM lesson_progress WHERE enrollment_id = ? AND is_completed = 1`,
  )
    .bind(enrollment.id)
    .first<{ c: number }>()
  const totalWatchRow = await DB.prepare(
    `SELECT COALESCE(SUM(watch_time_seconds), 0) as t FROM lesson_progress WHERE enrollment_id = ?`,
  )
    .bind(enrollment.id)
    .first<{ t: number }>()

  const totalL = Math.max(0, Number(courseLessonCount?.c ?? 0))
  const doneCl = Math.max(0, Number(completedLessonCount?.c ?? 0))
  const completion_rate = totalL > 0 ? Math.round((doneCl / totalL) * 100) : 0

  const shouldIssueCertificate = completion_rate >= 80
  const now = new Date().toISOString()

  const currentEnrollment = await DB.prepare(
    `SELECT certificate_issued, certificate_issued_at FROM enrollments WHERE id = ?`,
  )
    .bind(enrollment.id)
    .first<{ certificate_issued: number; certificate_issued_at: string | null }>()

  const certificateIssued = shouldIssueCertificate ? 1 : Number(currentEnrollment?.certificate_issued ?? 0)
  const certificateIssuedAt =
    shouldIssueCertificate && currentEnrollment && !currentEnrollment.certificate_issued
      ? now
      : currentEnrollment?.certificate_issued_at ?? null

  await DB.prepare(
    `
      UPDATE enrollments
      SET
        total_lessons = ?,
        completed_lessons = ?,
        total_watch_time_seconds = ?,
        completion_rate = ?,
        progress = ?,
        last_lesson_id = ?,
        last_watched_at = CURRENT_TIMESTAMP,
        certificate_issued = ?,
        certificate_issued_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
  ).bind(
    totalL,
    doneCl,
    totalWatchRow?.t ?? 0,
    completion_rate,
    completion_rate,
    lessonId,
    certificateIssued,
    certificateIssuedAt,
    enrollment.id,
  ).run()

  const certificateJustIssued = Boolean(
    shouldIssueCertificate && currentEnrollment && !currentEnrollment.certificate_issued,
  )

  return c.json({
    success: true,
    progress: {
      watch_percentage: progressPct,
      progress_percent: progressPct,
      watched_seconds: watchedSeconds,
      total_seconds: totalSeconds,
      is_completed: isCompleted,
      completion_rate,
    },
    certificate: {
      eligible: shouldIssueCertificate,
      issued: Number(certificateIssued) === 1,
      just_issued: certificateJustIssued,
      issued_at: certificateIssuedAt,
    },
  })
}

/**
 * POST /api/progress
 * Body: { lesson_id, watched_seconds, total_seconds, watch_time_seconds? }
 */
app.post('/', async (c) => {
  try {
    const body = await readJsonBody(c)
    const lid = body.lesson_id ?? body.lessonId
    if (lid == null || String(lid).trim() === '') {
      return c.json({ success: false, error: 'lesson_id가 필요합니다.' }, 400)
    }
    return await upsertLessonProgress(c, String(lid), body)
  } catch (error) {
    console.error('❌ Progress POST / error:', error)
    return c.json(
      {
        success: false,
        error: '진도 업데이트에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    )
  }
})

/**
 * Update lesson progress
 * POST /api/progress/lessons/:lessonId
 */
app.post('/lessons/:lessonId', async (c) => {
  try {
    const lessonId = c.req.param('lessonId')
    const body = await readJsonBody(c)
    return await upsertLessonProgress(c, lessonId, body)
  } catch (error) {
    console.error('❌ Progress update error:', error)
    return c.json(
      {
        success: false,
        error: '진도 업데이트에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    )
  }
})

/**
 * Get lesson progress
 * GET /api/progress/lessons/:lessonId
 */
app.get('/lessons/:lessonId', async (c) => {
  try {
    const user = c.get('user')
    const lessonId = c.req.param('lessonId')
    const { DB } = c.env

    // Get enrollment_id
    const lesson = await DB.prepare(`
      SELECT course_id FROM lessons WHERE id = ?
    `).bind(lessonId).first()

    if (!lesson) {
      return c.json({ success: false, error: '차시를 찾을 수 없습니다.' }, 404)
    }

    const enrollment = await DB.prepare(`
      SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?
    `).bind(user.id, lesson.course_id).first()

    if (!enrollment) {
      return c.json({ success: false, progress: null })
    }

    const progress = await DB.prepare(`
      SELECT * FROM lesson_progress
      WHERE enrollment_id = ? AND lesson_id = ?
    `).bind(enrollment.id, lessonId).first()

    return c.json({
      success: true,
      progress: progress || {
        watch_percentage: 0,
        last_position_seconds: 0,
        is_completed: 0
      }
    })

  } catch (error) {
    console.error('❌ Get progress error:', error)
    return c.json({ 
      success: false, 
      error: '진도 조회에 실패했습니다.' 
    }, 500)
  }
})

/**
 * Get course progress summary
 * GET /api/progress/courses/:courseId
 */
app.get('/courses/:courseId', async (c) => {
  try {
    const user = c.get('user')
    const courseId = c.req.param('courseId')
    const { DB } = c.env

    const enrollment = await DB.prepare(`
      SELECT 
        e.*,
        c.title as course_title,
        c.total_lessons as course_total_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ? AND e.course_id = ?
    `).bind(user.id, courseId).first()

    if (!enrollment) {
      return c.json({ success: false, error: '수강 중인 과정이 아닙니다.' }, 404)
    }

    // Get detailed lesson progress
    const lessons = await DB.prepare(`
      SELECT 
        l.id,
        l.lesson_number,
        l.title,
        l.video_duration_minutes,
        lp.watch_percentage,
        lp.is_completed,
        lp.last_watched_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = ?
      WHERE l.course_id = ?
      ORDER BY l.lesson_number
    `).bind(enrollment.id, courseId).all()

    return c.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        course_id: enrollment.course_id,
        course_title: enrollment.course_title,
        enrolled_at: enrollment.enrolled_at,
        progress: enrollment.progress,
        completion_rate: enrollment.completion_rate,
        total_lessons: enrollment.total_lessons,
        completed_lessons: enrollment.completed_lessons,
        last_watched_at: enrollment.last_watched_at,
        certificate_issued: enrollment.certificate_issued
      },
      lessons: lessons.results
    })

  } catch (error) {
    console.error('❌ Get course progress error:', error)
    return c.json({ 
      success: false, 
      error: '과정 진도 조회에 실패했습니다.' 
    }, 500)
  }
})

/**
 * Get user's all courses progress
 * GET /api/progress/my-courses
 */
app.get('/my-courses', async (c) => {
  try {
    const user = c.get('user')
    const { DB } = c.env

    const enrollments = await DB.prepare(`
      SELECT 
        e.id as enrollment_id,
        e.course_id,
        e.progress,
        e.completion_rate,
        e.total_lessons,
        e.completed_lessons,
        e.enrolled_at,
        e.last_watched_at,
        e.certificate_issued,
        c.title,
        c.description,
        c.thumbnail_url,
        c.total_duration_minutes,
        COALESCE(ins.name, u.name) as instructor_name,
        (
          SELECT cert.certificate_number FROM certificates cert
          WHERE cert.enrollment_id = e.id
          ORDER BY cert.id DESC LIMIT 1
        ) as certificate_number
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN instructors ins ON c.instructor_id = ins.id
      LEFT JOIN users u ON c.legacy_instructor_user_id = u.id
      WHERE e.user_id = ?
      ORDER BY e.last_watched_at DESC
    `).bind(user.id).all()

    return c.json({
      success: true,
      courses: enrollments.results
    })

  } catch (error) {
    console.error('❌ Get my courses error:', error)
    return c.json({ 
      success: false, 
      error: '내 강좌 조회에 실패했습니다.' 
    }, 500)
  }
})

export default app
