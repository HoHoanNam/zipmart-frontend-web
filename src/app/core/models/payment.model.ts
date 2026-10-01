export type PaymentGateway = 'vnpay' | 'momo';

export interface PaymentCheckoutPayload {
  orderId: string;
  gateway: PaymentGateway;
}

/** Response from `POST /payments/checkout` — matches `PaymentsService.createCheckout()`'s actual return shape. */
export interface PaymentCheckoutResult {
  payment: { id: string };
  checkoutUrl: string;
}

/** Response from `GET /payments/vnpay/return` and `GET /payments/momo/return`. */
export interface PaymentReturnResult {
  success: boolean;
  orderId: string | null;
}
