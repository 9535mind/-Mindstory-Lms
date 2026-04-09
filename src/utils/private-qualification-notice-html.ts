/**
 * 등록민간자격 관련 고지 문구 (강좌 상세 등)
 */

const LEGAL_PAGE_HREF = '/legal/private-qualification'

/** 수강생용: 강좌 상세·푸터 연계용 (친절한 안내 톤) */
export function privateQualificationStudentNoticeBlockHtml(): string {
  return `
<section class="rounded-xl border border-slate-200/80 bg-gray-50 px-5 py-5 text-sm text-gray-600 leading-relaxed space-y-3" aria-labelledby="studentQualNoticeTitle">
  <h2 id="studentQualNoticeTitle" class="text-base font-semibold text-gray-800 tracking-tight">자격증 취득 시 유의사항</h2>
  <p class="text-gray-600">본 교육원에서 안내하는 자격은 「자격기본법」에 따라 등록된 <strong class="text-gray-800 font-medium">민간자격</strong>이며, <strong class="text-gray-800 font-medium">국가가 인정하는 공인·국가자격이 아닙니다</strong>. 자격 취득만으로 취업·승진·수익·영업 자격 등이 보장되지 않으며, 개인의 노력·경력·채용 기준 등에 따라 결과가 달라질 수 있습니다.</p>
  <p class="text-gray-600">강좌에 자격이 연결되어 있으면, 바로 위 「자격증 정보 및 표시의무 고지」표에서 자격명·등록번호·발급기관·비용·환불 규정을 함께 확인해 주세요. 연결되지 않은 강좌는 해당 표가 나타나지 않을 수 있습니다.</p>
  <p class="text-gray-600 pt-0.5">
    <a href="${LEGAL_PAGE_HREF}" class="text-indigo-600 font-medium hover:underline">민간자격 운영 가이드 전문 보기</a>
  </p>
</section>`.trim()
}
