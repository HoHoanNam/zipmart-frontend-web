export type NotificationType = 'order_status' | 'coupon' | 'broadcast';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  relatedEntityId: string | null;
  createdAt: string;
}
