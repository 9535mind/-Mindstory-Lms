/**
 * 관리자 — 강사(Instructor) 프로필 CRUD
 * /api/admin/instructors
 */

import type { Context } from 'hono'
import { Hono } from 'hono'
import { Bindings } from '../types/database'
import { successResponse, errorResponse } from '../utils/helpers'
import { requireAdmin } from '../middleware/auth'
import { uploadImageFileToR2 } from '../utils/r2-image-upload'
import {
  generateInstructorProfileImageAi,
  normalizeInstructorGender,
  placeholderInstructorAvatarUrl,
} from '../utils/instructor-ai-image'
import {
  fetchInstructorProfileFields,
  fetchInstructorRowForRegenerate,
  InstructorsTableMissingError,
  insertInstructorRow,
  listInstructorsRows,
  updateInstructorRow,
} from '../utils/instructors-schema-compat'

const adminInstructors = new Hono<{ Bindings: Bindings }>()

adminInstructors.get('/instructors', requireAdmin, async (c) => {
  const { DB } = c.env
  try {
    const rows = await listInstructorsRows(DB)
    return c.json(successResponse(rows))
  } catch (e) {
    console.error('[admin/instructors] list:', e)
    return c.json(errorResponse('강사 목록 조회 실패'), 500)
  }
})

/** DALL·E로 프로필 이미지 생성·재생성 — 업로드 사진도 AI로 교체 가능, 성별 미지정(U)은 이름 기반 프롬프트 폴백 */
adminInstructors.post('/instructors/:id/regenerate-image', requireAdmin, async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  try {
    let bodyGender: string | undefined
    try {
      const b = (await c.req.json()) as { gender?: string }
      if (b && typeof b.gender === 'string') bodyGender = b.gender
    } catch {
      /* 빈 본문 */
    }
    const row = await fetchInstructorRowForRegenerate(DB, id)
    if (!row) {
      return c.json(errorResponse('강사를 찾을 수 없습니다.'), 404)
    }
    const effectiveGender =
      bodyGender !== undefined ? normalizeInstructorGender(bodyGender) : normalizeInstructorGender(row.gender)
    const ai = await generateInstructorProfileImageAi(c.env, row.name, row.specialty, effectiveGender)
    if (!ai.ok) {
      if (ai.reason === 'NO_API_KEY') {
        return c.json(errorResponse('OPENAI_API_KEY가 설정되지 않아 이미지를 생성할 수 없습니다.'), 503)
      }
      if (ai.reason === 'NO_R2') {
        return c.json(errorResponse('R2 스토리지가 없어 이미지를 저장할 수 없습니다.'), 503)
      }
      return c.json(
        errorResponse(`AI 이미지 생성 실패: ${(ai.detail || ai.reason).slice(0, 200)}`),
        502,
      )
    }
    const result = await updateInstructorRow(DB, id, {
      name: row.name,
      profile_image: ai.url,
      profile_image_ai: 1,
      bio: row.bio,
      specialty: row.specialty,
      gender: effectiveGender,
    })
    if (result.meta.changes === 0) {
      return c.json(errorResponse('강사를 찾을 수 없습니다.'), 404)
    }
    return c.json(
      successResponse({
        message: '프로필 사진을 새로 그렸습니다.',
        profile_image: ai.url,
        profile_image_ai: 1,
      }),
    )
  } catch (e) {
    if (e instanceof InstructorsTableMissingError) {
      return c.json(errorResponse(e.message), 503)
    }
    console.error('[admin/instructors] regenerate-image:', e)
    return c.json(errorResponse('이미지 재생성 실패'), 500)
  }
})

