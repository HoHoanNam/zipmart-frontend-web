export interface CouponApplyResult {
  discountPercent: number;
  discountAmount: number;
}

export interface AvailableCoupon {
  id: string;
  code: string;
  discountPercent: string;
  minOrderAmount: string | null;
  expiresAt: string | null;
}
