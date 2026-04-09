/**
 * 강사 프로필용 OpenAI Images (DALL·E) 생성 + R2 저장
 * 초실사(hyper-realistic) 스타일 프롬프트
 */

import type { Bindings } from '../types/database'
import { uploadImageBufferToR2 } from './r2-image-upload'

const DEFAULT_OPENAI_BASE = 'https://api.openai.com/v1'

function normalizeOpenAIBase(raw: string): string {
  const b = (raw || '').replace(/\/$/, '')
  if (!b) return DEFAULT_OPENAI_BASE
  if (/\/v\d+(\/|$)/.test(b)) return b
  return `${b}/v1`
}

/** DB/API 값 정규화: M | F | U | unknown */
export function normalizeInstructorGender(raw: string | null | undefined): 'M' | 'F' | 'U' {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
  if (s === 'M' || s === 'MALE' || s === '남' || s === '남성') return 'M'
  if (s === 'F' || s === 'FEMALE' || s === '여' || s === '여성') return 'F'
  if (s === 'U' || s === 'UNKNOWN' || s === '미지정') return 'U'
  return 'U'
}

/** 이름 기반으로 남/여 표현을 번갈아 사용 (성별 미지정 시 안전한 다양성) */
function genderPresentationFromName(name: string): { clause: string; tag: string } {
  let s = 0
  const n = (name || 'instructor').trim() || 'instructor'
  for (let i = 0; i < n.length; i++) {
    s = (s + n.charCodeAt(i) * (i + 1)) % 10007
  }
  const male = s % 2 === 0
  if (male) {
    return {
      tag: 'male',
      clause:
        'a Korean male professional educator in his 40s or 50s, middle-aged with a warm, confident smile',
    }
  }
  return {
    tag: 'female',
    clause:
      'a Korean female professional educator in her 40s or 50s, middle-aged with a warm, confident smile',
  }
}

/**
 * 전공(specialty) 문자열로 배경 디테일(영어) 생성 — 실제 장면은 아웃포커스·은은하게
 */
function specialtyBackgroundClause(specialty: string | null): string {
  const t = (specialty || '').trim().toLowerCase()
  if (!t) {
    return (
      'The softly blurred background is a neutral, elegant library or study with soft bookshelves, ' +
      'very shallow depth of field, no readable text.'
    )
  }
  const ko = specialty || ''
  const combined = `${t} ${ko}`

  if (/과학|실험|화학|물리|생명|science|physics|chemistry|biology|lab|laboratory|stem/i.test(combined)) {
    return (
      'The softly blurred background may include very subtle, out-of-focus laboratory glassware and neutral scientific equipment ' +
      '(beakers, flasks) — only as faint bokeh shapes, shallow depth of field, no readable text.'
    )
  }
  if (/음악|피아노|바이올린|기타|작곡|music|piano|violin|guitar|orchestra|instrument/i.test(combined)) {
    return (
      'The softly blurred background may include very subtle, out-of-focus musical instruments ' +
      '(piano, strings) as soft bokeh shapes only, shallow depth of field, no readable text.'
    )
  }
  if (/미술|회화|디자인|art|painting|drawing|illustration|gallery/i.test(combined)) {
    return (
      'The softly blurred background may suggest a quiet studio with very subtle easel or art-supply silhouettes ' +
      'as faint bokeh, shallow depth of field, no readable text.'
    )
  }
  if (/상담|심리|코칭|counseling|psychology|therapy|mental health/i.test(combined)) {
    return (
      'The softly blurred background suggests a calm, neutral professional office with soft furnishings ' +
      'and plants, very shallow depth of field, no readable text.'
    )
  }
  if (/체육|운동|sports|fitness|gym|physical/i.test(combined)) {
    return (
      'The softly blurred background may hint at a neutral athletic or training space as very soft bokeh only, ' +
      'shallow depth of field, no readable text.'
    )
  }

  return (
    `Field context (subtle, blurred only): ${specialty.slice(0, 120)}. ` +
      'Integrate as extremely soft, out-of-focus environmental hints — shallow depth of field, no readable text.'
  )
}

/**
 * 성별(M/F)에 따른 초실사 인물 묘사 — 미지정(U)이면 이름 해시 폴백
 */
