/**
 * LMS 챗봇 하이브리드 RAG — instructors / courses 키워드 검색 (LIKE 기반)
 */

import type { D1Database } from '@cloudflare/workers-types'
import {
  courseDetailUrl,
  formatCoursePriceLine,
  resolveScheduleForCourse,
  type CourseScheduleRow,
} from '../config/course-schedule'
import { parseCatalogLines } from './catalog-lines'
import { SQL_COURSE_CATALOG_VISIBLE, SQL_COURSE_CATALOG_VISIBLE_ALIAS } from './course-visibility'

/** 공개 카탈로그 강좌 — published + 휴지통 아님 */
const SQL_COURSE_PUBLISHED = SQL_COURSE_CATALOG_VISIBLE
const SQL_COURSE_PUBLISHED_ALIAS = SQL_COURSE_CATALOG_VISIBLE_ALIAS

const STOP = new Set([
  '그',
  '이',
  '저',
  '가',
  '을',
  '를',
  '에',
  '의',
  '와',
  '과',
  '도',
  '로',
  '으로',
  '은',
  '는',
  '하',
  '한',
  '할',
  '있',
  '없',
  '알',
  '수',
  '것',
  '뭐',
  '무엇',
  '어떻',
  '왜',
  '언제',
  '어디',
  '누가',
  '좀',
  '같',
  '대',
  '때',
  '및',
  '등',
  '수가',
  '수도',
  '있는',
  '없는',
  '하는',
  '입니다',
  '있어요',
  '해요',
  '주세요',
])

