/**
 * 🔐 에러 핸들링 유틸리티
 * 
 * 목적: API 에러 응답을 표준화하고 일관된 에러 처리를 제공
 * 사용법:
 *   - throwApiError(c, 400, '잘못된 요청입니다.', 'VALIDATION_ERROR')
 *   - handleError(c, error)
 */

import { Context } from 'hono'
import { ErrorCode } from '../types/database'

/**
 * 표준 API 에러 응답 생성
 * @param c - Hono Context
 * @param status - HTTP 상태 코드
 * @param message - 에러 메시지
 * @param code - 에러 코드 (선택적)
 */
export function throwApiError(
  c: Context,
  status: number,
  message: string,
  code?: ErrorCode
) {
  return c.json(
    {
      success: false,
      error: message,
      code: code || undefined,
    },
    status
  )
}

/**
 * 일반 에러 핸들러
 * @param c - Hono Context
 * @param error - Error 객체
 */
export function handleError(c: Context, error: unknown) {
  console.error('❌ Error occurred:', error)
  
  // Error 객체인 경우
  if (error instanceof Error) {
    // 특정 에러 메시지에 따른 처리
    if (error.message.includes('not found')) {
      return throwApiError(c, 404, '리소스를 찾을 수 없습니다.', ErrorCode.NOT_FOUND)
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return throwApiError(c, 401, '인증이 필요합니다.', ErrorCode.AUTH_REQUIRED)
    }
    
    if (error.message.includes('forbidden') || error.message.includes('permission')) {
      return throwApiError(c, 403, '권한이 없습니다.', ErrorCode.FORBIDDEN)
    }
    
    // 기본 에러 응답
    return throwApiError(c, 500, error.message)
  }
  
  // 알 수 없는 에러
  return throwApiError(c, 500, '서버 내부 오류가 발생했습니다.')
}

/**
 * 유효성 검증 에러
 * @param c - Hono Context
 * @param message - 에러 메시지
 */
export function throwValidationError(c: Context, message: string) {
  return throwApiError(c, 400, message, ErrorCode.VALIDATION_ERROR)
}

/**
 * 인증 에러
 * @param c - Hono Context
 * @param message - 에러 메시지 (선택적)
 */
export function throwAuthError(c: Context, message: string = '인증이 필요합니다.') {
  return throwApiError(c, 401, message, ErrorCode.AUTH_REQUIRED)
}

/**
 * 권한 에러
 * @param c - Hono Context
 * @param message - 에러 메시지 (선택적)
 */
export function throwForbiddenError(c: Context, message: string = '권한이 없습니다.') {
  return throwApiError(c, 403, message, ErrorCode.FORBIDDEN)
}

/**
 * 관리자 전용 에러
 * @param c - Hono Context
 */
export function throwAdminOnlyError(c: Context) {
  return throwApiError(c, 403, '관리자만 접근할 수 있습니다.', ErrorCode.ADMIN_ONLY)
}

/**
 * 리소스 없음 에러
 * @param c - Hono Context
 * @param resourceName - 리소스 이름 (예: '강좌', '차시', '사용자')
 */
export function throwNotFoundError(c: Context, resourceName: string = '리소스') {
  return throwApiError(c, 404, `${resourceName}를 찾을 수 없습니다.`, ErrorCode.NOT_FOUND)
}

/**
 * 중복 리소스 에러
 * @param c - Hono Context
 * @param message - 에러 메시지
 */
export function throwConflictError(c: Context, message: string) {
  return throwApiError(c, 409, message, ErrorCode.ALREADY_EXISTS)
}

/**
 * 비즈니스 로직 에러 생성기
 */
export const BusinessError = {
  /**
   * 이미 수강 중인 강좌
   */
  alreadyEnrolled(c: Context) {
    return throwApiError(c, 409, '이미 수강 중인 강좌입니다.', ErrorCode.ALREADY_ENROLLED)
  },
  
  /**
   * 수강하지 않은 강좌
   */
  notEnrolled(c: Context) {
    return throwApiError(c, 403, '수강하지 않은 강좌입니다.', ErrorCode.NOT_ENROLLED)
  },
  
  /**
   * 수료증 발급 불가
   */
  certificateNotEligible(c: Context, reason: string) {
    return throwApiError(c, 403, `수료증 발급 불가: ${reason}`, ErrorCode.CERTIFICATE_NOT_ELIGIBLE)
  },
  
  /**
   * 이미 리뷰 작성함
   */
  reviewAlreadyExists(c: Context) {
    return throwApiError(c, 409, '이미 수강평을 작성한 강좌입니다.', ErrorCode.REVIEW_ALREADY_EXISTS)
  },
}

/**
 * 비동기 함수 래퍼 - 에러를 자동으로 캐치
 * @param fn - 비동기 함수
 */
export function asyncHandler(fn: Function) {
  return async (c: Context) => {
    try {
      return await fn(c)
    } catch (error) {
      return handleError(c, error)
    }
  }
}

/**
 * 필수 필드 검증
 * @param c - Hono Context
 * @param data - 검증할 데이터
 * @param requiredFields - 필수 필드 배열
 * @returns 검증 성공 여부
 */
export function validateRequiredFields(
  c: Context,
  data: any,
  requiredFields: string[]
): boolean {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throwValidationError(c, `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`)
    return false
  }
  
  return true
}

/**
 * 이메일 형식 검증
 * @param email - 이메일 주소
 * @returns 유효성 여부
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 별점 범위 검증 (1~5)
 * @param rating - 별점
 * @returns 유효성 여부
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

/**
 * 성공 응답 생성
 * @param c - Hono Context
 * @param data - 응답 데이터
 * @param message - 성공 메시지 (선택적)
 * @param status - HTTP 상태 코드 (기본값: 200)
 */
export function successResponse(
  c: Context,
  data: any,
  message?: string,
  status: number = 200
) {
  return c.json(
    {
      success: true,
      data,
      message,
    },
    status
  )
}