function genderClauseForPrompt(name: string, specialty: string | null, gender: 'M' | 'F' | 'U'): string {
  if (gender === 'M') {
    return (
      'a PROFESSIONAL MALE instructor, Korean male adult, detailed short haircut, strong masculine look, ' +
      'confident professional demeanor, wearing smart casual business attire'
    )
  }
  if (gender === 'F') {
    return (
      'a PROFESSIONAL FEMALE instructor, Korean female adult, elegant look, warm smile, refined professional presence, ' +
      'wearing smart casual business attire'
    )
  }
  return `${genderPresentationFromName(name).clause}, wearing smart casual business attire`
}

/**
 * DALL·E 3용 초실사 스타일 프롬프트 (영어)
 */
function buildInstructorImagePrompt(
  name: string,
  specialty: string | null,
  genderRaw: string | null | undefined
): string {
  const g = normalizeInstructorGender(genderRaw)
  const genderClause = genderClauseForPrompt(name, specialty, g)
  const bg = specialtyBackgroundClause(specialty)

  const core =
    'A photorealistic, hyper-realistic studio portrait of a professional instructor, ' +
    `${genderClause}. ` +
    'Detailed skin texture, sharp focus on eyes. ' +
    'Professional studio lighting, shallow depth of field with a softly blurred neutral background. ' +
    '8k resolution, cinematic quality. The person is looking directly at the camera with confidence. ' +
    `${bg} ` +
    'Mandatory style tags: hyper-realistic, photorealistic, studio lighting, 8k resolution, detailed skin texture, ' +
    'professional look, neutral background, shallow depth of field, sharp focus. ' +
    'Absolutely no illustration, no cartoon, no 3D render, no anime — only real photography appearance. ' +
    'Single person only. No text, no watermark, no logo, no letters, no subtitles.'

  return core.replace(/\s+/g, ' ').trim()
}

type GenerateResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'NO_API_KEY' | 'NO_R2' | 'OPENAI_ERROR' | 'FETCH_FAILED'; detail?: string }

/**
 * DALL·E 3로 이미지 URL을 받아 R2에 저장한 뒤 공개 URL 반환.
 */
export async function generateInstructorProfileImageAi(
  env: Bindings,
  name: string,
  specialty: string | null,
  gender: string | null | undefined = undefined,
): Promise<GenerateResult> {
  const apiKey = (env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    return { ok: false, reason: 'NO_API_KEY' }
  }
  if (!env.R2) {
    return { ok: false, reason: 'NO_R2' }
  }

  const base = normalizeOpenAIBase(env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE).replace(/\/$/, '')
  const imageModel = ((env as Bindings & { OPENAI_IMAGE_MODEL?: string }).OPENAI_IMAGE_MODEL || 'dall-e-3').trim()

  const prompt = buildInstructorImagePrompt(name, specialty, gender)

  const body: Record<string, unknown> = {
    model: imageModel,
    prompt: prompt.slice(0, 3900),
    n: 1,
    size: imageModel === 'dall-e-3' ? '1024x1024' : '1024x1024',
    response_format: 'url',
  }
  if (imageModel === 'dall-e-3') {
    body.quality = 'hd'
  }

  const res = await fetch(`${base}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const raw = await res.text()
  let parsed: { data?: Array<{ url?: string }>; error?: { message?: string } } | null = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    return { ok: false, reason: 'OPENAI_ERROR', detail: raw.slice(0, 200) }
  }

  if (!res.ok) {
    const msg = parsed?.error?.message || raw.slice(0, 300)
    console.error('[instructor-ai-image] OpenAI images error:', res.status, msg)
    return { ok: false, reason: 'OPENAI_ERROR', detail: msg }
  }

  const imageUrl = parsed?.data?.[0]?.url
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { ok: false, reason: 'OPENAI_ERROR', detail: 'no image url in response' }
  }

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) {
    return { ok: false, reason: 'FETCH_FAILED', detail: `HTTP ${imgRes.status}` }
  }
  const buf = await imgRes.arrayBuffer()
  const contentType = imgRes.headers.get('content-type') || 'image/png'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png'
  const key = `images/instructors/ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  try {
    const publicUrl = await uploadImageBufferToR2(env, buf, contentType, key)
    return { ok: true, url: publicUrl }
  } catch (e) {
    console.error('[instructor-ai-image] R2 upload:', e)
    return { ok: false, reason: 'NO_R2' }
  }
}

/** 사진 없을 때 폴백(비 AI) — 이니셜 아바타 */
export function placeholderInstructorAvatarUrl(name: string): string {
  const q = encodeURIComponent(name.slice(0, 40) || 'Instructor')
  return `https://ui-avatars.com/api/?name=${q}&size=512&background=6366f1&color=fff&bold=true`
}
