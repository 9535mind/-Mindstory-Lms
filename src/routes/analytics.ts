/**
 * Analytics API Routes
 * Learning analytics and statistics for administrators
 */

import { Hono } from 'hono'
import type { Bindings } from '../types/database'
import { requireAdmin } from '../middleware/auth'

const app = new Hono<{ Bindings: Bindings }>()

// Apply admin authentication middleware to all routes
app.use('/*', requireAdmin)

/**
 * Get overall platform statistics
 * GET /api/analytics/overview
 */
app.get('/overview', async (c) => {
  try {
    const { DB } = c.env

    // Total users
    const totalUsers = await DB.prepare(`
      SELECT COUNT(*) as count FROM users WHERE role = 'student'
    `).first()

    // Total courses
    const totalCourses = await DB.prepare(`
      SELECT COUNT(*) as count FROM courses WHERE status = 'published'
        AND (deleted_at IS NULL OR TRIM(COALESCE(deleted_at,'')) = '')
    `).first()

    // Total enrollments
    const totalEnrollments = await DB.prepare(`
      SELECT COUNT(*) as count FROM enrollments
    `).first()

    // Completed enrollments (80%+)
    const completedEnrollments = await DB.prepare(`
      SELECT COUNT(*) as count FROM enrollments WHERE completion_rate >= 80
    `).first()

    // Certificates issued
    const certificatesIssued = await DB.prepare(`
      SELECT COUNT(*) as count FROM enrollments WHERE certificate_issued = 1
    `).first()

    // Average completion rate
    const avgCompletionRate = await DB.prepare(`
      SELECT AVG(completion_rate) as avg_rate FROM enrollments
    `).first()

    // Total watch time (hours)
    const totalWatchTime = await DB.prepare(`
      SELECT SUM(total_watch_time_seconds) as total_seconds FROM enrollments
    `).first()

    const totalHours = Math.round((totalWatchTime.total_seconds || 0) / 3600)

    return c.json({
      success: true,
      statistics: {
        total_users: totalUsers.count || 0,
        total_courses: totalCourses.count || 0,
        total_enrollments: totalEnrollments.count || 0,
        completed_enrollments: completedEnrollments.count || 0,
        certificates_issued: certificatesIssued.count || 0,
        avg_completion_rate: Math.round(avgCompletionRate.avg_rate || 0),
        total_watch_hours: totalHours
      }
    })

  } catch (error) {
    console.error('❌ Analytics overview error:', error)
    return c.json({ 
      success: false, 
      error: '통계 조회에 실패했습니다.' 
    }, 500)
  }
})

/**
 * Get course-specific analytics
 * GET /api/analytics/courses/:courseId
 */
