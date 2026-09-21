export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'credit';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
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
  taxAmount: string;
  discountAmount: string;
  couponCode: string | null;
  total: string;
  createdAt: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
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
