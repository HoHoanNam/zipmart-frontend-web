export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
/** `credit` is a legacy mock method kept only so old orders still render a label — no longer offered at checkout. */
export type PaymentMethod = 'cod' | 'credit' | 'vnpay' | 'momo';
/** Separate from `OrderStatus` lifecycle — see Infra D in the expansion plan. */
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  productName: string | null;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  recipientName: string | null;
  phoneNumber: string | null;
  city: string | null;
  district: string | null;
  ward: string | null;
  streetAddress: string | null;
  paymentMethod: PaymentMethod;
  /** Present once Infra D (payment gateways) ships backend-side; optional here so this model doesn't break if it's momentarily absent. */
  paymentStatus?: PaymentStatus;
  taxAmount: string;
  discountAmount: string;
  couponCode: string | null;
  total: string;
  createdAt: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export interface ShipmentEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  occurredAt: string;
}

export interface CreateOrderPayload {
  recipientName: string;
  phoneNumber: string;
  city: string;
  district: string;
  ward: string;
  streetAddress: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  /** Loyalty points to redeem against this order — see A.6 in the expansion plan. */
  redeemPoints?: number;
}

export interface UpdateOrderAddressPayload {
  recipientName?: string;
  phoneNumber?: string;
  city?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  paymentMethod?: PaymentMethod;
}