app.get('/courses/:courseId', async (c) => {
  try {
    const courseId = c.req.param('courseId')
    const { DB } = c.env

    // Course info
    const course = await DB.prepare(`
      SELECT id, title, enrolled_count FROM courses WHERE id = ?
    `).bind(courseId).first()

    if (!course) {
      return c.json({ success: false, error: '과정을 찾을 수 없습니다.' }, 404)
    }

    // Enrollment stats
    const enrollmentStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total_enrollments,
        AVG(completion_rate) as avg_completion_rate,
        SUM(CASE WHEN completion_rate >= 80 THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN completion_rate > 0 AND completion_rate < 80 THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN completion_rate = 0 THEN 1 ELSE 0 END) as not_started_count,
        SUM(total_watch_time_seconds) as total_watch_time
      FROM enrollments
      WHERE course_id = ?
    `).bind(courseId).first()

    // Top performing students
    const topStudents = await DB.prepare(`
      SELECT 
        u.name,
        e.completion_rate,
        e.completed_lessons,
        e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = ?
      ORDER BY e.completion_rate DESC, e.completed_lessons DESC
      LIMIT 10
    `).bind(courseId).all()

    // Lesson completion rates
    const lessonStats = await DB.prepare(`
      SELECT 
        l.lesson_number,
        l.title,
        COUNT(lp.id) as total_views,
        SUM(CASE WHEN lp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count,
        AVG(lp.watch_percentage) as avg_watch_percentage
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id
      WHERE l.course_id = ?
      GROUP BY l.id, l.lesson_number, l.title
      ORDER BY l.lesson_number
    `).bind(courseId).all()

    return c.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        enrolled_count: course.enrolled_count
      },
      statistics: {
        total_enrollments: enrollmentStats.total_enrollments || 0,
        avg_completion_rate: Math.round(enrollmentStats.avg_completion_rate || 0),
        completed_count: enrollmentStats.completed_count || 0,
        in_progress_count: enrollmentStats.in_progress_count || 0,
        not_started_count: enrollmentStats.not_started_count || 0,
        total_watch_hours: Math.round((enrollmentStats.total_watch_time || 0) / 3600),
        completion_rate: enrollmentStats.total_enrollments > 0
          ? Math.round((enrollmentStats.completed_count / enrollmentStats.total_enrollments) * 100)
          : 0
      },
      top_students: topStudents.results,
      lesson_stats: lessonStats.results
    })

  } catch (error) {
    console.error('❌ Course analytics error:', error)
    return c.json({ 
      success: false, 
      error: '과정 통계 조회에 실패했습니다.' 
    }, 500)
  }
})

/**
 * Get daily/weekly/monthly activity trends
 * GET /api/analytics/trends?period=daily|weekly|monthly
 */
app.get('/trends', async (c) => {
  try {
    const period = c.req.query('period') || 'daily'
    const { DB } = c.env

    let dateFormat = '%Y-%m-%d' // daily
    if (period === 'weekly') {
      dateFormat = '%Y-W%W'
    } else if (period === 'monthly') {
      dateFormat = '%Y-%m'
    }

    // New enrollments trend
    const enrollmentTrend = await DB.prepare(`
      SELECT 
        strftime('${dateFormat}', enrolled_at) as period,
        COUNT(*) as count
      FROM enrollments
      WHERE enrolled_at >= datetime('now', '-30 days')
      GROUP BY period
      ORDER BY period
    `).all()

    // Completion trend
    const completionTrend = await DB.prepare(`
      SELECT 
        strftime('${dateFormat}', last_watched_at) as period,
        COUNT(DISTINCT enrollment_id) as active_users,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
      FROM lesson_progress
      WHERE last_watched_at >= datetime('now', '-30 days')
      GROUP BY period
      ORDER BY period
    `).all()

    return c.json({
      success: true,
      trends: {
        enrollments: enrollmentTrend.results,
        completions: completionTrend.results
      }
    })

  } catch (error) {
    console.error('❌ Trends error:', error)
    return c.json({ 
      success: false, 
      error: '트렌드 조회에 실패했습니다.' 
    }, 500)
  }
})

/**
 * Get student list with progress
 * GET /api/analytics/students?courseId=X
 */
app.get('/students', async (c) => {
  try {
    const courseId = c.req.query('courseId')
    const { DB } = c.env

    let query = `
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        e.course_id,
        c.title as course_title,
        e.completion_rate,
        e.completed_lessons,
        e.total_lessons,
        e.enrolled_at,
        e.last_watched_at,
        e.certificate_issued
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
    `

    if (courseId) {
      query += ` WHERE e.course_id = ?`
    }

    query += ` ORDER BY e.last_watched_at DESC`

    const stmt = DB.prepare(query)
    const result = courseId ? await stmt.bind(courseId).all() : await stmt.all()

    return c.json({
      success: true,
      students: result.results
    })

  } catch (error) {
    console.error('❌ Students analytics error:', error)
    return c.json({ 
      success: false, 
      error: '학생 목록 조회에 실패했습니다.' 
    }, 500)
  }
})

export default app
