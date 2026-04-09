/**
 * 관리자 강좌 설명 — 제목 기반 홍보 문구 (한국어, 약 250자)
 */

import type { Bindings } from '../types/database'
import { generateTextGeminiOrOpenAI } from './ai-text-generation'

export async function generateAdminCourseDescription(env: Bindings, title: string): Promise<string> {
  const safe = String(title || '').trim().slice(0, 300)
  if (!safe) {
    throw new Error('EMPTY_TITLE')
  }

  const prompt = `이 강좌의 제목은 「${safe}」이야. 수강생들이 듣고 싶어지도록 전문적이면서도 친절한 설명을 한국어로 250자 내외로 작성해줘.

출력은 본문만 적어줘. 불필요한 인사말, "설명:", 따옴표로 감싼 제목 반복은 하지 마.`

  const systemInstruction =
    '당신은 평생교육원 강좌 홍보 카피를 작성하는 전문가입니다. 간결하고 신뢰감 있는 문장으로 작성합니다.'

  const content = await generateTextGeminiOrOpenAI(env, prompt, systemInstruction)
  return content.trim().replace(/^["']|["']$/g, '').slice(0, 2000)
}
