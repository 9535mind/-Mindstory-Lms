/**
 * 팝업/배너 로더 — 영구 비활성화
 * 과거 /api/popups + DB HTML 로 제3자 광고(iframe·스크립트)가 노출될 수 있어
 * 서버에서도 동일 API를 빈 응답으로 고정함 (src/index.tsx).
 */
;(function () {
  'use strict'
  var noop = function () {}
  var noopP = function () {
    return Promise.resolve()
  }
  window.PopupManager = {
    loadPopups: noopP,
    createPopup: function () {
      return null
    },
    closePopup: noop,
    trackView: noopP,
    trackClick: noopP,
    isTodayClosed: function () {
      return true
    },
    setTodayClosed: noop,
  }
})()
