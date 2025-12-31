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

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>로그인 - 마인드스토리 원격평생교육원</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full mx-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">
                        🎓 마인드스토리
                    </h1>
                    <p class="text-gray-600">원격평생교육원</p>
                </div>

                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이메일
                        </label>
                        <input 
                            type="email" 
                            id="email"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="example@email.com"
                            required
                        >
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호
                        </label>
                        <input 
                            type="password" 
                            id="password"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="••••••••"
                            required
                        >
                    </div>

                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="ml-2 text-sm text-gray-600">로그인 상태 유지</span>
                        </label>
                        <a href="#" class="text-sm text-blue-600 hover:text-blue-700">
                            비밀번호 찾기
                        </a>
                    </div>

                    <button 
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
                    >
                        로그인
                    </button>
                </form>

                <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <p class="text-sm text-yellow-800 text-center">
                        ⚠️ 데모 버전: 데이터베이스 미연결
                    </p>
                    <p class="text-xs text-gray-600 text-center mt-2">
                        실제 로그인 기능은 D1 Database 설정 후 사용 가능합니다
                    </p>
                </div>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        계정이 없으신가요? 
                        <a href="/register" class="text-blue-600 hover:text-blue-700 font-medium">
                            회원가입
                        </a>
                    </p>
                </div>

                <div class="mt-6 text-center">
                    <a href="/" class="text-sm text-gray-500 hover:text-gray-700">
                        ← 홈으로 돌아가기
                    </a>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                alert('데모 버전입니다.\\n\\n입력하신 정보:\\n이메일: ' + email + '\\n\\nD1 Database 연결 후 로그인 기능이 활성화됩니다.');
            });
        </script>
    </body>
    </html>
  `)
})

// Register page
app.get('/register', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>회원가입 - 마인드스토리 원격평생교육원</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center py-12">
        <div class="max-w-md w-full mx-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">
                        🎓 회원가입
                    </h1>
                    <p class="text-gray-600">마인드스토리 원격평생교육원</p>
                </div>

                <form id="registerForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이름
                        </label>
                        <input 
                            type="text" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="홍길동"
                            required
                        >
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이메일
                        </label>
                        <input 
                            type="email" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="example@email.com"
                            required
                        >
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호
                        </label>
                        <input 
                            type="password" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="8자 이상"
                            required
                        >
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호 확인
                        </label>
                        <input 
                            type="password" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="비밀번호 재입력"
                            required
                        >
                    </div>

                    <div class="flex items-start">
                        <input type="checkbox" class="mt-1 rounded border-gray-300" required>
                        <label class="ml-2 text-sm text-gray-600">
                            <a href="#" class="text-blue-600 hover:text-blue-700">이용약관</a> 및 
                            <a href="#" class="text-blue-600 hover:text-blue-700">개인정보처리방침</a>에 동의합니다
                        </label>
                    </div>

                    <button 
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
                    >
                        가입하기
                    </button>
                </form>

                <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <p class="text-sm text-yellow-800 text-center">
                        ⚠️ 데모 버전: 데이터베이스 미연결
                    </p>
                </div>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        이미 계정이 있으신가요? 
                        <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
                            로그인
                        </a>
                    </p>
                </div>

                <div class="mt-6 text-center">
                    <a href="/" class="text-sm text-gray-500 hover:text-gray-700">
                        ← 홈으로 돌아가기
                    </a>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('registerForm').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('데모 버전입니다.\\n\\nD1 Database 연결 후 회원가입 기능이 활성화됩니다.');
            });
        </script>
    </body>
    </html>
  `)
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

                <div class="mt-8 text-center space-x-4">
                    <a 
                        href="/login"
                        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
                    >
                        로그인
                    </a>
                    <button 
                        onclick="testAPI()"
                        class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
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
