/**
 * 강좌 정가·판매가 → DB price / sale_price / discount_price
 * 무료 여부는 컬럼으로 두지 않고, 판매가(또는 정가)가 0원인지로 판별한다.
 */

export type DerivedCoursePricing = {
  /** legacy `price` 컬럼과 동일 — 정가 */
  regular_price: number
  sale_price: number | null
  discount_price: number | null
}

export function deriveCoursePricing(
  regularRaw: number | string | null | undefined,
  saleRaw: number | string | null | undefined,
): DerivedCoursePricing {
  const regular = Math.max(0, parseInt(String(regularRaw ?? '0'), 10) || 0)
  const saleEmpty =
    saleRaw === undefined || saleRaw === null || String(saleRaw).trim() === ''
  const saleNum = saleEmpty ? null : Math.max(0, parseInt(String(saleRaw), 10) || 0)
  const sale_price = saleNum !== null && saleNum > 0 ? saleNum : null
  return {
    regular_price: regular,
    sale_price,
    discount_price: sale_price,
  }
}

/** UI용 할인율 0~100 (정가>0, 판매가<정가일 때) */
export function discountPercentDisplay(regular: number, sale: number | null): number | null {
  if (regular <= 0 || sale == null || sale >= regular) return null
  return Math.round((1 - sale / regular) * 100)
}
