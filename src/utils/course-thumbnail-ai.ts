/**
 * 강좌 대표 썸네일 — OpenAI Images (DALL·E 3) + R2
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

function clip(s: string, max: number): string {
  const t = (s || '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max) + '…'
}

/**
 * 강좌명·자격·설명·오프라인 모임 안내를 반영한 16:9 교육 썸네일용 프롬프트 (영어)
 */
export function buildCourseThumbnailPrompt(input: {
  title: string
  certificateName?: string | null
  description?: string | null
  scheduleInfo?: string | null
}): string {
  const title = clip(input.title, 120)
  const cert = input.certificateName ? clip(input.certificateName, 80) : ''
  const desc = clip(input.description || '', 400)
  const meet = clip(input.scheduleInfo || '', 300)

  const parts = [
    'Professional wide 16:9 aspect ratio thumbnail image for an online Korean adult education (LMS) course.',
    `Course title theme (do not render as readable text in the image): "${title}".`,
    cert ? `Credential / certification context (abstract mood only, no logos or text): ${cert}.` : '',
    desc ? `Learning focus (visual metaphor only, no text): ${desc}.` : '',
    meet ? `Community / offline meetup vibe (warm, welcoming, subtle — no schedules as text): ${meet}.` : '',
    'Style: modern, clean, cinematic lighting, soft gradients, subtle symbolic elements (books, light, paths, nature, abstract shapes).',
    'Mood: trustworthy, inspiring, calm professionalism suitable for lifelong learning.',
    'Absolutely no letters, numbers, watermarks, logos, subtitles, or readable text in the image.',
    'No photorealistic faces of identifiable people; prefer abstract or silhouetted figures if any.',
    'High quality, 8k feel, balanced composition, generous negative space.',
  ].filter(Boolean)

  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 3900)
}

export type CourseThumbAiResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'NO_API_KEY' | 'NO_R2' | 'OPENAI_ERROR' | 'FETCH_FAILED'; detail?: string }

export async function generateCourseThumbnailAi(
  env: Bindings,
  input: {
    title: string
    certificateName?: string | null
    description?: string | null
    scheduleInfo?: string | null
  },
): Promise<CourseThumbAiResult> {
  const apiKey = (env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    return { ok: false, reason: 'NO_API_KEY' }
  }
  if (!env.R2) {
    return { ok: false, reason: 'NO_R2' }
  }

  const base = normalizeOpenAIBase(env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE).replace(/\/$/, '')
  const imageModel = ((env as Bindings & { OPENAI_IMAGE_MODEL?: string }).OPENAI_IMAGE_MODEL || 'dall-e-3').trim()

  const prompt = buildCourseThumbnailPrompt(input)

  const body: Record<string, unknown> = {
    model: imageModel,
    prompt,
    n: 1,
    size: imageModel === 'dall-e-3' ? '1792x1024' : '1024x1024',
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
    console.error('[course-thumbnail-ai] OpenAI images error:', res.status, msg)
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
  const key = `images/courses/ai-thumb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

  try {
    const publicUrl = await uploadImageBufferToR2(env, buf, contentType, key)
    return { ok: true, url: publicUrl }
  } catch (e) {
    console.error('[course-thumbnail-ai] R2 upload:', e)
    return { ok: false, reason: 'NO_R2' }
  }
}

/** data URL·과도 길이 썸네일 문자열 거부 (D1/Worker 한도·500 방지) */
export const MAX_THUMBNAIL_URL_LENGTH = 400_000

export function normalizeThumbnailUrlInput(raw: unknown, existing: string | null | undefined): string | null {
  if (raw === undefined) return existing ?? null
  if (raw === null) return null
  const s = String(raw).trim()
  if (s === '') return null
  if (s.length > MAX_THUMBNAIL_URL_LENGTH) {
    throw new Error('THUMBNAIL_URL_TOO_LARGE')
  }
  return s.slice(0, 2000)
}