adminInstructors.post('/instructors', requireAdmin, async (c) => {
  const { DB } = c.env
  try {
    const body = await c.req.json()
    const name = String(body.name ?? '').trim()
    if (!name) {
      return c.json(errorResponse('이름은 필수입니다.'), 400)
    }
    const bio =
      body.bio != null && String(body.bio).trim() !== '' ? String(body.bio).trim().slice(0, 8000) : null
    const specialty =
      body.specialty != null && String(body.specialty).trim() !== ''
        ? String(body.specialty).trim().slice(0, 500)
        : null

    const genderNorm = normalizeInstructorGender(body.gender as string | undefined)

    const manualProfile =
      body.profile_image != null && String(body.profile_image).trim() !== ''
        ? String(body.profile_image).trim().slice(0, 2000)
        : null

    /** false면 사진/URL 없을 때 AI 호출 없이 이니셜 아바타만 (저장 빠름) */
    const autoGenerateProfile =
      body.auto_generate_profile_image === undefined ||
      body.auto_generate_profile_image === true ||
      body.auto_generate_profile_image === 1 ||
      String(body.auto_generate_profile_image) === '1'

    const warnings: string[] = []
    let profile_image: string | null = manualProfile
    let profile_image_ai = 0

    if (!profile_image) {
      if (!autoGenerateProfile) {
        profile_image = placeholderInstructorAvatarUrl(name)
        profile_image_ai = 0
      } else {
        const ai = await generateInstructorProfileImageAi(c.env, name, specialty)
        if (ai.ok) {
          profile_image = ai.url
          profile_image_ai = 1
        } else {
          profile_image = placeholderInstructorAvatarUrl(name)
          profile_image_ai = 0
          if (ai.reason === 'NO_API_KEY') {
            warnings.push('OPENAI_API_KEY가 없어 AI 프로필 이미지를 생성하지 못했습니다. 이니셜 아바타를 사용합니다.')
          } else if (ai.reason === 'NO_R2') {
            warnings.push('R2 스토리지가 없어 AI 이미지를 저장할 수 없습니다. 이니셜 아바타를 사용합니다.')
          } else {
            warnings.push(
              `AI 이미지 생성에 실패했습니다 (${ai.detail || ai.reason}). 이니셜 아바타를 사용합니다.`,
            )
          }
        }
      }
    }

    const result = await insertInstructorRow(DB, {
      name,
      profile_image,
      profile_image_ai,
      bio,
      specialty,
      gender: genderNorm,
    })

    return c.json(
      successResponse({
        id: result.meta.last_row_id,
        message: '강사가 등록되었습니다.',
        profile_image,
        profile_image_ai,
        warnings: warnings.length ? warnings : undefined,
      }),
      201
    )
  } catch (e) {
    if (e instanceof InstructorsTableMissingError) {
      return c.json(errorResponse(e.message), 503)
    }
    console.error('[admin/instructors] create:', e)
    const detail = e instanceof Error ? e.message : String(e)
    return c.json(
      errorResponse(
        `강사 등록 실패: ${detail.slice(0, 200)}. (원인: DB 마이그레이션 0048·0049 미적용 가능)`,
      ),
      500,
    )
  }
})