export function extractSearchKeywords(message: string): string[] {
  const cleaned = String(message || '')
    .replace(/[\[\]\(\)!?.,;:~'"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const parts = cleaned.split(/\s+/).filter((p) => p.length >= 2)
  const kw: string[] = []
  for (const p of parts) {
    const t = p.slice(0, 24)
    if (STOP.has(t) || t.length < 2) continue
    if (!kw.includes(t)) kw.push(t)
    if (kw.length >= 8) break
  }
  // 띄어쓰기 없는 짧은 한글(예: 브랜드명·복합어) — 2글자 겹침으로 보조 키워드
  const compact = cleaned.replace(/\s/g, '')
  if (compact.length >= 3 && kw.length < 4) {
    const cap = Math.min(compact.length - 1, 12)
    for (let i = 0; i < cap; i++) {
      const sub = compact.slice(i, i + 2)
      if (sub.length < 2 || STOP.has(sub)) continue
      if (!kw.includes(sub)) kw.push(sub)
      if (kw.length >= 8) break
    }
  }
  if (kw.length === 0 && cleaned.length >= 2) {
    const fallback = cleaned.slice(0, 40).trim()
    if (fallback.length >= 2) kw.push(fallback)
  }
  // 토큰이 하나뿐이면 질문 앞부분을 추가 검색어로 넣어 LIKE 매칭률 상승
  if (kw.length === 1 && cleaned.length >= 3 && cleaned.length <= 80) {
    const whole = cleaned.slice(0, 60).trim()
    if (whole.length >= 3 && !kw.includes(whole)) kw.unshift(whole)
  }
  return kw
}

function scoreText(haystack: string, keywords: string[]): number {
  const s = haystack.toLowerCase()
  let sc = 0
  for (const k of keywords) {
    if (k.length >= 2 && s.includes(k.toLowerCase())) sc += 1
  }
  return sc
}

type Candidate = {
  kind: 'instructor' | 'course'
  id: number
  score: number
  line: string
}

const MAX_SNIPPET = 200
const MAX_ROWS_FETCH = 60
const MAX_RESULTS = 5

function isNoSuchTableInstructors(err: unknown): boolean {
  const m = String(err instanceof Error ? err.message : err)
  return /no such table/i.test(m) && /instructors/i.test(m)
}

/**
 * 질문 키워드로 instructors·courses 검색 후, 관련성 상위 MAX_RESULTS개만 텍스트 블록으로 반환.
 */
export async function retrieveLmsHybridContext(db: D1Database | undefined, userMessage: string): Promise<string> {
  if (!db) return ''
  const keywords = extractSearchKeywords(userMessage)
  if (keywords.length === 0) return ''

  const orPart = keywords
    .map(() => '(COALESCE(name,\'\') || \' \' || COALESCE(specialty,\'\') || \' \' || COALESCE(bio,\'\')) LIKE ?')
    .join(' OR ')
  const instBinds = keywords.map((k) => `%${k}%`)

  const courseOrPart = keywords
    .map(() => '(COALESCE(title,\'\') || \' \' || COALESCE(description,\'\')) LIKE ?')
    .join(' OR ')
  const courseBinds = keywords.map((k) => `%${k}%`)

  const candidates: Candidate[] = []

  try {
    /** 강사: 공개 강좌에 한해 배정된 강사만 + (가능 시) 비활성 제외 — 유령·미노출 데이터 차단 */
    const instSqlActive = `SELECT DISTINCT i.id, i.name, i.specialty, i.bio
         FROM instructors i
         INNER JOIN courses c ON c.instructor_id = i.id AND ${SQL_COURSE_PUBLISHED_ALIAS}
         WHERE COALESCE(i.is_active, 1) = 1 AND (${orPart})
         LIMIT ${MAX_ROWS_FETCH}`
    const instSqlFallback = `SELECT DISTINCT i.id, i.name, i.specialty, i.bio
         FROM instructors i
         INNER JOIN courses c ON c.instructor_id = i.id AND ${SQL_COURSE_PUBLISHED_ALIAS}
         WHERE (${orPart})
         LIMIT ${MAX_ROWS_FETCH}`
    let listed
    try {
      listed = await db.prepare(instSqlActive).bind(...instBinds).all<{
        id: number
        name: string
        specialty: string | null
        bio: string | null
      }>()
    } catch (e) {
      const m = String(e instanceof Error ? e.message : e)
      if (!/no such column.*is_active/i.test(m)) throw e
      listed = await db.prepare(instSqlFallback).bind(...instBinds).all<{
        id: number
        name: string
        specialty: string | null
        bio: string | null
      }>()
    }
    for (const r of listed.results || []) {
      const blob = [r.name, r.specialty, r.bio].filter(Boolean).join(' ')
      const score = scoreText(blob, keywords)
      if (score < 1) continue
      const bio = (r.bio || '').replace(/\s+/g, ' ').trim().slice(0, MAX_SNIPPET)
      const sp = (r.specialty || '—').replace(/\s+/g, ' ').trim().slice(0, 100)
      const line =
        `- [강사 DB id=${r.id}] 이름: ${r.name} | 전공·분야: ${sp}` +
        (bio ? ` | 소개: ${bio}` : '')
      candidates.push({ kind: 'instructor', id: r.id, score, line })
    }
  } catch (e) {
    if (isNoSuchTableInstructors(e)) {
      console.warn('[chat-rag] instructors 테이블 없음 — 강사 검색 생략')
    } else {
      console.warn('[chat-rag] instructors 검색 오류', e)
    }
  }

  try {
    const listed = await db
      .prepare(
        `SELECT id, title, description, category_group, schedule_info
         FROM courses WHERE ${SQL_COURSE_PUBLISHED} AND (${courseOrPart}) LIMIT ${MAX_ROWS_FETCH}`,
      )
      .bind(...courseBinds)
      .all<{
        id: number
        title: string
        description: string | null
        category_group: string | null
        schedule_info: string | null
      }>()
    for (const r of listed.results || []) {
      const blob = [r.title, r.description].filter(Boolean).join(' ')
      const score = scoreText(blob, keywords)
      if (score < 1) continue
      const cg = parseCatalogLines(r.category_group).join(',')
      const sch = resolveScheduleForCourse({
        id: r.id,
        title: r.title,
        category_group: r.category_group,
        schedule_info: r.schedule_info,
      })
      const desc = (r.description || '').replace(/\s+/g, ' ').trim().slice(0, MAX_SNIPPET)
      const line =
        `- [강좌 DB id=${r.id}] "${r.title}" (브랜드·라인: ${cg || '—'}) | 일정: ${sch.scheduleText}` +
        (desc ? ` | 설명 발췌: ${desc}` : '') +
        ` | 상세·수강 URL: ${courseDetailUrl(r.id)}`
      candidates.push({ kind: 'course', id: r.id, score, line })
    }
  } catch (e) {
    console.warn('[chat-rag] courses 검색 오류', e)
  }

  const merged = new Map<string, Candidate>()
  for (const c of candidates) {
    const key = `${c.kind}:${c.id}`
    const prev = merged.get(key)
    if (!prev || c.score > prev.score) merged.set(key, c)
  }

  const sorted = [...merged.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.kind !== b.kind) return a.kind === 'course' ? -1 : 1
    return a.id - b.id
  })

  const top = sorted.slice(0, MAX_RESULTS)
  if (top.length === 0) return ''

  return top.map((t) => t.line).join('\n')
}

