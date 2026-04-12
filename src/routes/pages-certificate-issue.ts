/**
 * 시험 합격 후 자격증 발급비 — 본인인증(IMP.certification) → 결제(IMP.request_pay) 연속 처리
 * GET /certificate-issue?catalog_id=&exam_passed=
 */

import { Hono } from 'hono'
import type { Bindings } from '../types/database'
import {
  siteAiChatWidgetMarkup,
  siteAiChatWidgetScript,
  siteAiChatWidgetStyles,
} from '../utils/site-ai-chat-widget'
import {
  siteFloatingQuickMenuMarkup,
  siteFloatingQuickMenuScript,
  siteFloatingQuickMenuStyles,
} from '../utils/site-floating-quick-menu'
import { STATIC_JS_CACHE_QUERY } from '../utils/static-js-cache-bust'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/certificate-issue', (c) => {
  const impCodeForTest = c.env.PORTONE_IMP_CODE || ''
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>자격증 발급 신청 · 본인인증 및 결제</title>
  <link rel="stylesheet" href="/static/css/app.css" />
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"></script>
  <script src="/static/js/auth.js?v=20260329-admin-name"></script>
  <script src="/static/js/utils.js${STATIC_JS_CACHE_QUERY}"></script>
  <script src="/static/js/certificate-enrollment-popup.js${STATIC_JS_CACHE_QUERY}"></script>
  ${siteFloatingQuickMenuStyles()}
  ${siteAiChatWidgetStyles()}
