/** Flat VAT rate applied to (subtotal - discount) — must match backend-nest's src/orders/orders.constants.ts. */
export const VAT_RATE = 0.08;

/**
 * Client-side-only heuristic for showing/hiding the "Yêu cầu đổi trả" button
 * — matches the "đổi trả trong 30 ngày" policy already advertised in the
 * footer/return-policy page. Real enforcement of the window happens on the
 * backend (`ReturnsService.create()` per Infra E); this just avoids showing
 * a button that would obviously get rejected. Measured from `order.createdAt`
 * since `OrderDetail` has no separate "completedAt" timestamp yet.
 */
export const RETURN_WINDOW_DAYS = 30;