async function putInstructorMultipart(c: Context<{ Bindings: Bindings }>, id: string) {
  const { DB } = c.env
  const form = await c.req.formData()
  const file = form.get('file') as File | null
  const name = String(form.get('name') ?? '').trim()
  if (!name) {
    return c.json(errorResponse('이름은 필수입니다.'), 400)
  }
  const bio =
    form.get('bio') != null && String(form.get('bio')).trim() !== ''
      ? String(form.get('bio')).trim().slice(0, 8000)
      : null
  const specialty =
    form.get('specialty') != null && String(form.get('specialty')).trim() !== ''
      ? String(form.get('specialty')).trim().slice(0, 500)
      : null

  const existing = await fetchInstructorProfileFields(DB, id)

  if (!existing) {
    return c.json(errorResponse('강사를 찾을 수 없습니다.'), 404)
  }

  const genderForSave = normalizeInstructorGender(
    form.get('gender') != null && String(form.get('gender')).trim() !== ''
      ? String(form.get('gender'))
      : existing.gender ?? 'U',
  )

  let profile_image =
    form.get('profile_image') != null && String(form.get('profile_image')).trim() !== ''
      ? String(form.get('profile_image')).trim().slice(0, 2000)
      : null
  let profile_image_ai = Number(existing.profile_image_ai) ? 1 : 0

  if (file && typeof file.size === 'number' && file.size > 0) {
    try {
      const { url } = await uploadImageFileToR2(c.env, file, 'images/instructors')
      profile_image = url
      profile_image_ai = 0
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg === 'R2_NOT_CONFIGURED') {
        return c.json(errorResponse('이미지 저장(R2)이 설정되지 않았습니다.'), 503)
      }
      if (msg === 'UNSUPPORTED_TYPE') {
        return c.json(errorResponse('지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP)'), 400)
      }
      if (msg === 'FILE_TOO_LARGE') {
        return c.json(errorResponse('파일 크기는 5MB 이하여야 합니다.'), 400)
      }
      console.error('[admin/instructors] upload:', e)
      return c.json(errorResponse('이미지 업로드에 실패했습니다.'), 500)
    }
  } else {
    if (profile_image && profile_image === existing.profile_image) {
      profile_image_ai = Number(existing.profile_image_ai) ? 1 : 0
    } else if (profile_image) {
      profile_image_ai = 0
    } else {
      profile_image_ai = 0
    }
  }

  const result = await updateInstructorRow(DB, id, {
    name,
    profile_image,
    profile_image_ai,
    bio,
    specialty,
    gender: genderForSave,
  })

  if (result.meta.changes === 0) {
    return c.json(errorResponse('강사를 찾을 수 없습니다.'), 404)
  }

  return c.json(
    successResponse({
      message: '강사 정보가 수정되었습니다.',
      profile_image,
      profile_image_ai,
    }),
  )
}

adminInstructors.put('/instructors/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const ct = c.req.header('content-type') || ''
  if (ct.includes('multipart/form-data')) {
    try {
      return await putInstructorMultipart(c, id)
    } catch (e) {
      if (e instanceof InstructorsTableMissingError) {
        return c.json(errorResponse(e.message), 503)
      }
      throw e
    }
  }

  const { DB } = c.env
  try {
    const body = await c.req.json() as {
      name?: string
      bio?: string | null
      specialty?: string | null
      profile_image?: string | null
      gender?: string | null
    }
    const name = String(body.name ?? '').trim()
    if (!name) {
      return c.json(errorResponse('이름은 필수입니다.'), 400)
    }
    const bio =
      body.bio != null && String(body.bio).trim() !== '' ? String(body.bio).trim().slice(0, 8000) : null
    const specialty =
      body.specialty != null && String(body.specialty).trim() !== ''
        ? String(body.specialty).trim().slice(0, 500)
        : null

    const existing = await fetchInstructorProfileFields(DB, id)

    if (!existing) {
      return c.json(errorResponse('강사를 찾을 수 없습니다.'), 404)
    }

    let profile_image = existing.profile_image
    let profile_image_ai = Number(existing.profile_image_ai) ? 1 : 0

    if (Object.prototype.hasOwnProperty.call(body, 'profile_image')) {
      const v = body.profile_image
      profile_image =
        v != null && String(v).trim() !== '' ? String(v).trim().slice(0, 2000) : null
      if (profile_image) {
        const sameAsBefore = profile_image === existing.profile_image
        profile_image_ai = sameAsBefore ? (Number(existing.profile_image_ai) ? 1 : 0) : 0
      } else {
        profile_image_ai = 0
      }
    }

    const genderForSave = Object.prototype.hasOwnProperty.call(body, 'gender')
      ? normalizeInstructorGender(body.gender as string | undefined)
      : normalizeInstructorGender(existing.gender ?? 'U')

    const result = await updateInstructorRow(DB, id, {
      name,
      profile_image,
      profile_image_ai,
      bio,
      specialty,
      gender: genderForSave,
    })

    if (result.meta.changes === 0) {
      return c.json(errorResponse('강사를 찾을 수 없습니다.'), 404)
    }

    return c.json(successResponse({ message: '강사 정보가 수정되었습니다.' }))
  } catch (e) {
    if (e instanceof InstructorsTableMissingError) {
      return c.json(errorResponse(e.message), 503)
    }
    console.error('[admin/instructors] update:', e)
    return c.json(errorResponse('강사 수정 실패'), 500)
  }
})

export default adminInstructors
