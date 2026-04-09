/**
 * [1] 수강신청 단계 — 마케팅 안내 (체크박스 없음)
 * @param {object|null} guide — certificate_enrollment_guide
 * @param {function} onProceed
 */
function openCertificateEnrollmentModal(guide, onProceed) {
  if (!guide || typeof guide !== 'object') {
    if (typeof onProceed === 'function') onProceed()
    return
  }

  var existing = document.getElementById('msCertEnrollModal')
  if (existing) existing.remove()

  var wrap = document.createElement('div')
  wrap.id = 'msCertEnrollModal'
  wrap.className =
    'fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50'
  wrap.setAttribute('role', 'dialog')
  wrap.setAttribute('aria-modal', 'true')

  var listWon = Number(guide.fee_list_won) || 90000
  var stWon = Number(guide.fee_student_won) || 70000
  var courseTitle = String(guide.course_title || '강좌')
  var issuer = String(guide.issuer_name || '')
  var certName = String(guide.certificate_name || '')

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  wrap.innerHTML =
    '<div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">' +
    '<div class="p-6 space-y-4 text-slate-800">' +
    '<p class="text-base font-semibold text-slate-900 leading-snug">🎓 <strong>' +
    esc(courseTitle) +
    '</strong>을 이수하시면 ' +
    esc(issuer) +
    ' 명의의 \'<strong>' +
    esc(certName) +
    '</strong>\' 취득이 가능합니다!</p>' +
    '<p class="text-sm leading-relaxed rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-amber-950">' +
    '💥 마인드스토리 수강생 특별 혜택: 정상가 ' +
    listWon.toLocaleString() +
    '원 → ' +
    stWon.toLocaleString() +
    '원에 자격증 발급 가능' +
    '</p>' +
    '<div class="mt-4 rounded-lg border border-slate-200/90 bg-gray-50 px-3.5 py-3">' +
    '<p class="text-[11px] sm:text-xs text-gray-600 leading-relaxed">' +
    '<span class="font-medium text-gray-700">주의사항:</span> 본 자격은 <strong class="font-medium text-gray-800">등록 민간자격</strong>이며 <strong class="font-medium text-gray-800">국가 공인 자격이 아님</strong>을 알려 드립니다. 취업·수익 등은 보장되지 않을 수 있습니다. ' +
    '<a href="/legal/private-qualification" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">민간자격 운영 가이드</a>에서 자세히 확인하실 수 있습니다.' +
    '</p></div>' +
    '</div>' +
    '<div class="p-6 pt-0 flex flex-wrap gap-2 justify-end border-t border-slate-100">' +
    '<button type="button" id="msCertLightCancel" class="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">닫기</button>' +
    '<button type="button" id="msCertLightGo" class="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">확인 및 수강신청 계속하기</button>' +
    '</div></div>'

  document.body.appendChild(wrap)

  function close() {
    wrap.remove()
    document.removeEventListener('keydown', onKey)
  }

  function onKey(ev) {
    if (ev.key === 'Escape') close()
  }

  document.addEventListener('keydown', onKey)

  wrap.addEventListener('click', function (ev) {
    if (ev.target === wrap) close()
  })

  var btnGo = document.getElementById('msCertLightGo')
  var btnCancel = document.getElementById('msCertLightCancel')
  if (btnCancel) btnCancel.addEventListener('click', close)
  if (btnGo) {
    btnGo.addEventListener('click', function () {
      close()
      if (typeof onProceed === 'function') onProceed()
    })
  }
}

/**
 * [2] 자격증 발급 신청 단계 — 법적 동의 + 포트원 결제 전
 * @param {object} opts — { fee_won?: number } (기본 70000)
 * @param {function} onProceed
 */
function openCertificateIssuanceLegalModal(opts, onProceed) {
  var fee = opts && Number(opts.fee_won) > 0 ? Math.trunc(Number(opts.fee_won)) : 70000

  var existing = document.getElementById('msCertIssuanceLegalModal')
  if (existing) existing.remove()

  var wrap = document.createElement('div')
  wrap.id = 'msCertIssuanceLegalModal'
  wrap.className =
    'fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/55'
  wrap.setAttribute('role', 'dialog')
  wrap.setAttribute('aria-modal', 'true')
  wrap.setAttribute('aria-labelledby', 'msCertLegalTitle')

  wrap.innerHTML =
    '<div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200">' +
    '<div class="p-6 border-b border-slate-100">' +
    '<h2 id="msCertLegalTitle" class="text-lg font-bold text-slate-900">자격증 발급 신청</h2>' +
    '<p class="text-sm text-slate-600 mt-1">아래 내용을 확인하신 뒤 결제를 진행해 주세요.</p>' +
    '</div>' +
    '<div class="p-6 space-y-3 text-sm text-slate-800">' +
    '<label class="flex items-start gap-2 cursor-pointer">' +
    '<input type="checkbox" id="msLegalChk1" class="mt-1 rounded border-slate-300 text-indigo-600">' +
    '<span>본 자격은 등록민간자격으로 국가공인 자격이 아님을 확인하였습니다.</span></label>' +
    '<label class="flex items-start gap-2 cursor-pointer">' +
    '<input type="checkbox" id="msLegalChk2" class="mt-1 rounded border-slate-300 text-indigo-600">' +
    '<span>자격 취득을 위한 발급 비용 ' +
    fee.toLocaleString() +
    '원 결제에 동의합니다.</span></label>' +
    '<label class="flex items-start gap-2 cursor-pointer">' +
    '<input type="checkbox" id="msLegalChk3" class="mt-1 rounded border-slate-300 text-indigo-600">' +
    '<span>자격증 발급을 위해 실명 및 생년월일 정보를 발급 기관에 제공함에 동의합니다.</span></label>' +
    '</div>' +
    '<div class="p-6 pt-0 flex flex-wrap gap-2 justify-end">' +
    '<button type="button" id="msLegalCancel" class="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">취소</button>' +
    '<button type="button" id="msLegalGo" class="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed" disabled>동의 후 본인인증·결제 진행</button>' +
    '</div></div>'

  document.body.appendChild(wrap)

  var c1 = document.getElementById('msLegalChk1')
  var c2 = document.getElementById('msLegalChk2')
  var c3 = document.getElementById('msLegalChk3')
  var btnGo = document.getElementById('msLegalGo')
  var btnCancel = document.getElementById('msLegalCancel')

  function sync() {
    var ok = c1 && c1.checked && c2 && c2.checked && c3 && c3.checked
    if (btnGo) btnGo.disabled = !ok
  }

  function close() {
    wrap.remove()
    document.removeEventListener('keydown', onKey)
  }

  function onKey(ev) {
    if (ev.key === 'Escape') close()
  }

  document.addEventListener('keydown', onKey)

  ;[c1, c2, c3].forEach(function (el) {
    if (el) el.addEventListener('change', sync)
  })

  if (btnCancel) btnCancel.addEventListener('click', close)
  wrap.addEventListener('click', function (ev) {
    if (ev.target === wrap) close()
  })

  if (btnGo) {
    btnGo.addEventListener('click', function () {
      if (btnGo.disabled) return
      close()
      if (typeof onProceed === 'function') onProceed()
    })
  }

  sync()
}

if (typeof window !== 'undefined') {
  window.openCertificateEnrollmentModal = openCertificateEnrollmentModal
  window.openCertificateIssuanceLegalModal = openCertificateIssuanceLegalModal
}
