export type OrderStatus = 'pending' | 'paid' | 'shipped';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: string;
  createdAt: string;
}
