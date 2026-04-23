/**
 * MS12 — 비로그인 시 회의+로그인은 /app/meeting 한 화면. /app/login 은 /app/meeting 으로만 보냄(쿼리 유지).
 */
import { Hono } from 'hono'
import { Bindings } from '../types/database'

const p = new Hono<{ Bindings: Bindings }>()

const MS12_APP_SCRIPT = '/static/js/ms12-app.js?v=20260423j'
const waitBlock =
  '<p class="ms12-p" id="ms12-wait" style="color:rgb(100 116 139)">로그인 상태 확인 중…</p>'

type Ms12Route = 'home' | 'meeting'

function layout(title: string, route: Ms12Route, guest: string, authed: string) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <link rel="stylesheet" href="/static/css/app.css" />
  <script src="${MS12_APP_SCRIPT}" defer></script>
  <style>
    .ms12-wrap{max-width:48rem;margin:0 auto;padding:2rem 1.25rem;}
    .ms12-h1{font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;}
    .ms12-p{color:rgb(55 65 81);line-height:1.6;}
    .ms12-btn{display:inline-block;margin-top:0.75rem;padding:0.5rem 1rem;border-radius:0.5rem;background:rgb(79 70 229);color:#fff;text-decoration:none;font-weight:500;border:none;cursor:pointer;font-size:1rem;}
    .ms12-btn:hover{background:rgb(67 56 202);}
    .ms12-btn--muted{background:rgb(71 85 105);}
  </style>
</head>
<body class="bg-slate-50 min-h-screen" data-ms12-route="${route}">
  <div class="ms12-wrap">
    <noscript>
      <p class="ms12-p">JavaScript 를 켜 주세요. <a href="/app/meeting">회의(로그인)</a></p>
    </noscript>
    ${waitBlock}
    <div id="ms12-guest" style="display:none">${guest}</div>
    <div id="ms12-authed" style="display:none">${authed}</div>
  </div>
</body>
</html>`
}

p.get('/', (c) =>
  c.html(
    layout(
      'MS12',
      'home',
      `<h1 class="ms12-h1">MS12</h1>
       <p class="ms12-p">회의·협업 플랫폼입니다. 로그인하려면 아래를 누르세요.</p>
       <a class="ms12-btn" href="/api/auth/kakao/login?next=%2Fapp%2Fmeeting">카카오 로그인</a>
       <p class="ms12-p" style="margin-top:0.75rem;font-size:0.875rem;"><a href="/app/meeting" class="text-indigo-600 underline">회의 화면에서 로그인하기</a></p>`,
      `<h1 class="ms12-h1">MS12</h1>
       <p class="ms12-p" style="font-weight:600;color:rgb(22 101 52)">로그인됨</p>
       <p class="ms12-p">계정: <span class="js-ms12-user-name">—</span></p>
       <a class="ms12-btn" href="/app/meeting" style="background:rgb(15 118 110)">회의로 이동</a>
       <button type="button" class="ms12-btn ms12-btn--muted" data-ms12-logout style="margin-left:0.5rem" title="로그아웃">로그아웃</button>`,
    ),
  ),
)

/** 예전 /app/login 북마크·OAuth next — 동일 화면으로 /app/meeting (쿼리 유지) */
p.get('/login', (c) => {
  const q = new URL(c.req.url).search || ''
  return c.redirect(`/app/meeting${q}`, 302)
})

p.get('/meeting', (c) =>
  c.html(
    layout(
      '회의 — MS12',
      'meeting',
      `<h1 class="ms12-h1">회의</h1>
       <p class="ms12-p" style="font-weight:500">로그인이 필요합니다. 아래에서 카카오 또는 Google 계정으로 로그인하세요.</p>
       <a class="ms12-btn" href="/api/auth/kakao/login?next=%2Fapp%2Fmeeting">카카오로 계속</a>
       <p class="ms12-p" style="margin-top:1rem;font-size:0.875rem;">Google 계정: <a href="/api/auth/google/login?next=%2Fapp%2Fmeeting" class="text-indigo-600 underline">Google로 계속</a></p>
       <p class="ms12-p" style="margin-top:1.5rem;"><a href="/app" class="text-slate-500">MS12 홈</a></p>`,
      `<h1 class="ms12-h1">회의</h1>
       <p class="ms12-p">여기에 회의 UI가 연결됩니다. (백로그/프론트 연동 전 자리 표시)</p>
       <p class="ms12-p" style="margin-top:0.5rem">계정: <span class="js-ms12-user-name" style="font-weight:600">—</span></p>
       <a class="ms12-btn" href="/app">MS12 홈</a>
       <button type="button" class="ms12-btn ms12-btn--muted" data-ms12-logout style="margin-left:0.5rem">로그아웃</button>`,
    ),
  ),
)

export default p
