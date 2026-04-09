/**
 * GET /admin/chatbot-knowledge — 챗봇 지식·대화 로그 관리
 */
import { STATIC_JS_CACHE_QUERY } from './static-js-cache-bust'

export function adminChatbotKnowledgePageHtml(): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>챗봇 지식 관리 — 마인드스토리 LMS</title>
  <link rel="stylesheet" href="/static/css/app.css" />
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script src="/static/js/auth.js?v=20260329-admin-name"></script>
</head>
<body class="bg-slate-100 min-h-screen">
  <nav class="ms-admin-top-bar bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-xl sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0 flex-1 md:flex-none">
        <p class="text-xs text-indigo-200 uppercase tracking-widest">Mindstory LMS</p>
        <h1 class="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
          <i class="fas fa-robot text-indigo-300 shrink-0"></i>
          <span class="truncate">챗봇 지식 관리</span>
        </h1>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <a href="/admin/dashboard" class="text-sm text-indigo-200 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10">
          <i class="fas fa-satellite-dish mr-1"></i>관제탑
        </a>
        <a href="/" class="bg-indigo-500 hover:bg-indigo-400 border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shadow-sm">
          <i class="fas fa-graduation-cap mr-1"></i>수강생 사이트
        </a>
        <span class="inline-flex items-center max-w-[min(14rem,50vw)]"><span id="adminName" class="text-sm text-indigo-100 hidden sm:inline truncate" data-ms-name-default="text-sm text-indigo-100 hidden sm:inline truncate">…</span></span>
        <button type="button" onclick="logout()" class="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
        </button>
      </div>
    </div>
  </nav>

  <main class="max-w-5xl mx-auto px-4 py-8 space-y-8">
    <p class="text-sm text-slate-600">
      등록한 <strong>질문 키워드</strong>가 수강생 메시지에 <strong>포함</strong>되면, 해당 <strong>표준 답변</strong>이 챗봇에 최우선으로 반영됩니다. 키워드는 짧고 명확하게(예: <code class="text-xs bg-slate-200 px-1 rounded">환불</code>, <code class="text-xs bg-slate-200 px-1 rounded">수강 기간</code>) 두는 것을 권장합니다.
    </p>

    <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4" id="kbFormSection">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <i class="fas fa-pen text-indigo-600"></i> Q&amp;A 등록 · 수정
      </h2>
      <input type="hidden" id="kbEditId" value="" />
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="kbKeyword">질문 키워드</label>
        <input type="text" id="kbKeyword" maxlength="500" placeholder="예: 환불 규정" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm" autocomplete="off" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1" for="kbAnswer">표준 답변</label>
        <textarea id="kbAnswer" rows="8" maxlength="16000" placeholder="챗봇이 그대로 안내할 문구를 입력하세요." class="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-sans"></textarea>
      </div>
      <label class="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" id="kbActive" checked class="rounded border-slate-300 text-indigo-600" />
        활성화
      </label>
      <div class="flex flex-wrap gap-2">
        <button type="button" id="kbSaveBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold">
          저장
        </button>
        <button type="button" id="kbResetBtn" class="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg text-sm hover:bg-slate-50">
          새로 작성
        </button>
      </div>
      <p id="kbFormMsg" class="text-sm min-h-[1.25rem] text-slate-600"></p>
    </section>

    <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i class="fas fa-database text-emerald-600"></i> 등록된 지식
        </h2>
        <button type="button" id="kbReloadBtn" class="text-sm text-indigo-600 hover:underline">새로고침</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th class="p-3 whitespace-nowrap">키워드</th>
              <th class="p-3 min-w-[12rem]">답변 미리보기</th>
              <th class="p-3 whitespace-nowrap">상태</th>
              <th class="p-3 whitespace-nowrap">수정일</th>
              <th class="p-3 text-right whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody id="kbTableBody" class="divide-y divide-slate-100">
            <tr><td colspan="5" class="p-6 text-center text-slate-500">불러오는 중…</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i class="fas fa-comments text-amber-600"></i> 최근 챗봇 대화
        </h2>
        <p class="text-xs text-slate-500 mt-1">각 답변 옆에서 수정 후 저장하면 <code class="bg-slate-100 px-1 rounded">chatbot_knowledge</code>에 즉시 반영됩니다.</p>
      </div>
      <div class="overflow-x-auto max-h-[32rem] overflow-y-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
            <tr>
              <th class="p-3 whitespace-nowrap">시각</th>
              <th class="p-3 min-w-[8rem]">출처</th>
              <th class="p-3 min-w-[10rem]">사용자 질문</th>
              <th class="p-3 min-w-[12rem]">챗봇 답변</th>
              <th class="p-3 text-right whitespace-nowrap">학습</th>
            </tr>
          </thead>
          <tbody id="convTableBody" class="divide-y divide-slate-100">
            <tr><td colspan="5" class="p-6 text-center text-slate-500">불러오는 중…</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <script src="/static/js/utils.js${STATIC_JS_CACHE_QUERY}"></script>
  <script>
    (function () {
      var kbTableBody = document.getElementById('kbTableBody');
      var convTableBody = document.getElementById('convTableBody');
      var kbKeyword = document.getElementById('kbKeyword');
      var kbAnswer = document.getElementById('kbAnswer');
      var kbActive = document.getElementById('kbActive');
      var kbEditId = document.getElementById('kbEditId');
      var kbFormMsg = document.getElementById('kbFormMsg');

      function esc(s) {
        var t = document.createElement('span');
        t.textContent = s == null ? '' : String(s);
        return t.innerHTML;
      }

      function setFormMsg(t, ok) {
        if (!kbFormMsg) return;
        kbFormMsg.textContent = t || '';
        kbFormMsg.className = 'text-sm min-h-[1.25rem] ' + (ok === true ? 'text-emerald-700' : ok === false ? 'text-rose-600' : 'text-slate-600');
      }

      function resetForm() {
        if (kbEditId) kbEditId.value = '';
        if (kbKeyword) kbKeyword.value = '';
        if (kbAnswer) kbAnswer.value = '';
        if (kbActive) kbActive.checked = true;
        setFormMsg('');
      }

      async function loadKnowledge() {
        if (!kbTableBody) return;
        kbTableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-500">불러오는 중…</td></tr>';
        try {
          var r = await axios.get('/api/admin/chatbot-knowledge', { withCredentials: true });
          var items = (r.data && r.data.data && r.data.data.items) || [];
          if (!items.length) {
            kbTableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-500">등록된 지식이 없습니다.</td></tr>';
            return;
          }
          kbTableBody.innerHTML = items.map(function (row) {
            var prev = (row.answer_text || '').replace(/\\s+/g, ' ').slice(0, 80);
            if ((row.answer_text || '').length > 80) prev += '…';
            var act = row.is_active ? '<span class="text-emerald-700 font-medium">활성</span>' : '<span class="text-slate-400">비활성</span>';
            return (
              '<tr class="align-top">' +
              '<td class="p-3 font-medium text-slate-900">' + esc(row.question_keyword) + '</td>' +
              '<td class="p-3 text-slate-600 text-xs">' + esc(prev) + '</td>' +
              '<td class="p-3">' + act + '</td>' +
              '<td class="p-3 text-xs text-slate-500 whitespace-nowrap">' + esc(row.updated_at || '') + '</td>' +
              '<td class="p-3 text-right space-x-2 whitespace-nowrap">' +
              '<button type="button" class="text-indigo-600 hover:underline text-xs kb-edit" data-id="' + row.id + '">편집</button>' +
              '<button type="button" class="text-rose-600 hover:underline text-xs kb-del" data-id="' + row.id + '">삭제</button>' +
              '</td></tr>'
            );
          }).join('');
          kbTableBody.querySelectorAll('.kb-edit').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var id = parseInt(btn.getAttribute('data-id') || '0', 10);
              var row = items.find(function (x) { return x.id === id; });
              if (!row) return;
              if (kbEditId) kbEditId.value = String(row.id);
              if (kbKeyword) kbKeyword.value = row.question_keyword || '';
              if (kbAnswer) kbAnswer.value = row.answer_text || '';
              if (kbActive) kbActive.checked = !!row.is_active;
              setFormMsg('편집 중입니다. 저장하면 반영됩니다.', true);
              document.getElementById('kbFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          });
          kbTableBody.querySelectorAll('.kb-del').forEach(function (btn) {
            btn.addEventListener('click', async function () {
              var id = parseInt(btn.getAttribute('data-id') || '0', 10);
              if (!id || !confirm('이 지식 항목을 삭제할까요?')) return;
              try {
                await axios.delete('/api/admin/chatbot-knowledge/' + id, { withCredentials: true });
                await loadKnowledge();
                setFormMsg('삭제되었습니다.', true);
              } catch (e) {
                alert((e.response && e.response.data && e.response.data.error) || '삭제 실패');
              }
            });
          });
        } catch (e) {
          kbTableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-rose-600">목록을 불러오지 못했습니다.</td></tr>';
        }
      }

      async function loadConversations() {
        if (!convTableBody) return;
        convTableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-500">불러오는 중…</td></tr>';
        try {
          var r = await axios.get('/api/admin/chatbot-conversations?limit=50', { withCredentials: true });
          var items = (r.data && r.data.data && r.data.data.items) || [];
          if (!items.length) {
            convTableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-500">저장된 대화가 없습니다. 챗봇 사용 후 다시 확인해 주세요.</td></tr>';
            return;
          }
          convTableBody.innerHTML = items.map(function (row) {
            var qprev = (row.user_message || '').replace(/\\s+/g, ' ').slice(0, 100);
            if ((row.user_message || '').length > 100) qprev += '…';
            var aprev = (row.assistant_reply || '').replace(/\\s+/g, ' ').slice(0, 120);
            if ((row.assistant_reply || '').length > 120) aprev += '…';
            var uq = encodeURIComponent(row.user_message || '');
            var ua = encodeURIComponent(row.assistant_reply || '');
            return (
              '<tr class="align-top">' +
              '<td class="p-3 text-xs text-slate-500 whitespace-nowrap">' + esc(row.created_at || '') + '</td>' +
              '<td class="p-3 text-xs">' + esc(row.source || '') + '</td>' +
              '<td class="p-3 text-xs text-slate-800">' + esc(qprev) + '</td>' +
              '<td class="p-3 text-xs text-slate-700">' + esc(aprev) + '</td>' +
              '<td class="p-3 text-right">' +
              '<button type="button" class="text-indigo-600 hover:underline text-xs conv-learn" data-uq="' + uq + '" data-ua="' + ua + '">이 답변 수정하여 학습시키기</button>' +
              '</td></tr>'
            );
          }).join('');
          convTableBody.querySelectorAll('.conv-learn').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var uq = decodeURIComponent(btn.getAttribute('data-uq') || '');
              var ua = decodeURIComponent(btn.getAttribute('data-ua') || '');
              if (kbEditId) kbEditId.value = '';
              if (kbKeyword) kbKeyword.value = uq.slice(0, 500);
              if (kbAnswer) kbAnswer.value = ua;
              if (kbActive) kbActive.checked = true;
              setFormMsg('아래 키워드·답변을 다듬은 뒤 저장하면 새 지식으로 등록됩니다.', true);
              document.getElementById('kbFormSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
              if (kbKeyword) kbKeyword.focus();
            });
          });
        } catch (e) {
          convTableBody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-rose-600">대화 목록을 불러오지 못했습니다.</td></tr>';
        }
      }

      document.getElementById('kbSaveBtn').addEventListener('click', async function () {
        var kw = kbKeyword && kbKeyword.value.trim();
        var ans = kbAnswer && kbAnswer.value.trim();
        if (!kw || !ans) {
          setFormMsg('키워드와 표준 답변을 모두 입력해 주세요.', false);
          return;
        }
        var active = kbActive && kbActive.checked ? 1 : 0;
        var eid = kbEditId && kbEditId.value ? parseInt(kbEditId.value, 10) : 0;
        try {
          if (eid > 0) {
            await axios.put('/api/admin/chatbot-knowledge/' + eid, { question_keyword: kw, answer_text: ans, is_active: active }, { withCredentials: true });
            setFormMsg('수정되었습니다. 챗봇에 즉시 반영됩니다.', true);
          } else {
            await axios.post('/api/admin/chatbot-knowledge', { question_keyword: kw, answer_text: ans, is_active: active }, { withCredentials: true });
            setFormMsg('저장되었습니다. 챗봇에 즉시 반영됩니다.', true);
          }
          resetForm();
          await loadKnowledge();
          await loadConversations();
        } catch (e) {
          setFormMsg((e.response && e.response.data && e.response.data.error) || '저장 실패', false);
        }
      });

      document.getElementById('kbResetBtn').addEventListener('click', resetForm);
      document.getElementById('kbReloadBtn').addEventListener('click', function () { loadKnowledge(); loadConversations(); });

      async function boot() {
        try {
          var me = await axios.get('/api/auth/me', { withCredentials: true });
          var user = me.data && me.data.data;
          if (!user || user.role !== 'admin') {
            window.location.href = '/login?redirect=' + encodeURIComponent('/admin/chatbot-knowledge');
            return;
          }
          if (typeof applyHeaderUserDisplay === 'function') {
            applyHeaderUserDisplay(document.getElementById('adminName'), user);
          }
        } catch (e) {
          window.location.href = '/login?redirect=' + encodeURIComponent('/admin/chatbot-knowledge');
          return;
        }
        await loadKnowledge();
        await loadConversations();
      }
      boot();
    })();
  </script>
</body>
</html>`
}