const FALLBACK_COURSES = 10
const FALLBACK_INSTRUCTORS = 8

/**
 * 키워드 검색 결과가 비었을 때 — 공개 강좌·강사 일부를 DB에서 직접 나열해 맥락을 보강한다.
 */
export async function buildLmsFallbackSiteContext(db: D1Database | undefined): Promise<string> {
  if (!db) return ''
  const lines: string[] = []

  try {
    const fbInstActive = `SELECT DISTINCT i.id, i.name, i.specialty, i.bio
         FROM instructors i
         INNER JOIN courses c ON c.instructor_id = i.id AND ${SQL_COURSE_PUBLISHED_ALIAS}
         WHERE COALESCE(i.is_active, 1) = 1
         ORDER BY i.id DESC LIMIT ${FALLBACK_INSTRUCTORS}`
    const fbInst = `SELECT DISTINCT i.id, i.name, i.specialty, i.bio
         FROM instructors i
         INNER JOIN courses c ON c.instructor_id = i.id AND ${SQL_COURSE_PUBLISHED_ALIAS}
         ORDER BY i.id DESC LIMIT ${FALLBACK_INSTRUCTORS}`
    let inst
    try {
      inst = await db.prepare(fbInstActive).all<{ id: number; name: string; specialty: string | null; bio: string | null }>()
    } catch (e) {
      const m = String(e instanceof Error ? e.message : e)
      if (!/no such column.*is_active/i.test(m)) throw e
      inst = await db.prepare(fbInst).all<{ id: number; name: string; specialty: string | null; bio: string | null }>()
    }
    for (const r of inst.results || []) {
      const bio = (r.bio || '').replace(/\s+/g, ' ').trim().slice(0, MAX_SNIPPET)
      const sp = (r.specialty || '—').replace(/\s+/g, ' ').trim().slice(0, 100)
      lines.push(
        `- [강사 DB id=${r.id}] 이름: ${r.name} | 전공·분야: ${sp}` + (bio ? ` | 소개: ${bio}` : ''),
      )
    }
  } catch (e) {
    if (!isNoSuchTableInstructors(e)) console.warn('[chat-rag] fallback instructors', e)
  }

  try {
    const crs = await db
      .prepare(
        `SELECT id, title, description, category_group, schedule_info,
                COALESCE(regular_price, price) AS price, sale_price
         FROM courses WHERE ${SQL_COURSE_PUBLISHED} ORDER BY id DESC LIMIT ${FALLBACK_COURSES}`,
      )
      .all<{
        id: number
        title: string
        description: string | null
        category_group: string | null
        schedule_info: string | null
        price: number | null
        sale_price: number | null
      }>()
    for (const r of crs.results || []) {
      const cg = parseCatalogLines(r.category_group).join(',')
      const rowForPrice: CourseScheduleRow = {
        id: r.id,
        title: r.title,
        category_group: r.category_group,
        schedule_info: r.schedule_info,
        price: r.price,
        sale_price: r.sale_price,
      }
      const sch = resolveScheduleForCourse(rowForPrice)
      const priceLine = formatCoursePriceLine(rowForPrice)
      const desc = (r.description || '').replace(/\s+/g, ' ').trim().slice(0, MAX_SNIPPET)
      lines.push(
        `- [강좌 DB id=${r.id}] "${r.title}" (브랜드·라인: ${cg || '—'}) | 수강료(DB): ${priceLine} | 일정: ${sch.scheduleText}` +
          (desc ? ` | 설명 발췌: ${desc}` : '') +
          ` | 상세·수강 URL: ${courseDetailUrl(r.id)}`,
      )
    }
  } catch (e) {
    console.warn('[chat-rag] fallback courses', e)
  }

  if (lines.length === 0) return ''
  return (
    '(키워드 직접 매칭은 없었으나, 아래는 사이트 DB에서 가져온 최근 공개 강좌·강사 요약이다.)\n' +
    lines.join('\n')
  )
}
