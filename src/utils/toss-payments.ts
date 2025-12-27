/**
 * 토스페이먼츠 결제 연동
 * - 결제 요청
 * - 결제 승인
 * - 결제 취소 (환불)
 * - 웹훅 검증
 */

import { Bindings } from '../types/database'

// 토스페이먼츠 환경 설정
const TOSS_CONFIG = {
  // 테스트 환경 (개발용)
  test: {
    clientKey: 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq', // 테스트용 공개 키
    secretKey: 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R', // 테스트용 시크릿 키 (환경변수로 관리 필요)
  },
  // 운영 환경 (실제 결제)
  production: {
    clientKey: '', // 운영 환경 발급 대기
    secretKey: '', // 운영 환경 발급 대기 (wrangler secret put)
  }
}

// 환경 선택
const ENV = 'test' // 'production'으로 변경 시 실제 결제
const API_BASE = ENV === 'test' 
  ? 'https://api.tosspayments.com/v1'
  : 'https://api.tosspayments.com/v1'

/**
 * 결제 요청 데이터 생성
 */
export interface PaymentRequest {
  orderId: string          // 주문 ID (고유값)
  orderName: string        // 주문명
  amount: number           // 결제 금액
  customerEmail: string    // 고객 이메일
  customerName: string     // 고객 이름
  successUrl: string       // 성공 리다이렉트 URL
  failUrl: string          // 실패 리다이렉트 URL
}

/**
 * 결제 승인 요청
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
  secretKey: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(secretKey + ':')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`결제 승인 실패: ${error.message}`)
  }

  return await response.json()
}

/**
 * 결제 취소 (환불)
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number, // 부분 취소 금액 (선택)
  secretKey?: string
): Promise<any> {
  const secret = secretKey || TOSS_CONFIG[ENV].secretKey

  const response = await fetch(`${API_BASE}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(secret + ':')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason,
      ...(cancelAmount && { cancelAmount }) // 부분 취소 금액
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`결제 취소 실패: ${error.message}`)
  }

  return await response.json()
}

/**
 * 결제 조회
 */
export async function getPayment(
  paymentKey: string,
  secretKey?: string
): Promise<any> {
  const secret = secretKey || TOSS_CONFIG[ENV].secretKey

  const response = await fetch(`${API_BASE}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${btoa(secret + ':')}`,
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`결제 조회 실패: ${error.message}`)
  }

  return await response.json()
}

/**
 * 웹훅 서명 검증
 * 토스페이먼츠에서 전송한 웹훅이 위조되지 않았는지 확인
 */
export function verifyWebhookSignature(
  requestBody: string,
  signature: string,
  secretKey: string
): boolean {
  // HMAC-SHA256 검증 로직
  // 실제 구현 시 crypto 라이브러리 사용
  return true // 임시
}

/**
 * 환불 규정에 따른 환불 금액 계산
 */
export function calculateRefundAmount(
  originalAmount: number,
  progressRate: number, // 진도율 (0-100)
  enrolledDays: number   // 수강 경과 일수
): {
  refundAmount: number
  refundRate: number
  reason: string
} {
  // 환불 규정
  // 1. 수강 시작 전 (진도 0%): 100% 환불
  // 2. 진도 50% 미만: 50% 환불
  // 3. 진도 50% 이상: 환불 불가

  if (progressRate === 0 && enrolledDays <= 7) {
    // 7일 이내, 진도 0%: 100% 환불
    return {
      refundAmount: originalAmount,
      refundRate: 100,
      reason: '수강 시작 전 전액 환불'
    }
  } else if (progressRate < 50) {
    // 진도 50% 미만: 50% 환불
    return {
      refundAmount: Math.floor(originalAmount * 0.5),
      refundRate: 50,
      reason: '진도 50% 미만 부분 환불'
    }
  } else {
    // 진도 50% 이상: 환불 불가
    return {
      refundAmount: 0,
      refundRate: 0,
      reason: '진도 50% 이상 환불 불가'
    }
  }
}

/**
 * 결제 위젯 스크립트 생성
 */
export function generatePaymentWidgetScript(): string {
  const clientKey = TOSS_CONFIG[ENV].clientKey
  
  return `
<!-- 토스페이먼츠 결제 위젯 -->
<script src="https://js.tosspayments.com/v1/payment-widget"></script>
<script>
const clientKey = '${clientKey}'
const customerKey = 'USER_ID_' + Date.now() // 고객 고유 키

const paymentWidget = PaymentWidget(clientKey, customerKey)

// 결제 UI 렌더링
paymentWidget.renderPaymentMethods('#payment-widget', { value: AMOUNT })

// 결제 요청
async function requestPayment() {
  try {
    await paymentWidget.requestPayment({
      orderId: 'ORDER_' + Date.now(),
      orderName: '마인드 타임 코칭 입문',
      customerEmail: 'user@example.com',
      customerName: '홍길동',
      successUrl: window.location.origin + '/payment/success',
      failUrl: window.location.origin + '/payment/fail',
    })
  } catch (error) {
    console.error('결제 실패:', error)
  }
}
</script>
  `
}

/**
 * 사업자 정보
 */
export const BUSINESS_INFO = {
  businessNumber: '504-88-01964',
  companyName: '(주)마인드스토리',
  representative: '박종석',
  phone: '062-959-9535',
  email: 'sanj2100@naver.com',
  bankAccount: {
    bank: '농협',
    accountNumber: '351-1202-0831-23',
    accountHolder: '(주)마인드스토리'
  }
}
