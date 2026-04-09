/**
 * Gemini 우선, 실패 시 OpenAI — 강좌/차시 설명 등 공통 텍스트 생성
 */

import type { Bindings } from '../types/database'

const DEFAULT_OPENAI_BASE = 'https://api.openai.com/v1'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

function normalizeOpenAIBase(raw: string): string {
  const b = (raw || '').replace(/\/$/, '')
  if (!b) return DEFAULT_OPENAI_BASE
  if (/\/v\d+(\/|$)/.test(b)) return b
  return `${b}/v1`
}

function extractGeminiText(data: unknown): string {
  if (!data || typeof data !== 'object') {
    throw new Error('Gemini 응답 형식이 올바르지 않습니다.')
  }
  const d = data as Record<string, unknown>
  const blockReason = (d.promptFeedback as { blockReason?: string } | undefined)?.blockReason
  if (blockReason) {
    throw new Error(`Gemini가 요청을 차단했습니다: ${blockReason}`)
  }
  const errObj = d.error as { message?: string; status?: string } | undefined
  if (errObj?.message) {
    throw new Error(`Gemini API: ${errObj.message}`)
  }
  const candidates = d.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('Gemini 응답에 본문(candidates)이 없습니다.')
  }
  const parts = candidates[0]?.content?.parts
  const text = parts?.[0]?.text
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Gemini 응답에 텍스트가 없습니다.')
  }
  return text
}

async function callGemini(apiKey: string, baseURL: string, prompt: string, systemInstruction?: string) {
  const response = await fetch(`${baseURL}/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  })

  const rawText = await response.text()
  let data: unknown
  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch {
    console.error('Gemini raw (non-JSON):', rawText.slice(0, 500))
    throw new Error('Gemini 응답을 해석하지 못했습니다.')
  }

  if (!response.ok) {
    console.error('Gemini API HTTP', response.status, rawText.slice(0, 800))
    try {
      extractGeminiText(data)
    } catch (e) {
      if (e instanceof Error) throw e
    }
    throw new Error(`Gemini API 오류 (HTTP ${response.status})`)
  }

  return extractGeminiText(data)
}

async function callOpenAIChat(env: Bindings, system: string, user: string): Promise<string> {
  const apiKey = (env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    throw new Error('NO_AI_KEY')
  }
  const base = normalizeOpenAIBase(env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE).replace(/\/$/, '')
  const model = (env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.65,
      max_tokens: 1200,
    }),
  })

  const raw = await res.text()
  let parsed: { choices?: Array<{ message?: { content?: string } }> } | null = null
  try {
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    console.error('OpenAI non-JSON:', raw.slice(0, 400))
    throw new Error('OpenAI 응답을 해석하지 못했습니다.')
  }

  if (!res.ok) {
    console.error('OpenAI HTTP', res.status, raw.slice(0, 600))
    throw new Error(`OpenAI API 오류 (HTTP ${res.status})`)
  }

  const out = parsed?.choices?.[0]?.message?.content
  if (typeof out !== 'string' || !out.trim()) {
    throw new Error('OpenAI 응답에 본문이 없습니다.')
  }
  return out.trim()
}

/** 강좌/차시 설명용: Gemini 우선, 실패 시 OpenAI(키 있을 때), 둘 다 없으면 NO_AI_KEY */
export async function generateTextGeminiOrOpenAI(
  env: Bindings,
  prompt: string,
  systemInstruction: string,
): Promise<string> {
  const geminiKey = (env.GEMINI_API_KEY || '').trim()
  const baseURL = env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
  const openaiKey = (env.OPENAI_API_KEY || '').trim()

  if (geminiKey) {
    try {
      return await callGemini(geminiKey, baseURL, prompt, systemInstruction)
    } catch (e) {
      if (openaiKey) {
        console.warn('[ai] Gemini failed, falling back to OpenAI:', e instanceof Error ? e.message : e)
        return callOpenAIChat(env, systemInstruction, prompt)
      }
      throw e
    }
  }
  if (openaiKey) {
    return callOpenAIChat(env, systemInstruction, prompt)
  }
  throw new Error('NO_AI_KEY')
}
