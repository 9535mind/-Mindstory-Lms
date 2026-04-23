/**
 * MS12 /app* — /api/auth/me 단일 진실.
 * OAuth 직후(oauth_sync=1) + 로그인 확인 시에만 /app/meeting 으로 이동(이미 회의 경로면 이동 없음).
 * 그 외 자동 location 이동 없음(로그아웃은 사용자 클릭).
 */
;(function () {
  function authLog() {
    var a = ['[ms12-auth]'].concat(
      Array.prototype.slice.call(arguments).map(function (x) {
        return x === null || x === undefined ? String(x) : x
      })
    )
    if (typeof console !== 'undefined' && console.log) {
      console.log(a.join(' '))
    }
  }

  function getRoute() {
    var b = document.body
    var attr = b && b.getAttribute('data-ms12-route')
    if (attr) return attr
    var p = (typeof location !== 'undefined' && location.pathname) || ''
    p = p.replace(/\/$/, '') || '/'
    if (p === '/app/meeting') return 'meeting'
    if (p === '/app' || p === '' || p === '/') return 'home'
    return 'home'
  }

  function routePath() {
    var r = getRoute()
    if (r === 'meeting') return '/app/meeting'
    return '/app'
  }

  function isAuthedFromMe(json) {
    if (!json || json.success !== true) return false
    var d = json.data
    if (d == null) return false
    if (typeof d !== 'object' || Array.isArray(d)) return false
    return (
      d.id != null ||
      !!d.email ||
      !!d.session_token ||
      d.role != null ||
      !!d.name
    )
  }

  function applyNextToOAuthLinks() {
    var next = new URLSearchParams(window.location.search || '').get('next')
    if (!next) return
    if (next.indexOf('..') >= 0 || !next.startsWith('/')) return
    var q = 'next=' + encodeURIComponent(next)
    var list = document.querySelectorAll('a[href^="/api/auth/kakao/login"],a[href^="/api/auth/google/login"]')
    for (var i = 0; i < list.length; i++) {
      var el = list[i]
      var h = el.getAttribute('href') || ''
      if (h.indexOf('next=') >= 0) continue
      el.setAttribute('href', h + (h.indexOf('?') >= 0 ? '&' : '?') + q)
    }
  }

  async function fetchMeOnce() {
    var r
    if (typeof AbortController === 'undefined') {
      try {
        r = await fetch('/api/auth/me', { credentials: 'include' })
      } catch (e) {
        return { status: 0, json: null, _err: e }
      }
    } else {
      var ctrl = new AbortController()
      var t = setTimeout(function () {
        try {
          ctrl.abort()
        } catch (e) {}
      }, 10000)
      try {
        r = await fetch('/api/auth/me', { credentials: 'include', signal: ctrl.signal })
      } catch (e) {
        clearTimeout(t)
        return { status: 0, json: null, _err: e }
      }
      clearTimeout(t)
    }
    var j = null
    try {
      j = await r.json()
    } catch (e) {
      j = null
    }
    return { status: r.status, json: j }
  }

  function stripOauthParam() {
    var p = new URLSearchParams(window.location.search || '')
    if (p.get('oauth_sync') !== '1') return
    p.delete('oauth_sync')
    var q = p.toString()
    var u = window.location.pathname + (q ? '?' + q : '') + (window.location.hash || '')
    try {
      window.history.replaceState({}, '', u)
    } catch (e) {}
  }

  function setShellState(state, user) {
    authLog('route=' + routePath(), 'state=' + state)
    var w = document.getElementById('ms12-wait')
    var g = document.getElementById('ms12-guest')
    var a = document.getElementById('ms12-authed')
    if (w) w.style.display = state === 'loading' ? 'block' : 'none'
    if (g) g.style.display = state === 'guest' ? 'block' : 'none'
    if (a) a.style.display = state === 'authed' ? 'block' : 'none'
    if (state === 'authed' && user) {
      var nodes = document.querySelectorAll('.js-ms12-user-name')
      for (var n = 0; n < nodes.length; n++) {
        nodes[n].textContent = user.name || user.email || '사용자'
      }
    }
  }

  function wireLogout() {
    var btns = document.querySelectorAll('[data-ms12-logout]')
    for (var i = 0; i < btns.length; i++) {
      ;(function (btn) {
        if (btn.getAttribute('data-ms12-logout-wired') === '1') return
        btn.setAttribute('data-ms12-logout-wired', '1')
        btn.addEventListener('click', function () {
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .then(function () {
              try {
                localStorage.removeItem('user')
              } catch (e) {}
              window.location.href = '/app/meeting'
            })
            .catch(function () {
              window.location.href = '/app/meeting'
            })
        })
      })(btns[i])
    }
  }

  async function run() {
    var hadOauth = new URLSearchParams(window.location.search || '').get('oauth_sync') === '1'

    setShellState('loading', null)
    var o
    if (hadOauth) {
      o = await fetchMeOnce()
      authLog('oauth_sync handled')
    } else {
      o = await fetchMeOnce()
    }

    var j = o && o.json
    var authed = isAuthedFromMe(j)
    var user = authed && j && j.data ? j.data : null
    if (authed) {
      try {
        localStorage.setItem('user', JSON.stringify(j.data))
      } catch (e) {}
    }

    if (hadOauth && authed) {
      var normPath =
        (typeof location !== 'undefined' &&
          location.pathname &&
          location.pathname.replace(/\/$/, '')) ||
        ''
      if (!normPath) normPath = '/'
      if (normPath !== '/app/meeting') {
        authLog('post-oauth authed', '→', '/app/meeting')
        location.replace('/app/meeting')
        return
      }
    }
    if (hadOauth) {
      stripOauthParam()
    }

    if (authed) {
      setShellState('authed', user)
      wireLogout()
    } else {
      var r = getRoute()
      if (r === 'meeting' || r === 'home') {
        applyNextToOAuthLinks()
      }
      setShellState('guest', null)
    }
    authLog('no auto redirect')
  }

  function safeRun() {
    return run().catch(function (e) {
      authLog('route=' + routePath(), 'error=', String((e && e.message) || e))
      setShellState('guest', null)
      authLog('no auto redirect')
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeRun)
  } else {
    safeRun()
  }
})()
