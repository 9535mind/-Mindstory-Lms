/**
 * 마인드스토리 원격평생교육원 LMS 플랫폼
 * Ver.1.4 - 보안 강화 (Beta 준비)
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import { Bindings } from './types/database'
import { generalRateLimiter, strictRateLimiter, lenientRateLimiter } from './middleware/rate-limiter'

// 라우트 임포트
import auth from './routes/auth'
import authKakao from './routes/auth-kakao'
import authGoogle from './routes/auth-google'
import courses from './routes/courses'
import enrollments from './routes/enrollments'
import payments from './routes/payments'  // 결제 API
import certificates from './routes/certificates'  // Phase 4: 수료증 시스템
import admin from './routes/admin'
import landing from './routes/landing'  // 신규 랜딩 페이지
import pages from './routes/pages'
import pagesMy from './routes/pages-my'
import pagesAbout from './routes/pages-about'
import pagesAdmin from './routes/pages-admin'
import pagesPayment from './routes/pages-payment'  // 결제 페이지
// Removed: popups (Phase 2 cleanup)
import videos from './routes/videos'
import progress from './routes/progress'
// Removed: certifications (Phase 2 cleanup)
import upload from './routes/upload'
import ai from './routes/ai'
import reviews from './routes/reviews'  // Phase 2: 수강평/별점
// Removed: external video APIs (Phase 2 cleanup - YouTube only)
import aiBulkLessons from './routes/ai-bulk-lessons'
import pagesStudent from './routes/pages-student'
import pagesLearn from './routes/pages-learn'
import analytics from './routes/analytics'
import pagesAnalytics from './routes/pages-analytics'
import pagesCourseDetail from './routes/pages-course-detail'
import pagesEnrollment from './routes/pages-enrollment'  // 수강신청 페이지
import youtubeProxy from './routes/youtube-proxy'

const app = new Hono<{ Bindings: Bindings }>()

// 미들웨어
app.use('*', logger())

// CORS 설정 강화 - 베타 서비스용
// 로컬 개발: localhost, 127.0.0.1
// 샌드박스: *.sandbox.novita.ai
// 프로덕션: *.pages.dev (배포 후 실제 도메인으로 변경)
app.use('/api/*', cors({
  origin: (origin) => {
    // 로컬 개발 환경
    if (origin?.includes('localhost') || origin?.includes('127.0.0.1')) {
      return origin
    }
    // 샌드박스 환경
    if (origin?.includes('.sandbox.novita.ai')) {
      return origin
    }
    // Cloudflare Pages 환경
    if (origin?.includes('.pages.dev')) {
      return origin
    }
    // 프로덕션 도메인 (배포 후 추가)
    // if (origin === 'https://www.mindstory-lms.com') {
    //   return origin
    // }
    
    // 그 외는 차단
    return false
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 600,
  credentials: true,  // 쿠키 전송 허용
}))

// Rate Limiting 적용
// 엄격한 제한: 로그인, 회원가입, 비밀번호 재설정 (1분에 10회)
app.use('/api/auth/login', strictRateLimiter)
app.use('/api/auth/register', strictRateLimiter)
app.use('/api/auth/reset-password', strictRateLimiter)

// 일반 제한: 대부분의 API (1분에 100회)
app.use('/api/courses', generalRateLimiter)
app.use('/api/enrollments', generalRateLimiter)
app.use('/api/payments-v2', generalRateLimiter)
app.use('/api/admin', generalRateLimiter)
app.use('/api/upload', generalRateLimiter)

// 관대한 제한: 읽기 전용 API (1분에 200회)
app.use('/api/auth/me', lenientRateLimiter)
app.use('/api/health', lenientRateLimiter)

// 정적 파일 서빙 (Cloudflare Pages용 - root 제거)
app.use('/static/*', serveStatic())
app.use('/uploads/*', serveStatic()) // 업로드된 파일 서빙

// API 라우트
app.route('/api/auth', auth)
app.route('/api/auth/kakao', authKakao)  // 카카오 소셜 로그인
app.route('/api/auth/google', authGoogle)  // 구글 소셜 로그인
app.route('/api/courses', courses)
app.route('/api/courses', reviews)  // 수강평/별점 API (courses/:id/reviews)
app.route('/api/enrollments', enrollments)
app.route('/api/payments-v2', payments)  // 결제 API
app.route('/api', certificates)  // 수료증 API (courses/:id/certificate, my/certificates, certificates/:number)
app.route('/api/admin', admin)
// Removed popups route
app.route('/api/videos', videos)  // 영상 관리
app.route('/api/progress', progress)  // 진도율 추적
// Removed certification routes
app.route('/api/upload', upload)  // 파일 업로드
app.route('/api', upload)  // 스토리지 파일 서빙
app.route('/api/ai', ai)  // AI 도우미
// Removed external video API routes (YouTube only)
app.route('/api/ai-bulk-lessons', aiBulkLessons)  // AI 일괄 차시 생성
app.route('/api/analytics', analytics)  // 학습 분석 통계
app.route('/api/youtube', youtubeProxy)  // YouTube oEmbed 프록시 (CORS 해결)

// 페이지 라우트
app.route('/', landing)  // 신규 랜딩 페이지 (Phase 3)
app.route('/', pages)
app.route('/', pagesMy)
app.route('/', pagesAbout)
app.route('/', pagesPayment)  // 결제 페이지 (/payment/checkout, /payment/success, /payment/fail)
app.route('/', pagesEnrollment)  // 수강신청 페이지 (/enrollment)
app.route('/', pagesStudent)  // 수강생 페이지
app.route('/', pagesCourseDetail)  // 강좌 상세 페이지
app.route('/', pagesLearn)    // 학습 페이지
app.route('/', pagesAnalytics)  // 분석 페이지
app.route('/admin', pagesAdmin)  // 관리자 페이지

// 홈페이지는 landing 라우터가 처리함 (app.get('/' ) 제거)

// 헬스체크
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
