/**
 * Simple Test Page - No Database Required
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Middleware
app.use('/api/*', cors())
app.use('/static/*', serveStatic())

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'MindStory LMS is running!',
    timestamp: new Date().toISOString()
  })
})

// Home page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>마인드스토리 원격평생교육원</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
                <div class="text-center mb-12">
                    <h1 class="text-5xl font-bold text-gray-800 mb-4">
                        🎓 마인드스토리 원격평생교육원
                    </h1>
                    <p class="text-xl text-gray-600">
                        Learning Management System
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-8 mb-12">
                    <div class="bg-blue-50 p-6 rounded-xl">
                        <h3 class="text-2xl font-semibold text-blue-800 mb-3">
                            ✅ 배포 성공!
                        </h3>
                        <p class="text-gray-700">
                            Cloudflare Pages에 성공적으로 배포되었습니다.
                        </p>
                    </div>

                    <div class="bg-green-50 p-6 rounded-xl">
                        <h3 class="text-2xl font-semibold text-green-800 mb-3">
                            🚀 시스템 상태
                        </h3>
                        <p class="text-gray-700">
                            모든 시스템이 정상 작동 중입니다.
                        </p>
                    </div>
                </div>

                <div class="border-t pt-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6">
                        📊 배포 정보
                    </h2>
                    <ul class="space-y-3 text-gray-700">
                        <li>✅ <strong>프로젝트:</strong> mindstory-lms</li>
                        <li>✅ <strong>플랫폼:</strong> Cloudflare Pages</li>
                        <li>✅ <strong>프레임워크:</strong> Hono + TypeScript</li>
                        <li>✅ <strong>배포 일시:</strong> 2025-12-30</li>
                    </ul>
                </div>

                <div class="mt-12 p-6 bg-yellow-50 rounded-xl">
                    <h3 class="text-xl font-semibold text-yellow-800 mb-3">
                        ⚠️ 다음 단계
                    </h3>
                    <p class="text-gray-700 mb-4">
                        완전한 기능을 사용하려면 다음이 필요합니다:
                    </p>
                    <ul class="list-disc list-inside space-y-2 text-gray-700">
                        <li>D1 Database 설정 (데이터 저장)</li>
                        <li>R2 Storage 설정 (영상 파일)</li>
                        <li>API 토큰 권한 업그레이드</li>
                    </ul>
                </div>

                <div class="mt-8 text-center">
                    <button 
                        onclick="testAPI()"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
                    >
                        API 테스트
                    </button>
                    <div id="apiResult" class="mt-4 p-4 bg-gray-50 rounded-lg hidden"></div>
                </div>
            </div>
        </div>

        <script>
            async function testAPI() {
                const result = document.getElementById('apiResult');
                result.classList.remove('hidden');
                result.innerHTML = '<p class="text-gray-600">테스트 중...</p>';
                
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    result.innerHTML = \`
                        <div class="text-left">
                            <p class="font-semibold text-green-600 mb-2">✅ API 연결 성공!</p>
                            <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">\${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    \`;
                } catch (error) {
                    result.innerHTML = \`
                        <p class="text-red-600">❌ API 오류: \${error.message}</p>
                    \`;
                }
            }
        </script>
    </body>
    </html>
  `)
})

// 404 handler
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
            <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">
                홈으로 돌아가기
            </a>
        </div>
    </body>
    </html>
  `)
})

export default app