</head>
<body class="bg-slate-50 min-h-screen">
  <div class="max-w-lg mx-auto px-4 py-10">
    <p class="text-xs font-semibold text-indigo-600 mb-2">민간자격 발급비</p>
    <h1 class="text-2xl font-bold text-slate-900 mb-2">자격증 발급 신청</h1>
    <p class="text-sm text-slate-600 mb-6">
      필수 동의 후 휴대폰 본인인증과 발급비 결제가 이어서 진행됩니다.
    </p>
    <div id="examBanner" class="hidden mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      <i class="fas fa-check-circle mr-1"></i> 시험 합격 처리된 건입니다. 아래에서 발급비를 완료해 주세요.
    </div>
    <div id="catalogHint" class="mb-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      <span class="text-slate-500">선택 자격증 ID:</span>
      <span id="catalogIdLabel" class="font-mono font-semibold">—</span>
    </div>
    <button type="button" id="btnChain"
      class="w-full rounded-xl bg-indigo-600 px-4 py-4 text-center text-base font-bold text-white shadow-md hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">
      본인인증 및 결제하기
    </button>
    <p id="statusMsg" class="mt-4 text-sm text-slate-600 min-h-[1.25rem]"></p>
    <p class="mt-8 text-xs text-slate-500 leading-relaxed">
      테스트 모드: Cloudflare Pages / 로컬 환경 변수 <code class="bg-slate-100 px-1 rounded">PORTONE_IMP_CODE</code>에
      포트원 콘솔의 고객사 식별코드(imp…)를 넣으면 IMP.init 에 반영됩니다.
      프런트 전용 로컬 번들 테스트 시 <code class="bg-slate-100 px-1 rounded">VITE_PORTONE_IMP_CODE</code>를
      <code class="bg-slate-100 px-1 rounded">.env</code>에 설정할 수 있습니다.
    </p>
  </div>
  ${siteFloatingQuickMenuMarkup()}
  ${siteAiChatWidgetMarkup()}
  <script>
    ${siteFloatingQuickMenuScript()}
    ${siteAiChatWidgetScript()}
    window.__PORTONE_IMP_CODE_ENV__ = ${JSON.stringify(impCodeForTest)};
  </script>
  <script>
    (function () {
      var params = new URLSearchParams(window.location.search);
      var catalogId = parseInt(params.get('catalog_id') || params.get('certificate_catalog_id') || '0', 10);
      var examPassed = params.get('exam_passed') === '1' || params.get('passed') === '1';
      var btn = document.getElementById('btnChain');
      var statusEl = document.getElementById('statusMsg');
      var catalogLabel = document.getElementById('catalogIdLabel');
      var examBanner = document.getElementById('examBanner');
      if (catalogLabel) catalogLabel.textContent = catalogId > 0 ? String(catalogId) : '(URL에 catalog_id 필요)';
      if (examBanner && examPassed) examBanner.classList.remove('hidden');
      if (!catalogId || catalogId <= 0) {
        if (btn) btn.disabled = true;
        if (statusEl) statusEl.textContent = 'URL 예: /certificate-issue?catalog_id=1&exam_passed=1';
        return;
      }
      function setStatus(t) {
        if (statusEl) statusEl.textContent = t || '';
      }
      async function getMe() {
        try {
          var r = await axios.get('/api/auth/me', { withCredentials: true });
          var u = r.data && r.data.data;
          if (u && u.id) return u;
        } catch (e) {}
        return null;
      }
      btn.addEventListener('click', async function () {
        if (!window.IMP) {
          alert('결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
          return;
        }
        if (typeof window.openCertificateIssuanceLegalModal !== 'function') {
          alert('안내 화면을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
          return;
        }
        var me = await getMe();
        if (!me) {
          if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
          }
          return;
        }
        setStatus('자격증 정보를 불러오는 중…');
        var feeWon = 70000;
        try {
          var catRes = await axios.get('/api/certificate-issuance/catalog/' + catalogId, { withCredentials: true });
          var cd = catRes.data && catRes.data.data;
          if (cd && typeof cd.fee_won === 'number' && cd.fee_won > 0) feeWon = Math.trunc(cd.fee_won);
        } catch (e) {
          setStatus('');
          alert(e.response && e.response.data && e.response.data.error ? e.response.data.error : '자격증 정보를 불러오지 못했습니다.');
          return;
        }
        setStatus('');
        window.openCertificateIssuanceLegalModal({ fee_won: feeWon }, function proceedAfterLegal() {
          setStatus('설정을 불러오는 중…');
          axios.get('/api/portone/public-config', { withCredentials: true }).then(function (cfgRes) {
            var pg = (cfgRes.data && cfgRes.data.data && cfgRes.data.data.pg) || 'html5_inicis';
            if (!cfgRes.data || !cfgRes.data.success || !cfgRes.data.data || !cfgRes.data.data.impCode) {
              var fallback = window.__PORTONE_IMP_CODE_ENV__ || '';
              if (!fallback) {
                setStatus('');
                alert('포트원 식별코드가 설정되지 않았습니다. PORTONE_IMP_CODE(테스트용 imp 코드)를 환경에 넣어 주세요.');
                return;
              }
              IMP.init(fallback);
            } else {
              IMP.init(cfgRes.data.data.impCode);
            }
            setStatus('휴대폰 본인인증 창을 여는 중…');
            var certMerchantUid = 'CERT_' + Date.now();
            IMP.certification({ merchant_uid: certMerchantUid, popup: true }, function (rsp) {
              if (!rsp || !rsp.success) {
                var msg = (rsp && rsp.error_msg) || '본인인증이 취소되었습니다.';
                setStatus('');
                alert(msg);
                return;
              }
              var impUidCert = rsp.imp_uid;
              setStatus('주문 준비 중…');
              axios.post('/api/certificate-issuance/prepare', { certificate_catalog_id: catalogId }, { withCredentials: true })
                .then(function (prepRes) {
                  var p = prepRes.data;
                  if (!p || !p.success || !p.data) {
                    throw new Error((p && (p.error || p.message)) || '주문 준비 실패');
                  }
                  var d = p.data;
                  setStatus('결제창을 여는 중…');
                  IMP.request_pay({
                    pg: d.pg || pg,
                    pay_method: 'card',
                    merchant_uid: d.merchant_uid,
                    name: d.orderName,
                    amount: d.amount,
                    buyer_email: me.email || '',
                    buyer_name: me.name || '',
                    buyer_tel: me.phone || ''
                  }, function (rsp2) {
                    if (!rsp2 || !rsp2.success) {
                      setStatus('');
                      alert((rsp2 && rsp2.error_msg) || '결제가 완료되지 않았습니다.');
                      return;
                    }
                    setStatus('서버에서 결제를 검증하는 중…');
                    axios.post('/api/payment/verify', {
                      imp_uid_cert: impUidCert,
                      imp_uid_pay: rsp2.imp_uid,
                      merchant_uid: d.merchant_uid
                    }, { withCredentials: true })
                      .then(function (v) {
                        if (v.data && v.data.success) {
                          setStatus('완료되었습니다. 발급 처리 내역은 마이페이지에서 확인해 주세요.');
                          alert('본인인증 및 결제가 완료되었습니다.');
                        } else {
                          throw new Error((v.data && v.data.error) || '검증 실패');
                        }
                      })
                      .catch(function (e) {
                        setStatus('');
                        alert(e.response && e.response.data && e.response.data.error ? e.response.data.error : (e.message || '검증 요청 실패'));
                      });
                  });
                })
                .catch(function (e) {
                  setStatus('');
                  alert(e.response && e.response.data && e.response.data.error ? e.response.data.error : (e.message || '주문 준비 실패'));
                });
            });
          }).catch(function () {
            setStatus('');
            alert('결제 설정을 불러오지 못했습니다.');
          });
        });
      });
    })();
  </script>
</body>
</html>`)
})

export default app

