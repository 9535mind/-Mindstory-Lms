/**
 * 메인(/) 시그니처 라인업 — 관리자 연필 + 편집 모달 (D1 저장)
 */
;(function () {
  'use strict'

  var MODAL_ID = 'msSigLineupModal'
  var LABELS = {
    classic: 'MindStory Classic',
    next: 'MindStory Next',
    ncs: 'Consortium · NCS',
  }

  function closeModal() {
    var el = document.getElementById(MODAL_ID)
    if (el) el.remove()
  }

  function openModal(cardId, initial) {
    closeModal()
    var title = LABELS[cardId] || cardId
    var wrap = document.createElement('div')
    wrap.id = MODAL_ID
    wrap.className = 'fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50'
    wrap.setAttribute('role', 'dialog')
    wrap.setAttribute('aria-modal', 'true')
    wrap.innerHTML =
      '<div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200">' +
      '<div class="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">' +
      '<h3 class="text-lg font-bold text-slate-800">시그니처 카드 편집 — ' +
      title +
      '</h3>' +
      '<button type="button" class="text-slate-500 hover:text-slate-800 text-2xl leading-none" data-ms-sig-close aria-label="닫기">&times;</button></div>' +
      '<form id="msSigLineupForm" class="p-4 space-y-4">' +
      '<div><label class="block text-sm font-medium text-slate-700 mb-1" for="msSigFTitle">제목</label>' +
      '<input id="msSigFTitle" type="text" name="sig_title" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" autocomplete="off" /></div>' +
      '<div><label class="block text-sm font-medium text-slate-700 mb-1" for="msSigFDesc">설명</label>' +
      '<textarea id="msSigFDesc" name="sig_description" rows="4" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm leading-relaxed"></textarea></div>' +
      '<div><label class="block text-sm font-medium text-slate-700 mb-1" for="msSigFBtn">버튼 텍스트</label>' +
      '<input id="msSigFBtn" type="text" name="sig_button_label" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" autocomplete="off" /></div>' +
      '<div><label class="block text-sm font-medium text-slate-700 mb-1" for="msSigFHref">버튼 링크 (경로 또는 https URL)</label>' +
      '<input id="msSigFHref" type="text" name="sig_button_href" required class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="/courses/classic" autocomplete="off" /></div>' +
      '<p class="text-xs text-slate-500">저장 후 메인 화면에 즉시 반영됩니다.</p>' +
      '<div class="flex flex-wrap gap-2 pt-2">' +
      '<button type="submit" class="flex-1 min-w-[8rem] bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700">저장</button>' +
      '<button type="button" data-ms-sig-close class="px-4 py-2.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">취소</button></div>' +
      '</form></div>'
    document.body.appendChild(wrap)

    var form = wrap.querySelector('#msSigLineupForm')
    if (form) {
      var t = document.getElementById('msSigFTitle')
      var d = document.getElementById('msSigFDesc')
      var b = document.getElementById('msSigFBtn')
      var h = document.getElementById('msSigFHref')
      if (t) t.value = initial.title || ''
      if (d) d.value = initial.description || ''
      if (b) b.value = initial.button_label || ''
      if (h) h.value = initial.button_href || ''
    }

    function onBackdrop(ev) {
      if (ev.target === wrap) closeModal()
    }
    wrap.addEventListener('click', onBackdrop)
    wrap.querySelectorAll('[data-ms-sig-close]').forEach(function (b) {
      b.addEventListener('click', closeModal)
    })

    if (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault()
        var btn = form.querySelector('button[type="submit"]')
        if (btn) btn.disabled = true
        var payload = {
          title: (document.getElementById('msSigFTitle') || {}).value,
          description: (document.getElementById('msSigFDesc') || {}).value,
          button_label: (document.getElementById('msSigFBtn') || {}).value,
          button_href: (document.getElementById('msSigFHref') || {}).value,
        }
        axios
          .put('/api/admin/landing/signature-lineup/' + encodeURIComponent(cardId), payload, { withCredentials: true })
          .then(function (res) {
            if (res.data && res.data.success) {
              closeModal()
              window.location.reload()
            } else {
              alert((res.data && res.data.error) || '저장에 실패했습니다.')
            }
          })
          .catch(function (e) {
            console.error(e)
            var msg = (e.response && e.response.data && e.response.data.error) || e.message || '저장 실패'
            alert(msg)
          })
          .finally(function () {
            if (btn) btn.disabled = false
          })
      })
    }
  }

  function mountPencils(user) {
    var cards = document.querySelectorAll('[data-ms-signature-lineup-card]')
    if (!cards.length) return
    cards.forEach(function (root) {
      if (root.querySelector('[data-ms-signature-pencil]')) return
      var cardId = root.getAttribute('data-ms-signature-lineup-card')
      if (!cardId) return
      var a = document.createElement('a')
      a.href = '#'
      a.setAttribute('data-ms-signature-pencil', '1')
      a.className =
        'admin-magic-pencil absolute top-3 right-3 z-[50] pointer-events-auto !inline-flex items-center justify-center rounded-lg shadow-sm ring-1 ring-slate-200/80 bg-white/95'
      a.title = '카드 편집'
      a.setAttribute('aria-label', '시그니처 카드 편집')
      a.innerHTML = '<i class="fas fa-pencil-alt" aria-hidden="true"></i>'
      a.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        axios
          .get('/api/landing/signature-lineup', { withCredentials: true })
          .then(function (res) {
            var data = res.data && res.data.cards
            var row = data && data[cardId]
            if (!row) {
              alert('카드 데이터를 불러오지 못했습니다.')
              return
            }
            openModal(cardId, row)
          })
          .catch(function () {
            alert('카드 데이터를 불러오지 못했습니다.')
          })
      })
      root.appendChild(a)
    })
  }

  window.msInitLandingSignatureAdmin = function (user) {
    if (!user || user.role !== 'admin') return
    if (typeof window.isAdminStudentViewActive === 'function' && window.isAdminStudentViewActive(user)) return
    mountPencils(user)
  }
})()
